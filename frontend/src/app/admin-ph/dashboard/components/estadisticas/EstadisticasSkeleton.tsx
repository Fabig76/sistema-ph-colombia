'use client'

export default function EstadisticasSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Resumen de métricas clave - Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-md p-3 bg-gray-200 h-12 w-12"></div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="ml-1 h-3 bg-gray-200 rounded w-2/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Gráfico de actividad - Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      
      {/* Gráficos de distribución - Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-60 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
