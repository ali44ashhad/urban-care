import React, { useState, useEffect } from 'react'
import HeroModern from '../../components/HeroModern'
import HowItWorks from '../../components/HowItWorks'
import ServiceCategories from '../../components/ServiceCategories'
import ServiceDetailModal from '../../components/ServiceDetailModal'
import ServiceCard from '../../components/ServiceCard'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import servicesService from '../../services/services.service'

const CACHE_KEY = 'landing_consultation_services'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 min

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, at } = JSON.parse(raw)
    if (Date.now() - at > CACHE_TTL_MS) return null
    return Array.isArray(data) ? data : null
  } catch {
    return null
  }
}

function setCached(list) {
  try {
    if (Array.isArray(list)) sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, at: Date.now() }))
  } catch {}
}

export default function Landing() {
  const navigate = useNavigate()
  const [services, setServices] = useState(() => getCached() || [])
  const [selectedService, setSelectedService] = useState(null)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [loading, setLoading] = useState(() => !getCached())

  useEffect(() => {
    const cached = getCached()
    if (cached?.length) {
      setServices(cached)
      setLoading(false)
    }

    async function fetchServices() {
      try {
        const res = await servicesService.list({
          titleContains: 'Consultation',
          limit: 10
        })
        const list = res.data?.items ?? res.data
        const arr = Array.isArray(list) ? list : []
        setServices(arr)
        setCached(arr)
      } catch (err) {
        console.error('Failed to load services:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const handleServiceClick = (service) => {
    setSelectedService(service)
    setShowServiceModal(true)
  }

  const handleAddToCart = (service) => {
    // Service is already stored in sessionStorage by ServiceDetailModal
    setShowServiceModal(false)
    // Navigate to checkout is handled by modal
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroModern
        onSearch={(term) => {
          document.querySelector('#services-scroll')?.scrollIntoView({ behavior: 'smooth' })
        }}
        onBook={(service) => {
          handleServiceClick(service)
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <section className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Trusted pros for every home need</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">Book verified technicians for AC, electrical and cleaning — fast, reliable and with warranty.</p>
            </div>
            <div className="w-full sm:w-auto">
              <Link to='/services' className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 text-lg rounded-2xl text-white"> Get started 
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Services - Consultation */}
        <section id="services-scroll" className="mb-8 sm:mb-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              Popular Services
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Most booked services with verified professionals
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 3).map((service) => (
                <ServiceCard
                  key={service._id || service.id}
                  service={service}
                  onBook={handleServiceClick}
                  onSelect={handleServiceClick}
                />
              ))}
            </div>
          ) : null}
        </section>

        <div id="services-scroll">
          <ServiceCategories />
        </div>

        <HowItWorks />
      </main>

      {/* Service Detail Modal */}
      {showServiceModal && selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setShowServiceModal(false)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}
