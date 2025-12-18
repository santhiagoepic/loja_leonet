import Link from "next/link";

export default function VoltarPainel({ className = "" }) {
  return (
    <Link
      href="/admin"
      className={`mt-4 inline-block rounded-lg border border-orange-400 px-5 py-2 text-orange-600 font-semibold hover:bg-orange-50 transition ${className}`}
    >
      ← Voltar para o painel
    </Link>
  );
}
