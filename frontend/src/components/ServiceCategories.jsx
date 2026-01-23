import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import categoriesService from '../services/categories.service'
import { createSlug } from '../utils/formatters'
// import LoadingSpinner from './ui/LoadingSpinner'

export default function ServiceCategories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await categoriesService.list({ isActive: 'true' })
      setCategories(res.data.items || res.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  // if (loading) {
  //   return (
  //     <LoadingSpinner />
  //   )
  // }

  return (
    <section className="py-8 sm:py-12 ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            What are you looking for?
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Choose a service category to browse available services
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category, idx) => (
            <motion.div
              key={category._id || category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onClick={() => navigate(`/services/${createSlug(category.slug)}`)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                {/* Icon/Image */}
                <div className={`h-32 sm:h-40 bg-gradient-to-br ${category.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                  <span className="text-5xl sm:text-6xl filter drop-shadow-lg">
                    {category.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
