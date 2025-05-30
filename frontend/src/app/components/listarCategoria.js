"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import axios from "axios";

export default function ListarCategoria({
  todosProdutos,
  isLoading,
  error,
  titulo,
}) {
  const imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/";

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingAvaliacao, setLoadingAvaliacao] = useState(false);

  const [nota, setNota] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [comentario, setComentario] = useState("");
  const [fotoProduto, setFotoProduto] = useState(null);
  const [tipoAvaliacaoId, setTipoAvaliacaoId] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const abrirModal = async (produto) => {
    setProdutoSelecionado(produto);
    setLoadingAvaliacao(true);

    // Reset formulário e erros ao abrir modal
    setNota("");
    setNomeCompleto("");
    setComentario("");
    setFotoProduto(null);
    setTipoAvaliacaoId("");
    setErrors({});

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/avaliacoes/?produto_id=${produto.id}`
      );
      setAvaliacoes(response.data);
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
      setAvaliacoes([]);
    } finally {
      setLoadingAvaliacao(false);
    }
  };

  const fecharModal = () => {
    setProdutoSelecionado(null);
    setAvaliacoes([]);
    setErrors({});
  };

  const enviarAvaliacao = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const formData = new FormData();

      formData.append("produto_id", produtoSelecionado.id);
      formData.append("tipo_avaliacao_id", tipoAvaliacaoId);
      formData.append("nota", nota);
      formData.append("nome_completo", nomeCompleto);
      formData.append("comentario", comentario);

      if (fotoProduto) {
        formData.append("foto_produto", fotoProduto);
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/avaliacoes/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAvaliacoes((prev) => [response.data, ...prev]);

      // Limpa form
      setNota("");
      setNomeCompleto("");
      setComentario("");
      setFotoProduto(null);
      setTipoAvaliacaoId("");
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err);
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ geral: "Erro ao enviar avaliação." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-bold">
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-yellow-600 mb-8">{titulo}</h2>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-yellow-600" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {todosProdutos.map((produto) => (
              <div
                key={produto.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-85 w-full">
                  <Image
                    src={`${imageBaseUrl}${produto.imagem}`}
                    alt={produto.nome}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  {produto.em_destaque && (
                    <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">
                      Destaque
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {produto.nome}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {produto.descricao}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-pink-600">
                      R${" "}
                      {Number.parseFloat(produto.preco)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                    <button
                      onClick={() => abrirModal(produto)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition duration-200"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de avaliações - Estilo atualizado */}
      {produtoSelecionado && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-0 flex justify-center items-center overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto border-2 border-yellow-500">
            <button
              onClick={fecharModal}
              className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative h-100 w-full mb-4">
              <Image
                src={`${imageBaseUrl}${produtoSelecionado.imagem}`}
                alt={produtoSelecionado.nome}
                fill
                className="object-cover rounded"
              />
            </div>

            <h3 className="text-2xl font-bold text-yellow-600 mb-2">
              {produtoSelecionado.nome}
            </h3>
            <p className="text-yellow-700 mb-4">{produtoSelecionado.descricao}</p>
            <p className="text-xl font-bold text-yellow-600 mb-4">
              R${" "}
              {Number.parseFloat(produtoSelecionado.preco)
                .toFixed(2)
                .replace(".", ",")}
            </p>

            <h4 className="text-lg font-semibold text-yellow-600 mb-2">
              Avaliações:
            </h4>

            {loadingAvaliacao ? (
              <Loader2 className="animate-spin h-6 w-6 text-yellow-600" />
            ) : avaliacoes.length > 0 ? (
              <ul className="space-y-2 max-h-40 overflow-y-auto mb-6">
                {avaliacoes.map((av) => (
                  <li key={av.id} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-700">
                      {av.nome_completo}
                    </p>
                    <p className="text-xs text-yellow-600">Nota: {av.nota}/10</p>
                    {av.comentario && (
                      <p className="text-sm mt-1 text-yellow-800">{av.comentario}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-yellow-600 text-sm mb-6">
                Nenhuma avaliação disponível.
              </p>
            )}

            <form onSubmit={enviarAvaliacao} className="space-y-4">
              {errors.geral && (
                <p className="text-red-600 text-center">{errors.geral}</p>
              )}

              <div className=" text-yellow-600">
                <label className="block font-semibold text-yellow-700">
                  Tipo de Avaliação *
                </label>
                <select 
                  value={tipoAvaliacaoId}
                  onChange={(e) => setTipoAvaliacaoId(e.target.value)}
                  className={`w-full text-yellow-600 border rounded px-3 py-2 ${
                    errors.tipo_avaliacao_id
                      ? "border-red-500"
                      : "border-yellow-300"
                  }`}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="1">Positivo</option>
                  <option value="2">Negativo</option>
                </select>
                {errors.tipo_avaliacao_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tipo_avaliacao_id.join(", ")}
                  </p>
                )}
              </div>

              <div className=" text-yellow-600">
                <label className="block font-semibold text-yellow-700">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.nome_completo ? "border-red-500" : "border-yellow-300"
                  }`}
                  required
                />
                {errors.nome_completo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nome_completo.join(", ")}
                  </p>
                )}
              </div>

              <div className=" text-yellow-600">
                <label className="block font-semibold text-yellow-700">
                  Nota (0 a 10) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.nota ? "border-red-500" : "border-yellow-300"
                  }`}
                  required
                />
                {errors.nota && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nota.join(", ")}
                  </p>
                )}
              </div>

              <div className=" text-yellow-600">
                <label className="block font-semibold text-yellow-700">
                  Comentário
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full border border-yellow-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className=" text-yellow-600">
                <label className="block font-semibold text-yellow-700">
                  Foto do Produto (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoProduto(e.target.files[0])}
                  className="w-full"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="animate-spin h-5 w-5 inline-block" />
                ) : (
                  "Enviar Avaliação"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}