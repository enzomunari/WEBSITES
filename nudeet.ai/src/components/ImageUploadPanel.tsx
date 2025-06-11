// components/ImageUploadPanel.tsx - Fixed TypeScript and ESLint issues
"use client"

import { Upload, X, ChevronDown, ChevronUp, User, Calendar, HelpCircle, Droplets } from 'lucide-react'
import { AdvancedOptions } from '@/types'
import { useState } from 'react'
import Image from 'next/image'

interface ImageUploadPanelProps {
  preview: string | null;
  showAdvanced: boolean;
  advancedOptions: AdvancedOptions;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onToggleAdvanced: () => void;
  onOptionsChange: (options: AdvancedOptions) => void;
  onUploadBoxClick: () => void;
  hasUploadedFirstImage: boolean;
  uploadKey: number;
  isLoading?: boolean;
}

export const ImageUploadPanel: React.FC<ImageUploadPanelProps> = ({
  preview,
  showAdvanced,
  advancedOptions,
  onImageUpload,
  onClearImage,
  onToggleAdvanced,
  onOptionsChange,
  onUploadBoxClick,
  hasUploadedFirstImage,
  uploadKey
  // FIXED: Remove unused isLoading parameter
}) => {
  const [showHelp, setShowHelp] = useState(false);

  // Female poses with standing-front and standing-back first
  const femalePoseIcons = {
    'standing-front': '🧍',
    'standing-back': '🚶',
    'selfie': '🤳',
	'gagging': '😯',
	'squirting': '💧',
	'hand-on-head': '🖐️',
    'pants-down': '👖',
    'from above': '⬇️',
    'laying-legs-open': '🛏️',
    'ass-spread': '🍑',
    'doggystyle': '🐕',
    'missionary-pov': '👁️',
    'oral-pov': '💋',
    'cumshot': '💦',
    'tongue-out': '👅',
    'blowjob': '🫦',
    'shower': '🚿',
    'sucking': '👄'
  }

  const femalePoseLabels = {
    'standing-front': 'Standing Front',
    'standing-back': 'Standing Back',
    'selfie': 'Selfie',
	'gagging': 'Gagging',
	'squirting': 'Squirting',
	'hand-on-head': 'Hand on Head️',
    'pants-down': 'Pants Down',
    'from above': 'From Above',
    'laying-legs-open': 'Laying Open',
    'ass-spread': 'Ass Spread',
    'doggystyle': 'Doggystyle',
    'missionary-pov': 'Missionary POV',
    'oral-pov': 'Oral POV',
    'cumshot': 'Cumshot',
    'tongue-out': 'Tongue Out',
    'blowjob': 'Blowjob',
    'shower': 'Shower',
    'sucking': 'Sucking'
  }

  // Male poses (4 poses with standing first)
  const malePoseIcons = {
    'standing-front': '🧍',
    'from behind': '🔄',
    'shower': '🚿',
    'spread legs': '🦵'
  }

  const malePoseLabels = {
    'standing-front': 'Standing',
    'from behind': 'From Behind',
    'shower': 'Shower',
    'spread legs': 'Spread Legs'
  }

  // Get current pose configuration based on gender
  const currentPoseIcons = advancedOptions.gender === 'male' ? malePoseIcons : femalePoseIcons;
  const currentPoseLabels = advancedOptions.gender === 'male' ? malePoseLabels : femalePoseLabels;
  // FIXED: Proper typing for valid poses
  const validPoses = Object.keys(currentPoseIcons) as (keyof typeof currentPoseIcons)[];

  // Check if current pose is valid for the selected gender
  const isCurrentPoseValid = validPoses.includes(advancedOptions.pose as keyof typeof currentPoseIcons);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ New image upload triggered');
    onImageUpload(e);
  }

  const handleClearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🗑️ Clearing uploaded image');
    onClearImage();
  }

  // Handle upload box click with proper state management
  const handleUploadClick = () => {
    console.log('🖱️ Upload box clicked, hasUploadedFirstImage:', hasUploadedFirstImage)
    if (!hasUploadedFirstImage) {
      // Show warning modal for first upload
      onUploadBoxClick();
    } else {
      // Direct upload for subsequent uploads
      const fileInput = document.getElementById(`upload-input-main`) as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  const handleGenderChange = (gender: 'female' | 'male') => {
    // When switching gender, reset to first valid pose for that gender
    const newPoses = gender === 'male' ? malePoseIcons : femalePoseIcons;
    const firstValidPose = Object.keys(newPoses)[0] as AdvancedOptions['pose'];
    
    onOptionsChange({ 
      ...advancedOptions, 
      gender,
      pose: firstValidPose
    });
  }

  return (
    <div className="lg:col-span-4 control-panel rounded-xl p-6 flex flex-col">
      <div className="flex items-center justify-center gap-2 mb-6">
        <h2 className="text-xl font-semibold text-center text-slate-200">Upload Image</h2>
        <div 
          className="relative"
          onMouseEnter={() => setShowHelp(true)}
          onMouseLeave={() => setShowHelp(false)}
        >
          <HelpCircle className="w-5 h-5 text-slate-400 cursor-help hover:text-slate-300 transition-colors" />
          {showHelp && (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-80 bg-slate-900 text-white text-sm rounded-lg p-4 shadow-xl border border-slate-600 z-50">
              <div className="space-y-2">
                <p className="font-semibold text-blue-400">📸 Image Quality Tips:</p>
                <ul className="space-y-1 text-slate-300">
                  <li>• Use high-quality, clear face images</li>
                  <li>• Ensure good lighting and visibility</li>
                  <li>• Avoid images with multiple people</li>
                  <li>• Try different pictures for better results</li>
                  <li>• Output quality depends on input quality</li>
                </ul>
                <p className="font-semibold text-red-400 mt-3">⚠️ Important:</p>
                <p className="text-red-300">It&apos;s forbidden to use someone else&apos;s photo without their explicit consent.</p>
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900"></div>
            </div>
          )}
        </div>
      </div>
      
      <div
        onClick={handleUploadClick}
        className={`w-full aspect-square rounded-xl border-3 border-dashed border-slate-500/60 flex items-center justify-center cursor-pointer relative overflow-hidden hover:border-blue-400/70 upload-container ${preview ? 'has-image subtle-halo' : ''}`}
        style={{ maxWidth: '180px', maxHeight: '180px', margin: '0 auto' }}
      >
        {preview ? (
          <>
            <div className="image-container">
              {/* FIXED: Use Next.js Image component with proper props */}
              <Image 
                src={preview} 
                alt="Uploaded" 
                className="uploaded-preview-image" 
                fill
                style={{ objectFit: 'cover' }}
                sizes="180px"
              />
            </div>
            <button
              onClick={handleClearImage}
              className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg z-10"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-400 p-6">
            <Upload className="w-10 h-10 mb-2" />
            <span className="text-sm font-medium">Click to Upload</span>
            <span className="text-xs text-slate-500 mt-1">JPG, PNG, WebP</span>
            <span className="text-xs text-slate-500">Max 10MB</span>
          </div>
        )}
        
        {/* Single main file input with consistent ID */}
        <input
          key={uploadKey}
          id="upload-input-main"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
      
      {/* Advanced Options Toggle */}
      <button
        onClick={onToggleAdvanced}
        className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white py-4 px-4 rounded-lg flex items-center justify-between transition-all duration-200 font-medium border border-slate-600/40 my-6"
      >
        <span>Advanced Options</span>
        {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {/* Advanced Options Panel */}
      {showAdvanced && (
        <div className="mt-6 space-y-6 bg-slate-800/30 rounded-lg p-6 border border-slate-700/30 fade-in flex-1">
          {/* Gender */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4" />
              Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['female', 'male'] as const).map(gender => (
                <button
                  key={gender}
                  onClick={() => handleGenderChange(gender)}
                  className={`py-4 px-4 rounded-lg transition-all font-medium border ${
                    advancedOptions.gender === gender
                      ? 'bg-blue-600 text-white shadow-lg border-blue-500'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border-slate-600/50'
                  }`}
                >
                  {gender === 'female' ? '♀ Female' : '♂ Male'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Age Slider */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4" />
              Age: <span className="text-blue-400 font-bold">{advancedOptions.age}</span>
            </label>
            <div className="slider-container">
              <div
                className="slider-fill"
                style={{ width: `${((advancedOptions.age - 18) / (75 - 18)) * 100}%` }}
              />
              <div
                className="slider-thumb"
                style={{ left: `${((advancedOptions.age - 18) / (75 - 18)) * 100}%` }}
              />
              <input
                type="range"
                min="18"
                max="75"
                value={advancedOptions.age}
                onChange={e => onOptionsChange({ ...advancedOptions, age: parseInt(e.target.value) })}
                className="slider-input"
              />
            </div>
          </div>
          
          {/* Body Type Slider */}
          <div>
            <label className="text-sm font-medium mb-3 block text-slate-300">Body Type</label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">🏃‍♀️</span>
              <div className="flex-1 slider-container">
                <div
                  className="slider-fill"
                  style={{ width: `${advancedOptions.bodyType}%` }}
                />
                <div
                  className="slider-thumb"
                  style={{ left: `${advancedOptions.bodyType}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={advancedOptions.bodyType}
                  onChange={e => onOptionsChange({ ...advancedOptions, bodyType: parseInt(e.target.value) })}
                  className="slider-input"
                />
              </div>
              <span className="text-2xl">🍔</span>
            </div>
          </div>
          
          {/* Breast Size Slider (only for female) */}
          {advancedOptions.gender === 'female' && (
            <div>
              <label className="text-sm font-medium mb-3 block text-slate-300">Breast Size</label>
              <div className="flex items-center gap-4">
                <span className="text-2xl">🍊</span>
                <div className="flex-1 slider-container">
                  <div
                    className="slider-fill"
                    style={{ width: `${advancedOptions.breastSize}%` }}
                  />
                  <div
                    className="slider-thumb"
                    style={{ left: `${advancedOptions.breastSize}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={advancedOptions.breastSize}
                    onChange={e => onOptionsChange({ ...advancedOptions, breastSize: parseInt(e.target.value) })}
                    className="slider-input"
                  />
                </div>
                <span className="text-2xl">🍉</span>
              </div>
            </div>
          )}
          
          {/* Pose Selector - Gender-specific */}
          <div>
            <label className="text-sm font-medium mb-3 block text-slate-300">
              Pose
              {!isCurrentPoseValid && (
                <span className="text-red-400 text-xs ml-2">(Pose reset for {advancedOptions.gender})</span>
              )}
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto modern-scrollbar">
              {validPoses.map(pose => (
                <button
                  key={pose}
                  onClick={() => onOptionsChange({ ...advancedOptions, pose: pose as AdvancedOptions['pose'] })}
                  className={`py-3 px-2 rounded-lg text-xs transition-all flex flex-col items-center font-medium border ${
                    advancedOptions.pose === pose
                      ? 'bg-blue-600 text-white shadow-lg border-blue-500'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border-slate-600/50'
                  }`}
                >
                  <span className="text-lg mb-1">{currentPoseIcons[pose]}</span>
                  <span className="text-xs text-center leading-tight">{currentPoseLabels[pose]}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Skin Tone Slider */}
          <div>
            <label className="text-sm font-medium mb-3 block text-slate-300">Skin Tone</label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">🍫</span>
              <div className="flex-1 slider-container">
                <div
                  className="slider-fill"
                  style={{ width: `${advancedOptions.skinTone}%` }}
                />
                <div
                  className="slider-thumb"
                  style={{ left: `${advancedOptions.skinTone}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={advancedOptions.skinTone}
                  onChange={e => onOptionsChange({ ...advancedOptions, skinTone: parseInt(e.target.value) })}
                  className="slider-input"
                />
              </div>
              <span className="text-2xl">🥛</span>
            </div>
          </div>

          {/* Wetness Slider at bottom */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2 text-slate-300">
              <Droplets className="w-4 h-4" />
              Wetness: <span className="text-blue-400 font-bold">{advancedOptions.wetness}%</span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">🟤</span>
              <div className="flex-1 slider-container">
                <div
                  className="slider-fill"
                  style={{ width: `${advancedOptions.wetness}%` }}
                />
                <div
                  className="slider-thumb"
                  style={{ left: `${advancedOptions.wetness}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={advancedOptions.wetness}
                  onChange={e => onOptionsChange({ ...advancedOptions, wetness: parseInt(e.target.value) })}
                  className="slider-input"
                />
              </div>
              <span className="text-2xl">💧</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Controls wet and oily appearance</p>
          </div>
        </div>
      )}
    </div>
  );
};