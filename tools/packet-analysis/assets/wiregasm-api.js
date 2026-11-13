function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
// SPDX-License-Identifier: GPL-2.0-or-later
var $922ca3010d5b156c$exports = {};

$parcel$export($922ca3010d5b156c$exports, "PrefSetResult", () => $922ca3010d5b156c$export$9511720e10589113);
$parcel$export($922ca3010d5b156c$exports, "PrefType", () => $922ca3010d5b156c$export$eeff8db21dc74b3d);
// SPDX-License-Identifier: GPL-2.0-or-later
let $922ca3010d5b156c$export$9511720e10589113;
(function(PrefSetResult) {
    PrefSetResult[PrefSetResult["PREFS_SET_OK"] = 0] = "PREFS_SET_OK";
    PrefSetResult[PrefSetResult["PREFS_SET_SYNTAX_ERR"] = 1] = "PREFS_SET_SYNTAX_ERR";
    PrefSetResult[PrefSetResult["PREFS_SET_NO_SUCH_PREF"] = 2] = "PREFS_SET_NO_SUCH_PREF";
    PrefSetResult[PrefSetResult["PREFS_SET_OBSOLETE"] = 3] = "PREFS_SET_OBSOLETE";
})($922ca3010d5b156c$export$9511720e10589113 || ($922ca3010d5b156c$export$9511720e10589113 = {}));
let $922ca3010d5b156c$export$eeff8db21dc74b3d;
(function(PrefType) {
    PrefType[PrefType["PREF_UINT"] = 1] = "PREF_UINT";
    PrefType[PrefType["PREF_BOOL"] = 2] = "PREF_BOOL";
    PrefType[PrefType["PREF_ENUM"] = 4] = "PREF_ENUM";
    PrefType[PrefType["PREF_STRING"] = 8] = "PREF_STRING";
    PrefType[PrefType["PREF_RANGE"] = 16] = "PREF_RANGE";
    PrefType[PrefType["PREF_STATIC_TEXT"] = 32] = "PREF_STATIC_TEXT";
    PrefType[PrefType["PREF_UAT"] = 64] = "PREF_UAT";
    PrefType[PrefType["PREF_SAVE_FILENAME"] = 128] = "PREF_SAVE_FILENAME";
    PrefType[PrefType["PREF_COLOR"] = 256] = "PREF_COLOR";
    PrefType[PrefType["PREF_CUSTOM"] = 512] = "PREF_CUSTOM";
    PrefType[PrefType["PREF_OBSOLETE"] = 1024] = "PREF_OBSOLETE";
    PrefType[PrefType["PREF_DIRNAME"] = 2048] = "PREF_DIRNAME";
    PrefType[PrefType["PREF_DECODE_AS_UINT"] = 4096] = "PREF_DECODE_AS_UINT";
    PrefType[PrefType["PREF_DECODE_AS_RANGE"] = 8192] = "PREF_DECODE_AS_RANGE";
    PrefType[PrefType["PREF_OPEN_FILENAME"] = 16384] = "PREF_OPEN_FILENAME";
    PrefType[PrefType["PREF_PASSWORD"] = 32768] = "PREF_PASSWORD";
    PrefType[PrefType["PREF_PROTO_TCP_SNDAMB_ENUM"] = 65536] = "PREF_PROTO_TCP_SNDAMB_ENUM";
    PrefType[PrefType["PREF_DISSECTOR"] = 131072] = "PREF_DISSECTOR";
})($922ca3010d5b156c$export$eeff8db21dc74b3d || ($922ca3010d5b156c$export$eeff8db21dc74b3d = {}));


var $06475149eda1d309$exports = {};

$parcel$export($06475149eda1d309$exports, "vectorToArray", () => $06475149eda1d309$export$4b978bcb0889dc66);
$parcel$export($06475149eda1d309$exports, "free", () => $06475149eda1d309$export$13e2de3c33d99539);
$parcel$export($06475149eda1d309$exports, "preferenceSetCodeToError", () => $06475149eda1d309$export$a6506e3cba6c4388);
// SPDX-License-Identifier: GPL-2.0-or-later

function $06475149eda1d309$export$4b978bcb0889dc66(vec) {
    try {
        return Array.from({
            length: vec.size()
        }, (_, i)=>vec.get(i));
    } finally{
        // the elements are copied out; free the vector on the wasm heap
        vec.delete();
    }
}
function $06475149eda1d309$export$13e2de3c33d99539(handle) {
    handle.delete();
}
function $06475149eda1d309$export$a6506e3cba6c4388(code) {
    switch(code){
        case (0, $922ca3010d5b156c$export$9511720e10589113).PREFS_SET_SYNTAX_ERR:
            return "Syntax error in string";
        case (0, $922ca3010d5b156c$export$9511720e10589113).PREFS_SET_NO_SUCH_PREF:
            return "No such preference";
        case (0, $922ca3010d5b156c$export$9511720e10589113).PREFS_SET_OBSOLETE:
            return "Preference used to exist but no longer does";
        default:
            return "Unknown error";
    }
}




