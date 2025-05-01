export interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  line: number;
  message: string;
  content: string;
}

export interface LogFile {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}
