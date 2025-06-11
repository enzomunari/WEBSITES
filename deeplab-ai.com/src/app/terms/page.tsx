'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-lg bg-white/95">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3 text-decoration-none">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Deeplab-ai</h1>
                <p className="text-xs text-gray-500 font-medium">Terms of Service</p>
              </div>
            </Link>
            
            <Link
              href="/studio"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Create Headshots
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-8">Last updated: January 2024</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-6">
            By accessing and using Deeplab-ai (&apos;Service&apos;), you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use License</h2>
          <p className="text-gray-700 mb-6">
            Permission is granted to temporarily use the Service for personal, commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on the Service</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Image Rights and Usage</h2>
          <p className="text-gray-700 mb-6">
            You retain full ownership and rights to any images you upload to our Service. Generated headshots are yours to use for any purpose, including commercial use. We do not claim any rights to your generated images.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Privacy and Data Protection</h2>
          <p className="text-gray-700 mb-6">
            Your privacy is important to us. Uploaded images are processed securely and automatically deleted from our servers after generation. We do not store or use your images for any purpose other than generating your requested headshots.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Payment and Refunds</h2>
          <p className="text-gray-700 mb-6">
            All purchases are final. Refunds may be provided at our discretion within 7 days of purchase for unused credits. Technical issues that prevent service delivery may warrant refunds on a case-by-case basis.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Service Availability</h2>
          <p className="text-gray-700 mb-6">
            We strive to maintain 99% uptime but cannot guarantee uninterrupted service. Maintenance windows and technical issues may temporarily affect service availability.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Prohibited Uses</h2>
          <p className="text-gray-700 mb-6">
            You may not use our Service to:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Generate images of minors without proper authorization</li>
            <li>Create fake or misleading profile images</li>
            <li>Violate any local, state, national, or international law</li>
            <li>Transmit, or procure the sending of, any advertising or promotional material</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Disclaimer</h2>
          <p className="text-gray-700 mb-6">
            The information on this Service is provided on an &apos;as is&apos; basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contact Information</h2>
          <p className="text-gray-700 mb-6">
            If you have any questions about these Terms of Service, please contact us through our support channels.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TermsPage