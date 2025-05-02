import os
import json
import asyncio
import pathlib
from typing import List
from fastapi import FastAPI, HTTPException, WebSocket, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = FastAPI()
logs_dir = pathlib.Path(__file__).parent.parent / "logs"
if not logs_dir.exists():
    logs_dir.mkdir(parents=True)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connections
websocket_clients = []

class LogEventHandler(FileSystemEventHandler):
    def on_modified(self, event):
        notify_websockets({"type": "FILES_CHANGED"})

    def on_created(self, event):
        notify_websockets({"type": "FILES_CHANGED"})

observer = Observer()
observer.schedule(LogEventHandler(), str(logs_dir), recursive=True)
observer.start()

async def notify_websockets(message: dict):
    for client in websocket_clients:
        try:
            await client.send_json(message)
        except Exception as e:
            print(f"WebSocket notification error: {e}")

# WebSocket route
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        websocket_clients.remove(websocket)

# Helper function: Scan log files
def scan_log_files(dir_path: str) -> List[dict]:
    files = []
    for root, _, filenames in os.walk(dir_path):
        for filename in filenames:
            if filename.endswith(".json.log"):
                file_path = os.path.join(root, filename)
                stats = os.stat(file_path)
                files.append({
                    "name": filename,
                    "path": file_path,
                    "size": stats.st_size,
                    "lastModified": stats.st_mtime
                })
    # Sort by last modified date (newest first)
    files.sort(key=lambda x: x["lastModified"], reverse=True)
    return files

# Route: Get log files
@app.get("/api/logs/files")
def get_log_files(path: str = Query(None)):
    try:
        dir_path = logs_dir if path is None else pathlib.Path(path).resolve()
        if not os.path.exists(dir_path):
            raise HTTPException(status_code=404, detail="Directory not found")
        files = scan_log_files(dir_path)
        return JSONResponse(content=files)
    except Exception as e:
        print(f"Error reading log files: {e}")
        raise HTTPException(status_code=500, detail="Failed to read log files")

# Route: Get file content
@app.get("/api/logs/content")
def get_file_content(path: str):
    try:
        if path is None:
            raise HTTPException(status_code=400, detail="File path is required")
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="File not found")
        with open(path, "r", encoding='utf-8') as file:
            content = file.read()
        return JSONResponse(content=content)
    except Exception as e:
        print(f"Error reading log file: {e}")
        raise HTTPException(status_code=500, detail="Failed to read log file")

# Run server
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 9999))
    print(f"Server running on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)