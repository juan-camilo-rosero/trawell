'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '@/lib/firebase.config'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://trawell-yuxn.vercel.app'

interface Coordinates {
  lat: number
  lng: number
}

interface OriginCity {
  name: string
  coordinates: Coordinates
  placeId?: string
}

export interface UserData {
  _id: string
  firebaseUid: string
  email: string
  name: string
  hasCompletedOnboarding: boolean
  originCity?: OriginCity
  createdAt: string
  updatedAt: string
}

interface UserContextType {
  firebaseUser: FirebaseUser | null
  userData: UserData | null
  isLoading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
  updateUserData: (updates: Partial<UserData>) => void
  clearUserData: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async (firebaseUid: string): Promise<UserData | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users?firebaseUid=${firebaseUid}`
      )

      if (!response.ok) {
        throw new Error('Error al obtener datos del usuario')
      }

      const data = await response.json()

      if (data.success && data.data.users && data.data.users.length > 0) {
        return data.data.users[0]
      }

      return null
    } catch (err) {
      console.error('Error fetching user data:', err)
      throw err
    }
  }

  const refreshUserData = async () => {
    if (!firebaseUser) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchUserData(firebaseUser.uid)
      setUserData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserData = (updates: Partial<UserData>) => {
    if (userData) {
      setUserData({ ...userData, ...updates })
    }
  }

  const clearUserData = () => {
    setUserData(null)
    setError(null)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser)
      setIsLoading(true)

      if (currentUser) {
        try {
          const data = await fetchUserData(currentUser.uid)
          setUserData(data)
          setError(null)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar datos')
          setUserData(null)
        }
      } else {
        setUserData(null)
        setError(null)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value: UserContextType = {
    firebaseUser,
    userData,
    isLoading,
    error,
    refreshUserData,
    updateUserData,
    clearUserData,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider')
  }
  
  return context
}