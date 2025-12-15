'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase.config';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

interface DeleteAccountProps {
  email?: string;
}

export function DeleteAccount({ email }: DeleteAccountProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { clearUserData } = useUser();

  const handleDeleteAccount = async () => {
    setError(null);

    if (!confirmText || confirmText !== 'DELETE MY ACCOUNT') {
      setError('You must type exactly "DELETE MY ACCOUNT" to confirm');
      return;
    }

    if (!password.trim()) {
      setError('You must enter your password to confirm');
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;

      if (!user || !email) {
        setError('User not found');
        return;
      }

      // Reauthenticate before deleting
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);

      // Call API to delete user data in MongoDB
      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Error deleting account in database');
      }

      // Delete user from Firebase
      await deleteUser(user);

      // Clear context
      clearUserData();

      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting account';

      if (errorMessage.includes('wrong-password')) {
        setError('Incorrect password');
      } else if (errorMessage.includes('requires-recent-login')) {
        setError('Please log in again before deleting your account');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary text-white"
      >
        Delete my account
      </Button>
    );
  }

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          {!confirmStep ? (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                ⚠️ Delete account
              </h2>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium mb-3">
                    This action is <strong>PERMANENT</strong> and <strong>IRREVERSIBLE</strong>
                  </p>
                  <ul className="text-xs text-red-700 space-y-2 list-disc list-inside">
                    <li>All your personal data will be deleted</li>
                    <li>All your trips and itineraries will be removed</li>
                    <li>Your preferences and settings will be lost</li>
                    <li>You will not be able to recover this information</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-700">
                  Do you really want to delete your account and all your data?
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setConfirmStep(false);
                    setPassword('');
                    setConfirmText('');
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmStep(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Confirm deletion
              </h2>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type &quot;DELETE MY ACCOUNT&quot; to confirm
                  </label>
                  <Input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="DELETE MY ACCOUNT"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be exact (uppercase)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmStep(false);
                    setPassword('');
                    setConfirmText('');
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={
                    isLoading ||
                    !password ||
                    confirmText !== 'DELETE MY ACCOUNT'
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Deleting...' : 'Delete account'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
