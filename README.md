# Bouteek Kit

Bouteek brand panel for **After Effects** and **Premiere Pro**: logo motions (EN / AR), CTA, transitions, brand colours.
Made at BlueBearX.

## Install (first time only)
1. **Code › Download ZIP** on this page, unzip it.
2. Windows: double-click `Install_Windows.bat` · Mac: double-click `Install_Mac.command` (if blocked: right-click › Open).
3. Restart After Effects / Premiere Pro › **Window › Extensions › Bouteek Kit**.

## Updates
When a new version is here, the panel shows **New version … Update**. One click and it updates itself, with or without VPN (GitHub or the jsDelivr mirror).

## Releasing a new version (Ali)
1. Change files in `com.bouteek.kit/`.
2. `python3 tools/make_version.py 1.3.3 "what changed"`
3. Commit, then tag and push: `git tag v1.3.3 && git push && git push --tags`
   (or on GitHub: Releases > Draft a new release > tag `v1.3.3`).
4. For people without VPN (jsDelivr mirror), open once:
   https://purge.jsdelivr.net/gh/alihydri10/bouteek-kit@main/version.json

If it works well, Ali did his job right. If it's buggy, it's Claude's fault. Take a deep breath and tell us, so we can fix it.
