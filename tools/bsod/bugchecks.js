// Windows bugcheck names are identifiers from Microsoft's documented stop codes.
const codes = {
  A: [
    "IRQL_NOT_LESS_OR_EQUAL",
    "内核在较高 IRQL 访问了无效内存。结合参数中的地址、访问方式和指令地址排查驱动与内存。",
  ],
  "1A": [
    "MEMORY_MANAGEMENT",
    "内存管理检测到异常。参数 1 指明具体子类型，不能仅据此判断内存条损坏。",
  ],
  "1E": [
    "KMODE_EXCEPTION_NOT_HANDLED",
    "内核异常未被处理。检查异常代码和故障地址对应的模块。",
  ],
  24: [
    "NTFS_FILE_SYSTEM",
    "NTFS 文件系统处理过程中发生异常。检查存储、文件系统和相关过滤驱动。",
  ],
  "3B": [
    "SYSTEM_SERVICE_EXCEPTION",
    "系统服务执行期间出现异常。参数包含异常代码、指令地址和上下文地址。",
  ],
  "4E": [
    "PFN_LIST_CORRUPT",
    "物理页帧管理链表损坏。需结合参数检查驱动越界写入与内存稳定性。",
  ],
  50: [
    "PAGE_FAULT_IN_NONPAGED_AREA",
    "内核访问了不可用的非分页内存。故障地址与指令地址可帮助缩小范围。",
  ],
  "7B": [
    "INACCESSIBLE_BOOT_DEVICE",
    "系统启动时无法访问系统分区。检查存储控制器模式、启动盘和驱动。",
  ],
  "7E": [
    "SYSTEM_THREAD_EXCEPTION_NOT_HANDLED",
    "系统线程产生未处理异常。结合异常代码与异常地址排查。",
  ],
  "7F": [
    "UNEXPECTED_KERNEL_MODE_TRAP",
    "处理器发生了内核无法处理的陷阱。参数 1 是陷阱编号。",
  ],
  "9F": [
    "DRIVER_POWER_STATE_FAILURE",
    "驱动未正确完成电源状态请求。参数子类型用于区分具体阶段。",
  ],
  A5: [
    "ACPI_BIOS_ERROR",
    "ACPI 固件或表信息与系统要求不符。检查固件版本与相关配置。",
  ],
  BE: [
    "ATTEMPTED_WRITE_TO_READONLY_MEMORY",
    "内核组件试图写入只读内存。需要故障指令和地址证据。",
  ],
  C2: [
    "BAD_POOL_CALLER",
    "内核内存池操作无效。参数用于区分释放、分配或地址错误。",
  ],
  C4: [
    "DRIVER_VERIFIER_DETECTED_VIOLATION",
    "驱动程序验证程序检测到违规。参数 1 是具体检查编号。",
  ],
  C5: [
    "DRIVER_CORRUPTED_EXPOOL",
    "驱动破坏了内核内存池。关联模块需要结合地址证据核实。",
  ],
  D1: [
    "DRIVER_IRQL_NOT_LESS_OR_EQUAL",
    "驱动在较高 IRQL 访问了无效或分页内存。参数依次记录地址、IRQL、访问类型和指令地址。",
  ],
  EF: [
    "CRITICAL_PROCESS_DIED",
    "关键系统进程或线程意外终止。需要结合事件日志和进程信息分析。",
  ],
  F4: [
    "CRITICAL_OBJECT_TERMINATION",
    "关键系统进程或线程终止，系统无法继续运行。",
  ],
  FC: [
    "ATTEMPTED_EXECUTE_OF_NOEXECUTE_MEMORY",
    "系统试图执行不可执行内存中的代码。检查指令地址与内存破坏线索。",
  ],
  101: [
    "CLOCK_WATCHDOG_TIMEOUT",
    "次级处理器未在预期时间内响应时钟中断。检查处理器、固件和稳定性。",
  ],
  109: [
    "CRITICAL_STRUCTURE_CORRUPTION",
    "内核关键代码或数据结构被修改或损坏。",
  ],
  113: [
    "VIDEO_DXGKRNL_FATAL_ERROR",
    "图形内核检测到不可恢复异常。检查图形驱动、系统版本与硬件。",
  ],
  116: [
    "VIDEO_TDR_FAILURE",
    "图形超时恢复失败。参数 2 通常包含相关驱动地址，但不单独证明硬件故障。",
  ],
  117: [
    "VIDEO_TDR_TIMEOUT_DETECTED",
    "显示驱动未及时响应；该代码也可出现在实时内核转储中。",
  ],
  119: [
    "VIDEO_SCHEDULER_INTERNAL_ERROR",
    "图形调度程序检测到严重异常。参数 1 指明异常类型。",
  ],
  124: [
    "WHEA_UNCORRECTABLE_ERROR",
    "Windows 硬件错误体系报告了无法纠正的错误。需进一步解析 WHEA 记录定位来源。",
  ],
  133: [
    "DPC_WATCHDOG_VIOLATION",
    "DPC 或中断处理超时。参数用于区分单次超时与累计超时。",
  ],
  139: [
    "KERNEL_SECURITY_CHECK_FAILURE",
    "内核检测到关键数据结构损坏。参数 1 是具体损坏类型。",
  ],
  "13A": [
    "KERNEL_MODE_HEAP_CORRUPTION",
    "内核堆损坏。需结合子类型和后续调试判断写入来源。",
  ],
  141: ["VIDEO_ENGINE_TIMEOUT_DETECTED", "图形引擎超时，常见于实时内核转储。"],
  154: [
    "UNEXPECTED_STORE_EXCEPTION",
    "内核存储组件捕获到异常。结合磁盘健康、存储驱动和异常记录检查。",
  ],
  "15A": ["SDBUS_INTERNAL_ERROR", "SD 总线驱动检测到内部错误。"],
  "18B": ["SECURE_KERNEL_ERROR", "安全内核遇到致命错误。"],
  "1CA": [
    "SYNTHETIC_WATCHDOG_TIMEOUT",
    "系统监视器检测到超时。需结合平台与虚拟化环境排查。",
  ],
  20001: [
    "HYPERVISOR_ERROR",
    "虚拟机监控程序出现不可恢复错误。检查虚拟化、固件与平台配置。",
  ],
};
export function bugcheckInfo(code) {
  const key =
    String(code ?? "")
      .replace(/^0x/i, "")
      .replace(/^0+/, "")
      .toUpperCase() || "0";
  const aliases = {
    "1000007E": "7E",
    "1000007F": "7F",
    "1000008E": "8E",
    10000050: "50",
    "1000000A": "A",
    "100000D1": "D1",
  };
  const info = codes[aliases[key] || key];
  return info
    ? { name: info[0], description: info[1] }
    : {
        name: "未收录的停止代码",
        description: "保留原始代码和参数，可查阅 Microsoft 停止代码参考。",
      };
}
export const stopCodeReference =
  "https://learn.microsoft.com/windows-hardware/drivers/debugger/bug-check-code-reference2";
