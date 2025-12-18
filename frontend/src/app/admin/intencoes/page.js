"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "../useAdminGuard";
import Link from "next/link";

export default function IntencoesEmDesenvolvimento() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-600">
      <h1 className="text-2xl font-bold mb-4">Intenções de compra</h1>
      <p className="mb-2">Esta página está em desenvolvimento.</p>
      <p className="text-sm text-gray-400 mb-8">Em breve você poderá visualizar e gerenciar intenções de compra.</p>
      <a href="/admin" className="mt-4 inline-block rounded-lg border border-orange-400 px-5 py-2 text-orange-600 font-semibold hover:bg-orange-50 transition">← Voltar para o painel</a>
    </div>
  );
}
