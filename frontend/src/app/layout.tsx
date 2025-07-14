import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/hooks/useAuth'
import DevScript from '@/components/DevScript'
import ClientOnly from '@/components/ClientOnly'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Sistema PH Colombia',
    template: '%s | Sistema PH Colombia'
  },
  description: 'Sistema integral de gestión para propiedades horizontales en Colombia. Administra conjuntos residenciales, genera paz y salvos, y gestiona propietarios de manera eficiente.',
  keywords: [
    'propiedad horizontal',
    'administración',
    'conjuntos residenciales',
    'paz y salvo',
    'Colombia',
    'copropiedades'
  ],
  authors: [{ name: 'Sistema PH Colombia' }],
  creator: 'Sistema PH Colombia',
  publisher: 'Sistema PH Colombia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sistema-ph-colombia.com'),
  openGraph: {
    title: 'Sistema PH Colombia',
    description: 'Sistema integral de gestión para propiedades horizontales en Colombia',
    url: 'https://sistema-ph-colombia.com',
    siteName: 'Sistema PH Colombia',
    locale: 'es_CO',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientOnly
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg">Cargando aplicación...</p>
              </div>
            </div>
          }
        >
          <AuthProvider>
            {children}
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                  style: {
                    background: '#10b981',
                    color: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                  style: {
                    background: '#ef4444',
                    color: '#ffffff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ClientOnly>
        <DevScript />
      </body>
    </html>
  )
}
