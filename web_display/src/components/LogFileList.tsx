import React from 'react';
import { List, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { LogFile } from '../types';

interface LogFileListProps {
  files: LogFile[];
  selectedFile?: LogFile;
  onFileSelect: (file: LogFile) => void;
  onGoHome?: () => void;
}

const LogFileList: React.FC<LogFileListProps> = ({ files, selectedFile, onFileSelect, onGoHome }) => {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Button
          type="primary"
          icon={<HomeOutlined />}
          onClick={handleGoHome}
          style={{ width: '100%' }}
        >
          Home
        </Button>
      </div>
      <List
        dataSource={files}
        style={{ height: 'calc(100vh - 80px)', overflowY: 'auto' }}
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
    </div>
  );
};

export default LogFileList;
