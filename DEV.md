# Development Guide


0. Install dependencies

1. Launch file server (python based)

```bash
python web_display/start_web.py
```
Then, the file server should be running at port 8181.

2. Launch react debug mode

```bash
cd web_display

DANGEROUSLY_DISABLE_HOST_CHECK=true WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true REACT_APP_DEBUG_FILE_SERVER='http://localhost:8181' npm run start:dev
```
Then the frontend application should be running at 3000
