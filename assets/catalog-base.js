/* 新增工具时，只需在 tools 中添加一项；新增类别时，在 categories 中添加一项。 */
const ToolboxCatalog = {
  categories: [
    { id:'hardware', name:'硬件检测', icon:'cpu' },
    { id:'network', name:'网络运维', icon:'network' },
    { id:'windows', name:'系统运维', icon:'terminal' },
    { id:'peripheral', name:'设备与采集', icon:'devices' },
    { id:'nfc', name:'NFC 工具', icon:'nfc' },
    { id:'text', name:'文本与代码', icon:'convert' },
    { id:'ai', name:'AI 助手', icon:'chat' },
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
    {id:'system-commands',category:'windows',name:'系统命令速查',description:'CMD · PowerShell · Linux',href:'tools/system-commands/',icon:'terminal',tags:['CMD','PowerShell','Linux','命令'],keywords:'命令行 终端 shell 原生命令 内置命令 文件 网络 进程 磁盘 系统管理'},
    {id:'webvm',category:'windows',name:'WebVM 虚拟机',description:'Linux 终端 · 中文 · 联网 · AI',href:'tools/webvm/',icon:'terminal',tags:['Linux','WebVM','AI'],keywords:'虚拟机 Debian CheerpX WASM 终端 Tailscale 中文 命令 沙盒'},
    {id:'subnet',category:'network',name:'IP／子网计算器',description:'IPv4 · IPv6 · 子网掩码',href:'tools/subnet/',icon:'network',tags:['IP','CIDR','子网'],keywords:'网段 网络地址 广播 可用地址 掩码'},
    {id:'ip-batch',category:'network',name:'IP 批量整理',description:'去重排序 · 网段合并',href:'tools/ip-batch/',icon:'network',tags:['IP','CIDR','合并'],keywords:'IPv4 IPv6 批量 地址范围 整理'},
    {id:'mac',category:'network',name:'MAC 地址转换',description:'格式转换 · 地址类型',href:'tools/mac/',icon:'convert',tags:['MAC','OUI','EUI-64'],keywords:'物理地址 网卡 单播 组播 广播'},
    {id:'network',category:'network',name:'网络测速与延迟',description:'上下行测速 · 服务访问延迟',href:'tools/network/',icon:'network',tags:['测速','延迟','网络'],keywords:'带宽 下载 上传 运营商 云服务 游戏 厂商 HTTPS WeGame Steam Epic 战网 EA Ubisoft Xbox'},
    {id:'ai',category:'ai',name:'AI 助手',description:'对话 · 图片 · 文本附件',href:'tools/ai/',icon:'chat',tags:['AI','图片','文件'],keywords:'ChatGPT 豆包 助手 API 上传 对话'},
    {id:'scan',category:'peripheral',name:'条码与二维码',description:'摄像头 · 图片 · 扫码枪',href:'tools/scan/',icon:'scan',tags:['QR','条形码','扫码枪'],keywords:'扫码 二维码 QR Code128 EAN UPC PDF417 DataMatrix 摄像头 图片 输入 扫描'},
    {id:'devices',category:'peripheral',name:'外设检测',description:'键盘 · 鼠标 · 麦克风 · 摄像头',href:'tools/devices/',icon:'devices',tags:['键盘','鼠标','摄像头'],keywords:'外设 声道 手柄 游戏手柄 麦克风 音频 输入测试 USB'},
    {id:'recorder',category:'peripheral',name:'屏幕录制',description:'录制预览 · 浏览器暂存 · 下载',href:'tools/recorder/',icon:'record',tags:['录屏','暂存','视频'],keywords:'屏幕录制 摄像头 视频 下载 IndexedDB'} ,
    {id:'dns',category:'network',name:'DNS 查询',description:'多公共节点 · 记录解析对比',href:'tools/dns/',icon:'network',tags:['DNS','DoH','解析'],keywords:'阿里 DNSPod Google Cloudflare Quad9 域名 A AAAA MX TXT CNAME PTR'},
    {id:'ip-location',category:'network',name:'IP 地理位置',description:'公网 IP · 运营商 · 近似位置',href:'tools/ip-location/',icon:'network',tags:['IP','运营商','位置'],keywords:'IP 归属 ASN IPv4 IPv6 城市 时区'},
    {id:'switch-commands',category:'network',name:'交换机命令速查',description:'多厂商 CLI · 搜索与复制',href:'tools/switch-commands/',icon:'network',tags:['交换机','命令','网络运维'],keywords:'Cisco 华为 Huawei H3C 新华三 锐捷 Ruijie Juniper Aruba TP-Link Ubiquiti MikroTik VLAN Trunk PoE STP'},
    {id:'text-diff',category:'text',name:'文本差异对比',description:'并排比较 · 导出 unified diff',href:'tools/text-diff/',icon:'convert',tags:['文本','代码','差异'],keywords:'diff 比较 代码 配置 文件 修改 对比 jsdiff'}
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = ToolboxCatalog;
