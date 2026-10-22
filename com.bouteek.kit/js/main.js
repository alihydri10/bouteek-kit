/* Bouteek Kit panel (After Effects + Premiere Pro) */
(function () {
    var cs = new CSInterface();
    var HOST = cs.getHostApp();                         // "AEFT" | "PPRO"
    var EXT = cs.getExtensionPath();

    var ITEMS = [
        { id: "logo_v_en", cat: "logo", a: "Vertical", b: "EN", comp: "Bouteek Logo - Vertical EN" },
        { id: "logo_h_en", cat: "logo", a: "Horizontal", b: "EN", comp: "Bouteek Logo - Horizontal EN" },
        { id: "logo_v_ar", cat: "logo", a: "Vertical", b: "AR", comp: "Bouteek Logo - Vertical AR" },
        { id: "logo_h_ar", cat: "logo", a: "Horizontal", b: "AR", comp: "Bouteek Logo - Horizontal AR" },
        { id: "endcta_v", cat: "cta", a: "End to CTA", b: "Vertical", comp: "Bouteek End to CTA - Vertical" },
        { id: "endcta_h", cat: "cta", a: "End to CTA", b: "Horizontal", comp: "Bouteek End to CTA - Horizontal" },
        { id: "cta_v", cat: "cta", a: "CTA", b: "Vertical", comp: "Bouteek CTA - Vertical" },
        { id: "cta_h", cat: "cta", a: "CTA", b: "Horizontal", comp: "Bouteek CTA - Horizontal" },
        { id: "flower_v", cat: "trans", a: "Flower corner", b: "Vertical", comp: "Bouteek Flower Corner - Vertical" },
        { id: "flower_h", cat: "trans", a: "Flower corner", b: "Horizontal", comp: "Bouteek Flower Corner - Horizontal" },
        { id: "bloom_v", cat: "trans", a: "Bloom drop", b: "Vertical", comp: "Bouteek Bloom Drop - Vertical" },
        { id: "bloom_h", cat: "trans", a: "Bloom drop", b: "Horizontal", comp: "Bouteek Bloom Drop - Horizontal" }
    ];
    // logo / background pairs from the brand file
    var SCHEMES = [
        { bg: "#88C86F", logo: "#003C45", text: "#003C45" },
        { bg: "#F0F2EC", logo: "#003C45", text: "#003C45" },
        { bg: "#003C45", logo: "#88C86F", text: "#F0F2EC" }
    ];
    // the tag colours: shapes and transitions
    var ACCENTS = ["#88C86F", "#003C45", "#F0F2EC", "#645FAA", "#FDBA4D", "#76C5E4", "#F49AC1", "#F26646"];
    var SHAPE_ROT = ["#F26646", "#FDBA4D", "#76C5E4", "#645FAA", "#F49AC1", "#88C86F"];

    var DEF_EN = "You don\u2019t have to build alone", DEF_AR = "\u0644\u0642\u062f \u0628\u062f\u0623\u062a \u0647\u0630\u0627 \u0644\u062a\u0635\u0646\u0639 \u0634\u064a\u0626\u064b\u0627.";
    var state = { cat: "logo", sel: "logo_v_en", scheme: 2, accent: 7, bg: true, en: DEF_EN, ar: DEF_AR };
    try { var sv = JSON.parse(localStorage.getItem("btkKit") || "{}"); for (var k in sv) { if (state.hasOwnProperty(k)) { state[k] = sv[k]; } } } catch (e) { }
    function save() { try { localStorage.setItem("btkKit", JSON.stringify(state)); } catch (e) { } }

    var $ = function (id) { return document.getElementById(id); };
    function rgb(h) { h = h.replace("#", ""); return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]; }
    function colours() {
        var s = SCHEMES[state.scheme], a = ACCENTS[state.accent], j = SHAPE_ROT.indexOf(a);
        var a2 = j >= 0 ? SHAPE_ROT[(j + 1) % SHAPE_ROT.length] : "#FDBA4D", a3 = j >= 0 ? SHAPE_ROT[(j + 2) % SHAPE_ROT.length] : "#76C5E4";
        return { "Background": rgb(s.bg), "Logo": rgb(s.logo), "Text": rgb(s.text), "Accent": rgb(a), "Accent 2": rgb(a2), "Accent 3": rgb(a3) };
    }
    function status(msg, cls) { var el = $("status"); el.textContent = msg || ""; el.className = "status" + (cls ? " " + cls : ""); }
    function item(id) { for (var i = 0; i < ITEMS.length; i++) { if (ITEMS[i].id === id) { return ITEMS[i]; } } return null; }

    // ---------------------------------------------------------------- render
    function renderTabs() {
        var bs = $("tabs").querySelectorAll("button");
        for (var i = 0; i < bs.length; i++) { bs[i].className = bs[i].getAttribute("data-cat") === state.cat ? "on" : ""; }
    }
    function renderList() {
        var el = $("list"); el.innerHTML = "";
        ITEMS.forEach(function (it) {
            if (it.cat !== state.cat) { return; }
            var c = document.createElement("div");
            c.className = "card" + (it.id === state.sel ? " sel" : "");
            c.innerHTML = '<div class="v"><img src="img/prev/' + it.id + '.jpg"><video muted loop playsinline preload="none" src="img/prev/' + it.id + '.webm"></video></div>' +
                '<div class="nm">' + it.a + ' <span>· ' + it.b + '</span></div>';
            var v = c.querySelector("video");
            c.addEventListener("mouseenter", function () { try { v.currentTime = 0; var p = v.play(); if (p && p.catch) { p.catch(function () { }); } } catch (e) { } });
            c.addEventListener("mouseleave", function () { try { v.pause(); } catch (e) { } });
            c.addEventListener("click", function () { state.sel = it.id; save(); renderList(); });
            c.addEventListener("dblclick", function () { state.sel = it.id; save(); renderList(); add(); });
            el.appendChild(c);
        });
    }
    var BSVG = '<svg viewBox="0 0 76.32 70.7"><path d="M0 31.43V0h59.71c8.68 0 15.71 7.04 15.71 15.71s-7.04 15.71-15.71 15.71H0z"/><path d="M0 70.7V39.27h60.61c8.68 0 15.71 7.04 15.71 15.71S69.29 70.69 60.61 70.69H0z"/></svg>';
    function renderColours() {
        var sc = $("schemes"); sc.innerHTML = "";
        SCHEMES.forEach(function (s, i) {
            var b = document.createElement("button");
            b.className = "sc" + (i === state.scheme ? " on" : "");
            b.style.background = s.bg; b.innerHTML = BSVG; b.querySelector("svg").style.fill = s.logo;
            b.title = "Background + logo";
            b.addEventListener("click", function () { state.scheme = i; save(); renderColours(); });
            sc.appendChild(b);
        });
        var d = $("dots"); d.innerHTML = "";
        ACCENTS.forEach(function (h, i) {
            var b = document.createElement("button");
            b.className = "dot" + (i === state.accent ? " on" : ""); b.style.background = h; b.title = h;
            b.addEventListener("click", function () { state.accent = i; save(); renderColours(); });
            d.appendChild(b);
        });
        // transitions only use the shape colour
        $("schemes").parentNode.className = "row" + (state.cat === "trans" ? " off" : "");
        $("bgRow").className = "row" + (state.cat === "trans" ? " off" : "");
        $("btnBg").className = "tog" + (state.bg ? " on" : "");
        $("bgHint").textContent = state.bg ? "Background on" : "No background (transparent)";
        $("texts").className = "texts" + (state.cat === "cta" ? " on" : "");
    }
    function extras(o) {
        o.showBg = state.cat === "trans" ? null : state.bg;
        if (state.cat === "cta") { o.text = { en: state.en, ar: state.ar }; }
        return o;
    }

    // ---------------------------------------------------------------- host calls
    function call(fn, args, done) {
        var s = JSON.stringify(args).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        cs.evalScript(fn + "('" + s + "')", function (r) {
            r = String(r || "");
            if (r.indexOf("OK:") === 0) { status(r.substr(3), "ok"); }
            else { status(r.replace(/^ERR:/, "") || "Something went wrong.", "err"); }
            if (done) { done(r); }
        });
    }
    function add() {
        var it = item(state.sel); if (!it) { return; }
        $("btnAdd").disabled = true; status("Adding " + it.a + " · " + it.b + "…");
        call("btkAdd", {
            id: it.id, comp: it.comp,
            aep: EXT + "/template/template.aep",
            mogrt: EXT + "/mogrts/" + it.id + ".mogrt",
            colors: colours(),
            showBg: it.cat === "trans" ? null : state.bg,
            text: it.cat === "cta" ? { en: state.en, ar: state.ar } : null
        }, function () { $("btnAdd").disabled = false; });
    }
    function recolour() { call("btkRecolor", extras({ colors: colours() })); }

    // ---------------------------------------------------------------- wire up
    $("tabs").addEventListener("click", function (e) {
        var c = e.target.getAttribute && e.target.getAttribute("data-cat"); if (!c) { return; }
        state.cat = c;
        var first = null; ITEMS.forEach(function (it) { if (it.cat === c && !first) { first = it.id; } });
        if (!item(state.sel) || item(state.sel).cat !== c) { state.sel = first; }
        save(); renderTabs(); renderList(); renderColours();
    });
    $("btnAdd").addEventListener("click", add);
    $("btnRecolor").addEventListener("click", recolour);
    $("btnBg").addEventListener("click", function () { state.bg = !state.bg; save(); renderColours(); });
    $("txtEn").value = state.en; $("txtAr").value = state.ar;
    $("txtEn").addEventListener("input", function () { state.en = this.value; save(); });
    $("txtAr").addEventListener("input", function () { state.ar = this.value; save(); });
    $("rsEn").addEventListener("click", function () { state.en = DEF_EN; $("txtEn").value = DEF_EN; save(); });
    $("rsAr").addEventListener("click", function () { state.ar = DEF_AR; $("txtAr").value = DEF_AR; save(); });
    $("btnAbout").addEventListener("click", function () { $("about").className = "about on"; });
    $("btnClose").addEventListener("click", function () { $("about").className = "about"; });


    // ---------------------------------------------------------------- self update (files live on GitHub)
    var RAW = "https://raw.githubusercontent.com/alihydri10/bouteek-kit/main/";
    var localVer = "0.0.0", remote = null;
    function fsOK() { return !!(window.cep && window.cep.fs); }
    function newer(a, b) {                              // is a > b
        var x = String(a).split("."), y = String(b).split("."), i;
        for (i = 0; i < 3; i++) { var p = parseInt(x[i] || 0, 10), q = parseInt(y[i] || 0, 10); if (p !== q) { return p > q; } }
        return false;
    }
    function get(url, binary, done) {
        var x = new XMLHttpRequest();
        x.open("GET", url + (url.indexOf("?") < 0 ? "?" : "&") + "t=" + Date.now(), true);
        if (binary) { x.responseType = "arraybuffer"; }
        x.timeout = 60000;
        x.onload = function () { if (x.status === 200) { done(null, x.response); } else { done("HTTP " + x.status + " " + url); } };
        x.onerror = function () { done("No connection"); };
        x.ontimeout = function () { done("Timed out"); };
        x.send();
    }
    function b64(buf) {
        var bytes = new Uint8Array(buf), out = "", i, CH = 0x8000;
        for (i = 0; i < bytes.length; i += CH) { out += String.fromCharCode.apply(null, bytes.subarray(i, i + CH)); }
        return btoa(out);
    }
    function mkdirs(path) {
        var parts = path.split("/"), cur = parts[0], i;
        for (i = 1; i < parts.length; i++) { cur += "/" + parts[i]; window.cep.fs.makedir(cur); }
    }
    function readLocalVersion() {
        if (!fsOK()) { return; }
        try {
            var r = window.cep.fs.readFile(EXT + "/version.json");
            if (r.err === 0) { localVer = JSON.parse(r.data).version || localVer; }
        } catch (e) { }
        $("ver").textContent = "Version " + localVer;
    }
    function checkUpdate() {
        if (!fsOK()) { return; }
        get(RAW + "version.json", false, function (err, txt) {
            if (err) { return; }
            try { remote = JSON.parse(txt); } catch (e) { return; }
            if (remote && remote.version && newer(remote.version, localVer)) {
                $("updTxt").textContent = "New version " + remote.version + (remote.notes ? " · " + remote.notes : "");
                $("upd").className = "upd on";
            }
        });
    }
    function runUpdate() {
        if (!remote || !remote.files || !remote.files.length) { return; }
        var files = remote.files.slice(), got = [], i = 0;
        $("btnUpd").disabled = true;
        function next() {
            if (i >= files.length) { return write(); }
            $("updTxt").textContent = "Downloading " + (i + 1) + " / " + files.length + "…";
            get(RAW + "com.bouteek.kit/" + files[i].split("/").map(encodeURIComponent).join("/"), true, function (err, buf) {
                if (err) { $("updTxt").textContent = "Update failed: " + err; $("btnUpd").disabled = false; return; }
                got.push({ path: files[i], data: b64(buf) }); i++; next();
            });
        }
        function write() {
            var k, full, r, bad = [];
            for (k = 0; k < got.length; k++) {
                full = EXT + "/" + got[k].path;
                mkdirs(full.substring(0, full.lastIndexOf("/")));
                r = window.cep.fs.writeFile(full, got[k].data, window.cep.encoding.Base64);
                if (r.err !== 0) { bad.push(got[k].path); }
            }
            if (bad.length) { $("updTxt").textContent = "Could not write: " + bad.join(", "); $("btnUpd").disabled = false; return; }
            window.cep.fs.writeFile(EXT + "/version.json", JSON.stringify({ version: remote.version }));
            $("updTxt").textContent = "Updated to " + remote.version + ". Reloading…";
            cs.evalScript("$.evalFile(new File(\"" + EXT.replace(/\\/g, "/") + "/jsx/host.jsx\"))", function () {
                setTimeout(function () { location.reload(); }, 600);
            });
        }
        next();
    }
    $("btnUpd").addEventListener("click", runUpdate);
    readLocalVersion();
    setTimeout(checkUpdate, 2000);

    renderTabs(); renderList(); renderColours();
    status(HOST === "PPRO" ? "Premiere Pro: adds at the playhead." : (HOST === "AEFT" ? "After Effects: adds to the open comp at the time indicator." : "Open this panel in After Effects or Premiere Pro."));
    setTimeout(function () { $("splash").className = "splash out"; }, 1700);
})();
