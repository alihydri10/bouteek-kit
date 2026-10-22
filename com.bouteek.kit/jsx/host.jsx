/* Bouteek Kit - host script for After Effects and Premiere Pro (ExtendScript, ES3) */

function btkParse(s) { return eval("(" + s + ")"); }
function btkIsPremiere() { return BridgeTalk.appName === "premierepro"; }

function btkAdd(s) {
    try { var a = btkParse(s); return btkIsPremiere() ? btkPpAdd(a) : btkAeAdd(a); }
    catch (e) { return "ERR:" + e.toString() + (e.line ? " (line " + e.line + ")" : ""); }
}
function btkRecolor(s) {
    try { var a = btkParse(s); return btkIsPremiere() ? btkPpRecolor(a) : btkAeRecolor(a); }
    catch (e) { return "ERR:" + e.toString(); }
}

/* ======================================================= After Effects */
var BTK_COLOR_NAMES = ["Background", "Logo", "Text", "Accent", "Accent 2", "Accent 3"];

function btkCtrl(comp) {
    var i;
    for (i = 1; i <= comp.numLayers; i++) { if (comp.layer(i).name === "BTK COLORS") { return comp.layer(i); } }
    return null;
}
function btkAeSetColors(comp, c) {
    var ctrl = btkCtrl(comp), i, fx;
    if (!ctrl) { return false; }
    for (i = 0; i < BTK_COLOR_NAMES.length; i++) {
        fx = ctrl.property("ADBE Effect Parade").property(BTK_COLOR_NAMES[i]);
        if (fx && c[BTK_COLOR_NAMES[i]]) { var v = c[BTK_COLOR_NAMES[i]]; fx.property(1).setValue([v[0], v[1], v[2], 1]); }
    }
    return true;
}
function btkLayer(comp, n) { var i; for (i = 1; i <= comp.numLayers; i++) { if (comp.layer(i).name === n) { return comp.layer(i); } } return null; }
// Show BG checkbox + CTA text (only where the comp has them)
function btkAeSetExtras(comp, a) {
    var ctrl = btkCtrl(comp), n = 0, fx, L, td, k, pairs;
    if (!ctrl) { return 0; }
    if (a.showBg !== undefined && a.showBg !== null) {
        fx = ctrl.property("ADBE Effect Parade").property("Show BG");
        if (fx) { fx.property(1).setValue(a.showBg ? 1 : 0); n++; }
    }
    if (a.text) {
        pairs = [["BTK Text EN", a.text.en], ["BTK Text AR", a.text.ar]];
        for (k = 0; k < pairs.length; k++) {
            L = btkLayer(comp, pairs[k][0]);
            if (!L || pairs[k][1] === undefined || pairs[k][1] === null) { continue; }
            td = L.property("ADBE Text Properties").property("ADBE Text Document");
            var doc = td.value; doc.text = String(pairs[k][1]).replace(/\r?\n/g, "\r"); td.setValue(doc); n++;
        }
    }
    return n;
}
function btkCollect(folder, out) {
    var i, it;
    for (i = 1; i <= folder.numItems; i++) { it = folder.item(i); out.push(it); if (it instanceof FolderItem) { btkCollect(it, out); } }
}
function btkMark(comp, keep) {
    var i, l;
    keep[comp.id] = true;
    for (i = 1; i <= comp.numLayers; i++) {
        l = comp.layer(i);
        try { if (l.source) { if (!keep[l.source.id]) { keep[l.source.id] = true; if (l.source instanceof CompItem) { btkMark(l.source, keep); } } } } catch (e) { }
    }
}
function btkFixExpr(group, oldS, newS) {
    var k, q;
    for (k = 1; k <= group.numProperties; k++) {
        q = group.property(k);
        if (q.propertyType === PropertyType.PROPERTY) {
            try { if (q.canSetExpression && q.expression && q.expression.indexOf(oldS) >= 0) { q.expression = q.expression.split(oldS).join(newS); } } catch (e) { }
        } else { btkFixExpr(q, oldS, newS); }
    }
}
function btkFolder(name) {
    var i;
    for (i = 1; i <= app.project.numItems; i++) { if (app.project.item(i) instanceof FolderItem && app.project.item(i).name === name && app.project.item(i).parentFolder === app.project.rootFolder) { return app.project.item(i); } }
    return app.project.items.addFolder(name);
}
function btkAeAdd(a) {
    var tpl = new File(a.aep);
    if (!tpl.exists) { return "ERR:Template not found: " + tpl.fsName; }
    var target = app.project.activeItem, msg = "";
    var fold = app.project.importFile(new ImportOptions(tpl));     // its own undo step (AE opens one for imports)
    app.beginUndoGroup("Bouteek Kit: add");
    try {
        var all = [], i, top = null;
        btkCollect(fold, all);
        for (i = 0; i < all.length; i++) { if (all[i] instanceof CompItem && all[i].name === a.comp) { top = all[i]; } }
        if (!top) { return "ERR:" + a.comp + " is not in the template"; }
        // keep only what this comp uses
        var keep = {};
        btkMark(top, keep);
        for (i = all.length - 1; i >= 0; i--) { if (!(all[i] instanceof FolderItem) && !keep[all[i].id]) { try { all[i].remove(); } catch (eR) { } } }
        all = []; btkCollect(fold, all);
        for (i = all.length - 1; i >= 0; i--) { if (all[i] instanceof FolderItem && all[i].numItems === 0) { try { all[i].remove(); } catch (eF) { } } }
        // unique name, so the colour expressions point at this copy only
        var n = 0, base = a.comp, nm;
        for (i = 1; i <= app.project.numItems; i++) { if (app.project.item(i) instanceof CompItem) { nm = app.project.item(i).name; if (nm === base || nm.indexOf(base + " #") === 0) { n++; } } }
        if (n > 1) {
            var newName = base + " #" + n, ids = [], id;
            top.name = newName;
            for (id in keep) { if (keep.hasOwnProperty(id)) { ids.push(id); } }
            all = []; btkCollect(fold, all);
            for (i = 0; i < all.length; i++) {
                if (all[i] instanceof CompItem) {
                    var j;
                    for (j = 1; j <= all[i].numLayers; j++) { btkFixExpr(all[i].layer(j), "comp(\"" + base + "\")", "comp(\"" + newName + "\")"); }
                }
            }
        }
        btkAeSetColors(top, a.colors);
        btkAeSetExtras(top, a);
        fold.name = top.name;
        fold.parentFolder = btkFolder("Bouteek Kit");
        if (target instanceof CompItem && target !== top) {
            var L = target.layers.add(top);
            L.startTime = target.time;
            msg = "Added " + top.name + " to " + target.name + ".";
        } else {
            top.openInViewer();
            msg = "Imported " + top.name + " (open a comp first to drop it in at the time indicator).";
        }
    } catch (e) {
        return "ERR:" + e.toString() + (e.line ? " (line " + e.line + ")" : "");
    } finally {
        app.endUndoGroup();
    }
    return "OK:" + msg;
}
function btkAeRecolor(a) {
    var c = app.project.activeItem, n = 0, i, L;
    if (!(c instanceof CompItem)) { return "ERR:Open a comp and select a Bouteek layer."; }
    app.beginUndoGroup("Bouteek Kit: update");
    try {
        var sel = c.selectedLayers;
        for (i = 0; i < sel.length; i++) {
            L = sel[i];
            if (L.source instanceof CompItem && btkAeSetColors(L.source, a.colors)) { btkAeSetExtras(L.source, a); n++; }
        }
        if (n === 0 && btkAeSetColors(c, a.colors)) { btkAeSetExtras(c, a); n = 1; }
    } finally { app.endUndoGroup(); }
    return n ? "OK:Updated " + n + " item" + (n > 1 ? "s" : "") + "." : "ERR:Select a Bouteek layer (or open a Bouteek comp).";
}

