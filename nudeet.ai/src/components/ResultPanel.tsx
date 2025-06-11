// components/ResultPanel.tsx - Fixed ESLint character escaping
"use client"

import { Loader2, Download, HelpCircle, Trash2 } from 'lucide-react'
import { UltraSimpleImage } from './UltraSimpleImage'
import { useState } from 'react'

interface ResultPanelProps {
  isLoading: boolean;
  generated: string | null;
  generatedKey: number;
  generatedImageError: boolean;
  generatedHistory: string[];
  onDownload: (url?: string) => void;
  onImageClick: (src: string, index: number) => void;
  onGeneratedImageError: (hasError: boolean) => void;
  onDeleteFromHistory: (index: number) => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  isLoading,
  generated,
  generatedKey,
  generatedImageError,
  generatedHistory,
  onDownload,
  onImageClick,
  onGeneratedImageError,
  onDeleteFromHistory
}) => {
  const [showPrivacyHelp, setShowPrivacyHelp] = useState(false);

  // Handle delete with confirmation
  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent image click
    
    // Simple confirmation
    if (window.confirm('Delete this image from your gallery?')) {
      onDeleteFromHistory(index);
    }
  };

  return (
    <div className="lg:col-span-5 control-panel rounded-xl p-6 flex flex-col">
      <h2 className="text-xl font-semibold mb-6 text-center text-slate-200">Generated Result</h2>
      <div 
        className={`generated-result-container ${generatedImageError ? 'image-error' : ''}`}
        style={{ 
          width: '100%', 
          maxWidth: '350px', 
          height: '430px', 
          margin: '0 auto',
          aspectRatio: '832/1024'
        }}
      >
        {isLoading ? (
          <div className="loading-placeholder">
            <div className="text-center text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium">Generating image...</p>
            </div>
          </div>
        ) : generated ? (
          <>
            <div className="image-container">
              <UltraSimpleImage
                key={generatedKey}
                src={generated}
                alt="Generated image"
                className="main-generated-image cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onImageClick(generated, generatedHistory.length)}
                onError={() => onGeneratedImageError(true)}
                onLoadComplete={() => onGeneratedImageError(false)}
              />
            </div>
            <button
              onClick={() => onDownload(generated)}
              className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg border border-blue-500/30"
            >
              <Download className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="text-center text-slate-500">
            <div className="text-4xl mb-3">⚡</div>
            <p className="text-xs font-medium">Result will appear here</p>
          </div>
        )}
      </div>
      
      {/* Gallery */}
      {generatedHistory.length > 0 && (
        <div className="mt-6 fade-in gallery-container-full">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-slate-300">Previous Generations</h3>
            <div 
              className="relative"
              onMouseEnter={() => setShowPrivacyHelp(true)}
              onMouseLeave={() => setShowPrivacyHelp(false)}
            >
              <HelpCircle className="w-4 h-4 text-slate-400 cursor-help hover:text-slate-300 transition-colors" />
              {showPrivacyHelp && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-72 bg-slate-900 text-white text-sm rounded-lg p-4 shadow-xl border border-slate-600 z-50">
                  <div className="space-y-2">
                    <p className="font-semibold text-green-400">🔒 Privacy Protection:</p>
                    <ul className="space-y-1 text-slate-300">
                      <li>• Nudeet doesn&apos;t store any user data</li>
                      <li>• Your photos are never saved on our servers</li>
                      <li>• Generation history is session-only</li>
                      <li>• All images are deleted when you close the page</li>
                      <li>• Complete privacy guaranteed</li>
                    </ul>
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900"></div>
                </div>
              )}
            </div>
          </div>
          <div className="gallery-container-full bg-slate-800/20 rounded-lg border border-slate-700/30 overflow-hidden">
            <div className="gallery-scroll p-3 gallery-content overflow-y-auto">
              <div className="gallery-grid">
                {generatedHistory.map((historyImage, index) => (
                  <div key={index} className="relative group">
                    <div className="w-full aspect-square bg-slate-700/20 rounded-lg overflow-hidden relative">
                      <UltraSimpleImage
                        src={historyImage}
                        alt={`Generated ${index + 1}`}
                        className="gallery-image cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onImageClick(historyImage, index)}
                      />
                    </div>
                    
                    {/* Download button - top right */}
                    <button
                      onClick={() => onDownload(historyImage)}
                      className="absolute top-1 right-1 bg-blue-600/80 hover:bg-blue-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Download image"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    
                    {/* Delete button - bottom left */}
                    <button
                      onClick={(e) => handleDelete(index, e)}
                      className="absolute bottom-1 left-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete from gallery"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};