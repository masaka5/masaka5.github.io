/* 新增工具时，只需在 tools 中添加一项；新增类别时，在 categories 中添加一项。 */
const ToolboxCatalog = {
  categories: [
    { id:'hardware', name:'硬件测试', icon:'cpu' },
    { id:'nfc', name:'卡片工具', icon:'nfc' }
  ],
  tools: [
    {
      id:'stress', category:'hardware', name:'硬件压测',
      description:'CPU · 内存 · GPU · 磁盘',
      href:'tools/stress/', icon:'cpu', tags:['CPU','内存','GPU','磁盘'],
      keywords:'压力测试 性能 线程 stress'
    },
    {
      id:'nfc', category:'nfc', name:'NFC 读写',
      description:'扫描标签与写入文本',
      href:'tools/nfc/', icon:'nfc', tags:['标签扫描','文本写入'],
      keywords:'NDEF 序列号 NFC Android'
    },
    {
      id:'uid', category:'nfc', name:'UID 格式转换',
      description:'进制与字节顺序转换',
      href:'tools/uid/', icon:'convert', tags:['进制转换','字节反转'],
      keywords:'hex decimal 16 10 大整数 前导零'
    }
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = ToolboxCatalog;
