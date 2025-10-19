"use client";
import Header from "@/components/layout/header/Header";
import CustomInput from "@/components/ui/custom_input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  continueWithGoogle,
  signInWithEmail,
  resendVerificationEmail,
} from "@/lib/auth_functions";

// Constantes
const ERROR_MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Ventana de inicio de sesión cerrada",
  "auth/cancelled-popup-request": "Inicio de sesión cancelado",
  "auth/popup-blocked": "Ventana emergente bloqueada por el navegador",
  "auth/network-request-failed": "Error de conexión. Verifica tu internet",
  "auth/internal-error": "Error interno. Intenta nuevamente",
  "auth/unauthorized-domain": "Dominio no autorizado",
  "auth/invalid-email": "Email inválido",
  "auth/user-disabled": "Esta cuenta ha sido deshabilitada",
  "auth/user-not-found": "No existe una cuenta con este email",
  "auth/wrong-password": "Contraseña incorrecta",
  "auth/invalid-credential": "Credenciales inválidas",
  "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
  "auth/missing-credentials": "Email y contraseña son requeridos",
  "auth/email-not-verified":
    "Por favor verifica tu email antes de iniciar sesión",
  default: "Error al iniciar sesión",
};

function Page() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResendingEmail, setIsResendingEmail] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showUnverifiedMessage, setShowUnverifiedMessage] =
    useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const errorCode = error.message.match(/auth\/[\w-]+/)?.[0];
      return errorCode && ERROR_MESSAGES[errorCode]
        ? ERROR_MESSAGES[errorCode]
        : ERROR_MESSAGES.default;
    }
    return ERROR_MESSAGES.default;
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    setError("");
    setShowUnverifiedMessage(false);

    try {
      await continueWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    setError("");
    setShowUnverifiedMessage(false);
    setResendSuccess(false);

    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch (error: unknown) {
      const authError = error as { code?: string };
      if (authError.code === "auth/email-not-verified") {
        setShowUnverifiedMessage(true);
        setError("Tu email aún no ha sido verificado");
      } else {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
      }

      setIsLoading(false);
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    setIsResendingEmail(true);
    setResendSuccess(false);
    setError("");

    try {
      await resendVerificationEmail();
      setResendSuccess(true);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !isLoading) {
      handleEmailSignIn();
    }
  };

  return (
    <>
      <div className="md:hidden">
        <Header />
      </div>
      <div className="bg-secondary-200 md:bg-secondary-100 min-h-screen flex">
        <div className="w-full hidden lg:flex bg-secondary-200"></div>
        <div className="w-screen custom-ph flex items-center justify-center flex-col pt-16 min-h-screen md:max-w-xl md:mx-auto lg:w-1/2 bg-secondary-100 lg:py-8">
          <div className="w-full">
            <Link href="/" className="flex justify-center">
              <img
                src="static/logo.png"
                alt="Logo Trawell"
                className="h-16 w-auto hidden md:flex cursor-pointer"
              />
            </Link>
            <h1 className="text-muted-900 font-semibold text-3xl text-center lg:mt-4">
              Bienvenido de vuelta
            </h1>
            <h2 className="text-muted-500 mt-4 font-medium text-base text-center">
              Ingresa tus credenciales
            </h2>
          </div>
          <div className="w-full flex flex-col gap-6 mt-12 lg:mt-4">
            <CustomInput
              type="email"
              placeholder="Email"
              value={email}
              setValue={setEmail}
              onKeyPress={handleKeyPress}
            />
            <div>
              <CustomInput
                type="password"
                placeholder="Contraseña"
                value={password}
                setValue={setPassword}
                onKeyPress={handleKeyPress}
              />
              <div className="text-muted-500 font-medium text-right mt-4 underline md:text-base lg:text-sm">
                <Link href="/reset-password" className="w-auto">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
          </div>

          {/* Mensaje de email no verificado */}
          {showUnverifiedMessage && (
            <div className="w-full mt-6 bg-secondary-100 border border-secondary-300 rounded-lg p-4">
              <p className="text-sm text-primary mb-3 text-center font-semibold">
                Debes verificar tu email antes de iniciar sesión
              </p>
              <p className="text-xs text-muted-500 mb-3 text-center">
                Revisa tu bandeja de entrada y haz clic en el enlace de
                verificación
              </p>
              {resendSuccess ? (
                <p className="text-sm text-muted-900 text-center font-semibold">
                  Email reenviado correctamente
                </p>
              ) : (
                <Button
                  className="primary-btn w-full"
                  onClick={handleResendVerification}
                  disabled={isResendingEmail}
                >
                  {isResendingEmail
                    ? "Reenviando..."
                    : "Reenviar email de verificación"}
                </Button>
              )}
            </div>
          )}

          <div className="w-full flex flex-col gap-4 mt-12 lg:mt-8">
            <Button
              className="primary-btn text-xl !h-auto !py-3 md:text-base"
              onClick={handleEmailSignIn}
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
            <Button
              className="third-btn text-xl !h-auto !py-3 md:text-base gap-4 flex items-center justify-center"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <FcGoogle size={24} />
              Continuar con Google
            </Button>
          </div>

          {error && !showUnverifiedMessage && (
            <p className="text-primary text-sm mt-4 text-center">{error}</p>
          )}

          <Link
            href="/sign-up"
            className="underline text-muted-500 mt-12 md:mt-8"
          >
            ¿No tienes una cuenta?
          </Link>
        </div>
      </div>
    </>
  );
}

export default Page;
