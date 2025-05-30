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
    <header className="bg-yellow-600 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo aumentada à esquerda */}
          <div className="relative w-20 h-24">
            <Image
              src="/leonetlogo.png"
              alt="Leonete Modas"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Botões à direita - versão desktop */}
          <div className="hidden md:flex items-center space-x-6 text-black">
            <NavLink href="/" text="Home" />
            <NavLink href="/masculino" text="Masculino" />
            <NavLink href="/feminino" text="Feminino" />
            <NavLink href="/infantil" text="Infantil" />
            <NavLink href="/acessorios" text="Acessórios" />
            <NavLink href="/contato" text="Contato" />
            <NavLink href="/suporte" text="suporte" />
          </div>

          {/* Botão do menu hamburguer - versão mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-black focus:outline-none transition-transform duration-300 hover:scale-110"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X size={28} className="text-black" />
              ) : (
                <Menu size={28} className="text-black" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile com animação */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="md:hidden overflow-hidden"
            >
              <motion.div 
                className="flex flex-col space-y-3 pt-4 pb-4"
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

// Componente para links de navegação (desktop)
function NavLink({ href, text }) {
  return (
    <Link href={href}>
      <button className="relative px-2 py-1 text-lg font-bold hover:after:w-full after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300">
        {text}
      </button>
    </Link>
  );
}

// Componente para links de navegação (mobile) com animação
function MobileNavLink({ href, text, onClick, variants }) {
  return (
    <motion.div variants={variants}>
      <Link href={href} onClick={onClick}>
        <button className="w-full text-left px-4 py-3 text-lg font-bold bg-yellow-500 rounded-md hover:bg-yellow-400 transition-colors duration-300">
          {text}
        </button>
      </Link>
    </motion.div>
  );
}