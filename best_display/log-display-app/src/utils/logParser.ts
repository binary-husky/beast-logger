import { LogEntry } from '../types';

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
        entries.push({
          ...currentEntry,
          content: currentContent.join('\n')
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
        content: line
      };
      currentContent = [line];
    } else if (currentEntry && line.trim()) {
      // Add non-empty lines to the current entry's content
      currentContent.push(line);
    }
  }

  // Don't forget to add the last entry
  if (currentEntry) {
    entries.push({
      ...currentEntry,
      content: currentContent.join('\n')
    } as LogEntry);
  }

  return entries;
}

export function sortLogEntries(entries: LogEntry[], ascending: boolean = true): LogEntry[] {
  return [...entries].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
}
