import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import categoriesService from '../services/categories.service'

export default function HeroModern({ onSearch, onBook }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await categoriesService.list({ isActive: 'true' })
      const cats = res.data.items || res.data || []
      setCategories(cats)
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const total = categories.length

  useEffect(() => {
    if (total === 0) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), 3500)
    return () => clearInterval(id)
  }, [total])

  const handleSearch = () => {
    if (onSearch) onSearch(searchTerm)
  }

  const handleBookCurrent = () => {
    if (categories.length === 0) return
    const category = categories[current]
    navigate(`/services/${category.slug}`)
  }

  // if (loading || categories.length === 0) {
  //   return (
  //     <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629] text-white">
  //       <div className="max-w-7xl mx-auto px-4 py-20 text-center">
  //         <div className="text-gray-400">Loading...</div>
  //       </div>
  //     </section>
  //   )
  // }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629] text-white">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 top-8 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute left-0 bottom-0 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-cyan-500/15 to-indigo-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[250px] h-[250px] rounded-full bg-gradient-to-tr from-pink-500/10 to-yellow-500/10 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT SECTION */}
          <div>
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium">Trusted by 10,000+ Customers</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6">
                Home Services
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed">
                Book verified professionals for AC repair, plumbing, electrical work, salon services, and more. Fast, reliable, and backed by warranty.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBookCurrent}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Book a Service
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                <button
                  onClick={() => document.querySelector('#services-scroll')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/10 hover:border-white/20 rounded-2xl font-bold text-lg transition-all hover:bg-white/10"
                >
                  Explore Services
                </button>
              </div>

              {/* Search Bar */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-2xl hover:shadow-blue-500/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search for services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-base py-2"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Search
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SECTION - Category Carousel */}
          <div>
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Category Card */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={categories[current]?._id || categories[current]?.slug || current}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Category Icon & Name */}
                    <div className="mb-6">
                      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${categories[current]?.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center text-5xl shadow-xl mb-4`}>
                        {categories[current]?.icon || '📋'}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {categories[current]?.name}
                      </h3>
                      <p className="text-gray-300 text-base leading-relaxed">
                        {categories[current]?.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={handleBookCurrent}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      View Services
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {/* Navigation Dots */}
                    <div className="mt-6 flex justify-center gap-2">
                      {categories.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrent(idx)}
                          className={`h-2 rounded-full transition-all ${
                            idx === current 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 w-8' 
                              : 'bg-white/20 w-2 hover:bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute -z-10 -bottom-4 -left-4 w-64 h-64 bg-gradient-to-tr from-cyan-500/20 to-pink-500/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>

        {/* Popular Categories Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Popular Categories</h2>
            <p className="text-gray-400">Choose from our most booked services</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, idx) => (
              <motion.button
                key={category._id || category.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/services/${category.slug}`)}
                className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">
                  {category.name}
                </h4>
                <p className="text-gray-400 text-xs line-clamp-2">
                  {category.description?.split(',')[0] || category.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
