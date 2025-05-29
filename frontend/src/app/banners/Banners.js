"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [indexAtual, setIndexAtual] = useState(0);

  const imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/";

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/banners/");
        const data = await response.json();
        const ativos = data.filter((banner) => banner.ativo === true);
        setBanners(ativos);
      } catch (error) {
        console.error("Erro ao carregar banners:", error);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndexAtual((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(intervalo);
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[450px] overflow-hidden mb-8">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === indexAtual ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={`${imageBaseUrl}${banner.imagem}`}
            alt={`Banner ${banner.id}`}
            fill
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}
