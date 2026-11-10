(() => {
  const input = document.getElementById('inputValue');
  const from = document.getElementById('fromFormat');
  const to = document.getElementById('toFormat');
  const width = document.getElementById('byteLength');
  const output = document.getElementById('outputValue');
  const error = document.getElementById('conversionError');
  const copy = document.getElementById('copyOutput');
  const status = document.getElementById('copyStatus');
  const previews = { hex:'previewHex', dec:'previewDec', reversedHex:'previewReversedHex', reversedDec:'previewReversedDec' };
  let result = '';

  function update() {
    result = '';
    error.textContent = '';
    status.textContent = '';
    for (const id of Object.values(previews)) document.getElementById(id).textContent = '—';
    try {
      result = UIDTools.convert(input.value, from.value, to.value, width.value);
      output.textContent = result || '等待输入';
      if (result) for (const [format, id] of Object.entries(previews)) document.getElementById(id).textContent = UIDTools.convert(input.value, from.value, format, width.value);
    } catch (exception) {
      output.textContent = '—';
      error.textContent = exception.message;
    }
    copy.disabled = !result;
  }
  input.addEventListener('input', update);
  for (const select of [from, to, width]) select.addEventListener('change', update);
  document.getElementById('fillExample').addEventListener('click', () => {
    input.value = '04A100F2'; from.value = 'hex'; to.value = 'dec'; width.value = '4'; update();
  });
  document.getElementById('swapFormats').addEventListener('click', () => {
    if (result) input.value = result;
    [from.value, to.value] = [to.value, from.value];
    update();
  });
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(result); status.textContent = '已复制'; }
    catch (_) { status.textContent = '请选中结果手动复制'; }
  });
  const preset = new URLSearchParams(location.search).get('hex');
  if (preset) input.value = preset.slice(0, 512);
  update();
})();
