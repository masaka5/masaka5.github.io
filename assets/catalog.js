/* 新增工具时，只需在 tools 中添加一项；新增类别时，在 categories 中添加一项。 */
const ToolboxCatalog = {
  categories: [
    { id:'hardware', name:'硬件测试', icon:'cpu' },
    { id:'nfc', name:'卡片工具', icon:'nfc' },
    { id:'windows', name:'Windows 运维', icon:'windows' },
    { id:'network', name:'网络工具', icon:'network' },
    { id:'ai', name:'AI 助手', icon:'chat' }
  ],
  tools: [
    {
      id:'stress', category:'hardware', name:'硬件压测',
      description:'CPU · 内存 · GPU · 磁盘',
      href:'tools/stress/', icon:'cpu', tags:['CPU','内存','GPU','磁盘'],
      keywords:'压力测试 性能 线程 stress'
    },
    {
      id:'monitor', category:'hardware', name:'显示器检测',
      description:'坏点 · 漏光 · 色阶 · 拖影',
      href:'tools/monitor/', icon:'monitor', tags:['屏幕','坏点','漏光','色阶','网格'],
      keywords:'显示器 检测 对焦 对比度 饱和度 渐变 拖影 screen monitor'
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
    },
    {id:'windows-errors',category:'windows',name:'Windows 错误码',description:'错误查询 · 中文排查建议',href:'tools/windows-errors/',icon:'windows',tags:['错误码','蓝屏','HRESULT'],keywords:'Win32 Winsock NTSTATUS Windows 系统错误'},
    {id:'subnet',category:'network',name:'IP／子网计算器',description:'IPv4 · IPv6 · 子网掩码',href:'tools/subnet/',icon:'network',tags:['IP','CIDR','子网'],keywords:'网段 网络地址 广播 可用地址 掩码'},
    {id:'ip-batch',category:'network',name:'IP 批量整理',description:'去重排序 · 网段合并',href:'tools/ip-batch/',icon:'network',tags:['IP','CIDR','合并'],keywords:'IPv4 IPv6 批量 地址范围 整理'},
    {id:'mac',category:'network',name:'MAC 地址转换',description:'格式转换 · 地址类型',href:'tools/mac/',icon:'convert',tags:['MAC','OUI','EUI-64'],keywords:'物理地址 网卡 单播 组播 广播'},
    {id:'network',category:'network',name:'网络测速与延迟',description:'上下行测速 · 服务访问延迟',href:'tools/network/',icon:'network',tags:['测速','延迟','网络'],keywords:'带宽 下载 上传 运营商 云服务 游戏 厂商 HTTPS WeGame Steam Epic 战网 EA Ubisoft Xbox'},
    {id:'ai',category:'ai',name:'AI 助手',description:'对话 · 图片 · 文本附件',href:'tools/ai/',icon:'chat',tags:['AI','图片','文件'],keywords:'ChatGPT 豆包 助手 API 上传 对话'}
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = ToolboxCatalog;
