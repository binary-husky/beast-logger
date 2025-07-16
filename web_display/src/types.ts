export interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  line: number;
  message: string;
  content: string;
  color?: string | null;
  header?: string | null;
  true_content?: string | null;
  attach?: string | null;
  nested: string | null;
  nested_json: object | null;
}

export type LogMetadata = {
  nested: string | null;
  nested_json: string | null;
  color: string | null;
  header: string | null;
  true_content: string | null;
  attach?: string | null;
};

export interface LogFile {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}
