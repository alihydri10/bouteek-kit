#!/usr/bin/env python3
"""Release a new Bouteek Kit version. Run from the repo, then `git push`.
usage: python3 tools/release.py 1.3.3 "short note shown in the panel"
Two commits: (1) the panel files with the new version number, (2) version.json pointing at commit (1),
so GitHub and the jsDelivr mirror both serve exactly those files."""
import json, os, re, subprocess, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ext = os.path.join(root, "com.bouteek.kit")
ver, notes = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "")
def git(*a): return subprocess.check_output(["git", "-C", root] + list(a)).decode().strip()
json.dump({"version": ver}, open(os.path.join(ext, "version.json"), "w"))
m = os.path.join(ext, "CSXS", "manifest.xml")
s = open(m).read(); open(m, "w").write(re.sub(r'ExtensionBundleVersion="[^"]*"', 'ExtensionBundleVersion="%s"' % ver, s))
files = []
for d, _, fs in os.walk(ext):
    for f in fs:
        rel = os.path.relpath(os.path.join(d, f), ext).replace(os.sep, "/")
        if rel not in ("version.json", ".debug"):
            files.append(rel)
files.sort()
git("add", "-A", "com.bouteek.kit")
if git("status", "--porcelain", "com.bouteek.kit"):
    subprocess.check_call(["git", "-C", root, "commit", "-qm", "Bouteek Kit %s: panel files" % ver])
sha = git("rev-parse", "HEAD")
json.dump({"version": ver, "notes": notes, "commit": sha, "files": files}, open(os.path.join(root, "version.json"), "w"), indent=1, ensure_ascii=False)
git("add", "-A")
subprocess.check_call(["git", "-C", root, "commit", "-qm", "Bouteek Kit %s" % ver])
print("Bouteek Kit", ver, "-", len(files), "files, files commit", sha[:7], "- now run: git push")
