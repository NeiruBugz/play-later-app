# Frontend Logger

A simple logging utility that only works in the development environment. This logger will automatically suppress logs in production builds.

## Usage

```typescript
import logger from './lib/logger'

// Basic logging
logger.info('This is an info message')
logger.warn('This is a warning message')
logger.error('This is an error message')
logger.debug('This is a debug message', { someObject: true })

// Grouping logs
logger.group('Group name')
logger.info('Grouped message 1')
logger.info('Grouped message 2')
logger.groupEnd()

// Performance timing
logger.time('operation')
// ... some code to measure
logger.timeEnd('operation')
```

## Features

- Only logs in development environment (`import.meta.env.DEV === true`)
- Adds timestamps to all logs
- Provides different log levels: info, warn, error, debug
- Supports console groups for better organization
- Includes timing functions for simple performance measurements

## Implementation

The logger checks the `import.meta.env.DEV` variable, which is provided by Vite, to determine whether to log messages. In production builds, all log calls become no-ops.
