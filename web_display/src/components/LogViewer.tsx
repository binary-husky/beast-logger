import React, { useState, useEffect, useRef } from 'react';
import { List, Button, Pagination, Spin, message } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined, CopyOutlined } from '@ant-design/icons';
import { LogEntry } from '../types';
import { sortLogEntries } from '../utils/logParser';

interface LogViewerProps {
  entries: LogEntry[];
  isLoading: boolean;
  onPageChange?: (page: number) => void;
  totalEntries?: number;
  currentPage?: number;
}

const PAGE_SIZE = 15;

const LogViewer: React.FC<LogViewerProps> = ({ 
  entries, 
  isLoading, 
  onPageChange,
  totalEntries,
  currentPage = 1
}) => {
  const [ascending, setAscending] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const logContentRef = useRef<HTMLPreElement>(null);
  
  // Function to copy attach content to clipboard
  const copyAttachToClipboard = () => {
    if (selectedEntry?.attach) {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = selectedEntry.attach;
      
      // Make it invisible but still part of the document
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      
      // Add to document, select text, and execute copy command
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          message.success('Copied to clipboard');
        } else {
          message.error('Failed to copy to clipboard');
        }
      } catch (err) {
        message.error('Failed to copy to clipboard');
      } finally {
        // Clean up
        document.body.removeChild(textarea);
      }
    }
  };

  useEffect(() => {
    if (selectedEntry && logContentRef.current) {
      logContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [selectedEntry]);

  const sortedEntries = sortLogEntries(entries, ascending);

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return '#ff4d4f';
      case 'WARNING':
        return '#faad14';
      case 'SUCCESS':
        return '#52c41a';
      case 'INFO':
        return '#1890ff';
      case 'DEBUG':
        return '#8c8c8c';
      default:
        return '#000000';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ 
        width: '30%',
        minWidth: '200px',
        maxWidth: '80%',
        padding: '15px',
        height: '100%',
        position: 'relative',
        borderRight: '2px solid #e8e8e8',
        resize: 'horizontal',
        overflow: 'auto',
        boxSizing: 'border-box'
      }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <Spin size="large" tip="Reading log file..." />
        </div>
      )}
      {entries.length === 0 && !isLoading ? (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#999',
        }}>
          当前log文件没有任何有效内容
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
          icon={ascending ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
          onClick={() => setAscending(!ascending)}
        >
          {ascending ? 'Oldest First' : 'Newest First'}
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>Log Details</h3>
                <div>
                  <Button onClick={() => setFontSize(prev => Math.max(8, prev - 2))} style={{ marginRight: '8px' }}>A-</Button>
                  <Button onClick={() => setFontSize(prev => Math.min(24, prev + 2))}>A+</Button>
                </div>
              </div>
        <Pagination
          current={currentPage}
          total={totalEntries || entries.length}
          pageSize={PAGE_SIZE}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>
      <List
        dataSource={sortedEntries}
        renderItem={(entry, index) => (
          <List.Item
            key={`${index} - ${entry.timestamp}`}
            onClick={() => setSelectedEntry(entry)}
            style={{
              cursor: 'pointer',
              backgroundColor: selectedEntry === entry ? '#f0f0f0' : 'transparent',
              padding: '5px',
              borderRadius: '4px',
              margin: '4px 0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: entry.color || getLevelColor(entry.level), fontWeight: 'bold' }}>[{entry.level}]</span>
              <span style={{ color: entry.color || getLevelColor(entry.level), fontWeight: 'bold' }}>{entry.header || entry.message}</span>
              <span>-</span>
              <span>{entry.timestamp}</span>
            </div>
          </List.Item>
        )}
      />
        </>
      )}
      </div>
      
      <div style={{ 
        flex: '1',
        minWidth: '200px',
        padding: '5px',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#fafafa'
      }}>
        {selectedEntry ? (
          <div>
            <div style={{ marginBottom: '16px' }}>

              <div style={{ color: selectedEntry.color || getLevelColor(selectedEntry.level), fontWeight: 'bold' }}>
                [{selectedEntry.level}] {selectedEntry.header || selectedEntry.message}
              </div>
              <div style={{ color: '#666', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedEntry.timestamp}</span>
                {selectedEntry.attach && (
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyAttachToClipboard();
                    }}
                  >
                    Copy Attach
                  </Button>
                )}
              </div>
            </div>
            <pre 
              ref={logContentRef}
              style={{ 
              margin: 0,
              whiteSpace: 'pre',
              overflowX: 'auto',
              backgroundColor: '#fff',
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid #f0f0f0',
              fontFamily: 'ChineseFont, ChineseFontBold, "DejaVu Sans Mono", Consolas, monospace',
              textTransform: 'none',
              fontVariantEastAsian: 'none',
              fontKerning: 'none',
              fontFeatureSettings: 'normal',
              fontSize: `${fontSize}px`
            }}>
              {selectedEntry.true_content || selectedEntry.content}
            </pre>
          </div>
        ) : (
          <div style={{ 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}>
            Select a log entry to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
