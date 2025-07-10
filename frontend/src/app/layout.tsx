import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./globals.css";
import { Toaster } from 'react-hot-toast'

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Sistema PH Colombia',
    description: 'Sistema integral de gestión para propiedades horizontales en Colombia',
    siteName: 'Sistema PH Colombia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema PH Colombia',
    description: 'Sistema integral de gestión para propiedades horizontales en Colombia',
    creator: '@phcolombia',
  },
  robots: {
    index: false, // No indexar en desarrollo
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-screen bg-gray-50">
          {/* Contenido principal */}
          <main className="min-h-screen">
            {children}
          </main>
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                maxWidth: '400px',
              },
              success: {
                style: {
                  background: '#10b981',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
              loading: {
                style: {
                  background: '#6b7280',
                },
              },
            }}
          />
        </div>
        
        {/* Scripts de desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log('%c🏗️ Sistema PH Colombia - Modo Desarrollo', 'color: #2563eb; font-size: 16px; font-weight: bold;');
                console.log('%cAPI URL: ${process.env.NEXT_PUBLIC_API_URL}', 'color: #059669;');
                console.log('%cVersión: ${process.env.NEXT_PUBLIC_APP_VERSION}', 'color: #059669;');
              `,
            }}
          />
        )}
      </body>
    </html>
  )
}
