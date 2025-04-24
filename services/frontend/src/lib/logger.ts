/**
 * Simple logger that only works in development environment
 */

// Check if we're in development mode
const isDev = () => {
  return import.meta.env.DEV === true
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

// Base logger function
const log = (level: LogLevel, ...args: any[]) => {
  if (!isDev()) return

  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}][${level.toUpperCase()}]`

  switch (level) {
    case 'info':
      console.info(prefix, ...args)
      break
    case 'warn':
      console.warn(prefix, ...args)
      break
    case 'error':
      console.error(prefix, ...args)
      break
    case 'debug':
      console.debug(prefix, ...args)
      break
  }
}

// Export specific logging functions
export const logger = {
  info: (...args: any[]) => log('info', ...args),
  warn: (...args: any[]) => log('warn', ...args),
  error: (...args: any[]) => log('error', ...args),
  debug: (...args: any[]) => log('debug', ...args),

  // Group logs for better organization
  group: (name: string) => {
    if (!isDev()) return
    console.group(name)
  },
  groupEnd: () => {
    if (!isDev()) return
    console.groupEnd()
  },

  // Timing functions
  time: (label: string) => {
    if (!isDev()) return
    console.time(label)
  },
  timeEnd: (label: string) => {
    if (!isDev()) return
    console.timeEnd(label)
  },
}

export default logger
