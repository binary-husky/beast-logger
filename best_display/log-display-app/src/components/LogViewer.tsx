import React, { useState } from 'react';
import { Collapse, Button, Pagination } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { LogEntry } from '../types';
import { sortLogEntries } from '../utils/logParser';

interface LogViewerProps {
  entries: LogEntry[];
}

const PAGE_SIZE = 50;

const LogViewer: React.FC<LogViewerProps> = ({ entries }) => {
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
    <div style={{ padding: '20px', height: '100vh', overflowY: 'auto' }}>
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
                key={`${entry.timestamp}-${index}`}
                header={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: getLevelColor(entry.level) }}>[{entry.level}]</span>
                    <span>{entry.timestamp}</span>
                    <span>-</span>
                    <span>{entry.message}</span>
                  </div>
                }
              >
                <pre style={{ margin: 0, whiteSpace: 'pre', overflowX: 'auto' }}>
                  {entry.content}
                </pre>
              </Collapse.Panel>
          ))}
      </Collapse>
    </div>
  );
};

export default LogViewer;
