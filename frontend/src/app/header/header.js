"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="bg-white shadow-lg border-b-4 border-orange-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo aumentada e mais destacada */}
          <div className="relative w-24 h-28 flex-shrink-0">
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
function MobileNavLink({ href, text, onClick, variants }) {
  return (
    <motion.div variants={variants}>
      <Link href={href} onClick={onClick}>
        <button className="w-full text-left px-6 py-4 text-lg font-bold text-gray-800 hover:bg-orange-50 hover:text-orange-600 border-b border-gray-100 last:border-b-0 transition-all duration-300 flex items-center">
          <span className="flex-1">{text}</span>
          <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
        </button>
      </Link>
    </motion.div>
  );
}