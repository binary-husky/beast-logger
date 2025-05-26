import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Modal, Input, Button } from 'antd';
import LogFileList from './components/LogFileList';
import LogViewer from './components/LogViewer';
import { LogFile, LogEntry } from './types';
import { parseLogContent } from './utils/logParser';
import pako from 'pako';

const { Sider, Content } = Layout;
const FPORT = process.env.REACT_APP_FPORT || 9999;

function App() {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<LogFile>();
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPathInput, setShowPathInput] = useState(false);
  const [pathInput, setPathInput] = useState('');

  const PAGE_SIZE = 15;

  // Function to decompress gzipped base64 content
  const decompressContent = (compressedContent: string): string => {
    try {
      // Convert base64 to binary array using browser APIs
      const binaryString = atob(compressedContent);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decompressed = pako.inflate(bytes, { to: 'string' });
      return decompressed;
    } catch (error) {
      console.error('Error decompressing content:', error);
      return '';
    }
  };

  // Function to read log file content
  const readLogFile = useCallback(async (file: LogFile, page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/logs/content?` + 
        `path=${encodeURIComponent(file.path)}&` +
        `page=${page}&` +
        `num_entity_each_page=${PAGE_SIZE}`
      );
      const data = await response.json();
      const decompressedContent = data.compressed ? decompressContent(data.content) : data.content;
      const entries = parseLogContent(decompressedContent);
      setLogEntries(entries);
      setTotalEntries(data.totalEntries);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error reading log file:', error);
      setLogEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch log files list
  const fetchLogFiles = useCallback(async (path?: string) => {
    try {
      const url = path 
        ? `/api/logs/files?path=${encodeURIComponent(path)}`
        : `/api/logs/files`;
      const response = await fetch(url);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching log files:', error);
      setFiles([]);
    }
  }, []);

  // Handle path input submission
  const handlePathSubmit = () => {
    if (pathInput.trim()) {
      // Update URL with the new path parameter
      const url = new URL(window.location.href);
      url.searchParams.set('path', pathInput.trim());
      window.history.pushState({}, '', url.toString());
      
      // Fetch log files with the new path
      fetchLogFiles(pathInput.trim());
      
      // Close the modal
      setShowPathInput(false);
    }
  };

  // Initial load of log files
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');
    
    if (!path) {
      // If path is missing, show the input popup
      setShowPathInput(true);
    } else {
      // If path exists, fetch log files
      fetchLogFiles(path);
    }

    // // Set up WebSocket connection for real-time updates
    // const ws = new WebSocket(`ws://${window.location.host}/ws`);
    
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
      
    //   if (data.type === 'FILE_CHANGED' && data.path === selectedFile?.path && selectedFile) {
    //     readLogFile(selectedFile);
    //   } else if (data.type === 'FILES_CHANGED') {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const path = urlParams.get('path');
    //     fetchLogFiles(path || undefined);
    //   }
    // };

    // return () => {
    //   ws.close();
    // };
  }, [fetchLogFiles, readLogFile]); // Include all dependencies

  // Initial load of log files
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const selectedFilePath = urlParams.get('selectedFilePath');
    if (files){
      // Find the file in the fetched files
      const fileToSelect = files.find(file => file.path === selectedFilePath);
      if (fileToSelect) {
        // If the file exists, select it and read its content
        handleFileSelect(fileToSelect);
      }
    }
  }, [files]); // Include all dependencies

  // Handle file selection
  const handleFileSelect = (file: LogFile) => {
    setSelectedFile(file);
    setCurrentPage(1); // Reset to first page when selecting a new file
    readLogFile(file, 1);

    // Update URL with the selected file path
    const url = new URL(window.location.href);
    url.searchParams.set('selectedFilePath', file.path);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={200} theme="light">
          <LogFileList
            files={files}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        </Sider>
        <Content>
          {selectedFile ? (
            <LogViewer 
              entries={logEntries} 
              isLoading={isLoading}
              onPageChange={(page) => {
                setCurrentPage(page);
                if (selectedFile) {
                  readLogFile(selectedFile, page);
                }
              }}
              totalEntries={totalEntries}
              currentPage={currentPage}
            />
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

      {/* Path Input Modal */}
      <Modal
        title="Enter Log Directory Path"
        open={showPathInput}
        onCancel={() => setShowPathInput(false)}
        footer={[
          <Button key="submit" type="primary" onClick={handlePathSubmit}>
            Submit
          </Button>,
        ]}
        closable={false}
        maskClosable={false}
        keyboard={false}
      >
        <p>Please enter the path to your log directory:</p>
        <Input 
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          placeholder="Enter path"
          onPressEnter={handlePathSubmit}
          autoFocus
        />
      </Modal>
    </>
  );
}

export default App;
