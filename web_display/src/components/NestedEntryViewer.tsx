import React, { useRef, useState, useEffect } from 'react';
import { Badge, Button, Checkbox, Col, Row, Table, Pagination, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import type { GetProp } from 'antd';
import { CopyOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { LogEntry } from '../types';
import SimpleBadge from './SimpleBadge';
import DisplayToggleWrapper from './DisplayToggleWrapper';

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

interface ParagraphBlock {
  currentParagraph: any[]; // 或更具体的类型
  currentText: string[]; // 而不是 never[]
  paragraphCount: number;
}

// Message Component with internal collapse state
interface MessageComponentProps {
  message: ParagraphBlock[];
  msgIndex: number;
  showPureText: boolean;
  showRichText: boolean;
}

const MessageComponent: React.FC<MessageComponentProps> = React.memo(({
  message,
  msgIndex,
  showPureText,
  showRichText
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const paragraphStyle: React.CSSProperties = {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    margin: "0px 0px 10px 0px"
  };

  const smallParagraphStyle: React.CSSProperties = {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    margin: "0px 0px 0px 0px"
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Message Title with Collapse Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={toggleCollapse}
      >
        {isCollapsed ? <RightOutlined /> : <DownOutlined />}
        <span style={{ marginLeft: '8px', fontWeight: 'bold', fontSize: '14px' }}>
          Message {msgIndex + 1}
        </span>
      </div>

      {/* Message Content */}
      {!isCollapsed && (
        <Row gutter={24} style={{ marginBottom: '8px' }}>
          {showPureText &&
            <Col span={showRichText?12:24}>
              <div style={{
                maxHeight: '1500px',
                overflowY: 'auto',
                borderRadius: '4px',
                border: '1px solid #000000ff', padding: '1px', marginBottom: '16px'
              }}>
                {message.map((paragraph_block, paraIndex) => (
                  <p key={`paragraph-${msgIndex}-${paraIndex}`} style={paragraphStyle}>
                    <span style={{ whiteSpace: 'pre-wrap' }}>
                      {paragraph_block.currentText && paragraph_block.currentText.length > 0
                        ? paragraph_block.currentText.join('')
                        : ''}
                    </span>
                  </p>
                ))}
              </div>
            </Col>
          }
          {showRichText &&
            <Col span={showPureText?12:24}>
              <div style={{
                maxHeight: '1500px',
                overflowY: 'auto',
                borderRadius: '4px',
                border: '1px solid #000000ff', padding: '1px', marginBottom: '16px'

              }}>
                {message.map((paragraph_block, paraIndex) => (
                  <p key={`rich-paragraph-${msgIndex}-${paraIndex}`} style={smallParagraphStyle}>
                    {paragraph_block.currentParagraph}
                  </p>
                ))}
              </div>
            </Col>
          }
        </Row>
      )}
    </div>
  );
});

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem('nestedEntryViewer_pageSize');
    return saved ? parseInt(saved, 10) : 700;
  });
  const [showRichText, setShowRichText] = useState(() => {
    const saved = localStorage.getItem('nestedEntryViewer_showRichText');
    return saved ? JSON.parse(saved) : true;
  });
  const [showPureText, setShowPureText] = useState(() => {
    const saved = localStorage.getItem('nestedEntryViewer_showPureText');
    return saved ? JSON.parse(saved) : true;
  });

  // Styles for paragraphs
  const paragraphStyle: React.CSSProperties = {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    margin: "0px 0px 10px 0px"
  };
  const smallParagraphStyle: React.CSSProperties = {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    margin: "0px 0px 0px 0px"
  };

  const fallbackPreStyle: React.CSSProperties = {
    margin: '0 0 16px 0',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #e8e8e8',
    fontFamily: 'monospace',
    fontSize: `${fontSize}px`
  };

  // Create badge element with tooltip
  const createBadgeElement = (text: string, globalIndex: number, data: any) => {
    const tooltipTitle = data.title && Array.isArray(data.title) && data.title[globalIndex]
      ? data.title[globalIndex]
      : text;

    return (
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        {/* <Badge
          count={data.count[globalIndex]}
          text={text}
          title={tooltipTitle}
          overflowCount={1e99}
          showZero
          color={data.color[globalIndex]}
        /> */}

        <SimpleBadge
          text={text}
          count={data.count[globalIndex]}
          color={data.color[globalIndex]}
          title={tooltipTitle}
        />
      </div>
    );
  };


  // Process content and return elements
  const processContent = (data: any, startIndex: number, endIndex: number) => {
    const elements: React.ReactElement[] = [];
    let currentParagraph: React.ReactElement[] = [];
    let currentText: string[] = [];
    let paragraphCount = 0;
    let drag_flag = false;  // 当遇到 <|im_end|> 但后面有 \n 时，转变为 true，延迟paragraph的创建

    let paragraph_block: ParagraphBlock = {
      currentParagraph: [],
      currentText: [],
      paragraphCount: 0,
    };

    let message_block: ParagraphBlock[] = [];
    let all_message: ParagraphBlock[][] = [];

    // token level processing
    data.text.slice(startIndex, endIndex).forEach((text: string, index: number) => {
      const globalIndex = startIndex + index;
      const badge = createBadgeElement(text, globalIndex, data);

      if (drag_flag || text === '<|im_end|>' || text.includes('\n\n')) {

        // if next text is still \n\n or <|im_end|>, wait until next text to create paragraph
        if (text === '<|im_end|>') {
          const nextText = data.text[startIndex + index + 1];
          if (nextText && nextText.includes('\n')) {
            paragraph_block.currentParagraph.push(badge);
            paragraph_block.currentText.push(text);
            drag_flag = true;
            return;
          }
        }

        paragraph_block.currentParagraph.push(badge);
        paragraph_block.currentText.push(text);

        const should_begin_new_message = (text === '<|im_end|>' || drag_flag);
        const should_begin_new_paragraph = true;

        if (should_begin_new_paragraph) {
          message_block.push(paragraph_block);
          paragraph_block = {
            currentParagraph: [],
            currentText: [],
            paragraphCount: 0,
          };
        }

        // 当遇到双换行，im_end，drag_flag时
        if (should_begin_new_message) {
          message_block.push(paragraph_block);
          all_message.push(message_block);
          paragraph_block = {
            currentParagraph: [],
            currentText: [],
            paragraphCount: 0,
          };
          message_block = [];
        }

        if (drag_flag) {
          drag_flag = false;
        }
      } else {
        paragraph_block.currentParagraph.push(badge);
        paragraph_block.currentText.push(text);
      }
    });

    // Handle last paragraph if it exists
    if (paragraph_block.currentParagraph.length > 0) {
      const should_begin_new_message = true;
      if (should_begin_new_message) {
        message_block.push(paragraph_block);
        all_message.push(message_block);
        paragraph_block = {
          currentParagraph: [],
          currentText: [],
          paragraphCount: 0,
        };
        message_block = [];
      }
    }

    // Render all messages and paragraphs
    all_message.forEach((message, msgIndex) => {
      elements.push(
        <MessageComponent
          key={`message-${msgIndex}`}
          message={message}
          msgIndex={msgIndex}
          showPureText={showPureText}
          showRichText={showRichText}
        />
      );
    });

    return elements;
  };


  const onSelectorsChange = (checkedValues: string[]) => {
    setSelectedSelectors(checkedValues);
  };

  const onColumnsChange = (checkedValues: string[]) => {
    setSelectedColumns(checkedValues);
  };

  // Initial load of log files and data table generation
  useEffect(() => {
    if (!selectedEntry.nested_json) return;
    setSelectedRowContent('');
    const element_array = getAllKeyElements(selectedEntry.nested_json);

    // sort element_array alphabetically
    element_array.sort((a, b) => a.localeCompare(b));


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
        // console.log(rowData);
        tableData.push(rowData);
      }
    });

    // Get available columns from first row
    if (tableData.length > 0) {
      const columns = Object.keys(tableData[0]).filter(key => key !== 'key' && key !== 'selector');
      setAvailableColumns(columns);
      // Make 'content' column default not selected
      setSelectedColumns(columns.filter(col => col !== 'content'));
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

  // Save pageSize to localStorage
  useEffect(() => {
    localStorage.setItem('nestedEntryViewer_pageSize', pageSize.toString());
  }, [pageSize]);

  // Save showRichText to localStorage
  useEffect(() => {
    localStorage.setItem('nestedEntryViewer_showRichText', JSON.stringify(showRichText));
  }, [showRichText]);

  // Save showPureText to localStorage
  useEffect(() => {
    localStorage.setItem('nestedEntryViewer_showPureText', JSON.stringify(showPureText));
  }, [showPureText]);

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

      {/* selector checkboxes - side by side layout */}
      <Row gutter={24} style={{ marginBottom: '16px' }}>
        {/* control display table rows */}
        <Col span={15}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>control display table items</div>
          <div style={{ marginBottom: '16px' }}>
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedSelectors}
              onChange={onSelectorsChange}>
              <Row>
                {selectors.map((selector) => (
                  <Col span={12} key={selector}>
                    <Checkbox value={selector}>{selector}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </div>
        </Col>
        <Col span={1}>
          {/* add verticle line line */}
          <div style={{ borderLeft: '1px solid #e8e8e8', height: '100%' }}></div>
        </Col>

        {/* control display table cols */}
        <Col span={8}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>control display table cols</div>
          <div style={{ marginBottom: '16px' }}>
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedColumns}
              onChange={onColumnsChange}>
              <Row>
                {availableColumns.map((column) => (
                  <Col span={12} key={column}>
                    <Checkbox value={column}>{column}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </div>
        </Col>
      </Row>


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
                <a onClick={() => {
                  setSelectedRowContent(record.content || '');
                  setCurrentPage(1);
                }}>
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
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;

            return (
              <div>
                <Pagination
                  current={currentPage}
                  onChange={(page) => setCurrentPage(page)}
                  onShowSizeChange={(current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  total={data.text.length}
                  pageSize={pageSize}
                  showSizeChanger
                  pageSizeOptions={[100, 200, 300, 400, 500, 700, 1000, 1500, 2000, 3000, 5000, 10000, 20000, 50000, 999999999]}
                  style={{ marginTop: '8px' }}
                />

                <div style={{ marginBottom: '16px' }}>
                  <Checkbox
                    checked={showRichText}
                    onChange={e => setShowRichText(e.target.checked)}
                    style={{ marginRight: '16px' }}
                  >
                    Rich Text Display
                  </Checkbox>
                  <Checkbox
                    checked={showPureText}
                    onChange={e => setShowPureText(e.target.checked)}
                  >
                    Pure Text Display
                  </Checkbox>
                </div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", flexDirection: "column", width: "100%" }}>
                  {processContent(data, startIndex, endIndex)}
                </div>
                <Pagination
                  current={currentPage}
                  onChange={(page) => setCurrentPage(page)}
                  onShowSizeChange={(current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  total={data.text.length}
                  pageSize={pageSize}
                  showSizeChanger
                  pageSizeOptions={[100, 200, 300, 400, 500, 700, 1000, 1500, 2000, 3000, 5000, 10000, 20000, 50000, 999999999]}
                  style={{ marginTop: '8px' }}
                />
              </div>
            );
          }
        } catch (e) {
          // If JSON parsing fails or data structure is invalid, fall back to raw display
        }

        return (
          <pre style={fallbackPreStyle}>
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
