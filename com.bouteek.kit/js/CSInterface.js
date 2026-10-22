/* minimal CSInterface shim (enough for this panel) */
(function (w) {
    function CSInterface() {}
    CSInterface.prototype.hasHost = function () { return !!(w.__adobe_cep__ && w.__adobe_cep__.evalScript); };
    CSInterface.prototype.evalScript = function (script, cb) {
        if (!this.hasHost()) { if (cb) { cb("ERR:no host (open the panel inside After Effects or Premiere Pro)"); } return; }
        w.__adobe_cep__.evalScript(script, cb || function () {});
    };
    CSInterface.prototype.getExtensionPath = function () {
        try {
            var p = decodeURI(w.__adobe_cep__.getSystemPath("extension")).replace(/^file:\/\//, "");
            if (/^\/[A-Za-z]:/.test(p)) { p = p.substring(1); }      // Windows: /C:/... -> C:/...
            return p;                                                 // Mac keeps its leading /
        } catch (e) { return ""; }
    };
    CSInterface.prototype.getHostApp = function () {
        try { return JSON.parse(w.__adobe_cep__.getHostEnvironment()).appName; } catch (e) { return ""; }
    };
    w.CSInterface = CSInterface;
})(window);
