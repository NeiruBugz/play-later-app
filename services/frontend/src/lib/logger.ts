const isDevelopment = import.meta.env.DEV === true

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogFn = (message: string, ...args: unknown[]) => void

const logger = (level: LogLevel, message: string, ...args: unknown[]) => {
  if (!isDevelopment && level === 'debug') {
    return
  }

  switch (level) {
    case 'debug':
      console.debug(`[${level.toUpperCase()}]`, message, ...args)
      break
    case 'info':
      console.info(`[${level.toUpperCase()}]`, message, ...args)
      break
    case 'warn':
      console.warn(`[${level.toUpperCase()}]`, message, ...args)
      break
    case 'error':
      console.error(`[${level.toUpperCase()}]`, message, ...args)
      break
  }
}

const debug: LogFn = (message, ...args) => logger('debug', message, ...args)
const info: LogFn = (message, ...args) => logger('info', message, ...args)
const warn: LogFn = (message, ...args) => logger('warn', message, ...args)
const error: LogFn = (message, ...args) => logger('error', message, ...args)

const group = (name: string): void => {
  if (isDevelopment) {
    console.group(name)
  }
}

const groupEnd = (): void => {
  if (isDevelopment) {
    console.groupEnd()
  }
}

const time = (label: string): void => {
  if (isDevelopment) {
    console.time(label)
  }
}

const timeEnd = (label: string): void => {
  if (isDevelopment) {
    console.timeEnd(label)
  }
}

export default {
  debug,
  info,
  warn,
  error,
  group,
  groupEnd,
  time,
  timeEnd,
}
