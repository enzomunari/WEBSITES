// utils/creditsConfig.ts - Easy toggle for blocking credit purchases
export const CREDITS_CONFIG = {
  // 🔧 EASY TOGGLE: Set this to false to block credit purchases
  ALLOW_CREDIT_PURCHASE: false, // Change to true when payment processor is ready
  
  // Custom message when credits are blocked
  BLOCKED_MESSAGE: "Credit purchases are temporarily unavailable. We're working on integrating a secure payment processor. Please check back soon!",
  
  // Alternative message if you want to be more specific
  // BLOCKED_MESSAGE: "We're currently setting up our payment system. Credit purchases will be available within 24-48 hours.",
}

// Helper function to check if credit purchases are allowed
export const canPurchaseCredits = (): boolean => {
  return CREDITS_CONFIG.ALLOW_CREDIT_PURCHASE
}

// Get the blocked message
export const getBlockedMessage = (): string => {
  return CREDITS_CONFIG.BLOCKED_MESSAGE
}