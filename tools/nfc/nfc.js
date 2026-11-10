(() => {
  const scan = document.getElementById('scanNfc');
  const stop = document.getElementById('stopNfc');
  const write = document.getElementById('writeNfc');
  const input = document.getElementById('writeData');
  const status = document.getElementById('nfcStatus');
  const writeStatus = document.getElementById('writeStatus');
  const supported = isSecureContext && typeof window.NDEFReader === 'function';
  let controller = null;
  let scanner = null;
  let writing = false;
  let details = null;

  function message(text, tone = '') { status.textContent = text; status.dataset.tone = tone; }
  function updateButtons() {
    scan.disabled = !supported || !!controller || writing;
    stop.disabled = !controller;
    write.disabled = !supported || !!controller || writing || !input.value.trim();
    scan.textContent = controller ? '扫描中，请靠近标签' : '扫描 NFC 标签';
    write.textContent = writing ? '等待标签，请靠近设备' : '写入 NFC 标签';
  }
  function stopScan() {
    controller?.abort();
    controller = null;
    if (scanner) { scanner.onreading = null; scanner.onreadingerror = null; }
    scanner = null;
    updateButtons();
  }
  function bytesToHex(data) {
    if (!data) return '';
    const bytes = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  function recordInfo(record) {
    const rawData = bytesToHex(record.data);
    let data = rawData;
    if (record.data) {
      try {
        data = new TextDecoder(record.encoding || 'utf-8', { fatal: true }).decode(record.data);
        try { data = JSON.parse(data); } catch (_) {}
      } catch (_) {}
    }
    return { recordType:record.recordType, mediaType:record.mediaType || '', id:record.id || '', encoding:record.encoding || '', lang:record.lang || '', data, rawData };
  }
  function errorMessage(error) {
    if (error.name === 'NotAllowedError') return '未获得 NFC 权限，请允许后重试';
    if (error.name === 'NotSupportedError') return '设备或标签不支持此 NFC 操作';
    if (error.name === 'NotReadableError') return '无法读取标签，请检查 NFC 开关并重新靠近';
    if (error.name === 'NetworkError') return '标签读写中断，请保持标签靠近设备';
    return 'NFC 操作失败，请检查设备与标签后重试';
  }
  function onReading(event) {
    try {
      const records = Array.from(event.message?.records || [], recordInfo);
      const serial = String(event.serialNumber || '');
      let uid = serial ? UIDTools.hex(serial) : '';
      let source = serial ? '标签序列号' : '';
      if (!uid && records[0] && [8,14,20].includes(records[0].rawData.length)) {
        uid = records[0].rawData;
        source = '取自记录数据';
      }
      details = { serialNumber:serial, uid, uidSource:source, timestamp:new Date().toISOString(), records };
      document.getElementById('uidHex').value = uid;
      document.getElementById('uidDec').value = uid ? UIDTools.convert(uid, 'hex', 'dec') : '';
      document.getElementById('uidReversedDec').value = uid ? UIDTools.convert(uid, 'hex', 'reversedDec') : '';
      document.getElementById('uidSource').textContent = source ? '· ' + source : '';
      document.getElementById('nfcRecords').value = JSON.stringify(details, null, 2);
      document.getElementById('copyNfc').disabled = false;
      document.getElementById('converterLink').href = '../uid/' + (uid ? '?hex=' + encodeURIComponent(uid) : '');
      message(uid ? '标签读取成功 · ' + uid : '已读取记录，标签未提供 UID', 'success');
      document.querySelector('[data-nfc-view="info"]').click();
    } catch (_) { message('标签数据解析失败，请重新扫描', 'error'); }
    finally { stopScan(); }
  }
  scan.addEventListener('click', async () => {
    if (!supported || controller || writing) return;
    controller = new AbortController();
    scanner = new NDEFReader();
    scanner.onreading = onReading;
    scanner.onreadingerror = () => { message('标签读取失败，请重新靠近后扫描', 'error'); stopScan(); };
    const current = controller;
    updateButtons();
    message('请将 NFC 标签靠近设备');
    try { await scanner.scan({ signal:current.signal }); }
    catch (error) { if (error.name !== 'AbortError') message(errorMessage(error), 'error'); if (controller === current) stopScan(); }
  });
  stop.addEventListener('click', () => { stopScan(); message('扫描已停止'); });
  input.addEventListener('input', updateButtons);
  write.addEventListener('click', async () => {
    if (write.disabled) return;
    writing = true;
    updateButtons();
    writeStatus.textContent = '请保持标签靠近设备';
    try {
      const writer = new NDEFReader();
      await writer.write({ records:[{ recordType:'text', data:input.value }] });
      writeStatus.textContent = '写入成功';
      message('文本已写入 NFC 标签', 'success');
    } catch (error) { writeStatus.textContent = '写入失败'; message(errorMessage(error), 'error'); }
    finally { writing = false; updateButtons(); }
  });
  document.getElementById('copyNfc').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(details, null, 2)); message('标签详情已复制', 'success'); }
    catch (_) { message('请选中标签详情手动复制'); }
  });
  document.querySelectorAll('[data-nfc-view]').forEach(button => button.addEventListener('click', () => {
    document.getElementById('nfcPanels').dataset.view = button.dataset.nfcView;
    document.querySelectorAll('[data-nfc-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  window.addEventListener('pagehide', stopScan);
  message(supported ? '设备已就绪，点击扫描开始' : !isSecureContext ? '请使用 HTTPS 打开 NFC 工具' : '此设备不支持 Web NFC；可使用 Android Chrome');
  updateButtons();
})();
