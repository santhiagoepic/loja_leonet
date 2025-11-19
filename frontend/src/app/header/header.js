"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../providers/auth-context";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Animação para os itens do menu
  const itemVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 }
  };

  // Animação para o menu mobile
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        staggerChildren: 0.1,
        staggerDirection: 1
      }
    }
  };

  return (
    <header className="border-b-4 border-orange-500 bg-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo aumentada e mais destacada */}
          <div className="relative h-16 w-20 flex-shrink-0 sm:h-24 sm:w-28">
            <Image
              src="/leonetlogo.png"
              alt="Leonete Modas"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>

          {/* Navegação desktop - centralizada e com melhor espaçamento */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/" text="Home" />
            <NavLink href="/masculino" text="Masculino" />
            <NavLink href="/feminino" text="Feminino" />
            <NavLink href="/infantil" text="Infantil" />
            <NavLink href="/acessorios" text="Acessórios" />
            <NavLink href="/contato" text="Contato" />
            <NavLink href="/suporte" text="Suporte" />
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/conta"
                  className="flex items-center gap-2 rounded-lg border border-orange-500 px-3 py-1 text-sm font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white"
                >
                  <User className="h-4 w-4" />
                  Minha conta
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-lg border border-orange-500 px-3 py-1 text-sm font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Link>
            )}
          </nav>

          {/* Botão do menu hamburguer - versão mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none transition-all duration-300 hover:bg-orange-500 hover:text-white p-2 rounded-lg"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X size={28} />
              ) : (
                <Menu size={28} />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile com animação melhorada */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="md:hidden overflow-hidden bg-white rounded-lg shadow-xl mt-4"
            >
              <motion.div 
                className="flex flex-col py-4"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.1 }
                  },
                  closed: {
                    transition: { staggerChildren: 0.05, staggerDirection: -1 }
                  }
                }}
              >
                <MobileNavLink href="/" text="Home" onClick={toggleMenu} variants={itemVariants} />
                <MobileNavLink href="/masculino" text="Masculino" onClick={toggleMenu} variants={itemVariants} />
                <MobileNavLink href="/feminino" text="Feminino" onClick={toggleMenu} variants={itemVariants} />
                <MobileNavLink href="/infantil" text="Infantil" onClick={toggleMenu} variants={itemVariants} />
                <MobileNavLink href="/acessorios" text="Acessórios" onClick={toggleMenu} variants={itemVariants} />
                <MobileNavLink href="/contato" text="Contato" onClick={toggleMenu} variants={itemVariants} />
                <MobileNavLink href="/suporte" text="Suporte" onClick={toggleMenu} variants={itemVariants} />
                <motion.div variants={itemVariants} className="px-6 pt-4 space-y-3">
                  {user ? (
                    <>
                      <Link
                        href="/conta"
                        onClick={toggleMenu}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-500 px-4 py-2 font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white"
                      >
                        <User className="h-4 w-4" />
                        Minha conta
                      </Link>
                      <button
                        onClick={() => {
                          toggleMenu();
                          logout();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-500 px-4 py-2 font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={toggleMenu}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
                    >
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </Link>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// Componente para links de navegação (desktop) - melhorado
function NavLink({ href, text }) {
  return (
    <Link href={href}>
      <button className="relative px-4 py-2 font-bold text-gray-800 hover:text-orange-600 transition-all duration-300 group">
        {text}
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-orange-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
      </button>
    </Link>
  );
}

// Componente para links de navegação (mobile) - melhorado
function MobileNavLink({ href, text, onClick, variants, icon, badge }) {
  return (
    <motion.div variants={variants}>
      <Link href={href} onClick={onClick}>
        <button className="w-full text-left px-6 py-4 text-lg font-bold text-gray-800 hover:bg-orange-50 hover:text-orange-600 border-b border-gray-100 last:border-b-0 transition-all duration-300 flex items-center gap-3">
          {icon && <span>{icon}</span>}
          <span className="flex-1">{text}</span>
          {badge && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange-500 px-2 text-sm font-bold text-white">
              {badge}
            </span>
          )}
          <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
        </button>
      </Link>
    </motion.div>
  );
}