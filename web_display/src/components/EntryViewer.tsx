import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { LogEntry } from '../types';

interface EntryViewerProps {
  selectedEntry: LogEntry;
  fontSize: number;
  getLevelColor: (level: string) => string;
  copyAttachToClipboard: () => void;
}


function getAllKeyElements(nestedJson: Record<string, any>): string[] {

  // 使用示例
  // const selectedEntry = {
  //   nested_json: {
  //     "A1.B2.C3": {"col1": "value1", "col2": "value2", "col3": "value3", "content": "ABCABC"},
  //     "A1.B2.C4": {"col1": "value4", "col2": "value5", "col3": "value6", "content": "ABCABC"}
  //   }
  // };

  // const result = getAllKeyElements(selectedEntry.nested_json);
  // console.log(result); // 输出: ["A1", "B2", "C3", "C4"]

  const keyElements: Set<string> = new Set();
  // 遍历所有键
  Object.keys(nestedJson).forEach(key => {
    // 分割键中的各部分
    const parts = key.split('.');
    // 将各部分添加到集合中（自动去重）
    parts.forEach(part => keyElements.add(part));
  });
  // 将 Set 转换为数组并返回
  return Array.from(keyElements);
}

const EntryViewer: React.FC<EntryViewerProps> = ({
  selectedEntry,
  fontSize,
  getLevelColor,
  copyAttachToClipboard
}) => {
  const logContentRef = useRef<HTMLPreElement>(null);
  const {selectors, setSelectors} = useState([]);

  // Initial load of log files
  useEffect(() => {

    const element_array = getAllKeyElements(selectedEntry.nested_json);
    setSelectors(element_array);

  }, []); // Include all dependencies



  selectedEntry.nested_json = {
    "A1.B2.C3": {"col1": "value1", "col2": "value2", "col3": "value3", "content": "ABCABC"},
    "A1.B2.C4": {"col1": "value4", "col2": "value5", "col3": "value6", "content": "ABCABC"}
  }






  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: selectedEntry.color || getLevelColor(selectedEntry.level), fontWeight: 'bold' }}>
          [{selectedEntry.level}] {selectedEntry.header || selectedEntry.message}
        </div>
        {/* header */}
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

      {/* main content */}
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
