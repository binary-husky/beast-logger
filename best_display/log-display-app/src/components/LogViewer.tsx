import React, { useState } from 'react';
import { Collapse, Button, Pagination, Spin } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { LogEntry } from '../types';
import { sortLogEntries } from '../utils/logParser';

interface LogViewerProps {
  entries: LogEntry[];
  isLoading: boolean;
}

const PAGE_SIZE = 50;

const LogViewer: React.FC<LogViewerProps> = ({ entries, isLoading }) => {
  const [ascending, setAscending] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedEntries = sortLogEntries(entries, ascending);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentEntries = sortedEntries.slice(startIndex, startIndex + PAGE_SIZE);

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
    <div style={{ padding: '20px', height: '100vh', overflowY: 'auto', position: 'relative' }}>
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
        <Pagination
          current={currentPage}
          total={entries.length}
          pageSize={PAGE_SIZE}
          onChange={setCurrentPage}
          showSizeChanger={false}
        />
      </div>
      <Collapse>
          {currentEntries.map((entry, index) => (
              <Collapse.Panel
                key={`${index} - ${entry.timestamp}`}
                header={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: entry.color || getLevelColor(entry.level), fontWeight: 'bold' }}>[{entry.level}]</span>
                    <span style={{ color: entry.color || getLevelColor(entry.level), fontWeight: 'bold' }}>{entry.header || entry.message}</span>
                    <span>-</span>
                    <span>{entry.timestamp}</span>
                  </div>
                }
              >
                <pre style={{ margin: 0, whiteSpace: 'pre', overflowX: 'auto' }}>
                  {entry.true_content || entry.content}
                </pre>
              </Collapse.Panel>
          ))}
      </Collapse>
        </>
      )}
    </div>
  );
};

export default LogViewer;
