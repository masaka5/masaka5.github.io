import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ConfigProvider,
  App,
  Button,
  Input,
  Select,
  Switch,
  Space,
  Tag,
  Progress,
  Dropdown,
  Modal,
  Drawer,
  Empty,
  Tooltip,
  Segmented,
  Popconfirm,
  Form,
  InputNumber,
} from "antd";
import zhCN from "antd/locale/zh_CN";
import {
  ArrowLeftOutlined,
  AudioOutlined,
  FileTextOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  SettingOutlined,
  PauseOutlined,
  CaretRightOutlined,
  BorderOutlined,
  DeleteOutlined,
  HistoryOutlined,
  CheckOutlined,
  SoundOutlined,
  TeamOutlined,
  LoadingOutlined,
  CopyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { SpeechClient } from "../client.mjs";
import { MeetingRecorder, audioSamples } from "../capture.mjs";
import { LiveSpeechQueue } from "../live.mjs";
import {
  blankMeeting,
  listMeetings,
  saveMeeting,
  removeMeeting,
  saveAudio,
  getAudio,
  liveStore,
} from "../storage.mjs";
import {
  assignSpeakers,
  exportTranscript,
  clock,
  summaryBatches,
  minutesPrompt,
  wavBytes,
  extractMinutes,
} from "../core.mjs";
import { splitThinking } from "../../ai/local-ai-client.js";
import { SummaryClient } from "../summary-client.mjs";
import { recordToolUse } from "../../../assets/tool-use.mjs";
import "./style.css";
const date = (n) =>
    new Date(n).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  statusText = {
    draft: "未开始",
    recording: "录音中",
    paused: "已暂停",
    transcribing: "转写中",
    summarizing: "整理中",
    complete: "已完成",
    stopped: "已停止",
    interrupted: "待恢复",
  };
function download(bytes, name, mime = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([bytes], { type: mime })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function settingsInitial() {
  try {
    return {
      autoSummary: true,
      autoSpeakers: false,
      system: false,
      language: "",
      hotwords: "",
      engine: /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'sensevoice' : 'funasr',
      summaryEngine: /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'extract' : 'ai',
      ...JSON.parse(localStorage.getItem("pocket-minutes-options") || "{}"),
    };
  } catch {
    return {
      autoSummary: true,
      autoSpeakers: false,
      system: false,
      language: "",
      hotwords: "",
      engine: 'sensevoice',
      summaryEngine: 'extract',
    };
  }
}
function Minutes() {
  const { message, modal } = App.useApp(),
    [meeting, setMeeting] = useState(blankMeeting),
    [history, setHistory] = useState([]),
    [busy, setBusy] = useState(true),
    [hydrated, setHydrated] = useState(false),
    [recording, setRecording] = useState(false),
    [paused, setPaused] = useState(false),
    [timer, setTimer] = useState(0),
    [level, setLevel] = useState(0),
    [progress, setProgress] = useState(null),
    [error, setError] = useState(""),
    [settings, setSettings] = useState(settingsInitial),
    [settingsOpen, setSettingsOpen] = useState(false),
    [historyOpen, setHistoryOpen] = useState(false),
    [speakerOpen, setSpeakerOpen] = useState(false),
    [query, setQuery] = useState(""),
    [tab, setTab] = useState("transcript"),
    [audioURL, setAudioURL] = useState(""),
    [editing, setEditing] = useState(null),
    [editText, setEditText] = useState(""),
    [saved, setSaved] = useState(true),
    [ready, setReady] = useState(false);
  const current = useRef(meeting),
    recordRef = useRef(null),
    audioRef = useRef(null),
    speechRef = useRef(null),
    aiRef = useRef(null),
    storeQueue = useRef(Promise.resolve()),
    stopRef = useRef(false),
    activeJob = useRef(null),
    latestTime = useRef(0),
    optionsRef = useRef(settings),
    busyRef = useRef(false),
    recordingRef = useRef(false);
  const recordingError = useRef(null);
  const liveRef = useRef(null);
  const liveBuffer = useRef([]), liveBufferSize = useRef(0), liveOffset = useRef(0), liveChunkOffset = useRef(0), liveActive = useRef(false);
  optionsRef.current = settings;
  current.current = meeting;
  busyRef.current = busy;
  recordingRef.current = recording;
  const refresh = () => listMeetings().then(setHistory);
  const persist = (value) => {
    setSaved(false);
    storeQueue.current = storeQueue.current
      .then(() => saveMeeting(value))
      .then(() => {
        setSaved(true);
        return refresh();
      })
      .catch((e) => {
        setSaved(false);
        setError("保存失败：" + e.message);
      });
    return storeQueue.current;
  };
  const update = (patch, save = true) => {
    const value = {
      ...current.current,
      ...(typeof patch === "function" ? patch(current.current) : patch),
      updated: Date.now(),
    };
    current.current = value;
    setMeeting(value);
    if (save) persist(value);
    return value;
  };
  const loadAudio = async (id) => {
    const blob = await getAudio(id);
    setAudioURL((old) => {
      if (old) URL.revokeObjectURL(old);
      return blob ? URL.createObjectURL(blob) : "";
    });
    return blob;
  };
  const event = (e) => {
    if (e.type === "progress") setProgress(e);
    if (e.type === "ready") {setReady(true);setProgress(null);}
    if (e.type === "cache" && !e.stored)
      setError("模型可使用，但缓存空间不足，下次可能需要重新下载");
    if (e.type === "segment" && activeJob.current === current.current.id){
      const segment=liveActive.current?{...e.segment,start:e.segment.start+liveChunkOffset.current,end:e.segment.end+liveChunkOffset.current}:e.segment;
      update((m) => ({ rows: [...m.rows, segment] }));
    }
    if (e.type === "fatal") setReady(false);
  };
  if (!speechRef.current) speechRef.current = new SpeechClient(event);
  useEffect(() => {
    let alive = true;
    listMeetings()
      .then(async (rows) => {
        if (!alive) return;
        const id = localStorage.getItem("pocket-minutes-current"),
          item = rows.find((r) => r.id === id) || rows[0];
        if (item) {
          const restored = {
            ...item,
            status: [
              "recording",
              "paused",
              "transcribing",
              "summarizing",
            ].includes(item.status)
              ? "interrupted"
              : item.status,
          };
          current.current = restored;
          setMeeting(restored);
          await loadAudio(item.id);
          if (restored.status !== item.status) persist(restored);
        }
        setHistory(rows);
      })
      .catch((e) => setError(e.message))
      .finally(() => {
        if (alive) {
          setHydrated(true);
          setBusy(false);
          busyRef.current = false;
        }
      });
    return () => {
      alive = false;
      recordRef.current?.stop();
      speechRef.current?.dispose();
      aiRef.current?.dispose();
    };
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem("pocket-minutes-current", meeting.id);
  }, [meeting.id, hydrated]);
  useEffect(() => {
    localStorage.setItem("pocket-minutes-options", JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    const tick = setInterval(() => {
      if (
        recordingRef.current &&
        recordRef.current?.recorder?.state === "recording"
      ) {
        latestTime.current = recordRef.current.duration;
        setTimer(latestTime.current);
      }
    }, 250);
    return () => clearInterval(tick);
  }, []);
  useEffect(() => {
    const resize=()=>document.documentElement.style.setProperty('--app-height',`${window.visualViewport?.height||innerHeight}px`);
    resize();window.visualViewport?.addEventListener('resize',resize);
    return ()=>window.visualViewport?.removeEventListener('resize',resize);
  }, []);
  useEffect(() => {
    const before = (e) => {
      if (recordingRef.current || busyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, []);
  async function perform(task) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    stopRef.current = false;
    try {
      await task();
    } catch (e) {
      if (stopRef.current) update({ status: "stopped" });
      else {
        setError(e.message);
        update({ status: "interrupted" });
      }
    } finally {
      activeJob.current = null;
      setBusy(false);
      busyRef.current = false;
      setProgress(null);
    }
  }
  async function activate(item) {
    await storeQueue.current;
    current.current = item;
    setMeeting(item);
    setQuery("");
    setHistoryOpen(false);
    await loadAudio(item.id);
  }
  async function select(item) {
    if (busyRef.current || recordingRef.current) return;
    await activate(item);
  }
  async function create() {
    if (busyRef.current || recordingRef.current) return;
    const item = blankMeeting();
    await select(item);
    await persist(item);
  }
  async function startRecord() {
    if (busyRef.current || recordingRef.current) return;
    busyRef.current = true;
    stopRef.current=false;
    navigator.storage?.persist?.().catch(()=>{});
    setBusy(true);
    const item = blankMeeting();
    item.title = "会议 " + date(Date.now());
    current.current = item;
    setMeeting(item);
    setError("");
    setAudioURL((old) => {
      if (old) URL.revokeObjectURL(old);
      return "";
    });
    await persist(item);
    let index = 0;
    latestTime.current = 0;
    recordingError.current = null;
    setTimer(0);
    const recorder = (recordRef.current = new MeetingRecorder());
    liveRef.current = new LiveSpeechQueue({
      call: (type, data) => {
        if(type==='live-start'){liveActive.current=true;return speechRef.current.call('init',{options:data.options});}
        if(type==='live-audio'){
          liveChunkOffset.current=liveOffset.current;liveOffset.current+=(data.samples?.length||0)/16000;
          return speechRef.current.call('transcribe',{samples:data.samples,options:settings});
        }
        if(type==='live-finish'){liveActive.current=false;return Promise.resolve();}
      },
      store: liveStore,
      onError: (e) => setError("实时转写暂时中断：" + e.message),
    });
    try {
      await recorder.start({
        system: settings.system,
        onLevel: setLevel,
        onEnded: () => finishRecord(),
        onPcm: (samples) => {
          liveBuffer.current.push(samples);liveBufferSize.current+=samples.length;
          if(liveBufferSize.current>=64000){const packet=new Float32Array(liveBufferSize.current);let at=0;for(const part of liveBuffer.current){packet.set(part,at);at+=part.length;}liveBuffer.current=[];liveBufferSize.current=0;liveRef.current?.push(packet).catch(() => {});}
        },
        onError: (e) => {
          recordingError.current = e;
          finishRecord();
        },
        onChunk: (blob) => {
          const id = item.id,
            n = index++;
          storeQueue.current = storeQueue.current
            .then(() => saveAudio(id, n, blob))
            .then(() =>
              saveMeeting({
                ...current.current,
                duration: recorder.duration,
                audioType: blob.type,
                status: "recording",
              }),
            )
            .catch((e) => {
              recordingError.current = Error("录音保存失败：" + e.message);
              setError(recordingError.current.message);
              queueMicrotask(() => finishRecord());
            });
        },
      });
      if(stopRef.current){await recorder.stop();await storeQueue.current;update({status:'stopped'});await loadAudio(item.id);return;}
      setRecording(true);
      recordingRef.current = true;
      liveBuffer.current=[];liveBufferSize.current=0;liveOffset.current=0;liveChunkOffset.current=0;
      activeJob.current = item.id;
      recordToolUse("minutes");
      void liveRef.current.start({ ...settings }).catch(()=>{});
      setPaused(false);
      update({ status: "recording", audioType: recorder.mime });
    } catch (e) {
      speechRef.current.dispose();
      setError(e.message);
      update({ status: "draft" });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function finishRecord() {
    if (!recordingRef.current) return;
    stopRef.current = false;
    busyRef.current = true;
    setBusy(true);
    recordingRef.current = false;
    setRecording(false);
    setPaused(false);
    try {
      await recordRef.current.stop();
      if(liveBufferSize.current){const packet=new Float32Array(liveBufferSize.current);let at=0;for(const part of liveBuffer.current){packet.set(part,at);at+=part.length;}liveBuffer.current=[];liveBufferSize.current=0;await liveRef.current?.push(packet);}
      latestTime.current = recordRef.current.duration;
      await storeQueue.current;
      if (recordingError.current) throw recordingError.current;
      update({ duration: latestTime.current, status: "transcribing" });
      await storeQueue.current;
      await loadAudio(current.current.id);
      await liveRef.current?.finish();
      activeJob.current = null;
      if (stopRef.current) {
        update({ status: "stopped" });
        return;
      }
      busyRef.current = false;
      if (current.current.rows.length) {
        if (optionsRef.current.autoSpeakers) await diarize(await samples());
        if (optionsRef.current.autoSummary) await summarize();
        update({ status: "complete" });
      } else await transcribe();
    } catch (e) {
      setError(e.message);
      update({
        status: "interrupted",
        audioIncomplete: !!recordingError.current,
      });
      try {
        await loadAudio(current.current.id);
      } catch {}
    } finally {
      activeJob.current = null;
      setProgress(null);
      busyRef.current = false;
      setBusy(false);
    }
  }
  function pause() {
    const value = !paused;
    if (value) recordRef.current.pause();
    else recordRef.current.resume();
    setPaused(value);
    update({ status: value ? "paused" : "recording" });
  }
  async function importFile(file) {
    if (!file || busy || recording) return;
    navigator.storage?.persist?.().catch(()=>{});
    await perform(async () => {
      const item = blankMeeting();
      item.title = file.name.replace(/\.[^.]+$/, "");
      item.audioType = file.type;
      item.originalName = file.name;
      await activate(item);
      await saveAudio(item.id, 0, file);
      recordToolUse('minutes');
      await persist(item);
      await loadAudio(item.id);
    });
    if (!busyRef.current) await transcribe();
  }
  async function samples() {
    const id = current.current.id;
    await storeQueue.current;
    const blob = await getAudio(id);
    if (!blob?.size) throw Error("请先录音或导入文件");
    setProgress({ label: "解码音频", percent: 0 });
    return audioSamples(blob);
  }
  async function diarize(pcm) {
    if (stopRef.current) throw Error("已停止");
    setProgress({ label: "区分说话人", percent: 0 });
    const result = await speechRef.current.call("speakers", {
      samples: pcm,
      count: optionsRef.current.speakerCount || -1,
    });
    if (stopRef.current) throw Error("已停止");
    update((m) => ({ rows: assignSpeakers(m.rows, result.turns) }));
  }
  async function summarize() {
    const item = current.current;
    if (!item.rows.length) throw Error("请先完成转写");
    update({ status: "summarizing" });
    setTab("summary");
    if(optionsRef.current.summaryEngine==='extract'){
      update({summary:extractMinutes(item.rows,item.names)});
      return;
    }
    if (!aiRef.current)
      aiRef.current = new SummaryClient({
        onProgress: (p) =>
          setProgress({
            label: p.status || "加载纪要模型",
            percent: Math.round((p.value || 0) * 100),
          }),
        onPhase: () => setProgress({ label: "正在整理纪要", percent: null }),
      });
    const ai = aiRef.current;
    await ai.load();
    const batches = summaryBatches(item.rows, 3200, item.names),
      notes = [];
    for (let i = 0; i < batches.length; i++) {
      if (stopRef.current) break;
      setProgress({
        label: `整理纪要 ${i + 1}/${batches.length}`,
        percent: Math.round((i / batches.length) * 100),
      });
      ai.resetContext();
      const raw = await ai.ask([
        { role: "user", content: minutesPrompt(batches[i], item.title) },
      ]);
      const answer = splitThinking(raw).answer.trim();
      if (!answer) throw Error("纪要模型未返回正文，请重试");
      notes.push(answer);
      update({ summary: notes.join("\n\n---\n\n") });
    }
    if (stopRef.current) return;
    if (notes.length > 1) {
      let combined = notes;
      while (combined.join("\n").length > 7000) {
        const reduced = [];
        for (let i = 0; i < combined.length; i += 2) {
          if (stopRef.current) return;
          ai.resetContext();
          const raw = await ai.ask([
            {
              role: "user",
              content:
                minutesPrompt(
                  combined.slice(i, i + 2).join("\n\n"),
                  item.title,
                ) + "\n精简重复内容，保留所有决定和待办。",
            },
          ]);
          const answer = splitThinking(raw).answer.trim();
          if (!answer) throw Error("合并纪要未返回正文");
          reduced.push(answer);
        }
        if (reduced.join("").length >= combined.join("").length)
          throw Error("分段纪要过长，请分次整理");
        combined = reduced;
      }
      ai.resetContext();
      const raw = await ai.ask([
        {
          role: "user",
          content:
            minutesPrompt(combined.join("\n\n"), item.title) +
            "\n合并上面的分段纪要，去除重复，不增加原文没有的事实。",
        },
      ]);
      const answer = splitThinking(raw).answer.trim();
      if (!answer) throw Error("纪要模型未返回正文");
      update({ summary: answer });
    }
  }
  async function transcribe() {
    await perform(async () => {
      const options = optionsRef.current;
      activeJob.current = current.current.id;
      const pcm = await samples();
      if (stopRef.current) {
        update({ status: "stopped" });
        return;
      }
      update({
        rows: [],
        summary: "",
        status: "transcribing",
        duration: pcm.length / 16000,
      });
      setTab("transcript");
      const result = await speechRef.current.call("transcribe", {
        samples: pcm,
        options,
      });
      if (result.cancelled || stopRef.current) {
        update({ status: "stopped" });
        return;
      }
      if (!current.current.rows.length) {
        update({ status: "complete" });
        message.info("未检测到可识别的语音");
        return;
      }
      if (options.autoSpeakers) await diarize(await samples());
      if (!stopRef.current && options.autoSummary) await summarize();
      update({ status: stopRef.current ? "stopped" : "complete" });
      if (current.current.audioIncomplete)
        setError("此录音曾发生保存中断，部分内容可能缺失");
    });
  }
  async function exportFile(format) {
    if (busyRef.current || recordingRef.current) return;
    busyRef.current = true;
    setBusy(true);
    stopRef.current = false;
    try {
      const item = current.current,
        name = item.title.replace(/[<>:"/\\|?*]/g, "_") || "会议";
      if (format === "audio") {
        const blob = await getAudio(item.id);
        if (!blob) throw Error("没有录音");
        download(
          blob,
          item.originalName ||
            name +
              (blob.type.includes("mp4")
                ? ".m4a"
                : blob.type.includes("wav")
                  ? ".wav"
                  : ".webm"),
          blob.type,
        );
      } else if (format === "wav") {
        const pcm = await samples();
        if (!stopRef.current)
          download(wavBytes(pcm), name + ".wav", "audio/wav");
      } else if (format === "json")
        download(
          JSON.stringify(item, null, 2),
          name + ".json",
          "application/json",
        );
      else if (format === "md")
        download(
          `# ${item.title}\n\n${item.summary}\n\n## 转写\n\n${exportTranscript(item.rows, "txt", item.names)}`,
          name + ".md",
          "text/markdown",
        );
      else
        download(
          exportTranscript(item.rows, format, item.names),
          name + "." + format,
        );
      setProgress(null);
    } catch (e) {
      setError(e.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
      setProgress(null);
    }
  }
  const actionsDisabled = busy || recording,
    rows = meeting.rows.filter(
      (r) => !query || r.text.toLowerCase().includes(query.toLowerCase()),
    ),
    speakerIds = [
      ...new Set(
        meeting.rows.filter((r) => r.speaker != null).map((r) => r.speaker),
      ),
    ];
  function historyList() {
    return (
      <div className="history-list">
        {history.length ? (
          history.map((item) => (
            <div
              key={item.id}
              className={
                "history-item " + (meeting.id === item.id ? "selected" : "")
              }
            >
              <button disabled={actionsDisabled} onClick={() => select(item)}>
                <strong>{item.title}</strong>
                <span>
                  {date(item.updated)} · {clock(item.duration).slice(0, 8)}
                </span>
              </button>
              <Popconfirm
                title="删除会议和录音？"
                onConfirm={async () => {
                  if (busyRef.current || recordingRef.current) return;
                  busyRef.current = true;
                  setBusy(true);
                  try {
                    await storeQueue.current;
                    await removeMeeting(item.id);
                    await refresh();
                    if (current.current.id === item.id) {
                      const fresh = blankMeeting();
                      await activate(fresh);
                      await persist(fresh);
                    }
                  } catch (e) {
                    setError(e.message);
                  } finally {
                    busyRef.current = false;
                    setBusy(false);
                  }
                }}
                disabled={actionsDisabled}
                okText="删除"
                cancelText="取消"
              >
                <Button
                  type="text"
                  size="small"
                  disabled={actionsDisabled}
                  danger
                  aria-label={"删除 " + item.title}
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </div>
          ))
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无会议" />
        )}
      </div>
    );
  }
  const transcript = (
    <section
      className={
        "content-panel transcript " +
        (tab === "transcript" ? "mobile-active" : "")
      }
    >
      <div className="panel-heading">
        <h2>
          语音转写 <small>{meeting.rows.length} 段</small>
        </h2>
        <Space size={4}>
          <Tooltip title="区分说话人">
            <Button
              type="text"
              aria-label="区分说话人"
              icon={<TeamOutlined />}
              disabled={actionsDisabled || !meeting.rows.length}
              onClick={() =>
                perform(async () => {
                  await diarize(await samples());
                  update({ status: "complete" });
                })
              }
            />
          </Tooltip>
          <Tooltip title="发言人名称">
            <Button
              type="text"
              aria-label="编辑发言人"
              icon={<EditOutlined />}
              disabled={!speakerIds.length || actionsDisabled}
              onClick={() => setSpeakerOpen(true)}
            />
          </Tooltip>
          <Tooltip title="复制转写">
            <Button
              type="text"
              aria-label="复制转写"
              icon={<CopyOutlined />}
              disabled={!meeting.rows.length}
              onClick={() =>
                navigator.clipboard
                  .writeText(
                    exportTranscript(meeting.rows, "txt", meeting.names),
                  )
                  .then(() => message.success("已复制"))
                  .catch(() => message.error("复制失败"))
              }
            />
          </Tooltip>
        </Space>
      </div>
      <div className="search">
        <Input.Search
          allowClear
          placeholder="搜索转写"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="transcript-scroll">
        {rows.length ? (
          rows.map((row) => (
            <article className="segment" key={row.id}>
              <button
                className="timestamp"
                aria-label={"播放 " + clock(row.start)}
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = row.start;
                    audioRef.current.play().catch(() => {});
                  }
                }}
              >
                {clock(row.start).slice(0, 8)}
              </button>
              <div className="segment-copy">
                {row.speaker != null && (
                  <span className="speaker-label">
                    {meeting.names[row.speaker] ||
                      "发言人 " + (Number(row.speaker) + 1)}
                  </span>
                )}
                {editing === row.id ? (
                  <div>
                    <Input.TextArea
                      autoSize={{ minRows: 2, maxRows: 8 }}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <Space size={4}>
                      <Button
                        size="small"
                        type="link"
                        onClick={() => {
                          update((m) => ({
                            rows: m.rows.map((r) =>
                              r.id === row.id ? { ...r, text: editText } : r,
                            ),
                          }));
                          setEditing(null);
                        }}
                      >
                        保存
                      </Button>
                      <Button
                        size="small"
                        type="text"
                        onClick={() => setEditing(null)}
                      >
                        取消
                      </Button>
                    </Space>
                  </div>
                ) : (
                  <button
                    className="segment-text"
                    disabled={busy || recording}
                    title="点击编辑"
                    onClick={() => {
                      setEditing(row.id);
                      setEditText(row.text);
                    }}
                  >
                    {row.text}
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="empty-panel">
            <SoundOutlined />
            <p>
              {recording ? "聆听中…" : busy
                ? "正在识别语音…"
                : query
                  ? "没有匹配内容"
                  : "录音或导入音视频"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
  const summary = (
    <section
      className={
        "content-panel summary " + (tab === "summary" ? "mobile-active" : "")
      }
    >
      <div className="panel-heading">
        <h2>会议纪要</h2>
        <Space size={4}>
          <Tooltip title="复制纪要">
            <Button
              type="text"
              aria-label="复制纪要"
              icon={<CopyOutlined />}
              disabled={!meeting.summary}
              onClick={() =>
                navigator.clipboard
                  .writeText(meeting.summary)
                  .then(() => message.success("已复制"))
                  .catch(() => message.error("复制失败"))
              }
            />
          </Tooltip>
          <Button
            size="small"
            disabled={actionsDisabled || !meeting.rows.length}
            onClick={() =>
              perform(async () => {
                await summarize();
                update({ status: "complete" });
              })
            }
          >
            {meeting.summary ? "重新整理" : "整理纪要"}
          </Button>
        </Space>
      </div>
      {meeting.summary ? (
        <Input.TextArea
          className="summary-editor"
          aria-label="会议纪要"
          value={meeting.summary}
          disabled={busy}
          onChange={(e) => update({ summary: e.target.value })}
        />
      ) : (
        <div className="empty-panel">
          <FileTextOutlined />
          <p>
            {meeting.status === "summarizing"
              ? "正在整理会议内容…"
              : "摘要、决定与待办"}
          </p>
        </div>
      )}
    </section>
  );
  return (
    <div className="minutes-shell">
      <header className="tool-header">
        <a href="../../" className="back" aria-label="返回口袋工具箱">
          <ArrowLeftOutlined />
        </a>
        <FileTextOutlined className="brand-icon" />
        <h1>会议纪要</h1>
        <span className="save-status">
          <CheckOutlined />
          {saved ? "已保存" : "保存中"}
        </span>
        <div className="header-actions">
          <Button
            className="mobile-history"
            aria-label="会议记录"
            icon={<HistoryOutlined />}
            onClick={() => setHistoryOpen(true)}
          />
            <Tooltip title="设置">
            <Button
              aria-label="设置"
              icon={<SettingOutlined />}
              onClick={() => setSettingsOpen(true)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: "md", label: "Markdown 纪要" },
                { key: "txt", label: "TXT 转写" },
                { key: "json", label: "JSON 数据" },
                { key: "srt", label: "SRT 字幕" },
                { key: "vtt", label: "VTT 字幕" },
                { type: "divider" },
                { key: "audio", label: "原始录音" },
                { key: "wav", label: "WAV 音频" },
              ],
              onClick: ({ key }) => exportFile(key),
            }}
            disabled={recording || busy}
          >
            <Button aria-label="导出" icon={<DownloadOutlined aria-hidden />}>
              <span className="export-label">导出</span>
            </Button>
          </Dropdown>
        </div>
      </header>
      <div className="minutes-layout">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>会议记录</span>
            <Button
              type="text"
              icon={<PlusOutlined />}
              aria-label="新建会议"
              disabled={actionsDisabled}
              onClick={create}
            />
          </div>
          {historyList()}
          <div className="sidebar-foot">
            <span className={"model-dot " + (ready ? "ready" : "")} />
            {ready ? "语音引擎已就绪" : "本地语音引擎"}
          </div>
        </aside>
        <main className="minutes-main">
          <div className="meeting-heading">
            <Input
              aria-label="会议标题"
              variant="borderless"
              value={meeting.title}
              disabled={actionsDisabled}
              onChange={(e) => update({ title: e.target.value })}
            />
            <Tag color={recording ? "red" : busy ? "processing" : "default"}>
              {statusText[meeting.status] || "待处理"}
            </Tag>
          </div>
          <div className="record-bar">
            <div className="record-controls">
              {recording ? (
                <>
                  <Button
                    aria-label={paused ? "继续录音" : "暂停录音"}
                    icon={paused ? <CaretRightOutlined /> : <PauseOutlined />}
                    onClick={pause}
                  />
                  <Button
                    danger
                    aria-label="结束录音"
                    icon={<BorderOutlined />}
                    onClick={finishRecord}
                  >
                    结束录音
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="primary"
                    aria-label="开始录音"
                    icon={<AudioOutlined />}
                    disabled={busy}
                    onClick={startRecord}
                  >
                    开始录音
                  </Button>
                  <label
                    className={"import-button " + (busy ? "disabled" : "")}
                  >
                    <UploadOutlined />
                    <span>导入文件</span>
                    <input
                      aria-label="导入音视频"
                      type="file"
                      accept="audio/*,video/*,.wav,.mp3,.m4a,.mp4,.webm,.ogg,.flac,.aac,.mov,.mkv"
                      disabled={actionsDisabled}
                      onChange={(e) => {
                        importFile(e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </>
              )}
            </div>
            <div className="record-meter">
              <div className="meter-bars" aria-hidden="true">
                {Array.from({ length: 18 }, (_, i) => (
                  <i
                    key={i}
                    style={{
                      height:
                        recording && !paused
                          ? `${8 + Math.min(32, level * 280) * (1 - Math.abs(i - 8.5) / 12)}px`
                          : "5px",
                    }}
                  />
                ))}
              </div>
              <time>
                {clock(recording ? timer : meeting.duration).slice(0, 8)}
              </time>
            </div>
            <div className="record-extra">
              {busy ? (
                <Button
                  icon={<BorderOutlined />}
                  aria-label="停止"
                  danger
                  onClick={() => {
                    stopRef.current = true;
                    speechRef.current.stop();
                    if (aiRef.current?.ready) aiRef.current.stop();
                    else aiRef.current?.dispose();
                  }}
                >
                  停止
                </Button>
              ) : audioURL && !recording ? (
                <Button
                  disabled={actionsDisabled}
                  aria-label={meeting.rows.length ? "重新转写" : "开始转写"}
                  icon={<CaretRightOutlined />}
                  onClick={transcribe}
                >
                  {meeting.rows.length ? "重新转写" : "开始转写"}
                </Button>
              ) : (
                <Select
                  aria-label="录音来源"
                  value={settings.system ? "system" : "mic"}
                  disabled={recording}
                  options={[
                    { value: "mic", label: "麦克风" },
                    ...(!navigator.mediaDevices?.getDisplayMedia?[]:[{ value: "system", label: "系统音频 + 麦克风" }]),
                  ]}
                  onChange={(value) =>
                    setSettings({ ...settings, system: value === "system" })
                  }
                />
              )}
            </div>
          </div>
          {progress && (
            <div className="job-progress" role="status">
              <span>
                <LoadingOutlined /> {progress.label}
              </span>
              {progress.percent!=null&&<Progress
                percent={Math.max(
                  0,
                  Math.min(100, Number(progress.percent) || 0),
                )}
                size="small"
              />}
            </div>
          )}
          {error && (
            <div className="error-bar" role="alert">
              <span>{error}</span>
              <Button
                size="small"
                type="text"
                aria-label="关闭提示"
                onClick={() => setError("")}
              >
                关闭
              </Button>
            </div>
          )}
          <div className="mobile-tabs">
            <Segmented
              block
              value={tab}
              onChange={setTab}
              options={[
                { value: "transcript", label: "语音转写" },
                { value: "summary", label: "会议纪要" },
              ]}
            />
          </div>
          <div className="editor-layout">
            {transcript}
            {summary}
          </div>
          {audioURL && !recording && (
            <div className="audio-player">
              <SoundOutlined />
              <audio
                aria-label="会议录音"
                ref={audioRef}
                controls
                src={audioURL}
                preload="metadata"
              />
            </div>
          )}
        </main>
      </div>
      <Drawer
        title="会议记录"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        width={300}
      >
        <Button
          block
          icon={<PlusOutlined />}
          onClick={create}
          disabled={actionsDisabled}
        >
          新建会议
        </Button>
        {historyList()}
      </Drawer>
      <Modal
        title="设置"
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        onOk={() => setSettingsOpen(false)}
        okText="完成"
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <Form layout="vertical">
          <div className="settings-row">
            <span>转写后自动整理纪要</span>
            <Switch
              checked={settings.autoSummary}
              onChange={(v) => setSettings({ ...settings, autoSummary: v })}
            />
          </div>
          <div className="settings-row">
            <span>自动区分说话人</span>
            <Switch
              checked={settings.autoSpeakers}
              onChange={(v) => setSettings({ ...settings, autoSpeakers: v })}
            />
          </div>
          <Form.Item label="识别语言">
            <Select
              value={settings.language}
              options={[
                { value: "", label: "自动识别" },
                { value: "Chinese", label: "中文" },
                { value: "English", label: "英语" },
                { value: "Japanese", label: "日语" },
              ]}
              onChange={(v) => setSettings({ ...settings, language: v })}
            />
          </Form.Item>
          <Form.Item label="会议热词">
            <Input
              placeholder="人名、术语，用逗号分隔"
              value={settings.hotwords}
              onChange={(e) =>
                setSettings({ ...settings, hotwords: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="说话人数">
            <InputNumber
              min={1}
              max={100}
              placeholder="自动"
              value={settings.speakerCount}
              onChange={(v) => setSettings({ ...settings, speakerCount: v })}
            />
          </Form.Item>
          <Form.Item label="识别模型">
            <Select value={settings.engine||'funasr'} disabled={actionsDisabled}
              options={[{value:'sensevoice',label:'轻量 · 240 MB'},{value:'funasr',label:'标准 · 1 GB'}]}
              onChange={engine=>{speechRef.current.dispose();setReady(false);setSettings({...settings,engine});}} />
          </Form.Item>
          <Form.Item label="纪要整理">
            <Select value={settings.summaryEngine||'ai'} disabled={actionsDisabled}
              options={[{value:'extract',label:'原文摘录'},{value:'ai',label:'AI 整理 · 2.8 GB'}]}
              onChange={summaryEngine=>setSettings({...settings,summaryEngine})} />
          </Form.Item>
          <Button
            style={{ marginTop: 16 }}
            disabled={busy || recording}
            loading={busy && progress?.percent < 100}
            onClick={() =>
              perform(() =>
                speechRef.current.call("init", { options: settings }),
              )
            }
          >
            {ready ? "语音引擎已就绪" : "预加载语音模型"}
          </Button>
        </Form>
      </Modal>
      <Modal
        title="发言人"
        open={speakerOpen}
        onCancel={() => setSpeakerOpen(false)}
        onOk={() => setSpeakerOpen(false)}
        okText="完成"
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <Form layout="vertical">
          {speakerIds.map((id) => (
            <Form.Item key={id} label={"发言人 " + (Number(id) + 1)}>
              <Input
                aria-label={"发言人 " + (Number(id) + 1)}
                value={meeting.names[id] || ""}
                onChange={(e) =>
                  update((m) => ({
                    names: { ...m.names, [id]: e.target.value },
                  }))
                }
              />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
}
createRoot(document.getElementById("root")).render(
  <ConfigProvider
    locale={zhCN}
    button={{ autoInsertSpace: false }}
    theme={{
      token: {
        colorPrimary: "#315fc9",
        colorText: "#242d3a",
        colorBgLayout: "#f5f6f8",
        borderRadius: 8,
        fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
        fontSize: 14,
        controlHeight: 36,
      },
      components: {
        Button: { primaryShadow: "none" },
        Input: { activeShadow: "0 0 0 2px rgba(49,95,201,.08)" },
      },
    }}
  >
    <App>
      <Minutes />
    </App>
  </ConfigProvider>,
);
