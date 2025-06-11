/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #fff7ed 0%, #fef2f2 50%, #fdf2f8 100%)',
        'orange-gradient': 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        'stats-gradient': 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-in-left': 'slideInLeft 0.7s ease-out',
        'slide-in-right': 'slideInRight 0.7s ease-out',
        'bounce-in': 'bounceIn 0.8s ease-out',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(40px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(249, 115, 22, 0.6)' },
        },
        slideInLeft: {
          'from': { opacity: '0', transform: 'translateX(-30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'modern': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modern-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'modern-xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'orange-glow': '0 0 30px rgba(249, 115, 22, 0.3)',
        'orange-glow-lg': '0 0 60px rgba(249, 115, 22, 0.6)',
      }
    },
  },
  plugins: [],
  
  /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // ... keep all your existing theme config ...
    extend: {
      // ... keep all your existing colors, animations, etc. ...
    },
  },
  plugins: [],
  
  // ADD THIS SAFELIST SECTION TO FORCE GENERATE MISSING CLASSES
  safelist: [
    // Core layout classes
    'bg-white',
    'text-gray-900',
    'text-gray-600',
    'text-gray-700',
    'text-gray-500',
    'text-gray-400',
    'bg-gray-50',
    'bg-gray-100',
    'bg-gray-200',
    'border-gray-100',
    'border-gray-200',
    
    // Blue gradient classes
    'bg-gradient-to-r',
    'from-blue-500',
    'to-purple-600',
    'text-blue-600',
    'text-blue-400',
    'bg-blue-50',
    'border-blue-200',
    
    // Interactive classes
    'hover:shadow-xl',
    'hover:bg-blue-700',
    'hover:text-blue-300',
    'transform',
    'hover:-translate-y-0.5',
    'transition-all',
    'transition-colors',
    
    // Layout classes
    'rounded-xl',
    'rounded-2xl',
    'rounded-full',
    'shadow-lg',
    'font-bold',
    'font-semibold',
    'font-medium',
    
    // Generate all gray/blue/purple variations
    {
      pattern: /bg-(gray|blue|purple|green|red|yellow)-(50|100|200|300|400|500|600|700|800|900)/
    },
    {
      pattern: /text-(gray|blue|purple|green|red|yellow)-(50|100|200|300|400|500|600|700|800|900)/
    },
    {
      pattern: /border-(gray|blue|purple|green|red|yellow)-(50|100|200|300|400|500|600|700|800|900)/
    }
  ]
}
  
}