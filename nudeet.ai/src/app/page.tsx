// app/page.tsx - Complete version with admin dashboard integration - FIXED
"use client"

import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { ImageUploadPanel } from '@/components/ImageUploadPanel'
import { GenerateButton } from '@/components/GenerateButton'
import { ResultPanel } from '@/components/ResultPanel'
import { Modals } from '@/components/Modals'
import { AdvancedOptions, ConsentChecks } from '@/types'
// ADD this import
import { refreshUserData } from '@/utils/unifiedUserStorage'
import { 
  loadUserData, 
  addCredits, 
  markFreeTrialUsed, 
  canUseFreeTrialToday,
  getTimeUntilNextFreeTrial
} from '@/utils/userStorage'
import { canPurchaseCredits, getBlockedMessage } from '@/utils/creditsConfig'
// ADDED: Import data tracking functions
import { trackUserData, trackGeneration, trackUserEvent } from '@/utils/dataTracker'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function Home() {
  // --- STATE ---
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [generated, setGenerated] = useState<string | null>(null)
  const [generatedKey, setGeneratedKey] = useState<number>(Date.now())
  const [credits, setCredits] = useState<number>(0)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [legalModalOpen, setLegalModalOpen] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [dmcaModalOpen, setDmcaModalOpen] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [initialConsentModalOpen, setInitialConsentModalOpen] = useState(true)
  const [noCreditsModalOpen, setNoCreditsModalOpen] = useState(false)
  const [canUseFreeTrial, setCanUseFreeTrial] = useState(true)
  const [freeTrialTimeRemaining, setFreeTrialTimeRemaining] = useState<{hours: number; minutes: number} | null>(null)
  const [uploadWarningModalOpen, setUploadWarningModalOpen] = useState(false)
  const [hasUploadedFirstImage, setHasUploadedFirstImage] = useState(false)
  const [uploadKey, setUploadKey] = useState(0)
  const [creditsBlockedModalOpen, setCreditsBlockedModalOpen] = useState(false)
  const [consentChecks, setConsentChecks] = useState<ConsentChecks>({
    terms: false,
    age: false,
    consent: false
  })
  const [galleryViewImage, setGalleryViewImage] = useState<string | null>(null)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState<number>(0)
  const [generatedHistory, setGeneratedHistory] = useState<string[]>([])
  const [generatedImageError, setGeneratedImageError] = useState(false)

  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    gender: 'female',
    age: 25,
    bodyType: 50,
    breastSize: 50,
    pose: 'standing-front',
    skinTone: 50,
    wetness: 0
  })

  // NEW: Force refresh credits from server
  const refreshCredits = useCallback(async () => {
    try {
      console.log('🔄 Refreshing credits from server...')
      
      // Use the refreshUserData function from unifiedUserStorage
      const userData = await refreshUserData()
      
      console.log('✅ Refreshed user data:', userData.userId, 'Credits:', userData.credits)
      setCredits(userData.credits)
      
      // Update other relevant state
      setCanUseFreeTrial(canUseFreeTrialToday(userData))
      
      // Update free trial time remaining
      const timeRemaining = getTimeUntilNextFreeTrial(userData)
      if (timeRemaining !== "Available now") {
        try {
          const [hours, minutes] = timeRemaining.split('h ').map(part => parseInt(part.replace('m', '')))
          setFreeTrialTimeRemaining({ hours: hours || 0, minutes: minutes || 0 })
        } catch {
          setFreeTrialTimeRemaining(null)
        }
      } else {
        setFreeTrialTimeRemaining(null)
      }
      
      return userData
    } catch (error) {
      console.error('❌ Error refreshing credits:', error)
      return null
    }
  }, [])

  // ADDED: Track user data on page load and activities
  useEffect(() => {
    const initializeUserTracking = async () => {
      // MODIFIED: Use refreshCredits instead of loadUserData
      const userData = await refreshCredits();
      
      if (userData) {
        console.log('👤 User loaded with server sync:', {
          userId: userData.userId,
          deviceId: userData.deviceId,
          credits: userData.credits,
          totalGenerations: userData.totalGenerations,
          domain: typeof window !== 'undefined' ? window.location.hostname : 'server',
          canPurchaseCredits: canPurchaseCredits()
        });

        // ADDED: Track user data centrally
        try {
          await trackUserData({
            userId: userData.userId,
            deviceId: userData.deviceId,
            credits: userData.credits,
            lastFreeTrialDate: userData.lastFreeTrialDate,
            firstVisitDate: userData.firstVisitDate,
            lastVisitDate: userData.lastVisitDate,
            totalGenerations: userData.totalGenerations,
            totalFreeTrialsUsed: userData.totalFreeTrialsUsed
          });
          console.log('📊 User data tracked centrally');
        } catch (error) {
          console.error('❌ Failed to track user data:', error);
        }

        // ADDED: Track page load event
        try {
          await trackUserEvent('page_load', {
            domain: window.location.hostname,
            userAgent: navigator.userAgent.split(' ').pop() || 'unknown'
          });
          console.log('📊 Page load tracked');
        } catch (error) {
          console.error('❌ Failed to track page load:', error);
        }
      }
    };

    initializeUserTracking();
  }, [refreshCredits])

  // NEW: Refresh credits every 10 seconds when on page
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshCredits()
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [refreshCredits])

  // NEW: Refresh credits when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshCredits()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshCredits])

  // ENHANCED: Listen for credit updates from admin
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'credits_updated') {
        console.log('🔔 Credits updated by admin, refreshing...')
        refreshCredits()
      }
    }

    // Listen for storage events (cross-tab communication)
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for direct localStorage changes in same tab
    const checkForUpdates = () => {
      const lastUpdate = localStorage.getItem('credits_updated')
      if (lastUpdate && Date.now() - parseInt(lastUpdate) < 5000) {
        refreshCredits()
      }
    }
    
    const updateInterval = setInterval(checkForUpdates, 1000) // Check every second

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(updateInterval)
    }
  }, [refreshCredits])

  // --- HANDLERS ---
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (JPG, PNG, or WebP)'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }, [])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('📁 File upload event triggered:', file?.name || 'No file')
    
    if (!file) {
      console.log('❌ No file selected')
      return
    }
    
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      console.log('❌ File validation failed:', validationError)
      return
    }
    
    if (preview) {
      URL.revokeObjectURL(preview)
      console.log('🗑️ Revoked previous preview URL')
    }
    
    setError(null)
    setImage(file)
    const newPreviewUrl = URL.createObjectURL(file)
    setPreview(newPreviewUrl)
    setHasUploadedFirstImage(true)
    
    console.log('✅ New face uploaded successfully:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // ADDED: Track image upload event
    try {
      await trackUserEvent('image_upload', {
        fileSize: file.size,
        fileType: file.type
      });
      console.log('📊 Image upload tracked');
    } catch (error) {
      console.error('❌ Failed to track image upload:', error);
    }
  }, [validateFile, preview])

  const handleUploadBoxClick = useCallback(() => {
    if (!hasUploadedFirstImage) {
      console.log('🚨 First upload - showing warning modal')
      setUploadWarningModalOpen(true)
    } else {
      console.log('📁 Subsequent upload - direct file picker')
      const fileInput = document.getElementById(`upload-input-main`) as HTMLInputElement
      if (fileInput) {
        fileInput.click()
      }
    }
  }, [hasUploadedFirstImage])

  const handleUploadWarningConfirm = useCallback(() => {
    console.log('✅ Warning confirmed - permanently closing modal and opening file picker')
    
    setHasUploadedFirstImage(true)
    setUploadWarningModalOpen(false)
    setUploadKey(prev => prev + 1)
    
    setTimeout(() => {
      const fileInput = document.getElementById(`upload-input-main`) as HTMLInputElement
      if (fileInput) {
        console.log('📁 Triggering file input after warning acceptance')
        fileInput.click()
      } else {
        console.error('❌ No file input found')
      }
    }, 100)
  }, [])

  const handleUploadWarningCancel = useCallback(() => {
    console.log('❌ Upload warning cancelled')
    setUploadWarningModalOpen(false)
  }, [])

  const handleAdvancedOptionsChange = useCallback((newOptions: AdvancedOptions) => {
    setAdvancedOptions(newOptions);
  }, [])

  const deleteFromHistory = useCallback((indexToDelete: number) => {
    setGeneratedHistory(prev => {
      const newHistory = prev.filter((_, index) => index !== indexToDelete);
      console.log(`🗑️ Deleted image at index ${indexToDelete}. New history count:`, newHistory.length);
      return newHistory;
    });
    
    if (imageViewerOpen && currentGalleryIndex === indexToDelete) {
      setImageViewerOpen(false);
      setGalleryViewImage(null);
    }
    else if (imageViewerOpen && currentGalleryIndex > indexToDelete) {
      setCurrentGalleryIndex(prev => prev - 1);
    }
  }, [imageViewerOpen, currentGalleryIndex]);

  const simulateProgress = useCallback(() => {
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        
        let increment
        const random = Math.random()
        
        if (prev < 20) {
          increment = random * 10 + 5
        } else if (prev < 50) {
          increment = random * 5 + 3
        } else if (prev < 80) {
          increment = random * 3 + 1
        } else if (prev < 90) {
          increment = random * 1.5 + 0.5
        } else {
          increment = random * 0.7 + 0.1
        }
        
        return Math.min(prev + increment, 95)
      })
    }, 800)
    
    return interval
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!image) {
      setError('Please upload an image first')
      return
    }
    if (credits <= 0) {
      setNoCreditsModalOpen(true)
      return
    }

    const currentImage = generated;
    if (currentImage) {
      setGeneratedHistory(prev => [currentImage, ...prev]);
    }

    setIsLoading(true)
    setError(null)
    setGeneratedKey(Date.now())
    setGenerated(null)
    const progressInterval = simulateProgress()
    
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('options', JSON.stringify(advancedOptions))
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(600000)
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newImageUrl = json.imageUrl
      if (!newImageUrl) throw new Error('No image URL received from server')
      
      setGenerated(newImageUrl)
      setCredits(prev => prev - 1);
      setProgress(100)
      setTimeout(() => setProgress(0), 1000)

      // NEW: Refresh credits after successful generation
      await refreshCredits()

      // ADDED: Track successful generation
      try {
        const userData = await loadUserData();
        await trackGeneration({
          userId: userData.userId,
          deviceId: userData.deviceId,
          pose: advancedOptions.pose,
          gender: advancedOptions.gender,
          success: true,
          timestamp: new Date().toISOString()
        });
        console.log('📊 Successful generation tracked');
      } catch (error) {
        console.error('❌ Failed to track generation:', error);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage)
      addCredits(1);
      setCredits(prev => prev + 1);
      
      if (currentImage) {
        setGenerated(currentImage)
        setGeneratedHistory(prev => prev.slice(1))
      }

      // ADDED: Track failed generation
      try {
        const userData = await loadUserData();
        await trackGeneration({
          userId: userData.userId,
          deviceId: userData.deviceId,
          pose: advancedOptions.pose,
          gender: advancedOptions.gender,
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
        console.log('📊 Failed generation tracked');
      } catch (error) {
        console.error('❌ Failed to track generation error:', error);
      }
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
    }
  }, [image, credits, advancedOptions, generated, simulateProgress, refreshCredits])

  const handleFreeTrial = async () => {
    if (!image) {
      setError('Please upload an image first')
      setNoCreditsModalOpen(false)
      return
    }
    
    const userData = await loadUserData()
    
    if (!canUseFreeTrialToday(userData)) {
      const timeRemaining = getTimeUntilNextFreeTrial(userData)
      if (timeRemaining) {
        setError(`Free trial available in ${timeRemaining.hours}h ${timeRemaining.minutes}m`)
      } else {
        setError('Free trial not available right now')
      }
      setNoCreditsModalOpen(false)
      return
    }
    
    setNoCreditsModalOpen(false)
    markFreeTrialUsed()
    setCanUseFreeTrial(false)
    setFreeTrialTimeRemaining({ hours: 23, minutes: 59 })

    // NEW: Refresh credits after free trial use
    await refreshCredits()

    // ADDED: Track free trial usage
    try {
      await trackUserEvent('free_trial_used', {
        pose: advancedOptions.pose,
        gender: advancedOptions.gender
      });
      console.log('📊 Free trial usage tracked');
    } catch (error) {
      console.error('❌ Failed to track free trial:', error);
    }
    
    const currentImage = generated;
    if (currentImage) {
      setGeneratedHistory(prev => [currentImage, ...prev]);
    }
    
    setIsLoading(true)
    setError(null)
    setGeneratedKey(Date.now())
    setGenerated(null)
    const progressInterval = simulateProgress()
    
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('options', JSON.stringify({ ...advancedOptions, censored: true }))
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(600000)
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newImageUrl = json.imageUrl
      if (!newImageUrl) throw new Error('No image URL received from server')
      
      setGenerated(newImageUrl)
      setProgress(100)
      setTimeout(() => setProgress(0), 1000)

      // ADDED: Track successful free trial generation
      try {
        const userData = await loadUserData();
        await trackGeneration({
          userId: userData.userId,
          deviceId: userData.deviceId,
          pose: advancedOptions.pose,
          gender: advancedOptions.gender,
          success: true,
          timestamp: new Date().toISOString()
        });
        console.log('📊 Successful free trial generation tracked');
      } catch (error) {
        console.error('❌ Failed to track free trial generation:', error);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage)
      if (currentImage) {
        setGenerated(currentImage)
        setGeneratedHistory(prev => prev.slice(1))
      }

      // ADDED: Track failed free trial generation
      try {
        const userData = await loadUserData();
        await trackGeneration({
          userId: userData.userId,
          deviceId: userData.deviceId,
          pose: advancedOptions.pose,
          gender: advancedOptions.gender,
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
        console.log('📊 Failed free trial generation tracked');
      } catch (error) {
        console.error('❌ Failed to track free trial generation error:', error);
      }
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
    }
  }

  const downloadImage = async (imageUrl: string = generated || '') => {
    if (!imageUrl) return
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-image-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // ADDED: Track image download
      try {
        await trackUserEvent('image_download', {
          imageType: 'generated'
        });
        console.log('📊 Image download tracked');
      } catch (error) {
        console.error('❌ Failed to track download:', error);
      }
    } catch {
      setError('Failed to download image');
    }
  }

  const clearImage = () => {
    setImage(null)
    setError(null)
    
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
  }

  const handleGalleryImageClick = (imageSrc: string, index: number) => {
    setGalleryViewImage(imageSrc);
    setCurrentGalleryIndex(index);
    setImageViewerOpen(true);
  }

  const showNextGalleryImage = useCallback(() => {
    if (currentGalleryIndex < generatedHistory.length - 1) {
      const nextIndex = currentGalleryIndex + 1;
      setCurrentGalleryIndex(nextIndex);
      setGalleryViewImage(generatedHistory[nextIndex]);
    } else if (generated && currentGalleryIndex === generatedHistory.length - 1) {
      setCurrentGalleryIndex(generatedHistory.length);
      setGalleryViewImage(generated);
    }
  }, [currentGalleryIndex, generatedHistory, generated]);

  const showPrevGalleryImage = useCallback(() => {
    if (currentGalleryIndex > 0) {
      const prevIndex = currentGalleryIndex - 1;
      setCurrentGalleryIndex(prevIndex);
      setGalleryViewImage(generatedHistory[prevIndex]);
    }
  }, [currentGalleryIndex, generatedHistory]);

  const canEnterSite = () => consentChecks.terms && consentChecks.age && consentChecks.consent

  const handleConsentSubmit = async () => {
    if (canEnterSite()) {
      setInitialConsentModalOpen(false);

      // ADDED: Track consent acceptance
      try {
        await trackUserEvent('consent_accepted', {
          terms: consentChecks.terms,
          age: consentChecks.age,
          consent: consentChecks.consent
        });
        console.log('📊 Consent acceptance tracked');
      } catch (error) {
        console.error('❌ Failed to track consent:', error);
      }
    }
  }

  const handleConsentCheckChange = (key: keyof ConsentChecks) => {
    setConsentChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Buy credits handler with blocking check
  const handleBuyCredits = async (amount: number) => {
    console.log('🔍 === handleBuyCredits called ===')
    console.log('🔍 Amount:', amount)
    console.log('🔍 canPurchaseCredits():', canPurchaseCredits())
    
    if (!canPurchaseCredits()) {
      console.log('🚫 Credits blocked in handleBuyCredits - showing blocked modal')
      setCreditsBlockedModalOpen(true)
      setBuyModalOpen(false)
      return
    }
    
    console.log('✅ Processing credit purchase for amount:', amount)
    addCredits(amount);
    setCredits(prev => prev + amount);
    setBuyModalOpen(false);
    setError(null);

    // NEW: Refresh credits after purchase
    await refreshCredits()

    // ADDED: Track credit purchase
    try {
      await trackUserEvent('credit_purchase', {
        amount: amount,
        cost: amount === 3 ? 3.99 : amount === 10 ? 8.99 : 14.99
      });
      console.log('📊 Credit purchase tracked');
    } catch (error) {
      console.error('❌ Failed to track credit purchase:', error);
    }
  }

  // Buy credits button click handler
  const handleBuyCreditsClick = async () => {
    console.log('🔍 === Buy Credits button clicked ===')
    console.log('🔍 canPurchaseCredits():', canPurchaseCredits())
    
    if (!canPurchaseCredits()) {
      console.log('🚫 Credits blocked - showing blocked modal')
      setCreditsBlockedModalOpen(true)
      return
    }
    
    console.log('✅ Credits allowed - showing buy modal')
    setBuyModalOpen(true)

    // ADDED: Track buy credits modal open
    try {
      await trackUserEvent('buy_credits_modal_open');
      console.log('📊 Buy credits modal open tracked');
    } catch (error) {
      console.error('❌ Failed to track modal open:', error);
    }
  }

  const handleTermsOpen = () => setTermsModalOpen(true)
  const handlePrivacyOpen = () => setPrivacyModalOpen(true)
  const handleDmcaOpen = () => setDmcaModalOpen(true)
  const handleTermsClose = () => setTermsModalOpen(false)
  const handlePrivacyClose = () => setPrivacyModalOpen(false)
  const handleDmcaClose = () => setDmcaModalOpen(false)
  const handleLegalClick = () => setLegalModalOpen(true)

  const handleFooterTermsClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleTermsOpen();

    // ADDED: Track terms click
    try {
      await trackUserEvent('terms_clicked');
      console.log('📊 Terms click tracked');
    } catch (error) {
      console.error('❌ Failed to track terms click:', error);
    }
  }

  const handleFooterPrivacyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    handlePrivacyOpen();

    // ADDED: Track privacy click
    try {
      await trackUserEvent('privacy_clicked');
      console.log('📊 Privacy click tracked');
    } catch (error) {
      console.error('❌ Failed to track privacy click:', error);
    }
  }

  const handleFooterDmcaClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleDmcaOpen();

    // ADDED: Track DMCA click
    try {
      await trackUserEvent('dmca_clicked');
      console.log('📊 DMCA click tracked');
    } catch (error) {
      console.error('❌ Failed to track DMCA click:', error);
    }
  }

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 p-4">
          <div className="workstation-container rounded-2xl p-8 w-full max-w-7xl mx-auto">
            {/* ORIGINAL HEADER - Desktop Perfect, Mobile Responsive via CSS */}
            <div className="header-container flex items-center justify-between mb-8">
              <div className="title-section flex items-center gap-4">
                <div className="text-3xl font-bold text-blue-400">NUDEET</div>
                <div className="text-sm text-slate-400">AI Generation Studio</div>
              </div>
              <div className="credits-section flex items-center gap-6">
                <div className="credits-display flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium text-slate-300">Credits:</span>
                  <span className="text-xl">💎</span>
                  <span className="text-xl font-bold text-blue-400">{credits}</span>
                </div>
                <button
                  className="buy-credits-btn bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={handleBuyCreditsClick}
                  data-buy-credits
                >
                  💳 Buy Credits
                </button>
              </div>
            </div>
            
            {error && (
              <div className="error-message mb-6 bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto hover:bg-red-800/20 p-1 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* ORIGINAL GRID - Desktop Perfect, Mobile Responsive via CSS */}
            <div className="main-grid grid grid-cols-1 lg:grid-cols-11 gap-8">
              <div className="upload-panel lg:col-span-4">
                <ImageUploadPanel
                  preview={preview}
                  showAdvanced={showAdvanced}
                  advancedOptions={advancedOptions}
                  onImageUpload={handleImageUpload}
                  onClearImage={clearImage}
                  onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
                  onOptionsChange={handleAdvancedOptionsChange}
                  onUploadBoxClick={handleUploadBoxClick}
                  hasUploadedFirstImage={hasUploadedFirstImage}
                  uploadKey={uploadKey}
                  isLoading={isLoading}
                />
              </div>
              
              <div className="generate-panel lg:col-span-2 flex flex-col items-center">
                <div className="generate-button-container">
                  <GenerateButton
                    isLoading={isLoading}
                    progress={progress}
                    disabled={!image || isLoading}
                    onGenerate={handleGenerate}
                    onLegalClick={handleLegalClick}
                  />
                </div>
              </div>
              
              <div className="result-panel lg:col-span-5">
                <ResultPanel
                  isLoading={isLoading}
                  generated={generated}
                  generatedKey={generatedKey}
                  generatedImageError={generatedImageError}
                  generatedHistory={generatedHistory}
                  onDownload={downloadImage}
                  onImageClick={handleGalleryImageClick}
                  onGeneratedImageError={setGeneratedImageError}
                  onDeleteFromHistory={deleteFromHistory}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* ORIGINAL FOOTER - Mobile Responsive via CSS */}
        <footer className="mt-auto text-xs text-slate-500 text-center border-t border-slate-700/30 pt-6 pb-6 bg-slate-900/50">
          <p>© 2025 Nudeet. All rights reserved. Powered by advanced AI technology</p>
          <div className="footer-links mt-2 space-x-4">
            <button 
              onClick={handleFooterTermsClick}
              className="underline hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={handleFooterPrivacyClick}
              className="underline hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={handleFooterDmcaClick}
              className="underline hover:text-slate-300 transition-colors"
            >
              DMCA Policy
            </button>
            <span className="text-slate-600">|</span>
            <a href="mailto:nudeet.ai@proton.me" className="underline hover:text-slate-300 transition-colors">
              Contact: nudeet.ai@proton.me
            </a>
          </div>
        </footer>
      </div>
      
      {/* Upload Warning Modal */}
      {uploadWarningModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-2xl max-w-md w-full border border-yellow-600">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">⚠️ Upload Reminder</h3>
            <p className="text-sm text-slate-300 mb-6">
              Please ensure you are only uploading photos of:
              <br/>• Yourself
              <br/>• Fictional characters
              <br/>• Real persons with their explicit written consent
              <br/><br/>
              Uploading photos without consent is strictly prohibited and illegal.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleUploadWarningCancel}
                className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadWarningConfirm}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits Blocked Modal */}
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
      
      <Modals
        initialConsentModalOpen={initialConsentModalOpen}
        consentChecks={consentChecks}
        onConsentCheckChange={handleConsentCheckChange}
        onConsentSubmit={handleConsentSubmit}
        canEnterSite={canEnterSite()}
        legalModalOpen={legalModalOpen}
        onLegalClose={() => setLegalModalOpen(false)}
        termsModalOpen={termsModalOpen}
        privacyModalOpen={privacyModalOpen}
        dmcaModalOpen={dmcaModalOpen}
        onTermsOpen={handleTermsOpen}
        onPrivacyOpen={handlePrivacyOpen}
        onDmcaOpen={handleDmcaOpen}
        onTermsClose={handleTermsClose}
        onPrivacyClose={handlePrivacyClose}
        onDmcaClose={handleDmcaClose}
        imageViewerOpen={imageViewerOpen}
        galleryViewImage={galleryViewImage}
        currentGalleryIndex={currentGalleryIndex}
        generatedHistory={generatedHistory}
        generated={generated}
        onImageViewerClose={() => setImageViewerOpen(false)}
        onPrevImage={showPrevGalleryImage}
        onNextImage={showNextGalleryImage}
        buyModalOpen={buyModalOpen}
        onBuyCreditsClose={() => setBuyModalOpen(false)}
        onBuyCredits={handleBuyCredits}
        noCreditsModalOpen={noCreditsModalOpen}
        onNoCreditsClose={() => setNoCreditsModalOpen(false)}
        onFreeTrial={handleFreeTrial}
        canUseFreeTrial={canUseFreeTrial}
        freeTrialTimeRemaining={freeTrialTimeRemaining}
      />
    </main>
  );
}