'use client'

import React, { Suspense } from 'react'
import { PropietariosFlow } from '@/components/features/propietarios/PropietariosFlow'
import { PropertySkeleton } from '@/components/ui'

export default function PropietariosPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 max-w-3xl mx-auto p-6">
        <PropertySkeleton />
        <PropertySkeleton />
        <PropertySkeleton />
      </div>
    }>
      <PropietariosFlow />
    </Suspense>
  )
}
