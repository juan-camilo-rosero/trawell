'use client';

import { useRouter } from 'next/navigation';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();

  const handleSaved = () => {
    // Opcional: redirigir después de guardar
    // router.push('/dashboard');
  };

  return (
    <AuthGuard>
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
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          </div>

          {/* Content */}
          <div className="max-w-2xl">
            <ProfileSettings onSaved={handleSaved} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
