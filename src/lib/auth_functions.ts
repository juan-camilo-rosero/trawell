'use client'
import { auth } from "./firebase.config";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  type User,
  type UserCredential,
} from "firebase/auth";

// Tipos
export interface AuthResult {
  user: User;
  needsVerification: boolean;
}

// Errores personalizados
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Validaciones
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  return { isValid: true };
};

// Funciones de autenticación
export const continueWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
 
  try {
    const result: UserCredential = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error desconocido al iniciar sesión con Google');
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  // Validaciones
  if (!email || !password) {
    throw new AuthError('Email y contraseña son requeridos', 'auth/missing-credentials');
  }

  if (!validateEmail(email)) {
    throw new AuthError('Email inválido', 'auth/invalid-email');
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new AuthError(passwordValidation.message!, 'auth/weak-password');
  }

  try {
    const result: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = result.user;

    // Enviar verificación de email automáticamente
    await sendEmailVerification(user);

    return {
      user,
      needsVerification: true
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error desconocido al crear cuenta');
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  // Validaciones
  if (!email || !password) {
    throw new AuthError('Email y contraseña son requeridos', 'auth/missing-credentials');
  }

  if (!validateEmail(email)) {
    throw new AuthError('Email inválido', 'auth/invalid-email');
  }

  try {
    const result: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = result.user;

    // Verificar si el email está verificado
    if (!user.emailVerified) {
      throw new AuthError(
        'auth/email-not-verified',
        'auth/email-not-verified'
      );
    }

    return user;
  } catch (error) {
    // Si es nuestro error personalizado de email no verificado, lo lanzamos tal cual
    if (error instanceof AuthError && error.code === 'auth/email-not-verified') {
      throw error;
    }
    
    // Para otros errores, mantenemos el comportamiento original
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error desconocido al iniciar sesión');
  }
};

export const resendVerificationEmail = async (): Promise<void> => {
  const user = auth.currentUser;

  if (!user) {
    throw new AuthError('No hay usuario autenticado', 'auth/no-current-user');
  }

  if (user.emailVerified) {
    throw new AuthError('El email ya está verificado', 'auth/email-already-verified');
  }

  try {
    await sendEmailVerification(user);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error al reenviar email de verificación');
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error desconocido al cerrar sesión');
  }
};