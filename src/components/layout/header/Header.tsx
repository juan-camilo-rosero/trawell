"use client";
import { useState } from "react";
import { RiMenu3Fill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const MENU_ANIMATION = {
  hidden: { x: "100%" },
  visible: { x: "0%" },
  exit: { x: "100%" },
};

const OVERLAY_ANIMATION = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const TRANSITION = {
  type: "spring" as const,
  damping: 25,
  stiffness: 300,
};

interface MenuButtonsProps {
  onClose?: () => void;
}

const MenuButtons = ({ onClose }: MenuButtonsProps) => (
  <>
    <Link href="/sign-up" className="w-full" onClick={onClose}>
      <Button className="secondary-btn w-full">
        Crear cuenta
      </Button>
    </Link>
    <Link href="/login" className="w-full" onClick={onClose}>
      <Button className="primary-btn w-full">
        Iniciar sesión
      </Button>
    </Link>
  </>
);

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-secondary-100 py-4 custom-ph w-screen fixed flex flex-row items-center justify-between lg:py-3 z-30">
      <div className="w-full flex flex-row items-center justify-between">
        <Link href="/" className="flex flex-row items-center gap-2 cursor-pointer">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png"
            alt="Logo pinterest"
            className="w-8 h-8"
          />
          <h2 className="text-xl font-semibold text-muted-900">Trawell</h2>
        </Link>

        {/* Botón de menú en mobile */}
        <button
          className="md:hidden"
          onClick={toggleMenu}
          aria-label="Abrir menú"
        >
          <RiMenu3Fill className="text-3xl text-muted-900" />
        </button>

        {/* Botones en desktop */}
        <div className="hidden md:flex flex-row items-center gap-6">
          <MenuButtons />
        </div>
      </div>

      {/* Overlay y panel mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              variants={OVERLAY_ANIMATION}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={TRANSITION}
              onClick={closeMenu}
            />

            {/* Contenedor para evitar overflow */}
            <div className="fixed top-0 right-0 h-screen w-80 max-w-[85vw] z-50 overflow-hidden">
              {/* Panel lateral - más ancho para compensar el rebote */}
              <motion.div
                className="h-full bg-secondary-100 flex flex-col shadow-2xl"
                style={{ width: "110%" }}
                variants={MENU_ANIMATION}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={TRANSITION}
              >
                <div
                  className="h-full flex flex-col"
                  style={{ width: "90.91%" }}
                >
                  {/* Header del panel */}
                  <div className="py-4 custom-ph flex justify-end">
                    <button
                      onClick={closeMenu}
                      aria-label="Cerrar menú"
                      className="w-[36px] h-[36px] flex items-center justify-center"
                    >
                      <IoClose className="text-3xl text-muted-900" />
                    </button>
                  </div>

                  {/* Espaciador */}
                  <div className="flex-1" />

                  {/* Botones en la parte inferior */}
                  <div className="custom-ph pb-12 flex flex-col gap-3">
                    <MenuButtons onClose={closeMenu} />
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;