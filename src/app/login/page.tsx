"use client";
import Header from "@/components/layout/header/Header";
import CustomInput from "@/components/ui/custom_input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Link from "next/link";

function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            <Button className="primary-btn text-xl !h-auto !py-3 md:text-base">
              Iniciar sesión
            </Button>
            <Button className="third-btn text-xl !h-auto !py-3 md:text-base gap-4 flex items-center justify-center">
              <FcGoogle size={24} />
              Continuar con Google
            </Button>
          </div>
          <Link href="/signup" className="underline text-muted-500 mt-12 md:mt-8">
            ¿No tienes una cuenta?
          </Link>
        </div>
      </div>
    </>
  );
}

export default Page;
