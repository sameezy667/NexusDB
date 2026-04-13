@echo off
echo ========================================
echo Starting Whiteboard Architect Frontend
echo ========================================
echo.

cd frontend

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking if .env.local file exists...
if not exist .env.local (
    echo WARNING: .env.local file not found!
    echo Creating default .env.local...
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
    echo Created .env.local with default backend URL
)

echo.
echo Installing/Updating dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting Next.js development server...
echo ========================================
echo.
echo Frontend will be available at: http://localhost:3000
echo Whiteboard page: http://localhost:3000/whiteboard
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
