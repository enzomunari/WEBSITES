// src/types/index.ts - Professional Avatar Generator Types for Deeplab-ai

// Environment options for professional settings
export type EnvironmentType = 
  | 'office' 
  | 'studio-white' 
  | 'studio-grey' 
  | 'studio-color' 
  | 'black-white' 
  | 'outdoor'

// Professional clothing styles
export type AvatarStyleType = 
  | 'suit' 
  | 'casual' 
  | 'formal'

// User data interface for professional avatar generation
export interface UserData {
  userId: string
  deviceId: string
  credits: number
  lastFreeTrialDate: string | null
  firstVisitDate: string
  lastVisitDate: string
  totalGenerations: number
  totalFreeTrialsUsed: number
  isBlocked?: boolean
}

// Avatar generation request
export interface AvatarGenerationRequest {
  environment: EnvironmentType
  style: AvatarStyleType
  userId: string
  deviceId: string
  image: File
}

// Generation result
export interface GenerationResult {
  success: boolean
  imageUrl?: string
  creditsRemaining?: number
  message?: string
  error?: string
}

// Admin interfaces
export interface AdminStats {
  totalUsers: number
  activeUsers24h: number
  totalGenerations: number
  generationsToday: number
  queueLength: number
  totalCreditsIssued: number
  totalFreeTrials: number
}

export interface GenerationEvent {
  userId: string
  deviceId: string
  environment: string
  style: string
  success: boolean
  error?: string
  timestamp: string
  ipAddress?: string
}

export interface UserEvent {
  userId: string
  deviceId: string
  action: string
  timestamp: string
  metadata?: Record<string, string | number | boolean>
}

// Component props interfaces
export interface EnvironmentOption {
  id: EnvironmentType
  name: string
  icon: string
  description: string
}

export interface StyleOption {
  id: AvatarStyleType
  name: string
  icon: string
  description: string
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AdminApiResponse<T = unknown> extends ApiResponse<T> {
  timestamp?: string
}

// ComfyUI workflow types
export interface ComfyUINode {
  inputs: Record<string, unknown>
  class_type: string
  _meta?: {
    title: string
  }
}

export interface ComfyUIWorkflow {
  [nodeId: string]: ComfyUINode
}

// Queue monitoring types
export interface QueueItem {
  promptId: string
  position: number
  userId: string
  environment: string
  style: string
  timestamp: string
  progress?: number
  estimatedTime?: number
}

export interface QueueData {
  comfyuiStatus: string
  queue: {
    running: QueueItem[]
    pending: QueueItem[]
    recentCompleted: Array<QueueItem & { status: string }>
    totalInQueue: number
  }
  timestamp: string
}