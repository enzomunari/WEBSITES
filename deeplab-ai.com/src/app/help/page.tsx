'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Camera,
  Zap,
  Shield,
  CreditCard,
  Users,
  Clock
} from 'lucide-react'

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const faqData = [
    {
      category: 'Getting Started',
      icon: <Sparkles className="w-5 h-5" />,
      questions: [
        {
          question: 'How do I create my first AI headshot?',
          answer: 'Simply upload a clear photo of yourself, choose your preferred style and background, and click "Generate Headshot". Our AI will create professional headshots in under 2 minutes.'
        },
        {
          question: 'What type of photos work best?',
          answer: 'Use high-quality photos with good lighting where your face is clearly visible. Avoid sunglasses, heavy filters, or blurry images. Front-facing or slightly angled photos work best.'
        },
        {
          question: 'How long does it take to generate headshots?',
          answer: 'Most headshots are generated within 1-2 minutes. Complex requests may take up to 5 minutes during peak times.'
        }
      ]
    },
    {
      category: 'Credits & Pricing',
      icon: <CreditCard className="w-5 h-5" />,
      questions: [
        {
          question: 'How do credits work?',
          answer: 'Each headshot generation costs 1 credit. New users get 3 free credits to try the service. You can purchase additional credits through our pricing plans.'
        },
        {
          question: 'Do credits expire?',
          answer: 'No, your credits never expire. You can use them whenever you need professional headshots.'
        },
        {
          question: 'Can I get a refund?',
          answer: 'We offer refunds within 7 days of purchase if you haven&apos;t used any credits. For technical issues, contact our support team.'
        }
      ]
    },
    {
      category: 'Quality & Styles',
      icon: <Camera className="w-5 h-5" />,
      questions: [
        {
          question: 'What styles and backgrounds are available?',
          answer: 'We offer multiple professional styles (Business Suit, Smart Casual, Executive) and backgrounds (Modern Office, Studio White/Grey/Color, Classic B&W, Corporate Outdoor).'
        },
        {
          question: 'Can I regenerate if I don&apos;t like the result?',
          answer: 'Yes! If you&apos;re not satisfied with your headshot, you can generate a new one with different settings. Each generation uses 1 credit.'
        },
        {
          question: 'What resolution are the final images?',
          answer: 'All headshots are generated in high resolution (1024x1280 pixels) suitable for professional use, LinkedIn profiles, and printing.'
        }
      ]
    },
    {
      category: 'Privacy & Security',
      icon: <Shield className="w-5 h-5" />,
      questions: [
        {
          question: 'Is my uploaded photo secure?',
          answer: 'Yes, your privacy is our priority. Photos are processed securely and automatically deleted from our servers after generation.'
        },
        {
          question: 'Do you store my generated headshots?',
          answer: 'Generated headshots are temporarily available for download. We don&apos;t permanently store your images unless you save them locally.'
        },
        {
          question: 'Can I delete my account and data?',
          answer: 'Yes, you can request account deletion at any time. All your data will be permanently removed from our systems.'
        }
      ]
    },
    {
      category: 'Technical Support',
      icon: <HelpCircle className="w-5 h-5" />,
      questions: [
        {
          question: 'Why is my generation taking longer than usual?',
          answer: 'High traffic periods may cause delays. If generation takes more than 5 minutes, try refreshing the page or contact support.'
        },
        {
          question: 'What file formats are supported?',
          answer: 'We support JPEG, PNG, and WebP formats. Files must be under 10MB in size.'
        },
        {
          question: 'Can I use the headshots commercially?',
          answer: 'Yes, you have full rights to use your generated headshots for any purpose, including commercial use.'
        }
      ]
    }
  ]

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

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
                <p className="text-xs text-gray-500 font-medium">Help Center</p>
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Find answers to common questions about creating professional AI headshots
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: <Users className="w-6 h-6" />, number: "250K+", label: "Happy Users" },
            { icon: <Camera className="w-6 h-6" />, number: "1M+", label: "Photos Created" },
            { icon: <Clock className="w-6 h-6" />, number: "2 min", label: "Average Time" },
            { icon: <Zap className="w-6 h-6" />, number: "99%", label: "Success Rate" }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <div className="text-blue-500 flex justify-center mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredFAQs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-blue-500">
                  {category.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{category.category}</h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex // Unique index
                  return (
                    <div
                      key={faqIndex}
                      className="border border-gray-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </span>
                        {expandedFAQ === globalIndex ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      
                      {expandedFAQ === globalIndex && (
                        <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {searchTerm && filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              Try searching with different keywords or browse our categories above.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still need help?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/studio"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Try Creating Headshots
            </Link>
            <button className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage