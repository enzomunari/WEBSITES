'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  Sparkles, 
  Camera,
  Zap,
  Star,
  Users,
  Award,
  Shield,
  Clock,
  User,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'

const DeeplabLandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showProductsMenu, setShowProductsMenu] = useState(false)
  const [showResourcesMenu, setShowResourcesMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Before/After images data - CHANGE THESE TO YOUR BEST EXAMPLES
  const beforeAfterImages = [
    {
      before: '/images/c.jpg',
      after: '/images/c1.jpg',
      name: 'Professional',
      beforeGradient: 'linear-gradient(to bottom right, #e5e7eb, #9ca3af)',
      afterGradient: 'linear-gradient(to bottom right, #3b82f6, #1e40af)'
    },
    {
      before: '/images/j.jpg',
      after: '/images/j4.jpg',
      name: 'Executive',
      beforeGradient: 'linear-gradient(to bottom right, #e7e5e4, #a8a29e)',
      afterGradient: 'linear-gradient(to bottom right, #8b5cf6, #7c3aed)'
    },
    {
      before: '/images/m.jpg',
      after: '/images/m1.jpg',
      name: 'Corporate',
      beforeGradient: 'linear-gradient(to bottom right, #e2e8f0, #94a3b8)',
      afterGradient: 'linear-gradient(to bottom right, #06b6d4, #0891b2)'
    },
    {
      before: '/images/l.jpg',
      after: '/images/l5.jpg',
      name: 'Casual',
      beforeGradient: 'linear-gradient(to bottom right, #e5e5e5, #a3a3a3)',
      afterGradient: 'linear-gradient(to bottom right, #10b981, #059669)'
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechFlow",
      avatar: "linear-gradient(to bottom right, #3b82f6, #1e40af)",
      text: "Amazing quality headshots that transformed my LinkedIn profile. The AI captured details I never expected.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez", 
      role: "Startup Founder",
      company: "InnovateX",
      avatar: "linear-gradient(to bottom right, #8b5cf6, #7c3aed)",
      text: "Saved thousands on professional photography. Our entire team now has consistent, high-quality headshots.",
      rating: 5
    },
    {
      name: "Jennifer Kim",
      role: "Creative Director",
      company: "DesignStudio",
      avatar: "linear-gradient(to bottom right, #06b6d4, #0891b2)",
      text: "The variety of styles and backgrounds is incredible. Perfect for different brand personalities.",
      rating: 5
    }
  ]

  useEffect(() => {
    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 6000)

    return () => {
      clearInterval(testimonialInterval)
    }
  }, [testimonials.length])

  const stats = [
    { number: "250K+", label: "Happy Users", icon: <Users className="w-6 h-6" /> },
    { number: "1M+", label: "Photos Generated", icon: <Camera className="w-6 h-6" /> },
    { number: "99%", label: "Satisfaction Rate", icon: <Star className="w-6 h-6" /> },
    { number: "2min", label: "Average Time", icon: <Clock className="w-6 h-6" /> }
  ]

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered",
      description: "Advanced neural networks create photorealistic professional headshots",
      gradient: "linear-gradient(to bottom right, #3b82f6, #1d4ed8)"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Generate multiple professional headshots in under 2 minutes",
      gradient: "linear-gradient(to bottom right, #8b5cf6, #7c3aed)"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your photos are processed securely and deleted after generation",
      gradient: "linear-gradient(to bottom right, #06b6d4, #0891b2)"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Professional Quality",
      description: "Studio-quality results trusted by professionals worldwide",
      gradient: "linear-gradient(to bottom right, #10b981, #059669)"
    }
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        borderBottom: '1px solid #f3f4f6', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <Sparkles style={{ width: '22px', height: '22px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>Deeplab.ai</h1>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden md:flex">
              {/* Products Dropdown */}
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowProductsMenu(true)}
                onMouseLeave={() => setShowProductsMenu(false)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#374151', cursor: 'pointer', padding: '8px 0' }}>
                  <span style={{ fontWeight: '500' }}>Products</span>
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                </div>
                {showProductsMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    padding: '8px',
                    minWidth: '200px',
                    zIndex: 100
                  }}>
                    <Link href="/studio" style={{
                      display: 'block',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#374151',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>Pro Headshot Avatar</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Professional AI-generated headshots</div>
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/pricing" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Pricing</Link>

              {/* Resources Dropdown */}
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowResourcesMenu(true)}
                onMouseLeave={() => setShowResourcesMenu(false)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#374151', cursor: 'pointer', padding: '8px 0' }}>
                  <span style={{ fontWeight: '500' }}>Resources</span>
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                </div>
                {showResourcesMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    padding: '8px',
                    minWidth: '180px',
                    zIndex: 100
                  }}>
                    <Link href="/help" style={{
                      display: 'block',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#374151',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                    >Help</Link>
                    <Link href="/terms" style={{
                      display: 'block',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#374151',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                    >Terms of Service</Link>
                    <Link href="/privacy" style={{
                      display: 'block',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#374151',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                    >Data Privacy Policy</Link>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '24px' }}>
                <Link href="/studio" style={{ 
                  background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
                  color: 'white', 
                  padding: '10px 24px', 
                  borderRadius: '12px', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  Create Headshots
                </Link>
              </div>
            </nav>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer' }}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div style={{ 
              display: 'block',
              padding: '16px 0',
              borderTop: '1px solid #e5e7eb'
            }} className="md:hidden">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link href="/studio" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Products</Link>
                <Link href="/studio" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Examples</Link>
                <Link href="/pricing" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Pricing</Link>
                <Link href="/help" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Help</Link>
                <Link href="/studio" style={{ 
                  background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '12px', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  textAlign: 'center',
                  marginTop: '8px'
                }}>
                  Create Headshots
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
        paddingTop: '80px', 
        paddingBottom: '80px' 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', color: '#111827' }}>
              Professional <span style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Headshots</span><br />
              in Minutes
            </h1>
            
            <p style={{ fontSize: '20px', color: '#4b5563', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto 40px' }}>
              Transform your photos into professional headshots with our advanced AI technology. Perfect for LinkedIn, resumes, and business profiles.
            </p>

            <Link href="/studio" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
              color: 'white', 
              padding: '16px 32px', 
              borderRadius: '16px', 
              fontWeight: '700', 
              fontSize: '18px', 
              textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
              marginBottom: '48px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
            >
              Create Your Headshots
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </Link>
          </div>

          {/* Before/After Gallery */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {beforeAfterImages.map((item, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>Before</div>
                  <div style={{ 
                    aspectRatio: '3/4', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                    overflow: 'hidden',
                    border: '2px solid #e5e7eb'
                  }}>
                    <Image 
                      src={item.before} 
                      alt={`Original photo ${index + 1}`}
                      width={400}
                      height={533}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) nextElement.style.display = 'flex';
                      }}
                    />
                    <div style={{ 
                      display: 'none',
                      width: '100%', 
                      height: '100%', 
                      background: item.beforeGradient, 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <User style={{ width: '32px', height: '32px', color: 'rgba(255, 255, 255, 0.5)' }} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500', marginBottom: '8px' }}>After</div>
                  <div style={{ 
                    aspectRatio: '3/4', 
                    borderRadius: '16px', 
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)', 
                    position: 'relative',
                    overflow: 'hidden',
                    border: '2px solid #3b82f6',
                    marginBottom: '8px'
                  }}>
                    <Image 
                      src={item.after} 
                      alt={`AI generated professional headshot ${index + 1}`}
                      width={400}
                      height={533}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) nextElement.style.display = 'flex';
                      }}
                    />
                    <div style={{ 
                      display: 'none',
                      width: '100%', 
                      height: '100%', 
                      background: item.afterGradient, 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <User style={{ width: '32px', height: '32px', color: 'white' }} />
                    </div>
                    <div style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      left: '8px', 
                      backgroundColor: 'rgba(59, 130, 246, 0.9)', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '6px', 
                      fontSize: '10px', 
                      fontWeight: '600' 
                    }}>
                      AI
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', color: '#111827' }}>
              Why Choose Deeplab-ai?
            </h2>
            <p style={{ fontSize: '18px', color: '#4b5563', maxWidth: '600px', margin: '0 auto' }}>
              Advanced AI technology that delivers professional results in minutes
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {features.map((feature, index) => (
              <div 
                key={index} 
                style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #f3f4f6', 
                  borderRadius: '20px', 
                  padding: '32px 24px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.target as HTMLElement).style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  background: feature.gradient, 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 20px',
                  color: 'white'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#111827' }}>{feature.title}</h3>
                <p style={{ color: '#6b7280', lineHeight: '1.5', fontSize: '15px' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#3b82f6' }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>
                  {stat.number}
                </div>
                <div style={{ color: '#6b7280', fontWeight: '500' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', color: '#111827' }}>
              Trusted by Professionals
            </h2>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '20px', 
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} style={{ width: '20px', height: '20px', color: '#fbbf24', fill: 'currentColor' }} />
                ))}
              </div>
              
              <blockquote style={{ fontSize: '20px', fontWeight: '500', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
                &quot;{testimonials[currentTestimonial].text}&quot;
              </blockquote>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  background: testimonials[currentTestimonial].avatar, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <User style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{testimonials[currentTestimonial].name}</div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', gap: '8px' }}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  style={{
                    width: index === currentTestimonial ? '32px' : '12px',
                    height: '12px',
                    borderRadius: '6px',
                    background: index === currentTestimonial 
                      ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' 
                      : '#d1d5db',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', lineHeight: '1.2', color: '#111827' }}>
            Ready to Create Your Professional Headshots?
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
            Join thousands of professionals who trust Deeplab-ai
          </p>
          
          <Link href="/studio" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px', 
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
            color: 'white', 
            padding: '16px 32px', 
            borderRadius: '16px', 
            fontWeight: '700', 
            fontSize: '18px', 
            textDecoration: 'none',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
          >
            <Sparkles style={{ width: '20px', height: '20px' }} />
            Start Creating
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '48px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Sparkles style={{ width: '18px', height: '18px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Deeplab-ai</h3>
              </div>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', fontSize: '14px' }}>
                Professional AI headshot generator trusted by thousands worldwide.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', color: 'white' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/studio" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>AI Headshots</Link>
                <Link href="/pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Pricing</Link>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', color: 'white' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/help" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Help Center</Link>
                <Link href="/terms" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</Link>
                <Link href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #374151', marginTop: '32px', paddingTop: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            <p>&copy; 2024 Deeplab-ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DeeplabLandingPage