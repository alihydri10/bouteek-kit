@echo off
title Bouteek Kit - installer
echo Installing Bouteek Kit...
set "SRC=%~dp0com.bouteek.kit"
set "DST=%APPDATA%\Adobe\CEP\extensions\com.bouteek.kit"
for %%v in (9 10 11 12 13) do reg add "HKCU\Software\Adobe\CSXS.%%v" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul
if exist "%DST%" rmdir /s /q "%DST%"
robocopy "%SRC%" "%DST%" /E /NFL /NDL /NJH /NJS /NP >nul
if exist "%DST%\index.html" (
  echo.
  echo Done! Restart After Effects / Premiere Pro, then open Window ^> Extensions ^> Bouteek Kit.
) else (
  echo.
  echo Something went wrong. Take a deep breath and tell Ali.
)
echo.
pause
