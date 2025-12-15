'use client'

import ProfileSettings from '@/components/dashboard/ProfileSettings'
import { SettingsMenu } from '@/components/dashboard/SettingsMenu'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Settings - Left side */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProfileSettings />
            </div>
          </div>

          {/* Additional Settings - Right side */}
          <div className="lg:col-span-2">
            <SettingsMenu />
          </div>
        </div>
      </div>
    </div>
  )
}