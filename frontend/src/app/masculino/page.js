"use client";

import { useEffect, useState } from "react";
import ListarCategoria from "../components/listarCategoria";

export default function Produtosmasculino() {
  const [produtosPorTipo, setProdutosPorTipo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://127.0.0.1:8000/api/produtos_masculina/"
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

  // Base URL para imagens
  const imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/";

  // Achata todos os produtos
  const todosProdutos = produtosPorTipo.flatMap((tipo) => tipo.produtos);

  return (
    <ListarCategoria
      todosProdutos={todosProdutos}
      isLoading={isLoading}
      error={error}
      titulo={"Masculino"}
    />
  );
}
