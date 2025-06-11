'use client'

import React from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Sparkles, 
  Star, 
  Check, 
  Zap, 
  Shield,
  Camera,
  Users,
  Award,
  Crown
} from 'lucide-react'

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter Pack',
      price: '$3.99',
      credits: 3,
      description: 'Perfect to try it out',
      features: [
        '3 AI headshots',
        'All environments & styles',
        'High-resolution downloads',
        'Instant generation'
      ],
      popular: false,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Popular Pack',
      price: '$8.99',
      credits: 10,
      description: 'Great value for money',
      features: [
        '10 AI headshots',
        'All environments & styles',
        'High-resolution downloads',
        'Priority processing',
        'Multiple variations'
      ],
      popular: true,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Pro Pack',
      price: '$10.99',
      credits: 15,
      description: 'Best value pack',
      features: [
        '15 AI headshots',
        'All environments & styles',
        'High-resolution downloads',
        'Priority processing',
        'Multiple variations',
        'Premium support'
      ],
      popular: false,
      gradient: 'from-purple-500 to-purple-600'
    }
  ]

  const allFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your photos are processed securely and deleted after generation'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '30-second Generation',
      description: 'Get professional headshots in under 30 seconds'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Professional Quality',
      description: 'Studio-quality results perfect for LinkedIn and business use'
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'HD Downloads',
      description: 'High-resolution images suitable for professional use and printing'
    }
  ]

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
                <p className="text-xs text-gray-500 font-medium">Pricing</p>
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

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
            <Crown className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Professional AI Headshots
            </span>
          </div>
          
          <h1 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
            Choose Your <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Perfect Plan</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Get professional headshots in minutes. No contracts, no hidden fees. 
            Pay only for what you need.
          </p>

          {/* Stats */}
          <div className="flex justify-center items-center gap-8 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              <span>250,000+ users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span>Professional quality</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white border-2 rounded-2xl p-8 transition-all hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.credits}</span>
                  <span className="text-gray-600 ml-2">Credits</span>
                </div>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/studio"
                className={`block w-full text-center py-4 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>

        {/* All Plans Include */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            All Plans Include
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: 'How do credits work?',
                answer: 'Each AI headshot generation costs 1 credit. Credits never expire and can be used anytime.'
              },
              {
                question: 'Can I get a refund?',
                answer: 'Yes, we offer refunds within 7 days of purchase if you haven\'t used any credits.'
              },
              {
                question: 'What if I don\'t like my headshots?',
                answer: 'You can regenerate with different settings. Each generation uses 1 credit.'
              },
              {
                question: 'Are there any hidden fees?',
                answer: 'No hidden fees. Pay once and use your credits whenever you need headshots.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">{faq.question}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Create Professional Headshots?
          </h3>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of professionals who trust Deeplab-ai
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-6 h-6" />
            Start Creating Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PricingPage