import React, { useRef } from 'react';
import { Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { LogEntry } from '../types';

interface EntryViewerProps {
  selectedEntry: LogEntry;
  fontSize: number;
  getLevelColor: (level: string) => string;
  copyAttachToClipboard: () => void;
}

const EntryViewer: React.FC<EntryViewerProps> = ({
  selectedEntry,
  fontSize,
  getLevelColor,
  copyAttachToClipboard
}) => {
  const logContentRef = useRef<HTMLPreElement>(null);

  return (
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
  );
};

export default EntryViewer;
