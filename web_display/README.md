

readLogFile

>>>>

const response = await fetch(
`/api/logs/content?` +
`path=${encodeURIComponent(file.path)}&` +
`page=${page}&` +
`num_entity_each_page=${PAGE_SIZE}`
);

>>>>

const entries = parseLogContent(decompressedContent);

>>>>

processLogEntry (convert to LogEntry)

>>>>





