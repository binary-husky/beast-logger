import React from 'react';
import { List } from 'antd';
import { LogFile } from '../types';

interface LogFileListProps {
  files: LogFile[];
  selectedFile?: LogFile;
  onFileSelect: (file: LogFile) => void;
}

const LogFileList: React.FC<LogFileListProps> = ({ files, selectedFile, onFileSelect }) => {
  return (
    <List
      dataSource={files}
      style={{ height: '100vh', overflowY: 'auto' }}
      renderItem={(file) => (
        <List.Item
          onClick={() => onFileSelect(file)}
          style={{
            cursor: 'pointer',
            backgroundColor: selectedFile?.path === file.path ? '#e6f7ff' : undefined,
            padding: '12px 24px',
          }}
        >
          <List.Item.Meta
            title={file.name}
            description={
              <div>
                <div style={{ color: '#666', marginBottom: '4px' }}>{file.path}</div>
                <div>{new Date(file.lastModified).toLocaleString()}</div>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default LogFileList;
