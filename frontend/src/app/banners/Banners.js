"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiUrl } from "../../lib/api";
import { buildImageUrl } from "../lib/images";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [indexAtual, setIndexAtual] = useState(0);

  const imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/";

  useEffect(() => {
    const fetchBanners = async () => {
      const response = await fetch(apiUrl("/api/banners/"));
      const data = await response.json();
      const ativos = data.filter((banner) => banner.ativo === true);
      setBanners(ativos);
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
    <div className="relative mb-8 w-full overflow-hidden rounded-3xl bg-gray-100 shadow-lg">
      <div className="relative aspect-[4/3] sm:aspect-[16/7]">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === indexAtual ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={buildImageUrl(banner.imagem, imageBaseUrl)}
              alt={`Banner ${banner.id}`}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
