## how to debug:

- install server

```
npm run compile
```

- 开启 file server （同端口也打开build版的react）

REACT_APP_FPORT=8181 npm run start

- debug （在3000端口单独打开dev版的react，依赖file server）

DANGEROUSLY_DISABLE_HOST_CHECK=true WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true REACT_APP_DEBUG_FILE_SERVER='http://localhost:8181' npm run start:dev

##

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





