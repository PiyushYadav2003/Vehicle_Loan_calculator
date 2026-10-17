@echo off
title Vehicle Loan Calculator - Local Server
cd /d "%~dp0"

echo ======================================================================
echo          VEHICLE LOAN CALCULATOR - WEB TECHNOLOGY PROJECT
echo ======================================================================
echo.
echo [1/2] Launching your web browser at http://localhost:8085 ...
start "" "http://localhost:8085/index.html"

echo [2/2] Starting local Python HTTP server on port 8085...
echo.
echo Server is running! Press Ctrl+C in this window anytime to stop.
echo ======================================================================
echo.

python -m http.server 8085

:: Fallback if Python is ever uninstalled or not in PATH
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Notice] Python was not found in PATH.
    echo Opening index.html directly in your default browser instead...
    start "" "index.html"
)

pause
