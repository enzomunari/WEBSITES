'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Shield } from 'lucide-react'

const PrivacyPage: React.FC = () => {
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
                <p className="text-xs text-gray-500 font-medium">Privacy Policy</p>
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
        {/* Privacy Badge */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-green-50 border border-green-200 rounded-full px-6 py-3 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            <span className="text-green-800 font-semibold">Your Privacy is Protected</span>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-black text-gray-900 mb-8 text-center">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-8 text-center">Last updated: January 2024</p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-3">🔒 Key Privacy Commitments</h3>
            <ul className="text-blue-800 space-y-2">
              <li>• We automatically delete your uploaded photos after processing</li>
              <li>• Generated headshots are temporarily stored for download only</li>
              <li>• We never sell or share your personal data</li>
              <li>• All processing happens on secure, encrypted servers</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Photos You Upload</h3>
          <p className="text-gray-700 mb-4">
            When you use our service, you upload photos that are processed by our AI to generate professional headshots. These photos are:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Processed immediately upon upload</li>
            <li>Automatically deleted within 24 hours</li>
            <li>Never used for training our AI models</li>
            <li>Never shared with third parties</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Usage Information</h3>
          <p className="text-gray-700 mb-6">
            We collect basic usage information to improve our service:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Number of headshots generated</li>
            <li>Style and environment preferences</li>
            <li>Technical logs for troubleshooting</li>
            <li>Anonymous analytics data</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-6">
            Your information is used solely to:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Generate your requested headshots</li>
            <li>Provide customer support</li>
            <li>Improve our service quality</li>
            <li>Send service-related communications</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>
          <p className="text-gray-700 mb-6">
            We implement industry-standard security measures:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>End-to-end encryption for all uploaded images</li>
            <li>Secure HTTPS connections for all data transmission</li>
            <li>Regular security audits and monitoring</li>
            <li>Limited access controls for our team</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Retention</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h4 className="font-bold text-green-900 mb-2">Uploaded Photos</h4>
            <p className="text-green-800 mb-3">Automatically deleted within 24 hours of upload</p>
            
            <h4 className="font-bold text-green-900 mb-2">Generated Headshots</h4>
            <p className="text-green-800 mb-3">Available for download for 30 days, then permanently deleted</p>
            
            <h4 className="font-bold text-green-900 mb-2">Account Information</h4>
            <p className="text-green-800">Retained only as long as your account is active</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Request deletion of your account and all associated data</li>
            <li>Access information about what data we have collected</li>
            <li>Correct any inaccurate personal information</li>
            <li>Withdraw consent for data processing</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-700 mb-6">
            We use minimal cookies and tracking technologies:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Essential cookies for service functionality</li>
            <li>Analytics cookies to understand usage patterns (anonymous)</li>
            <li>No advertising or marketing tracking</li>
            <li>You can disable cookies in your browser settings</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Third-Party Services</h2>
          <p className="text-gray-700 mb-6">
            We use select third-party services that comply with our privacy standards:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Payment processing (encrypted and secure)</li>
            <li>Cloud infrastructure (with data encryption)</li>
            <li>Analytics services (anonymized data only)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">International Data Transfers</h2>
          <p className="text-gray-700 mb-6">
            Your data may be processed in countries other than your own. We ensure adequate protection through:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Standard contractual clauses</li>
            <li>Adequacy decisions by relevant authorities</li>
            <li>Other lawful transfer mechanisms</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Children&apos;s Privacy</h2>
          <p className="text-gray-700 mb-6">
            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
          <p className="text-gray-700 mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &apos;Last updated&apos; date.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="text-gray-700">
              <li>• Through our help center</li>
              <li>• By email (available in our support section)</li>
              <li>• Through our website contact form</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage