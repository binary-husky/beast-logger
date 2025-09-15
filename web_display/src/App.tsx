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
  const [incrementalFiles, setIncrementalFiles] = useState<LogFile[]>([]);

  const PAGE_SIZE = 15;

  // Function to save last open directory and time
  const save_last_open_dir_and_last_open_time = (path: string) => {
    localStorage.setItem('logDirectoryPath', path);
    localStorage.setItem('lastOpenTime', new Date().toISOString());
  };

  // Function to scan for incremental log files
  const scanIncrementalLogFiles = async () => {
    const lastPath = localStorage.getItem('logDirectoryPath');
    const lastOpenTime = localStorage.getItem('lastOpenTime');

    if (!lastPath || !lastOpenTime) {
      return;
    }

    try {
      // Get parent directory path
      const parentPath = lastPath.replace(/\/[^\/]*$/, '');

      const debugFileServer = process.env.REACT_APP_DEBUG_FILE_SERVER;
      const baseUrl = debugFileServer || '';
      const response = await fetch(
        `${baseUrl}/api/logs/files?path=${encodeURIComponent(parentPath)}&after_datatime=${encodeURIComponent(lastOpenTime)}`
      );

      if (response.ok) {
        const incrementalFilesData = await response.json();
        if (Array.isArray(incrementalFilesData) && incrementalFilesData.length > 0) {
          console.log('Found nearby log files:', incrementalFilesData);
          // filter 10 latest modified files
          const sortedFiles = incrementalFilesData
            .filter(file => file.lastModified) // Only include files with lastModified timestamp
            .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()) // Sort by newest first
            .slice(0, 10); // Take only the first 10
          setIncrementalFiles(sortedFiles);
        } else {
          setIncrementalFiles([]);
        }
      }
    } catch (error) {
      console.error('Error scanning incremental log files:', error);
      setIncrementalFiles([]);
    }
  };

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
      const debugFileServer = process.env.REACT_APP_DEBUG_FILE_SERVER;
      const baseUrl = debugFileServer || '';
      const response = await fetch(
        `${baseUrl}/api/logs/content?` +
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
      const debugFileServer = process.env.REACT_APP_DEBUG_FILE_SERVER;
      const baseUrl = debugFileServer || '';
      const url = path
        ? `${baseUrl}/api/logs/files?path=${encodeURIComponent(path)}`
        : `${baseUrl}/api/logs/files`;
      const response = await fetch(url);
      const data = await response.json();
      // check data is array
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected an array of log files');
      }
      setFiles(data);

      // Save path to localStorage
      if (path) {
        save_last_open_dir_and_last_open_time(path);
      }

    } catch (error) {
      console.error('Error fetching log files:', error);
      setFiles([]);
      alert('Error fetching log files. Please check the path and try again.');
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

  }, [fetchLogFiles, readLogFile]); // Include all dependencies

  // Initial load of log files
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const selectedFilePath = urlParams.get('selectedFilePath');
    if (files) {
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
          {/* 这是文件选择栏 */}
          <LogFileList
            files={files}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        </Sider>
        <Content>
          {/* 这是日志展示栏，包括条目选择侧边栏和展示 */}
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
            // 没有选择文件时的空状态
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
          <Button key="scan" onClick={scanIncrementalLogFiles}>
            Scan Incremental
          </Button>,
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
        <div>
          {/* put incremental files here */}
          {incrementalFiles.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Nearby Log Files:
              </p>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '8px'
              }}>
                {incrementalFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '4px 8px',
                      margin: '2px 0',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={() => {
                      // Set path to parent directory of the selected file
                      const parentPath = file.path.replace(/\/[^\/]*$/, '');
                      setPathInput(parentPath);
                      setIncrementalFiles([]);
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{file.name}</div>
                    <div style={{ color: '#666' }}>{file.path}</div>
                    {file.lastModified && (
                      <div style={{ color: '#999', fontSize: '10px' }}>
                        Modified: {new Date(file.lastModified).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default App;
