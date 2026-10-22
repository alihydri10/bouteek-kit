#!/usr/bin/env python3
"""Bump the Bouteek Kit version and rebuild version.json (the file list the panel downloads).
usage: python3 tools/make_version.py 1.3.1 "short note shown in the panel" """
import json, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ext = os.path.join(root, "com.bouteek.kit")
ver, notes = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "")
files = []
for d, _, fs in os.walk(ext):
    for f in fs:
        rel = os.path.relpath(os.path.join(d, f), ext).replace(os.sep, "/")
        if rel in ("version.json", ".debug"):
            continue
        files.append(rel)
files.sort()
json.dump({"version": ver, "notes": notes, "files": files}, open(os.path.join(root, "version.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"version": ver}, open(os.path.join(ext, "version.json"), "w"))
m = os.path.join(ext, "CSXS", "manifest.xml")
s = open(m).read()
s = re.sub(r'ExtensionBundleVersion="[^"]*"', 'ExtensionBundleVersion="%s"' % ver, s)
open(m, "w").write(s)
print("version", ver, "-", len(files), "files")
