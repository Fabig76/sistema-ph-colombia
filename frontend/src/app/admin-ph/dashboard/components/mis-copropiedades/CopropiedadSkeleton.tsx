'use client'

export default function CopropiedadSkeleton() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 animate-pulse">
      {/* Encabezado */}
      <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
        <div className="w-full">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
      
      {/* Cuerpo */}
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
          <div className="sm:col-span-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          <div className="sm:col-span-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          
          <div className="sm:col-span-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
      
      {/* Pie */}
      <div className="px-4 py-4 sm:px-6 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}