const $f9eab8d5ad8ec090$var$ALLOWED_TAP_KEYS = new Set([
    ...Array.from({
        length: 15
    }, (_, i)=>`tap${i}`),
    ...Array.from({
        length: 15
    }, (_, i)=>`filter${i}`)
]);
const $f9eab8d5ad8ec090$var$ALLOWED_GRAPH_KEYS = new Set([
    "filter",
    "interval",
    ...Array.from({
        length: 9
    }, (_, i)=>`graph${i}`),
    ...Array.from({
        length: 9
    }, (_, i)=>`filter${i}`)
]);
class $f9eab8d5ad8ec090$export$c4e6ddb7806910b1 {
    constructor(){
        this.initialized = false;
        this.session = null;
    }
    /**
   * Initialize the wrapper and the Wiregasm module
   *
   * @param loader Loader function for the Emscripten module
   * @param overrides Overrides
   */ async init(loader, overrides = {}, beforeInit = null) {
        if (this.initialized) return;
        this.lib = await loader(overrides);
        if (beforeInit !== null) await beforeInit(this.lib);
        if (!this.lib.init()) throw new Error("Failed to initialize Wiregasm");
        this.uploadDir = this.lib.getUploadDirectory();
        this.pluginsDir = this.lib.getPluginsDirectory();
        this.initialized = true;
    }
    listModules() {
        return this.lib.listModules();
    }
    listPrefs(module) {
        return this.lib.listPreferences(module);
    }
    applyPrefs() {
        this.lib.applyPreferences();
    }
    setPref(module, key, value) {
        const ret = this.lib.setPref(module, key, value);
        if (ret.code !== (0, $922ca3010d5b156c$export$9511720e10589113).PREFS_SET_OK) {
            const message = ret.error !== "" ? ret.error : (0, $06475149eda1d309$export$a6506e3cba6c4388)(ret.code);
            throw new Error(`Failed to set preference (${module}.${key}): ${message}`);
        }
    }
    getPref(module, key) {
        const response = this.lib.getPref(module, key);
        if (response.code !== 0) throw new Error(`Failed to get preference (${module}.${key})`);
        return response.data;
    }
    /**
   * Check the validity of a filter expression.
   *
   * @param filter A display filter expression
   */ testFilter(filter) {
        return this.lib.checkFilter(filter);
    }
    completeFilter(filter) {
        const out = this.lib.completeFilter(filter);
        return {
            fields: (0, $06475149eda1d309$export$4b978bcb0889dc66)(out.fields)
        };
    }
    tap(taps) {
        // Validate keys.
        if (!("tap0" in taps)) throw new Error("tap0 is mandatory.");
        if (!Object.keys(taps).every((k)=>$f9eab8d5ad8ec090$var$ALLOWED_TAP_KEYS.has(k))) throw new Error(`Invalid arguments. Allowed keys are: ${Array.from($f9eab8d5ad8ec090$var$ALLOWED_TAP_KEYS).join(", ")}.`);
        const session = this.loadedSession();
        const args = new this.lib.MapInput();
        for (const [k, v] of Object.entries(taps))args.set(k, v);
        let response;
        try {
            response = session.tap(args);
        } finally{
            (0, $06475149eda1d309$export$13e2de3c33d99539)(args);
        }
        return {
            error: response.error,
            taps: (0, $06475149eda1d309$export$4b978bcb0889dc66)(response.taps).map((tap)=>{
                // biome-ignore lint/suspicious/noExplicitAny: keeps the public return type of tap() unchanged
                let res;
                if (this.isConvTap(tap)) res = {
                    proto: tap.proto,
                    tap: tap.tap,
                    type: tap.type,
                    geoip: tap.geoip,
                    convs: (0, $06475149eda1d309$export$4b978bcb0889dc66)(tap.convs),
                    hosts: (0, $06475149eda1d309$export$4b978bcb0889dc66)(tap.hosts)
                };
                else if (this.isEoTap(tap)) res = {
                    proto: tap.proto,
                    tap: tap.tap,
                    type: tap.type,
                    objects: (0, $06475149eda1d309$export$4b978bcb0889dc66)(tap.objects)
                };
                else {
                    (0, $06475149eda1d309$export$13e2de3c33d99539)(tap);
                    throw new Error("Unknown tap result");
                }
                (0, $06475149eda1d309$export$13e2de3c33d99539)(tap);
                return res;
            })
        };
    }
    download(token) {
        return this.loadedSession().download(token);
    }
    iograph(input) {
        // Validate keys.
        if (!("graph0" in input)) throw new Error("graph0 is mandatory.");
        if (!Object.keys(input).every((k)=>$f9eab8d5ad8ec090$var$ALLOWED_GRAPH_KEYS.has(k))) throw new Error(`Invalid arguments. Allowed keys are: ${Array.from($f9eab8d5ad8ec090$var$ALLOWED_GRAPH_KEYS).join(", ")}.`);
        const session = this.loadedSession();
        const args = new this.lib.MapInput();
        for (const [k, v] of Object.entries(input))args.set(k, v);
        let out;
        try {
            out = session.iograph(args);
        } finally{
            (0, $06475149eda1d309$export$13e2de3c33d99539)(args);
        }
        return {
            ...out,
            iograph: (0, $06475149eda1d309$export$4b978bcb0889dc66)(out.iograph).map((t)=>({
                    items: (0, $06475149eda1d309$export$4b978bcb0889dc66)(t.items)
                }))
        };
    }
    reloadLuaPlugins() {
        this.lib.reloadLuaPlugins();
    }
    addPlugin(name, data, opts = {}) {
        const path = `${this.pluginsDir}/${name}`;
        this.lib.FS.writeFile(path, data, opts);
    }
    /**
   * Load a packet trace file for analysis.
   *
   * @returns Response containing the status and summary
   */ load(name, data, opts = {}) {
        if (this.session != null) this.session.delete();
        const path = `${this.uploadDir}/${name}`;
        this.lib.FS.writeFile(path, data, opts);
        this.session = new this.lib.DissectSession(path);
        const response = this.session.load();
        if (response.code !== 0) {
            // Don't keep a session for a file that failed to open.
            this.session.delete();
            this.session = null;
        }
        return response;
    }
    /**
   * Get Packet List information for a range of packets.
   *
   * @param filter Output those frames that pass this filter expression
   * @param skip Skip N frames
   * @param limit Limit the output to N frames
   */ frames(filter, skip = 0, limit = 0) {
        return this.loadedSession().getFrames(filter, skip, limit);
    }
    /**
   * Get full information about a frame including the protocol tree.
   *
   * @param number Frame number
   */ frame(num) {
        return this.loadedSession().getFrame(num);
    }
    follow(follow, filter) {
        return this.loadedSession().follow(follow, filter);
    }
    loadedSession() {
        if (this.session === null) throw new Error("No capture file loaded, call load() first.");
        return this.session;
    }
    destroy() {
        if (this.initialized) {
            if (this.session !== null) {
                this.session.delete();
                this.session = null;
            }
            this.lib.destroy();
            this.initialized = false;
        }
    }
    /**
   * Returns the column headers
   */ columns() {
        const vec = this.lib.getColumns();
        // convert it from a vector to array
        return (0, $06475149eda1d309$export$4b978bcb0889dc66)(vec);
    }
    isEoTap(tap) {
        return tap instanceof this.lib.TapExportObject;
    }
    isConvTap(tap) {
        return tap instanceof this.lib.TapConvResponse;
    }
    // Protocol enable/disable methods
    /**
   * List all registered protocols
   *
   * @returns Array of all protocols with their enabled state
   */ listProtocols() {
        return (0, $06475149eda1d309$export$4b978bcb0889dc66)(this.lib.listProtocols());
    }
    /**
   * Enable or disable a protocol by its ID
   *
   * @param protoId Protocol ID
   * @param enabled Whether to enable or disable the protocol
   * @returns true if successful, false otherwise
   */ setProtocolEnabled(protoId, enabled) {
        return this.lib.setProtocolEnabled(protoId, enabled);
    }
    /**
   * Enable or disable a protocol by its filter name
   *
   * @param protoName Protocol filter name (e.g., "tcp", "udp")
   * @param enabled Whether to enable or disable the protocol
   * @returns true if successful, false otherwise
   */ setProtocolEnabledByName(protoName, enabled) {
        return this.lib.setProtocolEnabledByName(protoName, enabled);
    }
    // Heuristic dissector enable/disable methods
    /**
   * List all registered heuristic dissectors
   *
   * @returns Array of all heuristic dissectors with their enabled state
   */ listHeuristicDissectors() {
        return (0, $06475149eda1d309$export$4b978bcb0889dc66)(this.lib.listHeuristicDissectors());
    }
    /**
   * Enable or disable a heuristic dissector by its unique short name
   *
   * @param shortName Unique short name of the heuristic dissector (e.g., "mac_nr_udp")
   * @param enabled Whether to enable or disable the heuristic
   * @returns true if successful, false otherwise
   */ setHeuristicEnabled(shortName, enabled) {
        return this.lib.setHeuristicEnabled(shortName, enabled);
    }
}


export {$f9eab8d5ad8ec090$export$c4e6ddb7806910b1 as Wiregasm, $922ca3010d5b156c$export$9511720e10589113 as PrefSetResult, $922ca3010d5b156c$export$eeff8db21dc74b3d as PrefType, $06475149eda1d309$export$4b978bcb0889dc66 as vectorToArray, $06475149eda1d309$export$13e2de3c33d99539 as free, $06475149eda1d309$export$a6506e3cba6c4388 as preferenceSetCodeToError};
//# sourceMappingURL=module.js.map
