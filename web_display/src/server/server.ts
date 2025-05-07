import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server with noServer option
const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket upgrade request
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes first for proper route matching

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
// Recursive function to scan for log files
function scanLogFiles(dir: string): Array<{name: string, path: string, size: number, lastModified: Date}> {
  const files: Array<{name: string, path: string, size: number, lastModified: Date}> = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...scanLogFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json.log')) {
      const stats = fs.statSync(fullPath);
      files.push({
        name: entry.name,
        path: fullPath,
        size: stats.size,
        lastModified: stats.mtime
      });
    }
  }
  
  return files;
}

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
    console.log(logsDir)
    const files = scanLogFiles(logsDir);
    // sort by last modified date (newest first)
    files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    res.json(files);
  } catch (error) {
    console.error('Error reading log files:', error);
    res.status(500).json({ error: 'Failed to read log files' });
  }
});

app.get('/api/logs/content', (req, res) => {
  try {
    const filePath = req.query.path as string;
    const page = parseInt(req.query.page as string) || 1;
    var numEntitiesPerPage = parseInt(req.query.num_entity_each_page as string) || 50;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const normalizedPath = path.normalize(filePath);
    
    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(normalizedPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const entityTakeNumLines = 2;
    // Calculate total number of entries and pages
    const totalEntries = Math.floor(lines.length / entityTakeNumLines);
    const totalPages = Math.ceil(totalEntries / numEntitiesPerPage);
    
    // Get the slice of entries for the requested page
    const startIndex = (page - 1) * numEntitiesPerPage * entityTakeNumLines;
    const endIndex = startIndex + numEntitiesPerPage * entityTakeNumLines;
    const pageContent = lines.slice(startIndex, endIndex).join('\n');
    
    // Compress the content using gzip
    const compressedContent = zlib.gzipSync(Buffer.from(pageContent)).toString('base64');

    res.json({
      content: compressedContent,
      compressed: true,
      totalEntries,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error reading log file:', error);
    res.status(500).json({ error: 'Failed to read log file' });
  }
});

// // Watch logs directory for changes
// const logsDir = path.join(__dirname, '../../logs');
// if (!fs.existsSync(logsDir)) {
//   fs.mkdirSync(logsDir, { recursive: true });
// }

// fs.watch(logsDir, (eventType, filename) => {
//   if (filename) {
//     if (eventType === 'change') {
//       broadcast({ type: 'FILE_CHANGED', path: path.join(logsDir, filename) });
//     } else {
//       broadcast({ type: 'FILES_CHANGED' });
//     }
//   }
// });

const FPORT = process.env.REACT_APP_FPORT || 9999;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../../build')));

// Simple catch-all route for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../build/index.html'));
});

server.listen(FPORT, () => {
  console.log(`Server running on port http://127.0.0.1:${FPORT}`);
});
