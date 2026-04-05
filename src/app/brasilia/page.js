"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, ExternalLink, ChevronDown } from "lucide-react";
import Image from "next/image";

// Place names and addresses stay in Portuguese as proper nouns
// Descriptions are translated via i18n keys
const recommendations = [
  {
    id: 1,
    key: "cathedral",
    name: "Cathedral of Brasília (Catedral Metropolitana)",
    category: "culture",
    address: "Esplanada dos Ministérios, Brasília",
    website: "https://catedral.org.br",
    image: "/images/catedral.jpg",
  },
  {
    id: 2,
    key: "congress",
    name: "National Congress (Congresso Nacional)",
    category: "culture",
    address: "Praça dos Três Poderes, Brasília",
    website: "https://www.camara.leg.br",
    image: "/images/congresso.jpg",
  },
  {
    id: 3,
    key: "jk",
    name: "JK Memorial",
    category: "culture",
    address: "Eixo Monumental, Brasília",
    website: "https://memorialjk.com.br",
    image: "/images/jkMemorial.jpg",
  },
  {
    id: 4,
    key: "parque",
    name: "Parque da Cidade (City Park)",
    category: "nature",
    address: "SIG, Brasília",
    website: null,
    image: "/images/parque-da-cidade.jpg",
  },
  {
    id: 5,
    key: "nacional",
    name: "Brasília National Park (Água Mineral)",
    category: "nature",
    address: "DF-001, Brasília",
    website: "https://www.icmbio.gov.br",
    image: "/images/parque-nacional.jpg",
  },
  {
    id: 6,
    key: "pontao",
    name: "Pontão do Lago Sul",
    category: "food",
    address: "SHIS QI 15, Lago Sul",
    website: null,
    image: "/images/pontao.jpg",
  },
  {
    id: 10,
    key: "estadio",
    name: "Estádio Nacional Mané Garrincha",
    category: "culture",
    address: "Arena BRB Mané Garrincha, Brasília",
    website: "https://arenabsb.com.br",
    image: "/images/estadio.jpg",
  },
  {
    id: 11,
    key: "jardim",
    name: "Jardim Botânico (Botanical Garden)",
    category: "nature",
    address: "SIG, Brasília",
    website: "https://www.jardimbotanicodebrasilia.df.gov.br",
    image: "/images/jardim.jpg",
  },
  {
    id: 12,
    key: "feira",
    name: "Feira da Torre de TV (TV Tower Fair)",
    category: "culture",
    address: "Eixo Monumental, Brasília",
    website: null,
    image: "/images/feira.jpg",
  },
];

const categories = ["all", "culture", "nature", "food", "nightlife"];

function RecommendationCard({ item, index }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="glass-card overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-indigo/20 dark:hover:shadow-pink-400/20"
    >
      <div className="h-48 relative overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo/10 dark:bg-pink/10 text-indigo dark:text-pink uppercase">
            {t(`brasilia.categories.${item.category}`)}
          </span>
        </div>

        {/* Name stays in Portuguese as a proper noun */}
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
          {item.name}
        </h3>

        {/* Description is translated */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {t(`brasilia.recommendations.${item.key}.description`)}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{item.address}</span>
        </div>

        {item.website && (
          <a
            href={item.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-indigo dark:text-pink hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Website
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function Brasilia() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredRecommendations =
    activeCategory === "all"
      ? recommendations
      : recommendations.filter((r) => r.category === activeCategory);

  const visibleRecommendations = filteredRecommendations.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRecommendations.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-indigo dark:text-pink">
            {t("brasilia.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t("brasilia.subtitle")}
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setVisibleCount(6);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-indigo text-white dark:bg-pink"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {t(`brasilia.categories.${category}`)}
            </button>
          ))}
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {visibleRecommendations.map((item, index) => (
            <RecommendationCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <button
              onClick={loadMore}
              className="btn-primary inline-flex items-center gap-2"
            >
              {t("brasilia.loadMore")}
              <ChevronDown className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No recommendations found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
