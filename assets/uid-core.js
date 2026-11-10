(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UIDTools = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const formats = ['hex', 'dec', 'reversedHex', 'reversedDec'];
  function hex(value) {
    const normalized = String(value).trim().replace(/^0x/i, '').replace(/[\s:-]/g, '');
    if (!normalized || !/^[0-9a-f]+$/i.test(normalized)) throw new Error('请输入有效的十六进制值');
    return (normalized.length % 2 ? '0' : '') + normalized.toUpperCase();
  }
  function decimal(value) {
    const normalized = String(value).trim();
    if (!/^\d+$/.test(normalized)) throw new Error('请输入非负十进制整数');
    return hex(BigInt(normalized).toString(16));
  }
  function reverse(value) { return hex(value).match(/../g).reverse().join(''); }
  function fit(value, byteLength) {
    if (byteLength === 'auto' || byteLength == null) return value;
    const length = Number(byteLength);
    if (![4, 7, 10].includes(length)) throw new Error('不支持的字节长度');
    if (value.length > length * 2) throw new Error('输入值超过所选字节长度');
    return value.padStart(length * 2, '0');
  }
  function convert(value, from = 'hex', to = 'dec', byteLength = 'auto') {
    if (!formats.includes(from) || !formats.includes(to)) throw new Error('不支持的输入或输出格式');
    if (!String(value).trim()) return '';
    let canonical = fit(from === 'dec' || from === 'reversedDec' ? decimal(value) : hex(value), byteLength);
    if (from === 'reversedHex' || from === 'reversedDec') canonical = reverse(canonical);
    switch (to) {
      case 'hex': return canonical;
      case 'dec': return BigInt('0x' + canonical).toString(10);
      case 'reversedHex': return reverse(canonical);
      case 'reversedDec': return BigInt('0x' + reverse(canonical)).toString(10);
    }
  }
  return { convert, hex, reverse, formats };
});
