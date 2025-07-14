'use client'

export default function PerfilSkeleton() {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg animate-pulse">
      {/* Encabezado */}
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/4"></div>
      </div>
      
      {/* Contenido del formulario */}
      <div className="border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {/* Lado izquierdo */}
          <div className="px-4 py-5 sm:px-6">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
            
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
          
          {/* Lado derecho */}
          <div className="px-4 py-5 sm:px-6">
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              
              <div className="flex justify-end">
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
