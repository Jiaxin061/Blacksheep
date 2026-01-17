@echo off
echo Starting SavePaws Frontend (Expo)...
echo.
cd frontend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting Expo...
echo Press 'a' when prompted to open on Android emulator
call npm run android


