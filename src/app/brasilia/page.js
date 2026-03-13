'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MapPin, ExternalLink, ChevronDown } from 'lucide-react'

const recommendations = [
  {
    id: 1,
    name: 'Cathedral of Brasília (Catedral Metropolitana)',
    category: 'culture',
    description: 'An iconic modernist cathedral designed by Oscar Niemeyer. Its stunning architecture features 16 curved concrete columns and beautiful stained glass.',
    address: 'Esplanada dos Ministerios, Brasília',
    website: 'https://catedral.org.br',
    image: '/images/catedral.jpg',
  },
  {
    id: 2,
    name: 'National Congress (Congresso Nacional)',
    category: 'culture',
    description: 'The seat of Brazil\'s federal government, featuring two iconic towers and two dome-shaped buildings. A masterpiece of modernist architecture.',
    address: 'Praça dos Três Poderes, Brasília',
    website: 'https://www.camara.leg.br',
    image: '/images/congresso.jpg',
  },
  {
    id: 3,
    name: 'JK Memorial',
    category: 'culture',
    description: 'A memorial dedicated to Juscelino Kubitschek, the founder of Brasília. Features exhibits about his life and the construction of the city.',
    address: 'Eixo Monumental, Brasília',
    website: 'https://memorialjk.com.br',
    image: '/images/jk.jpg',
  },
  {
    id: 4,
    name: 'Parque da Cidade (City Park)',
    category: 'nature',
    description: 'One of the largest urban parks in the world, perfect for walking, cycling, picnics, and outdoor activities. Features a beautiful lake.',
    address: 'SIG, Brasília',
    website: null,
    image: '/images/parque.jpg',
  },
  {
    id: 5,
    name: 'Brasília National Park (Água Mineral)',
    category: 'nature',
    description: 'A natural oasis with crystal-clear mineral water pools, hiking trails, and abundant wildlife. Perfect for a refreshing swim.',
    address: 'DF-001, Brasília',
    website: 'https://www.icmbio.gov.br',
    image: '/images/parque-nacional.jpg',
  },
  {
    id: 6,
    name: 'Pontão do Lago Sul',
    category: 'food',
    description: 'A vibrant waterfront area with numerous restaurants, bars, and cafes. Perfect for sunset views and enjoying local cuisine.',
    address: 'SHIS QI 15, Lago Sul',
    website: null,
    image: '/images/pontao.jpg',
  },
  {
    id: 7,
    name: 'Mercado Municipal (Public Market)',
    category: 'food',
    description: 'A bustling market offering fresh produce, local delicacies, and traditional Brazilian food stalls. Great for experiencing local culture.',
    address: 'WSN 306, Brasília',
    website: null,
    image: '/images/mercado.jpg',
  },
  {
    id: 8,
    name: 'Vila Planalto',
    category: 'food',
    description: 'A charming neighborhood known for its excellent restaurants, from traditional Brazilian to international cuisine.',
    address: 'Vila Planalto, Brasília',
    website: null,
    image: '/images/vila.jpg',
  },
  {
    id: 9,
    name: 'Setor de Diversões (Entertainment Sector)',
    category: 'nightlife',
    description: 'The heart of Brasília\'s nightlife, featuring bars, clubs, and live music venues. Perfect for dancing the night away.',
    address: 'CLS 404, Brasília',
    website: null,
    image: '/images/nightlife.jpg',
  },
  {
    id: 10,
    name: 'Santuário Dom Bosco',
    category: 'culture',
    description: 'A breathtaking church with walls made entirely of blue Murano glass, creating a celestial atmosphere when sunlight streams through.',
    address: 'W3 Sul, Brasília',
    website: null,
    image: '/images/santuario.jpg',
  },
  {
    id: 11,
    name: 'Jardim Botânico (Botanical Garden)',
    category: 'nature',
    description: 'A beautiful botanical garden showcasing the diverse flora of the Cerrado biome. Features walking trails and a peaceful atmosphere.',
    address: 'SIG, Brasília',
    website: 'https://www.jardimbotanicodebrasilia.df.gov.br',
    image: '/images/jardim.jpg',
  },
  {
    id: 12,
    name: 'Feira da Torre de TV (TV Tower Fair)',
    category: 'culture',
    description: 'A popular weekend fair at the base of the TV Tower, featuring local crafts, food, and live performances. Great for souvenirs.',
    address: 'Eixo Monumental, Brasília',
    website: null,
    image: '/images/feira.jpg',
  },
]

const categories = ['all', 'culture', 'nature', 'food', 'nightlife']

function RecommendationCard({ item, index }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="glass-card overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="h-48 bg-gradient-to-br from-indigo/20 to-pink/20 flex items-center justify-center">
        <div className="text-6xl">
          {item.category === 'culture' && '🏛️'}
          {item.category === 'nature' && '🌿'}
          {item.category === 'food' && '🍽️'}
          {item.category === 'nightlife' && '🌃'}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo/10 dark:bg-pink/10 text-indigo dark:text-pink uppercase">
            {item.category}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
          {item.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {item.description}
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
  )
}

export default function Brasília() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibleCount, setVisibleCount] = useState(6)

  const filteredRecommendations = activeCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === activeCategory)

  const visibleRecommendations = filteredRecommendations.slice(0, visibleCount)
  const hasMore = visibleCount < filteredRecommendations.length

  const loadMore = () => {
    setVisibleCount(prev => prev + 3)
  }

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
            {t('brasília.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('brasília.subtitle')}
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
                setActiveCategory(category)
                setVisibleCount(6)
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'bg-indigo text-white dark:bg-pink'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t(`brasília.categories.${category}`)}
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
              className="btn-outline inline-flex items-center gap-2"
            >
              {t('brasília.loadMore')}
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
  )
}
