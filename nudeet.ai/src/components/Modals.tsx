// components/Modals.tsx - Updated with credits blocking
"use client"

import { X, Shield, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { UltraSimpleImage } from './UltraSimpleImage'
import { LegalDocuments } from './LegalDocuments'
import { ConsentChecks } from '@/types'
import { useEffect, useCallback, useState, useRef } from 'react'
// ADDED: Import credits blocking functions
import { canPurchaseCredits, getBlockedMessage } from '@/utils/creditsConfig'

interface ModalsProps {
  // Consent Modal
  initialConsentModalOpen: boolean;
  consentChecks: ConsentChecks;
  onConsentCheckChange: (key: keyof ConsentChecks) => void;
  onConsentSubmit: () => void;
  canEnterSite: boolean;
  
  // Legal Modal
  legalModalOpen: boolean;
  onLegalClose: () => void;
  
  // Legal Documents
  termsModalOpen: boolean;
  privacyModalOpen: boolean;
  dmcaModalOpen: boolean;
  onTermsOpen: () => void;
  onPrivacyOpen: () => void;
  onDmcaOpen: () => void;
  onTermsClose: () => void;
  onPrivacyClose: () => void;
  onDmcaClose: () => void;
  
  // Image Viewer
  imageViewerOpen: boolean;
  galleryViewImage: string | null;
  currentGalleryIndex: number;
  generatedHistory: string[];
  generated: string | null;
  onImageViewerClose: () => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  
  // Buy Credits Modal
  buyModalOpen: boolean;
  onBuyCreditsClose: () => void;
  onBuyCredits: (amount: number) => void;
  
  // No Credits Modal
  noCreditsModalOpen: boolean;
  onNoCreditsClose: () => void;
  onFreeTrial: () => void;
  canUseFreeTrial: boolean;
  freeTrialTimeRemaining: { hours: number; minutes: number } | null;
}

export const Modals: React.FC<ModalsProps> = ({
  initialConsentModalOpen,
  consentChecks,
  onConsentCheckChange,
  onConsentSubmit,
  canEnterSite,
  legalModalOpen,
  onLegalClose,
  termsModalOpen,
  privacyModalOpen,
  dmcaModalOpen,
  onTermsOpen,
  onPrivacyOpen,
  onDmcaOpen,
  onTermsClose,
  onPrivacyClose,
  onDmcaClose,
  imageViewerOpen,
  galleryViewImage,
  currentGalleryIndex,
  generatedHistory,
  generated,
  onImageViewerClose,
  onPrevImage,
  onNextImage,
  buyModalOpen,
  onBuyCreditsClose,
  onBuyCredits,
  noCreditsModalOpen,
  onNoCreditsClose,
  onFreeTrial,
  canUseFreeTrial,
  freeTrialTimeRemaining
}) => {
  // Touch gesture state for mobile swiping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // ADDED: State for credits blocked modal
  const [creditsBlockedModalOpen, setCreditsBlockedModalOpen] = useState(false)
  
  const lastWheelTimeRef = useRef<number>(0);

  // Mouse wheel navigation for gallery
  const handleWheelNavigation = useCallback((event: WheelEvent) => {
    if (!imageViewerOpen) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const now = Date.now();
    if (lastWheelTimeRef.current && now - lastWheelTimeRef.current < 300) return;
    lastWheelTimeRef.current = now;
    
    if (event.deltaY > 0) {
      onNextImage();
    } else {
      onPrevImage();
    }
  }, [imageViewerOpen, onNextImage, onPrevImage]);

  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      onNextImage();
    } else if (isRightSwipe) {
      onPrevImage();
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!imageViewerOpen) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        onPrevImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onNextImage();
        break;
      case 'Escape':
        event.preventDefault();
        onImageViewerClose();
        break;
    }
  }, [imageViewerOpen, onPrevImage, onNextImage, onImageViewerClose]);

  // Add event listeners when gallery is open
  useEffect(() => {
    if (imageViewerOpen) {
      document.addEventListener('wheel', handleWheelNavigation, { passive: false });
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('wheel', handleWheelNavigation);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
      };
    }
  }, [imageViewerOpen, handleWheelNavigation, handleKeyDown]);

  // Calculate total images for navigation
  const totalImages = generatedHistory.length + (generated ? 1 : 0);
  const canGoPrev = currentGalleryIndex > 0;
  const canGoNext = currentGalleryIndex < totalImages - 1;

  // UPDATED: Handle buy credits with blocking check
  const handleBuyCreditsWithBlocking = (amount: number) => {
    if (!canPurchaseCredits()) {
      setCreditsBlockedModalOpen(true)
      onBuyCreditsClose() // Close the buy modal
      return
    }
    
    onBuyCredits(amount)
  }

  return (
    <>
      {/* Initial Consent Modal */}
      {initialConsentModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-slate-600">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-blue-400 mr-3" />
              <h2 className="text-3xl font-bold text-slate-200">Important Notice</h2>
            </div>
            <div className="space-y-4 mb-6">
              <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-red-400 flex items-center gap-2">
                  ⚠️ Adult Content Warning
                </h3>
                <p className="text-sm text-slate-300">
                  This website generates adult content using artificial intelligence. All content is for adults only (18+).
                  By proceeding, you acknowledge that you are accessing sexually explicit AI-generated material.
                </p>
              </div>
              <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-blue-400 flex items-center gap-2">
                  🤖 AI-Generated Content
                </h3>
                <p className="text-sm text-slate-300">
                  All images are created by artificial intelligence and do not depict real people.
                  The generated content is entirely fictional and synthetic.
                </p>
              </div>
              <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-green-400 flex items-center gap-2">
                  📸 Consent & Privacy
                </h3>
                <p className="text-sm text-slate-300">
                  All uploads and generations are private and not shared. You must have legal right to use any uploaded images.
                </p>
              </div>
            </div>
            
            {/* Consent Checkboxes */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span 
                  className={`consent-checkbox${consentChecks.terms ? ' checked' : ''} mt-1 flex-shrink-0 cursor-pointer`}
                  onClick={() => onConsentCheckChange('terms')}
                />
                <div className="text-sm cursor-pointer" onClick={() => onConsentCheckChange('terms')}>
                  I accept the{' '}
                  <span 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onTermsOpen();
                    }} 
                    className="underline text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
                  >
                    Terms of Service
                  </span>
                  {' '}and{' '}
                  <span 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onPrivacyOpen();
                    }} 
                    className="underline text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
                  >
                    Privacy Policy
                  </span>
                  {' '}and understand the legal implications of using this service. 
                  I acknowledge that I am using this service at my own discretion and responsibility.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span 
                  className={`consent-checkbox${consentChecks.age ? ' checked' : ''} mt-1 flex-shrink-0 cursor-pointer`}
                  onClick={() => onConsentCheckChange('age')}
                />
                <div className="text-sm cursor-pointer" onClick={() => onConsentCheckChange('age')}>
                  I certify that I am 18 years of age or older and legally permitted to access adult content in my jurisdiction. 
                  I understand that this website contains sexually explicit AI-generated material.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span 
                  className={`consent-checkbox${consentChecks.consent ? ' checked' : ''} mt-1 flex-shrink-0 cursor-pointer`}
                  onClick={() => onConsentCheckChange('consent')}
                />
                <div className="text-sm cursor-pointer" onClick={() => onConsentCheckChange('consent')}>
                  I will not use anyone&apos;s photo without their explicit consent and will not publish, share, or distribute 
                  any generated images without proper authorization. I understand the ethical implications of this technology.
                </div>
              </div>
            </div>
            <button
              onClick={onConsentSubmit}
              disabled={!canEnterSite}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
            >
              Enter Site
            </button>
          </div>
        </div>
      )}
      
      {/* Legal Modal */}
      {legalModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-slate-600 relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={onLegalClose}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Legal Information & Terms</h2>
            <p className="text-sm text-slate-300 mb-6">
              This website is for adults only and provides fictional, AI-generated images. No real people are depicted. All data is private and not shared.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => {
                  onLegalClose();
                  setTimeout(() => onTermsOpen(), 100);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                📋 Terms of Service
              </button>
              <button 
                onClick={() => {
                  onLegalClose();
                  setTimeout(() => onPrivacyOpen(), 100);
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
              >
                🔒 Privacy Policy
              </button>
              <button 
                onClick={() => {
                  onLegalClose();
                  setTimeout(() => onDmcaOpen(), 100);
                }}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
              >
                © DMCA Policy
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Legal Documents Component */}
      <LegalDocuments
        termsModalOpen={termsModalOpen}
        privacyModalOpen={privacyModalOpen}
        dmcaModalOpen={dmcaModalOpen}
        onTermsClose={onTermsClose}
        onPrivacyClose={onPrivacyClose}
        onDmcaClose={onDmcaClose}
      />
      
      {/* No Credits Modal */}
      {noCreditsModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-red-600 relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={onNoCreditsClose}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-red-400">No Credits Remaining</h2>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💎</div>
              <p className="text-slate-300 mb-4">
                You need credits to generate images. Try our free daily preview or purchase credits.
              </p>
            </div>
            
            <div className="space-y-3">
              {canUseFreeTrial ? (
                <button
                  onClick={onFreeTrial}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold text-lg transition-all"
                >
                  🎁 Try Free Daily Preview
                </button>
              ) : (
                <div className="w-full py-3 bg-gray-600 text-gray-300 rounded-xl font-bold text-lg text-center">
                  {freeTrialTimeRemaining ? (
                    <>⏰ Next free preview in {freeTrialTimeRemaining.hours}h {freeTrialTimeRemaining.minutes}m</>
                  ) : (
                    <>⏰ Free preview used today</>
                  )}
                </div>
              )}
              
              {/* UPDATED: Buy credits button with blocking check */}
              <button
                onClick={() => {
                  if (!canPurchaseCredits()) {
                    setCreditsBlockedModalOpen(true)
                    onNoCreditsClose()
                    return
                  }
                  
                  onNoCreditsClose();
                  setTimeout(() => {
                    const buyButton = document.querySelector('[data-buy-credits]') as HTMLButtonElement;
                    buyButton?.click();
                  }, 100);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all"
              >
                💳 Buy Credits
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* UPDATED: Buy Credits Modal with blocking functionality */}
      {buyModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-blue-600 relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={onBuyCreditsClose}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Buy Credits</h2>
            <div className="space-y-4">
              <button
                className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg transition-all"
                onClick={() => handleBuyCreditsWithBlocking(3)}
              >
                <div className="flex justify-between items-center">
                  <span>3 Credits</span>
                  <span className="text-green-400">$3.99</span>
                </div>
              </button>
              
              <button
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg transition-all relative"
                onClick={() => handleBuyCreditsWithBlocking(10)}
              >
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="flex justify-between items-center">
                  <span>10 Credits</span>
                  <span className="text-green-400">$8.99</span>
                </div>
              </button>
              
              <button
                className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-lg transition-all relative"
                onClick={() => handleBuyCreditsWithBlocking(20)}
              >
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  BEST VALUE
                </div>
                <div className="flex justify-between items-center">
                  <span>20 Credits</span>
                  <span className="text-green-400">$14.99</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADDED: Credits Blocked Modal */}
      {creditsBlockedModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-orange-600 relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={() => setCreditsBlockedModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-orange-400">Credit Purchases Unavailable</h2>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-slate-300 mb-4">
                {getBlockedMessage()}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setCreditsBlockedModalOpen(false)}
                className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold text-lg transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer with Navigation */}
      {imageViewerOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            className="absolute top-6 right-6 bg-slate-700/80 hover:bg-slate-900 text-white rounded-full p-3 z-10"
            onClick={onImageViewerClose}
          >
            <X className="w-7 h-7" />
          </button>
          
          {/* Navigation Instructions - FIXED: Hidden on mobile */}
          <div className="absolute top-6 left-6 bg-slate-900/80 text-white px-4 py-2 rounded-lg text-sm z-10 hidden md:block">
            <div className="flex items-center gap-4">
              <span>🖱️ Mouse wheel</span>
              <span>⌨️ Arrow keys</span>
              <span>📱 Swipe</span>
              <span className="text-slate-400">{currentGalleryIndex + 1} / {totalImages}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8 w-full max-w-5xl">
            <button
              onClick={onPrevImage}
              disabled={!canGoPrev}
              className="bg-slate-800/70 hover:bg-slate-800 text-white rounded-full p-4 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
              title="Previous image (←)"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <div className="flex-1 flex items-center justify-center relative group">
              {galleryViewImage && (
                <>
                  <UltraSimpleImage
                    src={galleryViewImage}
                    alt="Gallery view"
                    className="main-generated-image max-h-[85vh] max-w-[90%] rounded-xl shadow-2xl"
                  />
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = galleryViewImage;
                      link.download = `generated-image-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="absolute top-4 right-4 bg-blue-600/80 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Download image"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={onNextImage}
              disabled={!canGoNext}
              className="bg-slate-800/70 hover:bg-slate-800 text-white rounded-full p-4 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
              title="Next image (→)"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {Array.from({ length: totalImages }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentGalleryIndex ? 'bg-blue-400 w-6' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};