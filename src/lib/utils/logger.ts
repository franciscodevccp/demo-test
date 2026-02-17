/**
 * Logger utility that only logs in development
 * In production, all logs are removed during build
 * 
 * Usage:
 * import { logger } from '@/lib/utils/logger'
 * logger.log('This will only show in development')
 * logger.error('This will only show in development')
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args)
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
  
  // For critical errors that should always log (even in production)
  // Use sparingly for security-sensitive issues
  critical: (...args: unknown[]) => {
    // Always log critical errors
    console.error('[CRITICAL]', ...args)
  },
}
