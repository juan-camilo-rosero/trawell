'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase.config'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true)
        
        if (pathname !== '/dashboard/onboarding') {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/onboarding?firebaseUid=${currentUser.uid}`
            )
            
            if (response.ok) {
              const data = await response.json()
              
              if (data.success && !data.data.hasCompletedOnboarding) {
                router.push('/dashboard/onboarding')
              }
            } else {
              console.error('Error checking onboarding status:', response.status)
            }
          } catch (error) {
            console.error('Error checking onboarding:', error)
          } finally {
            setIsCheckingOnboarding(false)
          }
        } else {
          setIsCheckingOnboarding(false)
        }
      } else {
        setIsAuthenticated(false)
        setIsCheckingOnboarding(false)
        router.push('/sign-up')
      }
    })

    return () => unsubscribe()
  }, [router, pathname])

  if (isAuthenticated === null || isCheckingOnboarding) {
    return <AuthGuardSkeleton />
  }

  if (!isAuthenticated) {
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