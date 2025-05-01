import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from 'antd';
import LogFileList from './components/LogFileList';
import LogViewer from './components/LogViewer';
import { LogFile, LogEntry } from './types';
import { parseLogContent } from './utils/logParser';

const { Sider, Content } = Layout;

function App() {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<LogFile>();
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  // Function to read log file content
  const readLogFile = useCallback(async (file: LogFile) => {
    try {
      const response = await fetch(`http://localhost:3000/api/logs/content?path=${encodeURIComponent(file.path)}`);
      const content = await response.text();
      const entries = parseLogContent(content);
      setLogEntries(entries);
    } catch (error) {
      console.error('Error reading log file:', error);
      setLogEntries([]);
    }
  }, []);

  // Function to fetch log files list
  const fetchLogFiles = useCallback(async (path?: string) => {
    try {
      const url = path 
        ? `http://localhost:3000/api/logs/files?path=${encodeURIComponent(path)}`
        : 'http://localhost:3000/api/logs/files';
      const response = await fetch(url);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching log files:', error);
      setFiles([]);
    }
  }, []);

  // Initial load of log files
  useEffect(() => {
    // Get path from URL query parameter if present
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');
    fetchLogFiles(path || undefined);

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:3000/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'FILE_CHANGED' && data.path === selectedFile?.path && selectedFile) {
        readLogFile(selectedFile);
      } else if (data.type === 'FILES_CHANGED') {
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path');
        fetchLogFiles(path || undefined);
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedFile, fetchLogFiles, readLogFile]); // Include all dependencies

  // Handle file selection
  const handleFileSelect = (file: LogFile) => {
    setSelectedFile(file);
    readLogFile(file);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={300} theme="light">
        <LogFileList
          files={files}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
        />
      </Sider>
      <Content>
        {selectedFile ? (
          <LogViewer entries={logEntries} />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#999',
          }}>
            Select a log file to view its contents
          </div>
        )}
      </Content>
    </Layout>
  );
}

export default App;
