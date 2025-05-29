'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Star, Heart } from 'lucide-react';
import Image from 'next/image';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // Recupera todos os produtos do localStorage
    const allProducts = JSON.parse(localStorage.getItem('allProducts') || [];
    
    // Encontra o produto com o ID da URL
    const foundProduct = allProducts.find(p => p.id.toString() === params.id);
    
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Se não encontrar, redireciona para a página inicial
      router.push('/');
    }
    
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p>Produto não encontrado</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          Voltar para a loja
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Imagem do Produto */}
            <div className="md:w-1/2 p-6">
              <div className="relative h-96 w-full">
                <Image
                  src={product.imagem}
                  alt={product.nome}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Informações do Produto */}
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nome}</h1>
              
              {/* Avaliações */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`h-5 w-5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 ml-2">(4 avaliações)</span>
              </div>

              {/* Preço */}
              <p className="text-2xl text-gray-900 mb-4">
                R$ {product.preco.toFixed(2).replace('.', ',')}
              </p>

              {/* Descrição Curta */}
              <p className="text-gray-700 mb-6">{product.descricao}</p>

              {/* Tamanhos (opcional) */}
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-900 mb-2">Tamanhos</h2>
                <div className="flex space-x-2">
                  {['P', 'M', 'G', 'GG'].map((size) => (
                    <button
                      key={size}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex space-x-4">
                <button className="flex-1 bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Comprar Agora
                </button>
                <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalhes do Produto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div>
                <h3 className="font-medium">Composição</h3>
                <p>100% Algodão</p>
              </div>
              <div>
                <h3 className="font-medium">Cuidados</h3>
                <p>Lavar à mão, não usar alvejante</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}