@echo off
echo ========================================
echo Starting Whiteboard Architect Backend
echo ========================================
echo.

cd backend

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking if .env file exists...
if not exist .env (
    echo WARNING: .env file not found!
    echo Please create backend/.env with your GEMINI_API_KEY
    echo.
    echo Example:
    echo GEMINI_API_KEY=your_key_here
    echo.
    pause
)

echo.
echo Installing/Updating dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting FastAPI server on port 8000...
echo ========================================
echo.
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py
