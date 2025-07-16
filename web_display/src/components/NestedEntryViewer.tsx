import React, { useRef, useState, useEffect } from 'react';
import { Badge, Button, Checkbox, Col, Row, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import type { GetProp } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { LogEntry } from '../types';

interface EntryViewerProps {
  selectedEntry: LogEntry;
  fontSize: number;
  getLevelColor: (level: string) => string;
  copyAttachToClipboard: () => void;
}

interface TableRowData {
  key: number;
  selector: string;
  content?: string;
  col1?: string;
  col2?: string;
  col3?: string;
  [key: string]: string | number | undefined;
}

function getAllKeyElements(nestedJson: object | null): string[] {
  if (!nestedJson) {
    return [];
  }

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

const NestedEntryViewer: React.FC<EntryViewerProps> = ({
  selectedEntry,
  fontSize,
  getLevelColor,
  copyAttachToClipboard
}) => {
  const logContentRef = useRef<HTMLPreElement>(null);
  const [selectors, setSelectors] = useState<string[]>([]);
  const [selectedSelectors, setSelectedSelectors] = useState<string[]>([]);
  const [dataTable, setDataTable] = useState<TableRowData[]>([]);
  const [dataTableDisplay, setDataTableDisplay] = useState<TableRowData[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedRowContent, setSelectedRowContent] = useState<string>('');

  const onSelectorsChange = (checkedValues: string[]) => {
    setSelectedSelectors(checkedValues);
  };

  const onColumnsChange = (checkedValues: string[]) => {
    setSelectedColumns(checkedValues);
  };

  // Initial load of log files and data table generation
  useEffect(() => {
    if (!selectedEntry.nested_json) return;

    const element_array = getAllKeyElements(selectedEntry.nested_json);
    setSelectors(element_array);
    setSelectedSelectors(element_array);

    // Convert nested_json to data table
    const tableData: TableRowData[] = [];

    Object.entries(selectedEntry.nested_json).forEach(([key, value], index) => {
      if (typeof value === 'object' && value !== null) {
        const processedValue = { ...value };
        if (processedValue.content && typeof processedValue.content !== 'string') {
          processedValue.content = JSON.stringify(processedValue.content);
        }
        const rowData = {
          key: index,
          selector: key,
          ...processedValue
        } as TableRowData;
        console.log(rowData);
        tableData.push(rowData);
      }
    });

    // Get available columns from first row
    if (tableData.length > 0) {
      const columns = Object.keys(tableData[0]).filter(key => key !== 'key' && key !== 'selector');
      setAvailableColumns(columns);
      setSelectedColumns(columns);
    }

    setDataTable(tableData);
    setDataTableDisplay(tableData);
  }, [selectedEntry]); // Re-run when selectedEntry changes

  // Filter dataTable based on selectedSelectors
  useEffect(() => {
    const filteredData = dataTable.filter(row => {
      const selectorParts = row.selector.split('.');
      return selectorParts.every(part => selectedSelectors.includes(part));
    });
    setDataTableDisplay(filteredData);
  }, [dataTable, selectedSelectors]); // Re-run when dataTable or selectedSelectors changes

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

      {/* selector checkboxes - control display table rows */}
      <div style={{ marginBottom: '16px' }}>
        <Checkbox.Group
          style={{ width: '100%' }}
          value={selectedSelectors}
          onChange={onSelectorsChange}>
          <Row>
            {selectors.map((selector) => (
              <Col span={8} key={selector}>
                <Checkbox value={selector}>{selector}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </div>

      {/* selector checkboxes - control display table cols */}
      <div style={{ marginBottom: '16px' }}>
        <Checkbox.Group
          style={{ width: '100%' }}
          value={selectedColumns}
          onChange={onColumnsChange}>
          <Row>
            {availableColumns.map((column) => (
              <Col span={8} key={column}>
                <Checkbox value={column}>{column}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </div>


      {/* display table */}
      <div style={{ marginBottom: '16px' }}>
        <Table<TableRowData>
          columns={[
            {
              title: 'Selector',
              dataIndex: 'selector',
              key: 'selector',
              sorter: (a, b) => a.selector.localeCompare(b.selector),
              render: (text, record) => (
                <a onClick={() => setSelectedRowContent(record.content || '')}>
                  {text}
                </a>
              )
            },
            ...(dataTableDisplay.length > 0 && selectedColumns.length > 0
              ? selectedColumns.map(key => ({
                    title: key,
                    dataIndex: key,
                    key: key,
                    sorter: (a: TableRowData, b: TableRowData) =>
                      ((a[key] as string) || '').localeCompare((b[key] as string) || '')
                  }))
              : [])
          ]}
          dataSource={dataTableDisplay}
          size="small"
          scroll={{ x: true }}
          pagination={false}
        />
      </div>

      {/* main content selected*/}
      {selectedRowContent && (() => {
        try {
          const data = JSON.parse(selectedRowContent);
          if (data.text && data.count && data.color &&
              Array.isArray(data.text) && Array.isArray(data.count) && Array.isArray(data.color)) {
            return (
              <p style={{ display: "flex", gap: "4px" }}>
                {data.text.map((text: string, index: number) => (
                  <Badge
                    key={index}
                    count={data.count[index]}
                    text={text}
                    title="tt2"
                    overflowCount={1e99}
                    showZero
                    color={data.color[index]}
                  />
                ))}
              </p>
            );
          }
        } catch (e) {
          // If JSON parsing fails or data structure is invalid, fall back to raw display
        }

        return (
          <pre
            style={{
              margin: '0 0 16px 0',
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #e8e8e8',
              fontFamily: 'monospace',
              fontSize: `${fontSize}px`
            }}>
            {selectedRowContent}
          </pre>
        );
      })()}


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

export default NestedEntryViewer;
