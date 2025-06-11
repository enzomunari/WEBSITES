'use client'

import { useState, useEffect } from 'react'

interface ClientWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default ClientWrapper