"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthDialog({
  open,
  mode,
  onModeChange,
  onClose,
  onSubmit,
  submitting,
  error,
  message,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setRePassword("");
      setFullName("");
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({ mode, email, password, rePassword, fullName });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === "login" ? "Entrar na conta" : "Criar conta"}
              </h2>
              <button
                onClick={onClose}
                className="text-sm font-semibold text-orange-500 transition hover:text-orange-600"
              >
                Fechar
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4 text-sm">
              <button
                onClick={() => onModeChange("login")}
                className={`flex-1 rounded-lg border px-3 py-2 font-semibold transition ${
                  mode === "login"
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 text-gray-600 hover:border-orange-400"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => onModeChange("register")}
                className={`flex-1 rounded-lg border px-3 py-2 font-semibold transition ${
                  mode === "register"
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 text-gray-600 hover:border-orange-400"
                }`}
              >
                Criar conta
              </button>
            </div>

            {error ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="fullName">
                    Nome completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="exemplo@dominio.com"
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              {mode === "register" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="rePassword">
                    Confirmar senha
                  </label>
                  <input
                    id="rePassword"
                    type="password"
                    value={rePassword}
                    onChange={(event) => setRePassword(event.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {submitting ? "Enviando..." : mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
