// src/lib/validation.ts - Centralized validation utilities
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates an image file for size and type
 */
export function validateImageFile(file: File): ValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a JPEG, PNG, or WebP image file.'
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024))
    return {
      isValid: false,
      error: `Image must be smaller than ${maxSizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`
    }
  }

  // Check minimum file size (avoid corrupted files)
  if (file.size < 1024) {
    return {
      isValid: false,
      error: 'Image file appears to be corrupted or too small.'
    }
  }

  return { isValid: true }
}

/**
 * Validates environment parameter
 */
export function validateEnvironment(environment: string): ValidationResult {
  const validEnvironments = ['office', 'studio-white', 'studio-grey', 'studio-color', 'black-white', 'outdoor']
  
  if (!validEnvironments.includes(environment)) {
    return {
      isValid: false,
      error: 'Invalid environment selection.'
    }
  }

  return { isValid: true }
}

/**
 * Validates style parameter
 */
export function validateStyle(style: string): ValidationResult {
  const validStyles = ['suit', 'casual', 'formal']
  
  if (!validStyles.includes(style)) {
    return {
      isValid: false,
      error: 'Invalid style selection.'
    }
  }

  return { isValid: true }
}

/**
 * Validates user ID format
 */
export function validateUserId(userId: string): ValidationResult {
  if (!userId || typeof userId !== 'string') {
    return {
      isValid: false,
      error: 'Invalid user ID.'
    }
  }

  if (userId.length < 10) {
    return {
      isValid: false,
      error: 'User ID too short.'
    }
  }

  return { isValid: true }
}

/**
 * Validates device ID format
 */
export function validateDeviceId(deviceId: string): ValidationResult {
  if (!deviceId || typeof deviceId !== 'string') {
    return {
      isValid: false,
      error: 'Invalid device ID.'
    }
  }

  if (deviceId.length < 10) {
    return {
      isValid: false,
      error: 'Device ID too short.'
    }
  }

  return { isValid: true }
}

/**
 * Validates credit amount for admin operations
 */
export function validateCreditAmount(amount: number): ValidationResult {
  if (!Number.isInteger(amount) || amount <= 0) {
    return {
      isValid: false,
      error: 'Credit amount must be a positive integer.'
    }
  }

  if (amount > 1000) {
    return {
      isValid: false,
      error: 'Cannot add more than 1000 credits at once.'
    }
  }

  return { isValid: true }
}

/**
 * Validates admin password strength
 */
export function validateAdminPassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Admin password must be at least 8 characters long.'
    }
  }

  return { isValid: true }
}

/**
 * Sanitizes filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

/**
 * Validates environment variables at startup
 */
export function validateEnvironmentVariables(): ValidationResult {
  const required = ['ADMIN_PASSWORD', 'COMFY_URL']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    return {
      isValid: false,
      error: `Missing required environment variables: ${missing.join(', ')}`
    }
  }

  // Validate COMFY_URL format
  const comfyUrl = process.env.COMFY_URL
  if (comfyUrl && !comfyUrl.startsWith('http')) {
    return {
      isValid: false,
      error: 'COMFY_URL must start with http:// or https://'
    }
  }

  return { isValid: true }
}