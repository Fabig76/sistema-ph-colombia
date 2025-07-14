'use client'

import { useEffect } from 'react'

export default function DevScript() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('%c🏗️ Sistema PH Colombia - Modo Desarrollo', 'color: #2563eb; font-size: 16px; font-weight: bold;')
      console.log('%cAPI URL: ' + process.env.NEXT_PUBLIC_API_URL, 'color: #059669;')
      console.log('%cVersión: ' + process.env.NEXT_PUBLIC_APP_VERSION, 'color: #059669;')
    }
  }, [])

  return null
}
