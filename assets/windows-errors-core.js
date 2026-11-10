(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./windows-errors-data.js'));else root.WindowsErrors=factory(WindowsErrorData);})(typeof globalThis!=='undefined'?globalThis:this,(data)=>{
  const known={
    ERROR_SUCCESS:['操作成功','无需处理。'],ERROR_FILE_NOT_FOUND:['找不到指定的文件','确认文件路径、名称及文件是否存在。'],ERROR_PATH_NOT_FOUND:['找不到指定的路径','检查盘符、目录和共享路径。'],ERROR_ACCESS_DENIED:['拒绝访问','检查当前账户、文件权限和安全软件拦截记录。'],
    ERROR_INVALID_HANDLE:['句柄无效','重新启动相关应用并检查应用日志。'],ERROR_NOT_ENOUGH_MEMORY:['内存资源不足','检查可用内存和相关进程占用。'],ERROR_OUTOFMEMORY:['内存不足','检查内存、分页文件及应用的位数限制。'],ERROR_INVALID_DATA:['数据无效','核对文件内容、参数格式及来源。'],ERROR_INVALID_DRIVE:['系统找不到指定的驱动器','检查盘符与磁盘连接。'],
    ERROR_NOT_READY:['设备未就绪','检查介质是否插入及设备连接。'],ERROR_CRC:['数据循环冗余校验错误','核对传输校验值，检查存储设备和连接。'],ERROR_SHARING_VIOLATION:['文件被其他进程占用','查明占用进程并正常关闭文件。'],ERROR_LOCK_VIOLATION:['文件区域已锁定','等待占用程序完成或正常关闭它。'],ERROR_DISK_FULL:['磁盘空间不足','检查目标卷剩余空间。'],ERROR_HANDLE_DISK_FULL:['磁盘已满','检查写入位置、磁盘空间和配额。'],
    ERROR_BAD_NETPATH:['找不到网络路径','检查网络、DNS、共享路径及服务器连通性。'],ERROR_NETWORK_ACCESS_DENIED:['网络访问被拒绝','检查共享权限、账户权限及服务器策略。'],ERROR_BAD_NET_NAME:['找不到网络名称','确认共享名称和目标服务器地址。'],ERROR_NETNAME_DELETED:['指定的网络名称不再可用','检查共享连接及服务器状态。'],ERROR_NETWORK_UNREACHABLE:['网络位置不可达','检查地址、路由、VPN 和防火墙。'],ERROR_HOST_UNREACHABLE:['目标主机不可达','检查路由与目标服务状态。'],
    ERROR_INVALID_PARAMETER:['参数错误','核对命令参数、数据类型及接口要求。'],ERROR_INSUFFICIENT_BUFFER:['缓冲区不足','检查调用程序版本及相关应用日志。'],ERROR_INVALID_NAME:['文件名、目录名或卷标语法不正确','检查路径中的非法字符和格式。'],ERROR_MOD_NOT_FOUND:['找不到指定的模块','检查依赖组件、运行库及安装完整性。'],ERROR_PROC_NOT_FOUND:['找不到指定的过程','检查程序与依赖 DLL 的版本匹配。'],ERROR_BAD_EXE_FORMAT:['可执行文件格式不正确','检查文件完整性和 x86、x64、ARM64 架构。'],
    ERROR_ALREADY_EXISTS:['对象已存在','检查目标文件、目录或对象名称。'],ERROR_FILENAME_EXCED_RANGE:['文件名或路径过长','缩短路径并检查应用的长路径支持。'],ERROR_DIRECTORY:['目录名称无效','确认目标路径是可访问的目录。'],ERROR_OPERATION_ABORTED:['操作已取消','检查是否由用户、应用退出或设备断开取消。'],ERROR_IO_PENDING:['异步操作正在进行','等待操作完成；此状态本身不一定表示故障。'],ERROR_IO_DEVICE:['输入输出设备错误','检查设备连接、驱动及磁盘健康报告。'],
    ERROR_SERVICE_REQUEST_TIMEOUT:['服务启动或控制请求超时','查看服务依赖、事件日志及启动账户。'],ERROR_SERVICE_ALREADY_RUNNING:['服务已在运行','确认当前服务状态。'],ERROR_SERVICE_DISABLED:['服务已禁用','核对组织策略和服务启动类型。'],ERROR_SERVICE_DOES_NOT_EXIST:['指定的服务不存在','检查服务名称及软件安装状态。'],ERROR_SERVICE_LOGON_FAILED:['服务登录失败','检查服务账户、密码有效期和登录权限。'],ERROR_DEPENDENT_SERVICES_RUNNING:['依赖此服务的其他服务正在运行','检查服务依赖关系。'],
    ERROR_LOGON_FAILURE:['用户名或密码不正确','核对账户、域、凭据及键盘输入。'],ERROR_ACCOUNT_RESTRICTION:['账户受到限制','检查账户策略、登录时间与工作站限制。'],ERROR_PASSWORD_EXPIRED:['账户密码已过期','按组织流程更新密码。'],ERROR_ACCOUNT_DISABLED:['账户已禁用','联系账户管理员核对状态。'],ERROR_ACCOUNT_LOCKED_OUT:['账户已锁定','检查持续使用旧凭据的程序，并按组织流程解锁。'],ERROR_PRIVILEGE_NOT_HELD:['客户端缺少所需的特权','核对账户的用户权限分配。'],
    ERROR_INSTALL_FAILURE:['安装期间发生严重错误','查看安装程序日志、依赖与重启要求。'],ERROR_INSTALL_ALREADY_RUNNING:['另一项安装正在进行','等待现有安装完成。'],ERROR_SUCCESS_REBOOT_REQUIRED:['操作成功，需要重启','保存工作后安排重启。'],ERROR_TIMEOUT:['操作超时','检查目标服务、网络和应用超时设置。'],ERROR_CANCELLED:['操作被用户取消','确认是否需要重新执行。'],
    E_ACCESSDENIED:['拒绝访问','检查账户权限、目标对象权限与访问策略。'],E_FAIL:['未指定的失败','结合应用日志、事件记录和调用上下文定位。'],E_INVALIDARG:['参数无效','检查输入值和接口参数。'],E_OUTOFMEMORY:['内存不足','检查进程内存、分页文件和资源占用。'],E_NOINTERFACE:['不支持所请求的接口','检查组件注册、版本和架构匹配。'],E_NOTIMPL:['功能尚未实现','确认该组件是否支持此功能。'],E_POINTER:['指针无效','检查应用版本及崩溃日志。'],E_ABORT:['操作已中止','检查调用链和取消来源。'],E_UNEXPECTED:['发生意外错误','查看上下文日志和组件状态。'],
    REGDB_E_CLASSNOTREG:['组件类未注册','核对所需组件的安装、版本与架构。'],CO_E_SERVER_EXEC_FAILURE:['服务器应用执行失败','检查 COM 服务器、运行账户和事件日志。'],RPC_S_SERVER_UNAVAILABLE:['RPC 服务器不可用','检查目标服务、DNS、网络和防火墙。'],RPC_S_CALL_FAILED:['远程过程调用失败','检查服务状态及两端事件日志。'],
    WSAECONNRESET:['连接被对端重置','检查远端服务、代理和网络设备的连接记录。'],WSAECONNREFUSED:['连接被拒绝','确认目标地址、端口以及服务是否监听。'],WSAETIMEDOUT:['连接超时','检查网络、路由、防火墙及服务响应。'],WSAEHOSTUNREACH:['没有到目标主机的路由','检查地址、网关和路由。'],WSAEADDRINUSE:['地址或端口已被占用','检查监听该端口的进程。'],WSAHOST_NOT_FOUND:['找不到主机','检查域名拼写与 DNS 解析。'],WSAENETUNREACH:['网络不可达','检查本机网络与路由。'],
    DNS_ERROR_RCODE_NAME_ERROR:['DNS 名称不存在','核对域名和 DNS 记录。'],DNS_ERROR_RCODE_SERVER_FAILURE:['DNS 服务器处理失败','检查解析器及权威 DNS 的服务状态。'],CERT_E_EXPIRED:['证书已过期或尚未生效','核对系统时间和证书有效期。'],CERT_E_UNTRUSTEDROOT:['证书链的根不受信任','核对完整证书链和受信任证书来源。'],CERT_E_CN_NO_MATCH:['证书名称与主机不匹配','检查访问域名和证书 SAN。'],TRUST_E_BAD_DIGEST:['文件摘要与数字签名不匹配','重新核对文件来源和完整性。'],
    STATUS_ACCESS_VIOLATION:['访问冲突','查看崩溃转储、调用栈及故障模块。'],STATUS_IN_PAGE_ERROR:['页面调入错误','检查存储、分页文件及底层 I/O 错误。'],STATUS_ILLEGAL_INSTRUCTION:['非法指令','核对 CPU 指令集支持、程序版本与文件完整性。'],STATUS_STACK_OVERFLOW:['线程栈溢出','查看递归调用、调用栈和程序日志。'],STATUS_DLL_NOT_FOUND:['无法找到 DLL','检查程序依赖和安装完整性。'],STATUS_DLL_INIT_FAILED:['DLL 初始化失败','检查运行库、组件和应用启动日志。'],STATUS_INVALID_IMAGE_FORMAT:['映像格式无效','检查程序架构、依赖文件及完整性。'],STATUS_NO_MEMORY:['虚拟内存不足','检查提交量、分页文件及进程资源。'],STATUS_SUCCESS:['操作成功','无需处理。']
  };
  const additions=[
    ['HRESULT','CBS_E_SOURCE_MISSING','800F081F','找不到修复或更新所需的源文件','检查修复源与系统版本是否匹配。'],
    ['HRESULT','CBS_E_INSTALLERS_FAILED','800F0922','更新安装程序执行失败','查看 CBS 日志及更新所需的分区空间。'],
    ['HRESULT','WU_E_PT_WINHTTP_NAME_NOT_RESOLVED','8024402C','更新服务的代理或域名无法解析','检查代理、DNS 和更新服务器配置。'],
    ['BugCheck','IRQL_NOT_LESS_OR_EQUAL','0000000A','在较高 IRQL 访问了无效内存','结合转储检查驱动、内存和近期硬件变更。'],
    ['BugCheck','MEMORY_MANAGEMENT','0000001A','内存管理发生严重错误','结合转储检查内存、驱动与存储。'],
    ['BugCheck','PAGE_FAULT_IN_NONPAGED_AREA','00000050','访问了无效的非分页内存','查看转储中的故障模块与近期驱动变更。'],
    ['BugCheck','INACCESSIBLE_BOOT_DEVICE','0000007B','启动时无法访问系统设备','检查启动存储驱动、控制器模式及磁盘连接。'],
    ['BugCheck','SYSTEM_THREAD_EXCEPTION_NOT_HANDLED','0000007E','系统线程产生了未处理异常','查看转储中的异常代码和故障模块。'],
    ['BugCheck','DRIVER_POWER_STATE_FAILURE','0000009F','驱动未能完成电源状态切换','检查相关设备驱动和睡眠唤醒记录。'],
    ['BugCheck','DRIVER_IRQL_NOT_LESS_OR_EQUAL','000000D1','驱动访问了不适当的内存地址','根据转储定位驱动并核对版本。'],
    ['BugCheck','CRITICAL_PROCESS_DIED','000000EF','关键系统进程终止','检查转储、存储和系统事件日志。'],
    ['BugCheck','DPC_WATCHDOG_VIOLATION','00000133','DPC 或中断执行超时','查看转储，检查存储及其他内核驱动。'],
    ['BugCheck','WHEA_UNCORRECTABLE_ERROR','00000124','硬件报告了不可纠正错误','查看 WHEA 记录，核对温度、供电与硬件稳定性。']
  ];
  const records=data.map(([family,name,hex])=>({family,name,hex:'0x'+hex,decimal:String(parseInt(hex,16)),message:known[name]?.[0]||'已收录系统代码，暂无中文说明。',advice:known[name]?.[1]||'结合报错位置、应用日志及完整错误信息排查。'}));
  for(const [family,name,hex,message,advice] of additions)if(!records.some(r=>r.family===family&&r.name===name))records.push({family,name,hex:'0x'+hex,decimal:String(parseInt(hex,16)),message,advice});
  function codeOf(raw){
    const text=raw.trim();let value;
    if(/^0x[\da-f]+$/i.test(text))value=BigInt(text);
    else if(/^[\da-f]{8}$/i.test(text)&&(/[a-f]/i.test(text)||/^[89]/.test(text)))value=BigInt('0x'+text);
    else if(/^-?\d+$/.test(text))value=BigInt(text);
    else return null;
    if(value< -2147483648n||value>4294967295n)throw new Error('代码应为 32 位数值');
    if(value<0)value+=4294967296n;return value;
  }
  function lookup(raw,family='all'){
    const query=String(raw).trim();if(!query)return [];
    const value=codeOf(query),matchFamily=r=>family==='all'||r.family===family;
    let results=value===null?records.filter(r=>matchFamily(r)&&[r.name,r.message,r.advice].join(' ').toLowerCase().includes(query.toLowerCase())):records.filter(r=>matchFamily(r)&&BigInt(r.hex)===value);
    if(value!==null&&(value&0xffff0000n)===0x80070000n&&(family==='all'||family==='HRESULT')){
      const low=value&65535n,source=records.find(r=>r.family==='Win32'&&BigInt(r.hex)===low);
      if(source){
        const related=`源错误：Win32 ${low} · ${source.name}`;
        if(!results.length)results=[{family:'HRESULT',name:`HRESULT_FROM_WIN32(${source.name})`,hex:'0x'+value.toString(16).toUpperCase().padStart(8,'0'),decimal:String(value),message:source.message,advice:source.advice,related}];
        else results=results.map(r=>({...r,related,message:r.message.startsWith('已收录')?source.message:r.message,advice:r.message.startsWith('已收录')?source.advice:r.advice}));
      }
    }
    return results;
  }
  return {lookup,count:records.length};
});
