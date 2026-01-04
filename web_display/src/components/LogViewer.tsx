import React, { useState, useEffect, useRef } from 'react';
import { List, Button, Pagination, Spin, message } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { LogEntry } from '../types';
import EntryViewer from './EntryViewer';
import NestedEntryViewer from './NestedEntryViewer';
import { sortLogEntries } from '../utils/logParser';
import { Layout, Modal, Flex, Input, Splitter } from 'antd';

interface LogViewerProps {
  entries: LogEntry[];
  isLoading: boolean;
  onPageChange?: (page: number) => void;
  totalEntries?: number;
  currentPage?: number;
}

const PAGE_SIZE = 15;


interface EntrySelectionProps {
  isLoading: boolean;
  entries: any[];
  sortedEntries: any[];
  ascending: boolean;
  setAscending: (value: boolean) => void;
  selectedEntry: any;
  setSelectedEntry: (entry: any) => void;
  fontSize: number;
  setFontSize: (callback: (prev: number) => number) => void;
  totalEntries: number | undefined;
  currentPage: number | undefined;
  handlePageChange: (page: number) => void;
  getLevelColor: (level: string) => string;
}

const EntrySelection: React.FC<EntrySelectionProps> = ({
  isLoading,
  entries,
  sortedEntries,
  ascending,
  setAscending,
  selectedEntry,
  setSelectedEntry,
  setFontSize,
  totalEntries,
  currentPage,
  handlePageChange,
  getLevelColor
}) => {
  // Reference to measure entry-list-container height
  const entryListContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // Set up ResizeObserver to watch for container size changes
  useEffect(() => {
    if (!entryListContainerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(entryListContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate item height based on container height divided by PAGE_SIZE
  const getItemHeight = () => {
    const calculatedHeight = containerHeight / (PAGE_SIZE + 1);
    return Math.max(calculatedHeight, 50); // Minimum height of 50px
  };


  return (
    <div
      className="entry-selection-container"
      style={{ height: '100vh', backgroundColor: '#fafcff' }}>
      {/* 这个div是中间的entry选择列表 */}

      {isLoading && (
        <div
          className='loading-indicator'
          style={{
            position: 'absolute',
            height: '100vh',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            padding: '20px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
          <Spin size="large" tip="Reading log file..." />
        </div>
      )}

      {(entries.length === 0 && !isLoading) && (
        <div
          className='no-entry-indicator'
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#999',
          }}>
          当前log文件没有任何有效内容
        </div>
      )
      }

      {!(entries.length === 0 && !isLoading) && (
        <div
          className='entry-displayer'
          style={{ height: '100vh', display: 'flex', justifyContent: 'space-between', flexDirection: 'column', padding: '8px' }}
        >
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowY: 'hidden', overflowX: 'auto' }}>
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

          <div
            ref={entryListContainerRef}
            className="entry-list-container"
            style={{
              height: '100%', overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}>

            <List
              dataSource={sortedEntries}
              renderItem={(entry, index) => (
                <List.Item
                  key={`${index} - ${entry.timestamp}`}
                  onClick={() => setSelectedEntry(entry)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedEntry === entry ? '#fff25f4a' : 'transparent',
                    padding: '5px',
                    height: `${getItemHeight()}px`,
                    borderRadius: '4px',
                    overflowY: 'hidden',
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
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', width: '100%', overflowY: 'hidden', overflowX: 'auto', minHeight: '40px' }}>
            <Pagination
              current={currentPage}
              total={totalEntries || entries.length}
              pageSize={PAGE_SIZE}
              onChange={handlePageChange}
              showSizeChanger={false}
              size={'small'}
            />
          </div>
        </div>
      )}
    </div>

  )
}





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
  const [sizes, setSizes] = React.useState<(number | string)[]>(['30%', '70%']);

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

      <Layout style={{ minHeight: '100vh' }}>
        <Flex vertical gap="middle">
          <Splitter
            onResize={setSizes}
            style={{ height: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
          >
            <Splitter.Panel size={sizes[0]}>
              <EntrySelection
                isLoading={isLoading}
                entries={entries}
                sortedEntries={sortedEntries}
                ascending={ascending}
                setAscending={setAscending}
                selectedEntry={selectedEntry}
                setSelectedEntry={setSelectedEntry}
                fontSize={fontSize}
                setFontSize={setFontSize}
                totalEntries={totalEntries}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
                getLevelColor={getLevelColor}
              />
            </Splitter.Panel>
            <Splitter.Panel size={sizes[1]}>



              {/* 这个div是Entry的显示器 */}
              <div
                ref={logDisplayRef}
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '5px',
                  height: '100%',
                  overflowY: 'auto',
                  backgroundColor: '#ffffffff',
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




            </Splitter.Panel>
          </Splitter>
        </Flex>
      </Layout>




    </div>
  );
};

export default LogViewer;
