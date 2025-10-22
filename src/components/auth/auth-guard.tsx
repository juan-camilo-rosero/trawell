'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase.config'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push('/sign-up')
      }
    })

    return () => unsubscribe()
  }, [router])

  // Mientras verifica la autenticación - muestra skeleton
  if (isAuthenticated === null) {
    return <AuthGuardSkeleton />
  }

  // Si no está autenticado - muestra skeleton mientras redirige
  if (!isAuthenticated) {
    return <AuthGuardSkeleton />
  }

  // Usuario autenticado - muestra el contenido
  return <>{children}</>
}

function AuthGuardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />

      {/* Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-32 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-32 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-32 rounded-lg bg-gray-200 animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  )
}