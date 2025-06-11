// src/lib/config.ts - Application configuration
interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  ai: {
    maxFileSize: number;
    allowedTypes: string[];
    defaultCredits: number;
  };
  features: {
    ageDetectionEnabled: boolean;
    analyticsEnabled: boolean;
    debugMode: boolean;
  };
}

const config: AppConfig = {
  app: {
    name: 'Deeplab-ai',
    version: '1.0.0',
    description: 'Professional AI Avatar Generator'
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000,
    retries: 3
  },
  ai: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    defaultCredits: 3
  },
  features: {
    ageDetectionEnabled: process.env.AGE_DETECTION_ENABLED === 'true',
    analyticsEnabled: !!process.env.GOOGLE_ANALYTICS_ID,
    debugMode: process.env.NODE_ENV === 'development'
  }
}

export default config