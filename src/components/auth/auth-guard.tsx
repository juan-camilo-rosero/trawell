// @/components/auth/auth-guard.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { firebaseUser, userData, isLoading } = useUser()
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)

  useEffect(() => {
    // Esperar a que termine de cargar
    if (isLoading) {
      return
    }

    // Si no hay usuario autenticado, redirigir a sign-up
    if (!firebaseUser) {
      setIsCheckingOnboarding(false)
      router.push('/sign-up')
      return
    }

    // Si ya tenemos datos del usuario
    if (userData) {
      // Si estamos en la página de onboarding y SÍ ha completado el onboarding
      // redirigir al dashboard
      if (pathname === '/dashboard/onboarding' && userData.hasCompletedOnboarding) {
        router.push('/dashboard')
        setIsCheckingOnboarding(false)
        return
      }
      
      // Si NO está en la página de onboarding y NO ha completado el onboarding
      // redirigir al onboarding
      if (pathname !== '/dashboard/onboarding' && !userData.hasCompletedOnboarding) {
        router.push('/dashboard/onboarding')
        setIsCheckingOnboarding(false)
        return
      }
      
      setIsCheckingOnboarding(false)
    } else {
      // Si no hay datos del usuario pero está autenticado, algo salió mal
      console.error('Usuario autenticado pero sin datos en la BD')
      setIsCheckingOnboarding(false)
    }
  }, [firebaseUser, userData, isLoading, pathname, router])

  // Mostrar skeleton mientras se cargan los datos
  if (isLoading || isCheckingOnboarding) {
    return <AuthGuardSkeleton />
  }

  // Mostrar skeleton si no hay usuario
  if (!firebaseUser) {
    return <AuthGuardSkeleton />
  }

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