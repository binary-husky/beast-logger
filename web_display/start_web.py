import os
import json
import base64
import gzip
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Initialize FastAPI app
app = FastAPI()

# Enable CORS (allow all)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LOGS_DIR = os.path.join(BASE_DIR, 'logs')
BUILD_DIR = os.path.join(BASE_DIR, '..', 'web_display_dist', 'build_pub')

# WebSocket connections registry
_connections: Set[WebSocket] = set()


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print("New WebSocket connection")
    _connections.add(ws)
    try:
        while True:
            # Keep connection alive; ignore incoming messages
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print("WebSocket error:", e)
    finally:
        _connections.discard(ws)


async def broadcast(message: Any):
    data = json.dumps(message)
    for ws in list(_connections):
        try:
            await ws.send_text(data)
        except Exception:
            _connections.discard(ws)


# Helpers

def _parse_after_datetime(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    # Try ISO8601 first
    try:
        dt = datetime.fromisoformat(s.replace('Z', '+00:00'))
        # Normalize to naive UTC for comparison
        if dt.tzinfo is not None:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt
    except Exception:
        pass
    # Try numeric timestamp (seconds or ms)
    try:
        val = float(s)
        if val > 1e12:  # ms to seconds
            val /= 1000.0
        # Normalize to naive UTC
        return datetime.utcfromtimestamp(val)
    except Exception:
        return None


def _scan_log_files(dir_path: str, after_datatime: Optional[str]) -> List[Dict[str, Any]]:
    files: List[Dict[str, Any]] = []
    after_datatime = None # force no filter
    after_dt = _parse_after_datetime(after_datatime)
    if not os.path.exists(dir_path):
        return files

    LIMIT = 60

    def dfs(current_dir: str):
        if len(files) >= LIMIT:
            return
        try:
            entries = []
            with os.scandir(current_dir) as it:
                for entry in it:
                    try:
                        st = entry.stat(follow_symlinks=False)
                    except FileNotFoundError:
                        continue
                    entries.append((entry, st))

            entries.sort(key=lambda e: e[1].st_mtime, reverse=True)
            print(f"[{len(files)}] Scanning {current_dir}, found {len(entries)} entries")
            for entry, st in entries:
                if len(files) >= LIMIT:
                    return
                if entry.is_file(follow_symlinks=False):
                    name = entry.name
                    if '.json.' in name and name.endswith('.log'):
                        mtime_dt = datetime.utcfromtimestamp(st.st_mtime)
                        if after_dt and mtime_dt <= after_dt:
                            continue
                        files.append({
                            'name': name,
                            'path': entry.path,
                            'size': st.st_size,
                            'lastModified': mtime_dt.isoformat() + 'Z'
                        })
                elif entry.is_dir(follow_symlinks=False):
                    dfs(entry.path)
        except PermissionError:
            return

    dfs(dir_path)

    if after_datatime is not None and len(files) == 0:
        return _scan_log_files(dir_path, None)

    return files


# API Routes
@app.get('/api/logs/files')
def get_log_files(path: Optional[str] = Query(default=None), after_datatime: Optional[str] = Query(default=None)):
    custom_dir = path
    logs_dir = os.path.normpath(custom_dir) if custom_dir else DEFAULT_LOGS_DIR

    if custom_dir and not os.path.exists(logs_dir):
        raise HTTPException(status_code=404, detail='Directory not found')

    if not custom_dir and not os.path.exists(logs_dir):
        os.makedirs(logs_dir, exist_ok=True)

    print(logs_dir)
    files = _scan_log_files(logs_dir, after_datatime)
    files.sort(key=lambda f: f['lastModified'], reverse=True)
    return JSONResponse(files)


@app.get('/api/logs/content')
def get_log_content(path: str = Query(...), page: int = Query(1), num_entity_each_page: int = Query(50)):
    if not path:
        raise HTTPException(status_code=400, detail='File path is required')

    normalized_path = os.path.normpath(path)

    if not os.path.exists(normalized_path):
        raise HTTPException(status_code=404, detail='File not found')

    try:
        with open(normalized_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception:
        raise HTTPException(status_code=500, detail='Failed to read log file')

    lines = [line for line in content.splitlines() if line.strip()]

    entity_take_num_lines = 2
    total_entries = len(lines) // entity_take_num_lines
    total_pages = (total_entries + num_entity_each_page - 1) // num_entity_each_page

    start_index = (page - 1) * num_entity_each_page * entity_take_num_lines
    end_index = start_index + num_entity_each_page * entity_take_num_lines
    page_content = '\n'.join(lines[start_index:end_index])

    try:
        compressed = gzip.compress(page_content.encode('utf-8'), compresslevel=9)
        compressed_b64 = base64.b64encode(compressed).decode('ascii')
    except Exception:
        raise HTTPException(status_code=500, detail='Failed to compress log file content')

    return {
        'content': compressed_b64,
        'compressed': True,
        'totalEntries': total_entries,
        'totalPages': total_pages,
        'currentPage': page
    }


# Static files from React build (mirror express.static)
if os.path.isdir(BUILD_DIR):
    static_dir = os.path.join(BUILD_DIR, 'static')
    if os.path.isdir(static_dir):
        app.mount('/static', StaticFiles(directory=static_dir, html=False), name='static')


# Catch-all route to serve index.html for client-side routing
@app.get('/{full_path:path}')
def spa_fallback(full_path: str):
    index_html = os.path.join(BUILD_DIR, 'index.html')
    # Serve real file from build if it exists
    candidate = os.path.join(BUILD_DIR, full_path)
    if os.path.isfile(candidate):
        return FileResponse(candidate)
    if os.path.isfile(index_html):
        return FileResponse(index_html)
    return JSONResponse({'message': 'Not found'}, status_code=404)


def main():
    port = int(os.getenv('REACT_APP_FPORT', '8181'))
    uvicorn.run(app, host='127.0.0.1', port=port)


if __name__ == '__main__':
    main()
