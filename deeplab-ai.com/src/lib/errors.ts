// src/lib/errors.ts - Centralized error handling utilities

export enum ErrorCode {
  // Validation errors (400s)
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_FILE = 'INVALID_FILE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication errors (401s)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Authorization errors (403s)
  FORBIDDEN = 'FORBIDDEN',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  
  // Not found errors (404s)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // Server errors (500s)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  COMFYUI_ERROR = 'COMFYUI_ERROR',
  GENERATION_FAILED = 'GENERATION_FAILED',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

export interface AppError {
  code: ErrorCode
  message: string
  userMessage?: string // User-friendly message
  details?: Record<string, unknown>
  statusCode: number
}

/**
 * Creates a standardized error object
 */
export function createError(
  code: ErrorCode, 
  message: string, 
  userMessage?: string, 
  details?: Record<string, unknown>
): AppError {
  const statusCodeMap: Record<ErrorCode, number> = {
    // 400s
    [ErrorCode.INVALID_INPUT]: 400,
    [ErrorCode.INVALID_FILE]: 400,
    [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
    
    // 401s
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.INVALID_CREDENTIALS]: 401,
    
    // 403s
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.ACCOUNT_BLOCKED]: 403,
    [ErrorCode.INSUFFICIENT_CREDITS]: 402, // Payment required
    
    // 404s
    [ErrorCode.USER_NOT_FOUND]: 404,
    [ErrorCode.RESOURCE_NOT_FOUND]: 404,
    
    // 500s
    [ErrorCode.INTERNAL_ERROR]: 500,
    [ErrorCode.COMFYUI_ERROR]: 503, // Service unavailable
    [ErrorCode.GENERATION_FAILED]: 500,
    [ErrorCode.FILE_UPLOAD_FAILED]: 500,
    [ErrorCode.DATABASE_ERROR]: 500
  }

  return {
    code,
    message,
    userMessage: userMessage || getUserFriendlyMessage(code),
    details,
    statusCode: statusCodeMap[code] || 500
  }
}

/**
 * Gets user-friendly error messages
 */
function getUserFriendlyMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.INVALID_INPUT]: 'Please check your input and try again.',
    [ErrorCode.INVALID_FILE]: 'Please upload a valid image file (JPEG, PNG, or WebP).',
    [ErrorCode.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
    
    [ErrorCode.UNAUTHORIZED]: 'Please log in to continue.',
    [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials. Please try again.',
    
    [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
    [ErrorCode.ACCOUNT_BLOCKED]: 'Your account has been temporarily blocked. Please contact support.',
    [ErrorCode.INSUFFICIENT_CREDITS]: 'You do not have enough credits. Please purchase more credits to continue.',
    
    [ErrorCode.USER_NOT_FOUND]: 'User not found. Please try again.',
    [ErrorCode.RESOURCE_NOT_FOUND]: 'The requested resource was not found.',
    
    [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later.',
    [ErrorCode.COMFYUI_ERROR]: 'AI service is temporarily unavailable. Please try again in a few minutes.',
    [ErrorCode.GENERATION_FAILED]: 'Image generation failed. Please try again with a different photo.',
    [ErrorCode.FILE_UPLOAD_FAILED]: 'File upload failed. Please try again.',
    [ErrorCode.DATABASE_ERROR]: 'Database error. Please try again later.'
  }

  return messages[code] || 'An unexpected error occurred.'
}

/**
 * Parses ComfyUI errors and returns appropriate error codes
 */
export function parseComfyUIError(error: Error | Record<string, unknown> | string): AppError {
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
    ? error 
    : error?.message?.toString() || 'Unknown ComfyUI error'
  
  if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
    return createError(
      ErrorCode.COMFYUI_ERROR,
      'ComfyUI request timeout',
      'AI service is taking longer than expected. Please try again.'
    )
  }
  
  if (errorMessage.includes('connection') || errorMessage.includes('offline') || errorMessage.includes('ECONNREFUSED')) {
    return createError(
      ErrorCode.COMFYUI_ERROR,
      'Cannot connect to ComfyUI',
      'AI service is temporarily unavailable. Please try again in a few minutes.'
    )
  }
  
  if (errorMessage.includes('workflow') || errorMessage.includes('node')) {
    return createError(
      ErrorCode.GENERATION_FAILED,
      'ComfyUI workflow error',
      'AI configuration error. Please contact support if this continues.'
    )
  }
  
  if (errorMessage.includes('upload') || errorMessage.includes('image')) {
    return createError(
      ErrorCode.FILE_UPLOAD_FAILED,
      'Image upload to ComfyUI failed',
      'Failed to process your image. Please try with a different image.'
    )
  }
  
  return createError(
    ErrorCode.GENERATION_FAILED,
    `ComfyUI error: ${errorMessage}`,
    'Image generation failed. Please try again.'
  )
}

/**
 * Logs errors appropriately based on environment
 */
export function logError(error: AppError | Error, context?: string): void {
  const isDev = process.env.NODE_ENV === 'development'
  const timestamp = new Date().toISOString()
  
  if (isDev) {
    console.group(`🚨 Error ${context ? `in ${context}` : ''} - ${timestamp}`)
    console.error('Error details:', error)
    if ('stack' in error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
    console.groupEnd()
  } else {
    // In production, log less verbose errors
    console.error(`[${timestamp}] ${context || 'Error'}:`, {
      message: error.message,
      code: 'code' in error ? error.code : 'UNKNOWN',
      ...(context && { context })
    })
  }
}

/**
 * Wraps async functions with error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), context)
      throw error
    }
  }
}

/**
 * Creates API error responses
 */
export function createApiErrorResponse(error: AppError) {
  return {
    success: false,
    error: error.userMessage || error.message,
    code: error.code,
    ...(process.env.NODE_ENV === 'development' && {
      details: error.details,
      internalMessage: error.message
    })
  }
}

/**
 * Validates and throws appropriate errors for common scenarios
 */
export const validators = {
  requireAuth: (isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required')
    }
  },

  requireCredits: (credits: number, required: number = 1) => {
    if (credits < required) {
      throw createError(ErrorCode.INSUFFICIENT_CREDITS, `Insufficient credits: ${credits} < ${required}`)
    }
  },

  requireNotBlocked: (isBlocked: boolean) => {
    if (isBlocked) {
      throw createError(ErrorCode.ACCOUNT_BLOCKED, 'Account is blocked')
    }
  },

  requireValidFile: (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      throw createError(ErrorCode.INVALID_FILE, `Invalid file type: ${file.type}`)
    }
    
    if (file.size > maxSize) {
      throw createError(ErrorCode.INVALID_FILE, `File too large: ${file.size} > ${maxSize}`)
    }
  },

  requireValidInput: (value: unknown, fieldName: string) => {
    if (value === undefined || value === null || value === '') {
      throw createError(ErrorCode.MISSING_REQUIRED_FIELD, `Missing required field: ${fieldName}`)
    }
  }
}

const errorHandler = {
  ErrorCode,
  createError,
  parseComfyUIError,
  logError,
  withErrorHandling,
  createApiErrorResponse,
  validators
}

export default errorHandler