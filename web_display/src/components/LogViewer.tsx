import React, { useState, useEffect, useRef } from 'react';
import { List, Button, Pagination, Spin, message } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { LogEntry } from '../types';
import EntryViewer from './EntryViewer';
import NestedEntryViewer from './NestedEntryViewer';
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

  // Ref for the right log display area
  const logDisplayRef = useRef<HTMLDivElement>(null);

  // Scroll to top/bottom handlers
  const scrollToTop = () => {
    if (logDisplayRef.current) {
      logDisplayRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const scrollToBottom = () => {
    if (logDisplayRef.current) {
      logDisplayRef.current.scrollTo({ top: logDisplayRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 这个div是中间的entry选择列表 */}
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
                <div>
                  <Button onClick={() => setFontSize(prev => Math.max(8, prev - 2))} style={{ marginRight: '8px' }}>A-</Button>
                  <Button onClick={() => setFontSize(prev => Math.min(24, prev + 2))}>A+</Button>
                </div>
              </div>

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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: entry.color || getLevelColor(entry.level), fontWeight: 'bold' }}>[{entry.level}]</span>
                      <span style={{ color: entry.color || getLevelColor(entry.level), fontWeight: 'bold' }}>{entry.header || entry.message}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>

                </List.Item>
              )}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <Pagination
                current={currentPage}
                total={totalEntries || entries.length}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>

      {/* 这个div是Entry的显示器 */}
      <div
        ref={logDisplayRef}
        style={{
          flex: '1',
          minWidth: '200px',
          padding: '5px',
          height: '100%',
          overflowY: 'auto',
          backgroundColor: '#fafafa',
          position: 'relative',
        }}
      >
        {/* Floating go top/bottom buttons */}
        <div style={{
          position: 'fixed',
          right: '40px',
          bottom: '120px',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <button
            onClick={scrollToTop}
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid #ccc',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '22px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            title="Go Top"
          >
            <span style={{ display: 'inline-block', transform: 'translateY(-2px)' }}>▲</span>
          </button>
          <button
            onClick={scrollToBottom}
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid #ccc',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '22px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            title="Go Bottom"
          >
            <span style={{ display: 'inline-block', transform: 'translateY(2px)' }}>▼</span>
          </button>
        </div>
        {selectedEntry ? (
          selectedEntry.nested ? (
            <NestedEntryViewer
              selectedEntry={selectedEntry}
              fontSize={fontSize}
              getLevelColor={getLevelColor}
              copyAttachToClipboard={copyAttachToClipboard}
            />
          ) : (
            <EntryViewer
              selectedEntry={selectedEntry}
              fontSize={fontSize}
              getLevelColor={getLevelColor}
              copyAttachToClipboard={copyAttachToClipboard}
            />
          )
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
