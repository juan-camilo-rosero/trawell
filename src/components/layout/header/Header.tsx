"use client";
import { useState } from "react";
import { RiMenu3Fill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const TRANSITION = { duration: 0.3, ease: "easeInOut" as const};

interface MenuButtonsProps {
  onClose?: () => void;
}

const MenuButtons = ({ onClose }: MenuButtonsProps) => (
  <>
    <Link href="/sign-up" className="w-full" onClick={onClose}>
      <Button className="secondary-btn w-full">Crear cuenta</Button>
    </Link>
    <Link href="/login" className="w-full" onClick={onClose}>
      <Button className="primary-btn w-full">Iniciar sesión</Button>
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
            src="static/logo.png"
            alt="Logo pinterest"
            className="w-auto h-8"
          />
          <h2 className="text-xl font-semibold text-muted-900">Trawell</h2>
        </Link>

        <button
          className="md:hidden"
          onClick={toggleMenu}
          aria-label="Abrir menú"
        >
          <RiMenu3Fill className="text-3xl text-muted-900" />
        </button>

        <div className="hidden md:flex flex-row items-center gap-6">
          <MenuButtons />
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={TRANSITION}
              onClick={closeMenu}
            />

            <motion.div
              className="fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-secondary-100 flex flex-col shadow-2xl z-50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={TRANSITION}
            >
              <div className="py-4 custom-ph flex justify-end">
                <button
                  onClick={closeMenu}
                  aria-label="Cerrar menú"
                  className="w-9 h-9 flex items-center justify-center"
                >
                  <IoClose className="text-3xl text-muted-900" />
                </button>
              </div>

              <div className="custom-ph pt-12 flex flex-col gap-3">
                <MenuButtons onClose={closeMenu} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;