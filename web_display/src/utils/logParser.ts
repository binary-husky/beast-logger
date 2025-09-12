import { LogEntry, LogMetadata } from '../types';
import pako from 'pako';

/**
 * Sort log entries by timestamp
 * @param entries Array of log entries to sort
 * @param ascending Sort direction (true for ascending, false for descending)
 * @returns Sorted array of log entries
 */
export function sortLogEntries(entries: LogEntry[], ascending: boolean = true): LogEntry[] {
  return [...entries].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
}



// Function to decompress gzipped base64 content
const decompressContent = (compressedContent: string): string => {
  try {
    // Convert base64 to binary array using browser APIs
    const binaryString = atob(compressedContent);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decompressed = pako.inflate(bytes, { to: 'string' });
    return decompressed;
  } catch (error) {
    console.error('Error decompressing content:', error);
    return '';
  }
};

/**
 * Parse a single log line into its components
 * parse log title such as
 *
 * `2025-05-02 22:47:43.023 | INFO     | __main__:<module>:199 -`
 *
 * @param line Raw log line
 * @returns Parsed log entry or null if invalid format
 */
function parseLogLine(line: string): Partial<LogEntry> | null {
  const logLevelPattern = /\|\s*(INFO|DEBUG|WARN|ERROR|CRITICAL)\s*\|/;
  if (!logLevelPattern.test(line)) return null;
  if (line.trim().startsWith('{')) return null;
  if (line.trim().startsWith('base64:')) return null;

  const [timestamp, level, module, lineNum, ...messageParts] = line.split('|').map(part => part.trim());

  return {
    timestamp,
    level,
    module,
    line: parseInt(lineNum) || 0,
    message: messageParts.join('|').trim(),
    content: line,
    color: null,
    header: null,
    true_content: null
  };
}

/**
 * Parse JSON metadata from log content
 * @param content Log content string
 * @returns Parsed metadata or null values if parsing fails
 */
function parseJsonMetadata(content: string): LogMetadata {
  const defaultMetadata: LogMetadata = { nested: null, nested_json: null, color: null, header: null, true_content: null, attach: null };

  try {
    const contentLines = content.split('\n');
    const jsonContent = contentLines.slice(1).join('\n').trim();
    if (!jsonContent) return defaultMetadata;

    const jsonData = JSON.parse(jsonContent);
    return {
      nested: jsonData?.nested ?? null,
      nested_json: jsonData?.nested_json ?? null,
      color: jsonData?.color ?? null,
      header: jsonData?.header ?? null,
      true_content: jsonData?.content ?? null,
      attach: jsonData?.attach ?? null
    };
  } catch {
    return defaultMetadata;
  }
}

/**
 * Process a complete log entry
 * @param entry Partial log entry
 * @param content Array of content lines
 * @returns Complete log entry
 */
function processLogEntry(entry: Partial<LogEntry>, content: string[]): LogEntry {
  const contentStr = content.join('\n');
  const metadata = parseJsonMetadata(contentStr);

  return {
    ...entry,
    content: contentStr,
    ...metadata
  } as LogEntry;
}

/**
 * Parse raw log content into structured log entries
 * @param content Raw log content string
 * @returns Array of parsed log entries
 */
export function parseLogContent(content: string): LogEntry[] {
  const entries: LogEntry[] = [];
  const lines = content.split('\n');

  let currentEntry: Partial<LogEntry> | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    // parse log header
    const parsedLine = parseLogLine(line);

    // if meet header, it means that previous log entry is finished, and we need to process it
    if (parsedLine) {
      if (currentEntry) {
        // previous log entry is finished, and we need to process it
        // - the first part include timestamp, level, module, line number, and message
        // - the second part is the main content of the log entry
        entries.push(processLogEntry(currentEntry, currentContent));
      }
      currentEntry = parsedLine;
      currentContent = [line];
    } else if (currentEntry && line.trim()) {
      if (line.startsWith('base64:')) {
        var linex = line.replace('base64:', ''); // remove base64 prefix if exists
        linex = decompressContent(linex);
        currentContent.push(linex);
      } else {
        currentContent.push(line);
      }
    }
  }

  if (currentEntry) {
    // previous log entry is finished, and we need to process it
    // - the first part include timestamp, level, module, line number, and message
    // - the second part is the main content of the log entry
    entries.push(processLogEntry(currentEntry, currentContent));
  }

  return entries;
}
