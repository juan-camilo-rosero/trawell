"use client";
import Header from "@/components/layout/header/Header";
import CustomInput from "@/components/ui/custom_input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { continueWithGoogle, signUpWithEmail } from "@/lib/auth_functions";

// Constantes
const ERROR_MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Ventana de inicio de sesión cerrada",
  "auth/cancelled-popup-request": "Inicio de sesión cancelado",
  "auth/popup-blocked": "Ventana emergente bloqueada por el navegador",
  "auth/network-request-failed": "Error de conexión. Verifica tu internet",
  "auth/internal-error": "Error interno. Intenta nuevamente",
  "auth/unauthorized-domain": "Dominio no autorizado",
  "auth/invalid-email": "Email inválido",
  "auth/email-already-in-use": "Ya existe una cuenta con este email",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
  "auth/operation-not-allowed": "Operación no permitida",
  "auth/missing-credentials": "Email y contraseña son requeridos",
  "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
  default: "Error al crear cuenta",
};

function Page() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showVerificationMessage, setShowVerificationMessage] = useState<boolean>(false);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const errorCode = error.message.match(/auth\/[\w-]+/)?.[0];
      return errorCode && ERROR_MESSAGES[errorCode]
        ? ERROR_MESSAGES[errorCode]
        : ERROR_MESSAGES.default;
    }
    return ERROR_MESSAGES.default;
  };

  const validateForm = (): boolean => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Por favor completa todos los campos");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    return true;
  };

  const handleGoogleSignUp = async (): Promise<void> => {
    setIsLoading(true);
    setError("");

    try {
      await continueWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (): Promise<void> => {
    setError("");
    setShowVerificationMessage(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUpWithEmail(email, password);
      
      // Siempre mostramos el mensaje de verificación ya que needsVerification siempre es true
      if (result.needsVerification) {
        setShowVerificationMessage(true);
        setIsLoading(false);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !isLoading) {
      handleEmailSignUp();
    }
  };

  if (showVerificationMessage) {
    return (
      <>
        <div className="md:hidden">
          <Header />
        </div>
        <div className="bg-secondary-200 md:bg-secondary-100 min-h-screen flex">
          <div className="w-full hidden lg:flex bg-secondary-200"></div>
          <div className="w-screen custom-ph flex items-center justify-center flex-col pt-16 lg:pt-0 min-h-screen md:max-w-xl md:mx-auto lg:w-1/2 bg-secondary-100">
            <div className="w-full max-w-md">
              <div className="bg-secondary-100 rounded-lg p-6">
                <div className="text-center mb-4">
                  <img src="static/logo.png" alt="Logo Trawell" className="h-16 mb-8 w-auto mx-auto"/>
                  <h2 className="text-2xl font-semibold text-muted-900 mb-2">
                    ¡Cuenta creada!
                  </h2>
                  <p className="text-muted-500 mb-4">
                    Hemos enviado un correo de verificación a:
                  </p>
                  <p className="font-semibold text-muted-900 mb-4 text-lg">{email}</p>
                  <p className="text-sm text-muted-500">
                    Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta. <span className="text-muted-900 font-semibold">Posiblemente llegue a spam jajan&apos;t :(</span>
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/login">
                  <Button className="primary-btn text-xl !h-auto !py-3 md:text-base w-full">
                    Ir a inicio de sesión
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="md:hidden">
        <Header />
      </div>
      <div className="bg-secondary-200 md:bg-secondary-100 min-h-screen flex">
        <div className="w-full hidden lg:flex bg-secondary-200"></div>
        <div className="w-screen custom-ph flex items-center justify-center flex-col pt-16 lg:pt-0 min-h-screen md:max-w-xl md:mx-auto lg:w-1/2 bg-secondary-100">
          <div className="w-full">
            <Link href="/" className="flex justify-center">
              <img
                src="static/logo.png"
                alt="Logo Trawell"
                className="h-16 w-auto hidden md:flex cursor-pointer"
              />
            </Link>
            <h1 className="text-muted-900 font-semibold text-3xl text-center lg:mt-4">
              Crea tu cuenta
            </h1>
            <h2 className="text-muted-500 mt-4 font-medium text-base text-center">
              Completa tus datos para comenzar
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
            <CustomInput
              type="password"
              placeholder="Contraseña"
              value={password}
              setValue={setPassword}
              onKeyPress={handleKeyPress}
            />
            <CustomInput
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              setValue={setConfirmPassword}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="w-full flex flex-col gap-4 mt-12 lg:mt-8">
            <Button
              className="primary-btn text-xl !h-auto !py-3 md:text-base"
              onClick={handleEmailSignUp}
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
            <Button
              className="third-btn text-xl !h-auto !py-3 md:text-base gap-4 flex items-center justify-center"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <FcGoogle size={24} />
              Continuar con Google
            </Button>
          </div>

          {error && (
            <p className="text-primary text-sm mt-4 text-center">
              {error}
            </p>
          )}

          <Link
            href="/signup"
            className="underline text-muted-500 mt-12 md:mt-8"
          >
            ¿Ya tienes una cuenta?
          </Link>
        </div>
      </div>
    </>
  );
}

export default Page;