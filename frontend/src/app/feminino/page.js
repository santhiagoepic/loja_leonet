"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Camera, Star, X, MessageCircle } from "lucide-react";
import ListarCategoria from "../components/listarCategoria";

// Componente do Card Interativo
const ProductCard = ({ product, imageBaseUrl }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do formulário de avaliação
  const [ratingForm, setRatingForm] = useState({
    foto_produto: null,
    nome_completo: "",
    comentario: "",
    tamanho: "",
    cor: "",
  });

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRatingForm(prev => ({ ...prev, foto_produto: file }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRatingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('produto_id', product.id);
      formData.append('nome_completo', ratingForm.nome_completo);
      formData.append('nota', selectedRating);
      formData.append('comentario', ratingForm.comentario);
      formData.append('tipo_avaliacao_id', '1'); // Ajuste conforme necessário
      
      if (ratingForm.foto_produto) {
        formData.append('foto_produto', ratingForm.foto_produto);
      }
      if (ratingForm.tamanho) {
        formData.append('tamanho', ratingForm.tamanho);
      }
      if (ratingForm.cor) {
        formData.append('cor', ratingForm.cor);
      }

      const response = await fetch('/api/avaliacoes/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Avaliação enviada com sucesso!');
        setShowRatingModal(false);
        // Reset form
        setSelectedRating(0);
        setRatingForm({
          foto_produto: null,
          nome_completo: "",
          comentario: "",
          tamanho: "",
          cor: "",
        });
      } else {
        throw new Error('Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = `Olá! Gostaria de pedir o produto: ${product.nome} - R$ ${product.preco}`;
  const whatsappUrl = `https://wa.me/5563984107523?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <div 
        className="relative bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {/* Imagem do produto */}
        <div className="relative overflow-hidden aspect-square">
          <Image
            src={imageBaseUrl + product.imagem}
            alt={product.nome}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Badge Destaque */}
          {product.em_destaque && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Destaque
            </div>
          )}

          {/* Overlay no hover */}
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              showDetails ? 'bg-opacity-40' : 'bg-opacity-0'
            }`}
          >
            {/* Botão Avaliar Produto no centro */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                showDetails ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                onClick={() => setShowRatingModal(true)}
                className="bg-white text-orange-500 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-orange-50 transition-colors duration-200"
              >
                Avaliar Produto
              </button>
            </div>
          </div>
        </div>

        {/* Informações sempre visíveis */}
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2 mb-2 min-h-[3rem]">
            {product.nome}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-orange-500 whitespace-nowrap">
              R$ {product.preco}
            </span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-green-700 transition-colors duration-200"
            >
              <MessageCircle size={16} />
              Pedir no WhatsApp
            </a>
          </div>
        </div>

        {/* Painel de detalhes que desliza */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm transform transition-transform duration-300 ${
            showDetails ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="p-4 max-h-48 overflow-y-auto">
            <h4 className="font-semibold mb-2">Detalhes do Produto</h4>
            
            {product.descricao && (
              <p className="text-sm text-gray-600 mb-2">{product.descricao}</p>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {product.cor && (
                <div>
                  <span className="font-medium">Cor:</span> {product.cor}
                </div>
              )}
              {product.tamanho && (
                <div>
                  <span className="font-medium">Tamanho:</span> {product.tamanho}
                </div>
              )}
              {product.material && (
                <div>
                  <span className="font-medium">Material:</span> {product.material}
                </div>
              )}
              {product.cuidados && (
                <div>
                  <span className="font-medium">Cuidados:</span> {product.cuidados}
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t px-4 py-3 flex gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded text-center hover:bg-green-700 transition-colors duration-200"
            >
              Pedir Agora
            </a>
            <button
              onClick={() => setShowRatingModal(true)}
              className="flex-1 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors duration-200"
            >
              Avaliar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Avaliação Aprimorado */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Avaliar Produto</h2>
                <p className="text-gray-600">{product.nome}</p>
              </div>
              <button
                onClick={() => setShowRatingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Informações do Produto */}
            <div className="p-6 border-b flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={imageBaseUrl + product.imagem}
                  alt={product.nome}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{product.nome}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.descricao}
                </p>
                <p className="text-lg font-bold text-orange-500 mt-1">
                  R$ {product.preco}
                </p>
              </div>
            </div>

            {/* Instruções de Avaliação */}
            <div className="p-6 border-b bg-blue-50">
              <h4 className="font-semibold mb-3">Como fazer uma boa avaliação:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Tire uma foto nítida do produto que você recebeu</li>
                <li>• Descreva sua experiência real com o produto</li>
                <li>• Comente sobre qualidade, tamanho e cores</li>
                <li>• Sua avaliação ajuda outros clientes!</li>
              </ul>
            </div>

            {/* Formulário de Avaliação */}
            <form onSubmit={handleSubmitRating} className="p-6 space-y-6">
              {/* Foto do Comprovante */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Foto do Produto que Você Recebeu *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors duration-200 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="foto-produto"
                    required
                  />
                  <label htmlFor="foto-produto" className="cursor-pointer">
                    <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Clique para enviar foto
                    </p>
                    {ratingForm.foto_produto && (
                      <p className="text-xs text-green-600 mt-1">
                        Arquivo selecionado: {ratingForm.foto_produto.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              {/* Nota Visual */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Nota: Quanto você gostou do produto? *
                </label>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Não gostei</span>
                  <span className="text-sm text-gray-500">Muito bom!</span>
                </div>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(rating)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedRating === rating
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-gray-300 text-gray-400 hover:border-orange-500 hover:text-orange-500'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome_completo"
                  value={ratingForm.nome_completo}
                  onChange={handleInputChange}
                  placeholder="Como você gostaria de ser chamado?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  required
                />
              </div>

              {/* Comentário Detalhado */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentário Detalhado *
                </label>
                <textarea
                  name="comentario"
                  value={ratingForm.comentario}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder={`Por exemplo:
• A qualidade do material é boa?
• O tamanho corresponde ao que você esperava?
• As cores são fiéis às fotos?
• O caimento ficou bom?
• Recomendaria para outras pessoas?`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 resize-none"
                  required
                />
              </div>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tamanho comprado
                  </label>
                  <select
                    name="tamanho"
                    value={ratingForm.tamanho}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  >
                    <option value="">Selecione</option>
                    <option value="PP">PP</option>
                    <option value="P">P</option>
                    <option value="M">M</option>
                    <option value="G">G</option>
                    <option value="GG">GG</option>
                    <option value="XG">XG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cor comprada
                  </label>
                  <input
                    type="text"
                    name="cor"
                    value={ratingForm.cor}
                    onChange={handleInputChange}
                    placeholder="Cor do produto"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedRating || !ratingForm.foto_produto}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Enviar Avaliação com Foto
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Componente Principal Atualizado
export default function ProdutosFemininos() {
  const [produtosPorTipo, setProdutosPorTipo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://127.0.0.1:8000/api/produtos_feminina/"
        );

        if (!response.ok) throw new Error("Falha ao carregar os produtos");
        const data = await response.json();
        setProdutosPorTipo(data);
      } catch (err) {
        setError(
          "Erro ao carregar produtos. Por favor, tente novamente mais tarde."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  // Achata todos os produtos em uma única lista
  const todosProdutos = produtosPorTipo.flatMap((tipo) => tipo.produtos);

  // Lógica de paginação
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = todosProdutos.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(todosProdutos.length / productsPerPage);

  const imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/";

  return (
    <div className="min-h-screen bg-gray-50">
      <ListarCategoria
        todosProdutos={todosProdutos}
        isLoading={isLoading}
        error={error}
        titulo={"Feminino"}
        renderProduct={(product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            imageBaseUrl={imageBaseUrl} 
          />
        )}
      />
    </div>
  );
}