"use client";

import Image from "next/image";
import { Camera, Info, Loader2, X } from "lucide-react";
import { buildImageUrl } from "../lib/images";

export default function AvaliacaoModal({
  produto,
  avaliacoes,
  loadingAvaliacao,
  onClose,
  onSubmit,
  formState,
  onFormChange,
  errors,
  submitting,
}) {
  if (!produto) return null;

  const imageSrc = buildImageUrl(produto.imagem);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">Avaliação</p>
            <h3 className="text-2xl font-bold text-gray-900">{produto.nome}</h3>
            <p className="text-sm text-gray-500">Compartilhe sua experiência real com este produto</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 p-2 text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8 p-6">
          <div className="flex gap-6 rounded-2xl bg-gray-50 p-4">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
              <Image src={imageSrc} alt={produto.nome} fill className="object-cover" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{produto.nome}</h4>
              {produto.descricao && <p className="text-sm text-gray-600">{produto.descricao}</p>}
              <p className="mt-2 text-xl font-bold text-orange-500">
                R$ {Number.parseFloat(produto.preco).toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Info className="h-4 w-4" />
              <p className="font-semibold">Como fazer uma boa avaliação?</p>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-blue-800">
              <li>Envie uma foto nítida do produto que você recebeu.</li>
              <li>Conte sobre a qualidade do material e o caimento.</li>
              <li>Informe se as cores e tamanhos correspondem ao esperado.</li>
              <li>Ajude outros clientes com dicas úteis.</li>
            </ul>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {errors?.geral && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.geral}</p>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Foto do produto *</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 transition hover:border-orange-400">
                <Camera className="mb-2 h-6 w-6 text-gray-400" />
                <span className="font-medium text-gray-700">
                  {formState.fotoProduto ? formState.fotoProduto.name : "Clique para enviar foto"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    onFormChange("fotoProduto", files && files[0] ? files[0] : null);
                  }}
                  className="hidden"
                  required
                />
              </label>
              {errors?.foto_produto && (
                <p className="mt-1 text-xs text-red-500">{errors.foto_produto.join(", ")}</p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">Nota (1 a 5) *</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((nota) => {
                  const selected = formState.nota === nota.toString();
                  return (
                    <button
                      type="button"
                      key={nota}
                      onClick={() => onFormChange("nota", nota.toString())}
                      className={`h-10 w-10 rounded-full border-2 text-sm font-semibold transition ${
                        selected ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500"
                      }`}
                    >
                      {nota}
                    </button>
                  );
                })}
              </div>
              {errors?.nota && <p className="mt-1 text-xs text-red-500">{errors.nota.join(", ")}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Seu nome *</label>
              <input
                type="text"
                value={formState.nomeCompleto}
                onChange={(e) => onFormChange("nomeCompleto", e.target.value)}
                placeholder="Como você gostaria de ser chamado?"
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                  errors?.nome_completo ? "border-red-400" : "border-gray-200"
                }`}
                required
              />
              {errors?.nome_completo && <p className="mt-1 text-xs text-red-500">{errors.nome_completo.join(", ")}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Conte sua experiência *</label>
              <textarea
                value={formState.comentario}
                onChange={(e) => onFormChange("comentario", e.target.value)}
                rows={4}
                placeholder="Fale sobre qualidade, tamanho, conforto, fidelidade das cores ..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                required
              />
              {errors?.comentario && <p className="mt-1 text-xs text-red-500">{errors.comentario.join(", ")}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Tamanho comprado</label>
                <select
                  value={formState.tamanho}
                  onChange={(e) => onFormChange("tamanho", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Selecione</option>
                  {["PP", "P", "M", "G", "GG", "XG"].map((tamanho) => (
                    <option key={tamanho} value={tamanho}>
                      {tamanho}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Cor escolhida</label>
                <input
                  type="text"
                  value={formState.cor}
                  onChange={(e) => onFormChange("cor", e.target.value)}
                  placeholder="Ex: Preto, Bege, Azul"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando avaliação...
                </>
              ) : (
                <>Enviar avaliação</>
              )}
            </button>
          </form>

          <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-900">Avaliações recentes</h4>
            {loadingAvaliacao ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando avaliações...
              </div>
            ) : avaliacoes?.length ? (
              <ul className="mt-3 space-y-3">
                {avaliacoes.map((avaliacao) => (
                  <li key={avaliacao.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{avaliacao.nome_completo}</p>
                      <span className="text-sm font-semibold text-orange-500">Nota {avaliacao.nota}/5</span>
                    </div>
                    {avaliacao.comentario && (
                      <p className="mt-1 text-sm text-gray-600">{avaliacao.comentario}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-gray-500">Ainda não há avaliações para este produto.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
