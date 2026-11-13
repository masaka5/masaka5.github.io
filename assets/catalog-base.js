/* 新增工具时，只需在 tools 中添加一项；新增类别时，在 categories 中添加一项。 */
const ToolboxCatalog = {
  categories: [
    { id:'hardware', name:'硬件与外设', icon:'cpu' },
    { id:'network', name:'网络运维', icon:'network' },
    { id:'windows', name:'电脑维护', icon:'wrench' },
    { id:'workspace', name:'开发与虚拟机', icon:'computer' },
    { id:'text', name:'文本与代码', icon:'convert' },
    { id:'collaboration', name:'协作与绘图', icon:'users-round' },
    { id:'meetings', name:'在线协作', icon:'video' },
    { id:'ai', name:'AI 助手', icon:'chat' },
  ],
  tools: [
    {id:'qr-transfer',category:'meetings',name:'动态二维码传输',description:'离线传输 · 断帧补收 · 密码保护',href:'tools/qr-transfer/',icon:'qr-code',tags:['二维码','离线','传输'],keywords:'动态 二维码 QR 文件 文本 数据 传输 WASM Zstandard ZXing 离线 扫码 加密 密码 断帧 续传'},
    {id:'browser-fingerprint',category:'security',name:'浏览器指纹',description:'设备特征 · 指纹检测 · 浏览器对比',href:'tools/browser-fingerprint/',icon:'fingerprint',tags:['NeoPrint','指纹','隐私'],keywords:'NeoPrint 浏览器 指纹 设备 跨浏览器 检测 本地 隐私 Canvas WebGL WebGPU'},
    {id:'yt-dlp',category:'media',name:'媒体下载',description:'批量解析 · 分段下载 · 断点续传',href:'tools/yt-dlp/',icon:'download',tags:['yt-dlp','WASM'],keywords:'yt-dlp 下载 视频 音频 字幕 缩略图 HLS DASH FFmpeg 续传'},
    {id:'jupyter',category:'workspace',name:'Jupyter 笔记本',description:'Python · 单元格 · 本地笔记本',href:'tools/jupyter/',icon:'notebook-tabs',tags:['Jupyter','Python'],keywords:'JupyterLite Notebook IPYNB Python 编程 笔记本 运行 WASM'},
    {id:'python-ide',category:'workspace',name:'Python IDE',description:'编辑 · 编译检查 · 运行',href:'tools/python-ide/',icon:'file-code-2',tags:['Python','IDE','WASM'],keywords:'Python CPython Pyodide 编译 运行 开发 IDE 代码 控制台'},
    {id:'powershell-ide',category:'workspace',name:'PowerShell 7 IDE',description:'脚本编辑 · 运行 · 交互终端',href:'tools/powershell-ide/',icon:'square-terminal',tags:['PowerShell','IDE','Linux'],keywords:'PowerShell pwsh PS1 7 编辑 编译 运行 脚本 终端 IDE Linux'},
    {id:'web-adb',category:'hardware',name:'安卓调试',description:'Web ADB · 终端 · 文件 · 应用',href:'tools/web-adb/',icon:'smartphone',tags:['安卓','ADB','USB'],keywords:'WebADB Android 安卓 调试 终端 文件 APK 安装 截图 WebUSB'},
    {id:'photo-editor',category:'image',name:'图片编辑器',description:'图层 · 选区 · 画笔 · 滤镜',href:'tools/photo-editor/',icon:'brush',tags:['图片','编辑','图层'],keywords:'在线 PS Photoshop 图片 编辑 画笔 图层 选区 裁剪 滤镜 miniPaint'},
    {id:'broadcast',category:'media',name:'直播工作台',description:'场景合成 · 混音 · 推流 · 录制',href:'tools/broadcast/',icon:'radio',tags:['直播','场景','录制'],keywords:'OBS 摄像头 屏幕 窗口 直播 RTMP WHIP 字幕 绿幕 水印 混音'},
    {id:'drawio',category:'collaboration',name:'思维导图与流程图',description:'draw.io · 绘图 · 本地草稿',href:'tools/drawio/',icon:'workflow',tags:['绘图','流程图','思维导图'],keywords:'draw.io diagrams.net 脑图 UML XML SVG PNG'},
    {id:'tiptap',category:'text',name:'富文本文档',description:'Tiptap · 排版 · 表格 · 图片',href:'tools/office-editors/document.html',icon:'file-pen-line',tags:['文档','排版','Tiptap'],keywords:'富文本 编辑器 文档 JSON HTML 本地 草稿'},
    {id:'web-ppt',category:'collaboration',name:'幻灯片',description:'Web-PPT · 演示 · PPTX 导出',href:'tools/web-ppt/',icon:'panels-top-left',tags:['演示','PPT','幻灯片'],keywords:'Web-PPT 演示文稿 图片 文字 排版'},
    {id:'univer',category:'data',name:'表格与文档',description:'Univer · 公式 · 数据编辑',href:'tools/office-editors/office.html',icon:'sheet',tags:['表格','文档','Univer'],keywords:'Univer 电子表格 公式 CSV 文档 办公'},
    {id:'file-transfer',category:'meetings',name:'文件直传',description:'设备直连 · 断点续传 · 完整校验',href:'tools/file-transfer/',icon:'send',tags:['P2P','WebRTC','续传'],keywords:'浏览器 文件 直传 传输 分享 设备 发送 接收 密码 断点续传 WebRTC P2P 本地'},
    {id:'bsod',category:'windows',name:'蓝屏分析',description:'停止代码 · 转储解析 · 驱动关联',href:'tools/bsod/',icon:'monitor-x',tags:['蓝屏','DMP','WASM'],keywords:'BlueScreenView Windows 蓝屏 minidump 内核 转储 dmp dump bugcheck 停止代码 崩溃 驱动 分析'},
    {id:'iso',category:'files',name:'镜像工具',description:'镜像浏览 · 文件提取 · 镜像制作',href:'tools/iso/',icon:'disc-3',tags:['ISO','WIM','IMG','VHD'],keywords:'iso9660 Joliet 光盘 镜像 文件夹 打包 制作 WIM ESD IMG VHD VHDX 提取 编辑 WASM'},
    {id:'folder-analysis',category:'windows',name:'文件夹分析',description:'空间分析 · 重复文件 · 类型统计',href:'tools/folder-analysis/',icon:'folder-search',tags:['文件夹','重复','空间'],keywords:'WizTree 文件夹 分析 大小 面积图 重复文件 检测 SHA256 WASM 目录 类型 CSV'},
    {id:'code',category:'workspace',name:'代码工作台',description:'VS Code · 中文 · 本地文件',href:'tools/code/',icon:'code-xml',tags:['代码','VS Code','编辑器'],keywords:'vscode.dev 网页 IDE 编辑器 PowerShell Python JavaScript TypeScript Rust 文件 目录 补全'},
    {id:'serial',category:'hardware',name:'串口调试与烧录',description:'文本 · HEX · ESP 固件',href:'tools/serial/',icon:'unplug',tags:['串口','固件','ESP'],keywords:'Web Serial UART USB COM 波特率 收发 烧录 固件 ESP32 ESP8266 esptool BIN'},
    {id:'file-watermark',category:'encoding',name:'文件隐写与校验',description:'隐藏标记 · 口令认证 · 还原',href:'tools/file-watermark/',icon:'file-key-2',tags:['隐写','校验','水印'],keywords:'文件水印 隐藏 标记 metadata PNG JPEG PDF Office ZIP HMAC SHA256 认证 完整性 校验'},
    {id:'meeting',category:'meetings',name:'在线会议',description:'音视频 · 屏幕共享 · 协作白板',href:'tools/meeting/',icon:'video',tags:['会议','共享','白板'],keywords:'Teams 多人 在线 开会 语音 视频 摄像头 屏幕 声音 共享 会议室 WebRTC 白板 CRDT Yjs 实时协作 绘图 聊天'},
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
    {id:'image-viewer',category:'image',name:'图片查看器',description:'缩略图 · 浏览 · 调整 · 转换',href:'tools/image-viewer/',icon:'images',tags:['图片','WASM'],keywords:'ImageGlass 图片 查看器 相册 缩放 旋转 裁剪 幻灯片 元数据 GIF'},
    {id:'media-player',category:'media',name:'媒体播放器',description:'播放列表 · 字幕 · 格式转换',href:'tools/media-player/',icon:'play',tags:['视频','音频','WASM'],keywords:'VLC 播放器 音频 视频 字幕 倍速 画中画 截图 FFmpeg'},
    {id:'windows-errors',category:'windows',name:'Windows 错误码',description:'错误查询 · 中文排查建议',href:'tools/windows-errors/',icon:'windows',tags:['错误码','蓝屏','HRESULT'],keywords:'Win32 Winsock NTSTATUS Windows 系统错误'},
    {id:'system-commands',category:'windows',name:'系统命令速查',description:'CMD · PowerShell · Linux',href:'tools/system-commands/',icon:'terminal',tags:['CMD','PowerShell','Linux','命令'],keywords:'命令行 终端 shell 原生命令 内置命令 文件 网络 进程 磁盘 系统管理'},
    {id:'webvm',category:'windows',name:'WebVM 虚拟机',description:'Linux 终端 · 中文 · 联网 · AI',href:'tools/webvm/',icon:'terminal',tags:['Linux','WebVM','AI'],keywords:'虚拟机 Debian CheerpX WASM 终端 Tailscale 中文 命令 沙盒'},
    {id:'remote',category:'network',name:'远程连接',description:'RDP · VNC · SSH',href:'tools/remote/',icon:'monitor',tags:['远程','设备','网关'],keywords:'远程桌面 SSH VNC RDP 设备管理 Windows 网关'},
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
