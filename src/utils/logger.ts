type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown>;

type SerializedError = {
  name?: string;
  message?: string;
  stack?: string;
  [key: string]: unknown;
};

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: LogMeta;
  error?: SerializedError;
};

const isProduction = import.meta.env.PROD;

const serializeError = (error: unknown): SerializedError | undefined => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (error && typeof error === 'object') {
    return error as SerializedError;
  }

  if (error !== undefined && error !== null) {
    return { message: String(error) };
  }

  return undefined;
};

const writeEntry = (entry: LogEntry) => {
  const serialized = isProduction ? JSON.stringify(entry) : entry;

  switch (entry.level) {
    case 'debug':
      console.debug(serialized);
      break;
    case 'info':
      console.info(serialized);
      break;
    case 'warn':
      console.warn(serialized);
      break;
    case 'error':
      console.error(serialized);
      break;
    default:
      console.log(serialized);
      break;
  }
};

const baseLog = (level: LogLevel, message: string, meta?: LogMeta, error?: unknown) => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  };

  writeEntry(entry);
};

export const logger = {
  debug(message: string, meta?: LogMeta) {
    if (!isProduction) {
      baseLog('debug', message, meta);
    }
  },
  info(message: string, meta?: LogMeta) {
    baseLog('info', message, meta);
  },
  warn(message: string, meta?: LogMeta) {
    baseLog('warn', message, meta);
  },
  error(message: string, error?: unknown, meta?: LogMeta) {
    baseLog('error', message, meta, error);
  },
};