/* ======================================================= Premiere Pro */
function btkPpSetColors(trackItem, c, a) {
    var comp = null, i, p, v, n = 0;
    try { comp = trackItem.getMGTComponent(); } catch (e) { }
    if (!comp) { return 0; }
    for (i = 0; i < BTK_COLOR_NAMES.length; i++) {
        v = c[BTK_COLOR_NAMES[i]];
        if (!v) { continue; }
        try {
            p = comp.properties.getParamForDisplayName(BTK_COLOR_NAMES[i]);
            if (p) { p.setColorValue(255, Math.round(v[0] * 255), Math.round(v[1] * 255), Math.round(v[2] * 255), 1); n++; }
        } catch (e2) { }
    }
    btkPpSetExtras(comp, a);
    return n;
}
function btkJsonEsc(t) { return String(t).replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\r?\n/g, "\\n"); }
function btkPpSetExtras(comp, a) {
    var p, v, k, pairs;
    if (!a) { return; }
    if (a.showBg !== undefined && a.showBg !== null) {
        try { p = comp.properties.getParamForDisplayName("Show BG"); if (p) { p.setValue(a.showBg ? true : false, true); } } catch (e) { }
    }
    if (a.text) {
        pairs = [["CTA Text", a.text.en], ["CTA Text AR", a.text.ar]];
        for (k = 0; k < pairs.length; k++) {
            if (pairs[k][1] === undefined || pairs[k][1] === null) { continue; }
            try {
                p = comp.properties.getParamForDisplayName(pairs[k][0]);
                if (!p) { continue; }
                v = String(p.getValue());
                if (v.indexOf("textEditValue") >= 0) { var rep = "\"textEditValue\":\"" + btkJsonEsc(pairs[k][1]) + "\""; v = v.replace(/"textEditValue"\s*:\s*"(?:[^"\\]|\\.)*"/, function () { return rep; }); p.setValue(v, true); }
                else { p.setValue(String(pairs[k][1]), true); }
            } catch (e2) { }
        }
    }
}
function btkPpPickTrack(seq, sec) {
    var vt = seq.videoTracks, i, j, tr, busy, cl;
    for (i = 1; i < vt.numTracks; i++) {
        tr = vt[i]; busy = false;
        for (j = 0; j < tr.clips.numItems; j++) {
            cl = tr.clips[j];
            if (cl.start.seconds <= sec + 0.001 && cl.end.seconds > sec + 0.001) { busy = true; break; }
        }
        if (!busy) { return i; }
    }
    try {                                           // every track is busy here: add one on top
        app.enableQE();
        qe.project.getActiveSequence().addTracks(1, vt.numTracks, 0);
        if (seq.videoTracks.numTracks > vt.numTracks) { return seq.videoTracks.numTracks - 1; }
    } catch (e) { }
    return vt.numTracks - 1;
}
function btkPpAdd(a) {
    var seq = app.project.activeSequence;
    if (!seq) { return "ERR:Open a sequence first."; }
    var f = new File(a.mogrt);
    if (!f.exists) { return "ERR:Template not found: " + f.fsName; }
    var t = seq.getPlayerPosition();
    var vIdx = btkPpPickTrack(seq, t.seconds);
    var item = seq.importMGT(f.fsName, t.ticks, vIdx, 0);
    if (!item) { return "ERR:Premiere could not import the template."; }
    btkPpSetColors(item, a.colors, a);
    return "OK:Added on V" + (vIdx + 1) + " at the playhead.";
}
function btkPpRecolor(a) {
    var seq = app.project.activeSequence, n = 0, i, sel;
    if (!seq) { return "ERR:Open a sequence first."; }
    sel = seq.getSelection();
    for (i = 0; i < sel.length; i++) { if (btkPpSetColors(sel[i], a.colors, a)) { n++; } }
    return n ? "OK:Updated " + n + " clip" + (n > 1 ? "s" : "") + "." : "ERR:Select a Bouteek clip in the timeline.";
}
