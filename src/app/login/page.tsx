"use client";
import Header from "@/components/layout/header/Header";
import CustomInput from "@/components/ui/custom_input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { continueWithGoogle } from "@/lib/auth_functions";

// Tipos
/*interface AuthError {
  message: string;
}*/

// Constantes
const ERROR_MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Ventana de inicio de sesión cerrada",
  "auth/cancelled-popup-request": "Inicio de sesión cancelado",
  "auth/popup-blocked": "Ventana emergente bloqueada por el navegador",
  "auth/network-request-failed": "Error de conexión. Verifica tu internet",
  "auth/internal-error": "Error interno. Intenta nuevamente",
  "auth/unauthorized-domain": "Dominio no autorizado",
  default: "Error al iniciar sesión con Google",
};

function Page() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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
    // Implementar lógica de inicio de sesión con email
    console.log("Email sign in", { email, password });
  };

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
              Bienvenido de vuelta
            </h1>
            <h2 className="text-muted-500 mt-4 font-medium text-base text-center">
              Ingresa tus credenciales
            </h2>
          </div>
          <div className="w-full flex flex-col gap-6 mt-12 lg:mt-4">
            <CustomInput
              type="text"
              placeholder="Email"
              value={email}
              setValue={setEmail}
            />
            <div>
              <CustomInput
                type="password"
                placeholder="Contraseña"
                value={password}
                setValue={setPassword}
              />
              <div className="text-muted-500 font-medium text-right mt-4 underline md:text-base lg:text-sm">
                <Link href="/reset-password" className="w-auto">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-4 mt-12 lg:mt-8">
            <Button
              className="primary-btn text-xl !h-auto !py-3 md:text-base"
              onClick={handleEmailSignIn}
              disabled={isLoading}
            >
              Iniciar sesión
            </Button>
            <Button
              className="third-btn text-xl !h-auto !py-3 md:text-base gap-4 flex items-center justify-center"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <FcGoogle size={24} />
              {isLoading ? "Iniciando sesión..." : "Continuar con Google"}
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
            ¿No tienes una cuenta?
          </Link>
        </div>
      </div>
    </>
  );
}

export default Page;