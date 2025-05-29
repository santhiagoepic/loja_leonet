"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import ListarCategoria from "../components/listarCategoria";

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
    <ListarCategoria
      todosProdutos={todosProdutos}
      isLoading={isLoading}
      error={error}
      titulo={"Feminino"}
    />
  );
}
