import { IUser } from '@/models/user/User';

export interface UpdateProfileData {
  name?: string;
  profileImage?: string;
}

/**
 * Actualiza el perfil del usuario (nombre e imagen)
 */
export async function updateUserProfile(
  firebaseUid: string,
  data: UpdateProfileData
): Promise<IUser> {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebaseUid,
        ...data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar el perfil');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Convierte una imagen a base64 para almacenarla
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Valida que el archivo sea una imagen
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('El archivo debe ser una imagen (JPG, PNG, WebP o GIF)');
  }

  if (file.size > maxSize) {
    throw new Error('La imagen no debe exceder 5MB');
  }

  return true;
}
