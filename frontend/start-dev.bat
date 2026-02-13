@echo off
echo ========================================
echo  Activity System - Frontend (Next.js)
echo ========================================
echo.
echo Starting Frontend Development Server...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [!] node_modules not found. Installing dependencies...
    echo.
    call npm install
    echo.
)

echo [*] Starting Next.js development server...
echo.
echo Once you see "Ready in X.Xs", the frontend will be available at:
echo.
echo   Local:   http://localhost:3000
echo   Network: http://[your-ip]:3000
echo.
echo Available pages:
echo   - http://localhost:3000/login
echo   - Login with demo users (password: password123)
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run dev
