'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase.config'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push('/sign-up')
      }
    })

    return () => unsubscribe()
  }, [router])

  // Mientras verifica la autenticación
  if (isAuthenticated === null) {
    return fallback || <AuthGuardLoader />
  }

  // Si no está autenticado (antes de redirigir)
  if (!isAuthenticated) {
    return fallback || <AuthGuardLoader />
  }

  // Usuario autenticado
  return <>{children}</>
}

function AuthGuardLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-200 border-t-primary" />
        <p className="text-muted-foreground">Verificando autenticación...</p>
      </div>
    </div>
  )
}