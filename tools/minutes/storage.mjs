let opened;
export function database() {
  return (opened ||= new Promise((resolve, reject) => {
    const r = indexedDB.open("pocket-minutes", 2);
    r.onupgradeneeded = () => {
      if(!r.result.objectStoreNames.contains("meetings"))r.result.createObjectStore("meetings", { keyPath: "id" });
      if(!r.result.objectStoreNames.contains("audio"))r.result.createObjectStore("audio", { keyPath: ["meeting", "index"] });
      if(!r.result.objectStoreNames.contains("live"))r.result.createObjectStore("live", { keyPath: "id" });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  }));
}
export async function transaction(store, mode, work) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode),
      request = work(tx.objectStore(store));
    let value;
    request.onsuccess = () => {
      value = request.result;
    };
    tx.oncomplete = () => resolve(value);
    tx.onabort = tx.onerror = () => reject(tx.error || Error("浏览器存储失败"));
  });
}
export const saveMeeting = (value) =>
  transaction("meetings", "readwrite", (s) => s.put(value));
export const listMeetings = () =>
  transaction("meetings", "readonly", (s) => s.getAll()).then((a) =>
    a.sort((a, b) => b.updated - a.updated),
  );
export const saveAudio = (meeting, index, blob) =>
  transaction("audio", "readwrite", (s) => s.put({ meeting, index, blob }));
export const liveStore = {
  put: (id,samples) => transaction('live','readwrite',s=>s.put({id,samples})),
  get: id => transaction('live','readonly',s=>s.get(id)).then(row=>row.samples),
  remove: id => transaction('live','readwrite',s=>s.delete(id)),
};
export async function getAudio(meeting) {
  const rows = await transaction("audio", "readonly", (s) =>
    s.getAll(
      IDBKeyRange.bound([meeting, 0], [meeting, Number.MAX_SAFE_INTEGER]),
    ),
  );
  return rows.length
    ? new Blob(
        rows.map((r) => r.blob),
        { type: rows[0].blob.type },
      )
    : null;
}
export async function removeMeeting(id) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["meetings", "audio"], "readwrite");
    tx.objectStore("meetings").delete(id);
    tx.objectStore("audio").delete(
      IDBKeyRange.bound([id, 0], [id, Number.MAX_SAFE_INTEGER]),
    );
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error);
  });
}
export function blankMeeting() {
  return {
    id: crypto.randomUUID(),
    title: "未命名会议",
    created: Date.now(),
    updated: Date.now(),
    rows: [],
    summary: "",
    names: {},
    duration: 0,
    status: "draft",
    audioType: "",
  };
}
