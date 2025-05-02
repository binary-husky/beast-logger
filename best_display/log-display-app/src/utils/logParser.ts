import { LogEntry } from '../types';

export function sortLogEntries(entries: LogEntry[], ascending: boolean = true): LogEntry[] {
  return [...entries].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
}

export function parseLogContent(content: string): LogEntry[] {
  const entries: LogEntry[] = [];
  const lines = content.split('\n');
  const logLevelPattern = /\|\s*(INFO|DEBUG|WARN|ERROR|CRITICAL)\s*\|/;
  
  let currentEntry: Partial<LogEntry> | null = null;
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const logLevelMatch = line.match(logLevelPattern);

    if (logLevelMatch) {
      // If we have a previous entry, save it
      if (currentEntry) {
        const contentStr = currentContent.join('\n');
        let jsonData = null;
        try {
          // Try to parse the content after the first line as JSON
          const contentLines = contentStr.split('\n');
          const jsonContent = contentLines.slice(1).join('\n');
          if (jsonContent.trim()) {
            jsonData = JSON.parse(jsonContent);
          }
        } catch (e) {
          // If JSON parsing fails, continue with null values
        }

        entries.push({
          ...currentEntry,
          content: contentStr,
          color: jsonData?.color ?? null,
          header: jsonData?.header ?? null,
          true_content: jsonData?.true_content ?? null
        } as LogEntry);
      }

      // Start a new entry
      const [timestamp, level, module, lineNum, ...messageParts] = line.split('|').map(part => part.trim());
      currentEntry = {
        timestamp,
        level: level,
        module,
        line: parseInt(lineNum) || 0,
        message: messageParts.join('|').trim(),
        content: line,
        color: null,
        header: null,
        true_content: null
      };
      currentContent = [line];
    } else if (currentEntry && line.trim()) {
      // Add non-empty lines to the current entry's content
      currentContent.push(line);
    }
  }

  // Don't forget to add the last entry
  if (currentEntry) {
    const contentStr = currentContent.join('\n');
    let jsonData = null;
    try {
      // Try to parse the content after the first line as JSON
      const contentLines = contentStr.split('\n');
      const jsonContent = contentLines.slice(1).join('\n');
      if (jsonContent.trim()) {
        jsonData = JSON.parse(jsonContent);
      }
    } catch (e) {
    }

    entries.push({
      ...currentEntry,
      content: contentStr,
      color: jsonData?.color ?? null,
      header: jsonData?.header ?? null,
      true_content: jsonData?.content ?? null
    } as LogEntry);
  }

  return entries;
}
