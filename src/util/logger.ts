import bunyan from 'bunyan';

type LoggerConfig = {
  PROJECT_NAME: string;
  LOG_LEVEL?: import('bunyan').LogLevel;
  STREAMS?: import('bunyan').Stream[];
};

function logger(config: LoggerConfig): import('bunyan') {
  return bunyan.createLogger({
    name: config.PROJECT_NAME,
    level: config.LOG_LEVEL || 'debug',
    streams: config.STREAMS,
  });
}

export const Logger = logger({
  PROJECT_NAME: 'flowchart-api',
});
