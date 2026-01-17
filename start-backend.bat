@echo off
echo Starting SavePaws Backend Server...
echo.
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting server...
call npm run dev



