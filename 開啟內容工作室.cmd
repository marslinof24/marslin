@echo off
cd /d "%~dp0"
set "MARS_EDITOR_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%MARS_EDITOR_PYTHON%" (
  "%MARS_EDITOR_PYTHON%" "_local\editor\open_editor.py"
) else (
  python "_local\editor\open_editor.py"
)
