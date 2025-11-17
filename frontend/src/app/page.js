"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, X, Star, Camera, Info } from "lucide-react";
import axios from "axios";
import Banners from "./banners/Banners";

// Componente de Card de Produto Interativo
const ProductCard = ({ produto, onWhatsApp, onAvaliar, imageBaseUrl }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border border-gray-200 relative"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Imagem do Produto */}
      <div className="relative h-64 w-full flex-grow-0 overflow-hidden">
        <Image
          src={`${imageBaseUrl}${produto.imagem}`}
          alt={produto.nome || "Produto"}
          fill
          className={`object-cover transition-transform duration-500 ${
            showDetails ? 'scale-110' : 'scale-100'
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Overlay de informações ao hover */}
        <div className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 flex items-center justify-center ${
          showDetails ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={() => onAvaliar(produto)}
            className="bg-white text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Avaliar Produto
          </button>
        </div>

        {produto.em_destaque && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            Destaque
          </div>
        )}

        {/* Ícone de informações */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full p-1 shadow-sm">
          <Info className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {/* Conteúdo Principal (Sempre Visível) */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2 leading-tight">
          {produto.nome}
        </h3>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-orange-500 whitespace-nowrap">
            R$ {Number.parseFloat(produto.preco).toFixed(2).replace(".", ",")}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWhatsApp(produto);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 min-w-[140px] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.176-1.24-6.165-3.495-8.411"/>
            </svg>
            <span className="whitespace-nowrap">Pedir no WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Detalhes que aparecem no hover */}
      <div className={`absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm transition-all duration-300 p-4 flex flex-col ${
        showDetails ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <h3 className="text-lg font-semibold text-black mb-3">
          {produto.nome}
        </h3>
        
        <div className="flex-grow overflow-y-auto">
          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            {produto.descricao}
          </p>
          
          {/* Informações adicionais do produto */}
          <div className="space-y-2 text-sm text-gray-600">
            {produto.cor && (
              <p><strong>Cor:</strong> {produto.cor}</p>
            )}
            {produto.tamanho && (
              <p><strong>Tamanho:</strong> {produto.tamanho}</p>
            )}
            {produto.material && (
              <p><strong>Material:</strong> {produto.material}</p>
            )}
            {produto.cuidados && (
              <p><strong>Cuidados:</strong> {produto.cuidados}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWhatsApp(produto);
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 text-center"
          >
            Pedir Agora
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAvaliar(produto);
            }}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition-all duration-200 text-center"
          >
            Avaliar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Avaliações ATUALIZADO
const AvaliacaoModal = ({ 
  produto, 
  avaliacoes, 
  loadingAvaliacao, 
  onClose, 
  onSubmit,
  formState,
  onFormChange,
  errors,
  submitting 
}) => (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div>
          <h3 className="text-2xl font-bold text-black">Avaliar Produto</h3>
          <p className="text-gray-600 mt-1">{produto.nome}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Info do Produto */}
        <div className="flex gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={`https://res.cloudinary.com/dzlm6jkhv/${produto.imagem}`}
              alt={produto.nome}
              fill
              className="object-cover rounded"
            />
          </div>
          <div>
            <h4 className="text-lg font-bold text-black">{produto.nome}</h4>
            <p className="text-gray-600 text-sm">{produto.descricao}</p>
            <p className="text-xl font-bold text-orange-500 mt-1">
              R$ {Number.parseFloat(produto.preco).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">📝 Como fazer uma boa avaliação:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Envie foto do produto que você recebeu</li>
            <li>• Conte sobre a qualidade do material</li>
            <li>• Informe se o tamanho corresponde ao esperado</li>
            <li>• Comente sobre o caimento e conforto</li>
            <li>• Fale sobre a fidelidade das cores</li>
          </ul>
        </div>

        {/* Formulário de Avaliação ATUALIZADO */}
        <form onSubmit={onSubmit} className="space-y-6">
          {errors.geral && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-center">{errors.geral}</p>
            </div>
          )}

          {/* Foto do Comprovante/Produto */}
          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              <Camera className="w-4 h-4 inline mr-2" />
              Foto do Produto que Você Recebeu *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFormChange('fotoProduto', e.target.files[0])}
                className="hidden"
                id="fotoComprovante"
                required
              />
              <label htmlFor="fotoComprovante" className="cursor-pointer">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">
                  {formState.fotoProduto ? formState.fotoProduto.name : 'Clique para enviar foto'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Envie uma foto do produto que você recebeu
                </p>
              </label>
            </div>
            {errors.foto_produto && (
              <p className="text-red-500 text-xs mt-1">
                {errors.foto_produto.join(", ")}
              </p>
            )}
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              Nota: Quanto você gostou do produto? *
            </label>
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <label key={num} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="nota"
                    value={num}
                    checked={formState.nota === num.toString()}
                    onChange={(e) => onFormChange('nota', e.target.value)}
                    className="hidden"
                    required
                  />
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-200 ${
                    formState.nota === num.toString() 
                      ? 'bg-orange-500 border-orange-500 text-white' 
                      : 'border-gray-300 text-gray-400 hover:border-orange-500 hover:text-orange-500'
                  }`}>
                    {num}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Não gostei</span>
              <span>Muito bom!</span>
            </div>
            {errors.nota && (
              <p className="text-red-500 text-xs mt-1">
                {errors.nota.join(", ")}
              </p>
            )}
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Seu Nome *
            </label>
            <input
              type="text"
              value={formState.nomeCompleto}
              onChange={(e) => onFormChange('nomeCompleto', e.target.value)}
              placeholder="Como você gostaria de ser chamado?"
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.nome_completo ? 'border-red-500' : 'border-gray-300'
              } focus:border-orange-500 focus:ring-1 focus:ring-orange-500`}
              required
            />
            {errors.nome_completo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.nome_completo.join(", ")}
              </p>
            )}
          </div>

          {/* Comentário Detalhado */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Conte sua experiência com o produto *
            </label>
            <textarea
              value={formState.comentario}
              onChange={(e) => onFormChange('comentario', e.target.value)}
              placeholder={`Por exemplo:
• A qualidade do material é boa?
• O tamanho corresponde ao que você esperava?
• As cores são fiéis às fotos?
• O caimento ficou bom?
• Recomendaria para outras pessoas?`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 min-h-[120px]"
              rows={5}
              required
            />
            {errors.comentario && (
              <p className="text-red-500 text-xs mt-1">
                {errors.comentario.join(", ")}
              </p>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Tamanho que você comprou
              </label>
              <select
                value={formState.tamanho}
                onChange={(e) => onFormChange('tamanho', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Selecione o tamanho</option>
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
                <option value="XG">XG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Cor que você comprou
              </label>
              <input
                type="text"
                value={formState.cor}
                onChange={(e) => onFormChange('cor', e.target.value)}
                placeholder="Ex: Preto, Azul, Vermelho..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 inline-block mr-2" />
                Enviando Avaliação...
              </>
            ) : (
              '📸 Enviar Avaliação com Foto'
            )}
          </button>
        </form>
      </div>
    </div>
  </div>
);

// Componente de Seção de Categoria
const CategorySection = ({ 
  category, 
  title, 
  produtos, 
  onWhatsApp,
  onAvaliar,
  imageBaseUrl 
}) => {
  if (!produtos || produtos.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-black">{title}</h2>
      </div>

      {produtos.map((grupo, index) => {
        return (
          <div key={index} className="mb-10">
            <h3 className="text-2xl text-orange-500 font-semibold mb-6">
              {grupo.tipo}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {grupo.produtos.map((produto, produtoIndex) => (
                <ProductCard
                  key={`${index}-${produtoIndex}`}
                  produto={produto}
                  onWhatsApp={onWhatsApp}
                  onAvaliar={onAvaliar}
                  imageBaseUrl={imageBaseUrl}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Botão "Ver todos" movido para o final da seção */}
      <div className="flex justify-center mt-8">
        <Link 
          href={`/${category}`}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
        >
          Ver todos os {title.toLowerCase()}
        </Link>
      </div>
    </section>
  );
};

// COMPONENTE PRINCIPAL CORRIGIDO
export default function Home() {
  const [categorias, setCategorias] = useState({
    femininos: [],
    masculinos: [],
    acessorios: [],
    infantil: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para avaliações
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingAvaliacao, setLoadingAvaliacao] = useState(false);
  const [formState, setFormState] = useState({
    nota: "",
    nomeCompleto: "",
    comentario: "",
    fotoProduto: null,
    tipoAvaliacaoId: "",
    tamanho: "",
    cor: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/";

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const endpoints = [
          "http://127.0.0.1:8000/api/produtos_feminina/",
          "http://127.0.0.1:8000/api/produtos_masculina/",
          "http://127.0.0.1:8000/api/produtos_acessorios/",
          "http://127.0.0.1:8000/api/produtos_infantil/"
        ];

        const responses = await Promise.all(
          endpoints.map(url => fetch(url).then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          }))
        );

        setCategorias({
          femininos: responses[0],
          masculinos: responses[1],
          acessorios: responses[2],
          infantil: responses[3]
        });
      } catch (err) {
        setError("Erro ao carregar produtos. Por favor, tente novamente mais tarde.");
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  // Função para redirecionar para WhatsApp
  const handleWhatsApp = (produto) => {
    const phoneNumber = "5563984107523";
    
    const nomeProduto = produto.nome || "Produto";
    const descricao = produto.descricao || "Sem descrição disponível";
    const preco = Number.parseFloat(produto.preco).toFixed(2).replace(".", ",");
    
    const message = `🛍️ *INTERESSE NO PRODUTO* 🛍️

*Produto:* ${nomeProduto}
*Descrição:* ${descricao}
*Preço:* R$ ${preco}

Olá! Gostaria de mais informações sobre este produto. Poderia me informar:
• Cores disponíveis
• Tamanhos
• Condições de pagamento
• Prazo de entrega

Aguardo seu retorno! 😊`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Funções para avaliações
  const abrirModal = async (produto) => {
    setProdutoSelecionado(produto);
    setLoadingAvaliacao(true);
    setFormState({
      nota: "",
      nomeCompleto: "",
      comentario: "",
      fotoProduto: null,
      tipoAvaliacaoId: "",
      tamanho: "",
      cor: ""
    });
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

  const handleFormChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const enviarAvaliacao = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("produto_id", produtoSelecionado.id);
      formData.append("tipo_avaliacao_id", formState.tipoAvaliacaoId || "1");
      formData.append("nota", formState.nota);
      formData.append("nome_completo", formState.nomeCompleto);
      formData.append("comentario", formState.comentario);

      if (formState.fotoProduto) {
        formData.append("foto_produto", formState.fotoProduto);
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

      setAvaliacoes(prev => [response.data, ...prev]);
      setFormState({
        nota: "",
        nomeCompleto: "",
        comentario: "",
        fotoProduto: null,
        tipoAvaliacaoId: "",
        tamanho: "",
        cor: ""
      });
      
      // Fechar modal após envio bem-sucedido
      setTimeout(() => {
        fecharModal();
      }, 2000);
      
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
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Banners />

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-orange-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : (
          <div className="space-y-16">
            <CategorySection
              category="feminino"
              title="Produtos Femininos"
              produtos={categorias.femininos}
              onWhatsApp={handleWhatsApp}
              onAvaliar={abrirModal}
              imageBaseUrl={imageBaseUrl}
            />
            
            <CategorySection
              category="masculino"
              title="Produtos Masculinos"
              produtos={categorias.masculinos}
              onWhatsApp={handleWhatsApp}
              onAvaliar={abrirModal}
              imageBaseUrl={imageBaseUrl}
            />
            
            <CategorySection
              category="acessorios"
              title="Acessórios"
              produtos={categorias.acessorios}
              onWhatsApp={handleWhatsApp}
              onAvaliar={abrirModal}
              imageBaseUrl={imageBaseUrl}
            />
            
            <CategorySection
              category="infantil"
              title="Infantil"
              produtos={categorias.infantil}
              onWhatsApp={handleWhatsApp}
              onAvaliar={abrirModal}
              imageBaseUrl={imageBaseUrl}
            />
          </div>
        )}
      </main>

      {/* Modal de Avaliações */}
      {produtoSelecionado && (
        <AvaliacaoModal
          produto={produtoSelecionado}
          avaliacoes={avaliacoes}
          loadingAvaliacao={loadingAvaliacao}
          onClose={fecharModal}
          onSubmit={enviarAvaliacao}
          formState={formState}
          onFormChange={handleFormChange}
          errors={errors}
          submitting={submitting}
        />
      )}
    </div>
  );
}