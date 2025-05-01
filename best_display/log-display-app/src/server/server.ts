import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import fs from 'fs';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('error', console.error);
});

// Broadcast to all connected clients
const broadcast = (message: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(message));
    }
  });
};

// API Routes
app.get('/api/logs/files', (req, res) => {
  try {
    const dirPath = req.query.path as string;
    const logsDir = dirPath ? path.normalize(dirPath) : path.join(__dirname, '../../logs');
    
    // Validate directory path
    if (dirPath && !fs.existsSync(logsDir)) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    // Create default logs directory if it doesn't exist and no custom path provided
    if (!dirPath && !fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const files = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logsDir, file),
        size: fs.statSync(path.join(logsDir, file)).size,
        lastModified: fs.statSync(path.join(logsDir, file)).mtime
      }));

    res.json(files);
  } catch (error) {
    console.error('Error reading log files:', error);
    res.status(500).json({ error: 'Failed to read log files' });
  }
});

app.get('/api/logs/content', (req, res) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const normalizedPath = path.normalize(filePath);
    
    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(normalizedPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error reading log file:', error);
    res.status(500).json({ error: 'Failed to read log file' });
  }
});

// Watch logs directory for changes
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

fs.watch(logsDir, (eventType, filename) => {
  if (filename) {
    if (eventType === 'change') {
      broadcast({ type: 'FILE_CHANGED', path: path.join(logsDir, filename) });
    } else {
      broadcast({ type: 'FILES_CHANGED' });
    }
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
