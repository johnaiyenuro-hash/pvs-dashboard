@echo off
title Mercor Live Sync Service
echo Starting Mercor Sync Service on http://127.0.0.1:4884...
node "%~dp0sync-server.js"
pause
