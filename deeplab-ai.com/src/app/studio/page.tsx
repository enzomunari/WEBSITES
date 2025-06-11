'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Sparkles, 
  Camera,
  Zap,
  Download,
  RefreshCw,
  Upload,
  Crown,
  ArrowLeft,
  X
} from 'lucide-react'

// Import from local utils
import { 
  loadUnifiedUserData,
  canUseFreeTrial,
  markFreeTrialUsed
} from '../../utils/unifiedUserStorage'

// Enhanced localStorage with error handling
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn(`localStorage.getItem failed for key ${key}:`, error)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn(`localStorage.setItem failed for key ${key}:`, error)
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`localStorage.removeItem failed for key ${key}:`, error)
    }
  }
}

// Load and save generated images from localStorage
const loadGeneratedImages = (): string[] => {
  const saved = safeLocalStorage.getItem('deeplab_generated_images')
  try {
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const saveGeneratedImages = (images: string[]): void => {
  safeLocalStorage.setItem('deeplab_generated_images', JSON.stringify(images))
}

// Background generation tracking
const setBackgroundGeneration = (isGenerating: boolean, generationData?: Record<string, unknown>): void => {
  if (isGenerating && generationData) {
    safeLocalStorage.setItem('deeplab_background_generation', JSON.stringify({
      ...generationData,
      startTime: Date.now()
    }))
  } else {
    safeLocalStorage.removeItem('deeplab_background_generation')
  }
}

const getBackgroundGeneration = (): Record<string, unknown> | null => {
  const saved = safeLocalStorage.getItem('deeplab_background_generation')
  try {
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// Check for completed background generation
const checkBackgroundGeneration = async (): Promise<string | null> => {
  const backgroundGen = getBackgroundGeneration()
  if (!backgroundGen) return null

  // If it's been more than 5 minutes, consider it failed
  if (Date.now() - (backgroundGen.startTime as number) > 5 * 60 * 1000) {
    setBackgroundGeneration(false)
    return null
  }

  try {
    console.log('Checking background generation...', backgroundGen)
    // Implementation would check your generation status here
  } catch (error) {
    console.error('Error checking background generation:', error)
  }

  return null
}

// User data interface
interface UserData {
  userId: string;
  deviceId: string;
  credits: number;
  lastFreeTrialDate: string | null;
  firstVisitDate: string;
  lastVisitDate: string;
  totalGenerations: number;
  totalFreeTrialsUsed: number;
  isBlocked: boolean;
  sitesUsed: string[];
  lastSyncDate: string;
}

// Get user data using unified system
const getUserData = async (): Promise<UserData | null> => {
  if (typeof window === 'undefined') return null
  
  console.log('📋 Loading unified user data for Deeplab...')
  
  try {
    const userData = await loadUnifiedUserData()
    
    // Update localStorage for backward compatibility
    safeLocalStorage.setItem('shared_user_id', userData.userId)
    safeLocalStorage.setItem('shared_device_id', userData.deviceId)
    safeLocalStorage.setItem('shared_credits', userData.credits.toString())
    safeLocalStorage.setItem('shared_total_generations', userData.totalGenerations.toString())
    safeLocalStorage.setItem('shared_free_trials_used', userData.totalFreeTrialsUsed.toString())
    
    console.log('✅ Unified user data loaded:', userData.userId, `Credits: ${userData.credits}`)
    
    return userData
  } catch (error) {
    console.error('Error loading unified user data:', error)
    return null
  }
}

// Check if user can generate
const canGenerate = async (): Promise<{ canGenerate: boolean; reason?: string }> => {
  const userData = await getUserData()
  if (!userData) return { canGenerate: false, reason: 'User data not available' }
  
  if (userData.isBlocked) {
    return { canGenerate: false, reason: 'Account is blocked' }
  }
  
  if (userData.credits > 0) {
    return { canGenerate: true }
  }
  
  if (canUseFreeTrial(userData)) {
    return { canGenerate: true, reason: 'free_trial' }
  }
  
  return { canGenerate: false, reason: 'No credits available' }
}

// Perform generation using unified system
const performGeneration = async (isFreeTrial: boolean = false): Promise<{ success: boolean; userData: UserData | null }> => {
  const userData = await getUserData()
  if (!userData) return { success: false, userData: null }
  
  if (userData.isBlocked) {
    return { success: false, userData }
  }
  
  if (isFreeTrial) {
    if (canUseFreeTrial(userData)) {
      const updatedData = await markFreeTrialUsed()
      console.log('🎁 Used free trial for generation')
      return { success: true, userData: updatedData }
    } else {
      return { success: false, userData }
    }
  } else {
    // Use credit - direct API call instead of hook
    if (userData.credits > 0) {
      try {
        const response = await fetch('/api/shared-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addCredits',
            userId: userData.userId,
            amount: -1 // Subtract 1 credit
          })
        })
        
        if (response.ok) {
          const updatedUserData = await response.json()
          console.log('💸 Used credit for generation')
          return { success: true, userData: updatedUserData }
        }
      } catch (error) {
        console.error('Error using credit:', error)
      }
      return { success: false, userData }
    } else {
      return { success: false, userData }
    }
  }
}

const DeeplabStudio: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null)
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('office')
  const [selectedStyle, setSelectedStyle] = useState<string>('suit')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserData()
      setUserData(data)
      
      // Load persistent generated images
      const savedImages = loadGeneratedImages()
      setGeneratedImages(savedImages)
      if (savedImages.length > 0) {
        setGeneratedImage(savedImages[0])
      }
      
      // Check for background generation completion
      const backgroundResult = await checkBackgroundGeneration()
      if (backgroundResult) {
        const updatedImages = [backgroundResult, ...savedImages]
        setGeneratedImages(updatedImages)
        setGeneratedImage(backgroundResult)
        saveGeneratedImages(updatedImages)
        
        if (data) {
          const updatedUserData = await getUserData()
          setUserData(updatedUserData)
        }
      }
    }
    
    loadUserData()
  }, [])

  const environments = [
    { id: 'office', name: 'Professional Office', image: '/environments/office.jpg' },
    { id: 'studio', name: 'Photography Studio', image: '/environments/studio.jpg' },
    { id: 'outdoor', name: 'Outdoor Business', image: '/environments/outdoor.jpg' },
    { id: 'library', name: 'Executive Library', image: '/environments/library.jpg' }
  ]

  const styles = [
    { id: 'suit', name: 'Business Suit', image: '/styles/suit.jpg' },
    { id: 'casual', name: 'Business Casual', image: '/styles/casual.jpg' },
    { id: 'formal', name: 'Executive Formal', image: '/styles/formal.jpg' },
    { id: 'creative', name: 'Creative Professional', image: '/styles/creative.jpg' }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      setSelectedFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedFilePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleGenerate = async () => {
    if (!selectedFile || !userData) {
      setError('Please select an image and ensure user data is loaded')
      return
    }

    const { canGenerate: canGen, reason } = await canGenerate()
    
    if (!canGen) {
      if (reason === 'No credits available') {
        setShowCreditsModal(true)
      } else {
        setError(reason || 'Cannot generate at this time')
      }
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(0)

    try {
      const isFreeTrial = reason === 'free_trial'
      
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('environment', selectedEnvironment)
      formData.append('style', selectedStyle)
      formData.append('userId', userData.userId)
      formData.append('deviceId', userData.deviceId)

      console.log(`🎨 Starting generation: ${selectedEnvironment}, ${selectedStyle}`)

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 1000)

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (response.ok) {
        const result = await response.json()
        
        const generationResult = await performGeneration(isFreeTrial)
        
        if (generationResult.success && generationResult.userData) {
          setUserData(generationResult.userData)
          
          const newImages = [result.imageUrl, ...generatedImages]
          setGeneratedImages(newImages)
          setGeneratedImage(result.imageUrl)
          saveGeneratedImages(newImages)
          
          setProgress(100)
          console.log('✅ Generation completed successfully')
        } else {
          setError('Generation succeeded but failed to update credits')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Generation failed')
        console.error('❌ Generation failed:', errorData.error)
      }
    } catch (error) {
      console.error('❌ Generation error:', error)
      setError('Network error occurred')
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `deeplab-headshot-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      if (typeof window !== 'undefined') {
        window.open(imageUrl, '_blank')
        alert('Download failed. Please right-click the image and select "Save image as..."')
      }
    }
  }

  const viewImage = (imageUrl: string) => {
    setViewerImageUrl(imageUrl)
    setShowImageViewer(true)
  }

  useEffect(() => {
    return () => {
      if (selectedFilePreview) {
        URL.revokeObjectURL(selectedFilePreview)
      }
    }
  }, [selectedFilePreview])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: '#e2e8f0',
        position: 'sticky', 
        top: 0, 
        zIndex: 40,
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <ArrowLeft style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1f2937' }}>DeepLab AI</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Professional Headshots</div>
                </div>
              </Link>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f3f4f6', borderRadius: '12px' }}>
                <Zap style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                <span style={{ fontWeight: '600', color: '#374151' }}>
                  {userData?.credits || 0} Credits
                </span>
              </div>
              
              <button
                onClick={() => setShowCreditsModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                <Crown style={{ width: '16px', height: '16px' }} />
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Left Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Upload Section */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '20px', 
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
                Upload Your Photo
              </h2>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  backgroundColor: selectedFilePreview ? '#f9fafb' : 'transparent'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              >
                {selectedFilePreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Image 
                      src={selectedFilePreview} 
                      alt="Preview" 
                      width={100}
                      height={100}
                      style={{ 
                        objectFit: 'cover', 
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb'
                      }} 
                    />
                    <p style={{ color: '#374151', fontWeight: '500' }}>Click to change photo</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Upload style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                      Choose your photo
                    </p>
                    <p style={{ color: '#6b7280' }}>JPG, PNG or WebP (max 10MB)</p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Environment Selection */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '20px', 
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
                Choose Environment
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {environments.map((env) => (
                  <div
                    key={env.id}
                    onClick={() => setSelectedEnvironment(env.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedEnvironment === env.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      cursor: 'pointer',
                      backgroundColor: selectedEnvironment === env.id ? '#dbeafe' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#374151', textAlign: 'center' }}>
                      {env.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '20px', 
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
                Choose Style
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {styles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedStyle === style.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      cursor: 'pointer',
                      backgroundColor: selectedStyle === style.id ? '#dbeafe' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#374151', textAlign: 'center' }}>
                      {style.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedFile || isGenerating}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 24px',
                backgroundColor: isGenerating ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: !selectedFile || isGenerating ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                  Generating... {progress}%
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '20px', height: '20px' }} />
                  Generate Professional Headshot
                </>
              )}
            </button>

            {error && (
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: '#fee2e2', 
                color: '#dc2626', 
                borderRadius: '12px',
                border: '1px solid #fecaca'
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '20px', 
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              Your Professional Headshots
            </h3>
            
            {generatedImage ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <Image 
                    src={generatedImage} 
                    alt="Generated headshot" 
                    width={500}
                    height={500}
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: '2px solid #e5e7eb'
                    }}
                    onClick={() => viewImage(generatedImage)}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    display: 'flex', 
                    gap: '8px' 
                  }}>
                    <button
                      onClick={() => downloadImage(generatedImage)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Download style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>

                {generatedImages.length > 1 && (
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                      All Generated Images
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                      gap: '8px' 
                    }}>
                      {generatedImages.map((img, index) => (
                        <Image
                          key={index}
                          src={img}
                          alt={`Generated ${index + 1}`}
                          width={80}
                          height={80}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: img === generatedImage ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                            transition: 'border-color 0.2s'
                          }}
                          onClick={() => setGeneratedImage(img)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '300px',
                color: '#9ca3af',
                textAlign: 'center'
              }}>
                <Camera style={{ width: '64px', height: '64px', marginBottom: '16px' }} />
                <p style={{ fontSize: '18px', fontWeight: '600' }}>No headshots generated yet</p>
                <p>Upload a photo and click generate to create your professional headshot</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Viewer Modal */}
      {showImageViewer && viewerImageUrl && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px'
          }}
          onClick={() => setShowImageViewer(false)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <Image 
              src={viewerImageUrl} 
              alt="Full size" 
              width={800}
              height={800}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain',
                borderRadius: '12px'
              }} 
            />
            <button
              onClick={() => setShowImageViewer(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      )}

      {/* Credits Modal */}
      {showCreditsModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px'
          }}
          onClick={() => setShowCreditsModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
              Buy Credits
            </h3>
            <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>
              You need credits to generate professional headshots. Each generation uses 1 credit.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ 
                padding: '16px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>5 Credits - $9.99</div>
                <div style={{ color: '#6b7280' }}>Perfect for trying out</div>
              </div>
              <div style={{ 
                padding: '16px', 
                border: '2px solid #3b82f6', 
                borderRadius: '12px',
                textAlign: 'center',
                backgroundColor: '#dbeafe'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>15 Credits - $24.99</div>
                <div style={{ color: '#6b7280' }}>Most popular choice</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCreditsModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.open('/pricing', '_blank')
                  setShowCreditsModal(false)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default DeeplabStudio