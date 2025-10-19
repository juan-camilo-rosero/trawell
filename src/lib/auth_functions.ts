'use client'
import { auth } from "./firebase.config";
import {
  GoogleAuthProvider,
  signInWithPopup,
  type User,
  type UserCredential,
} from "firebase/auth";

export const continueWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  
  try {
    const result: UserCredential = await signInWithPopup(auth, provider);
    // const credential = GoogleAuthProvider.credentialFromResult(result);
    // const token = credential?.accessToken;
    const user = result.user;
    
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error desconocido al iniciar sesión con Google');
  }
};