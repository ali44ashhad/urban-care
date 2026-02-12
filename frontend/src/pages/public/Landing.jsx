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

export default function Landing() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    try {
      const res = await servicesService.list()
      setServices(res.data || [])
    } catch (err) {
      console.error('Failed to load services:', err)
    } finally {
      setLoading(false)
    }
  }

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
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">Book verified technicians for AC, plumbing, electrical, cleaning and salon services — fast, reliable and with warranty.</p>
            </div>
            <div className="w-full sm:w-auto">
              <Link to='/services' className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 text-lg rounded-2xl text-white"> Get started 
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Services Section - AC Service */}
        {!loading && services.length > 0 && (
          <section id="services-scroll" className="mb-8 sm:mb-12">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                Popular Services
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Most booked services with verified professionals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map((service) => (
                <ServiceCard
                  key={service._id || service.id}
                  service={service}
                  onBook={handleServiceClick}
                  onSelect={handleServiceClick}
                />
              ))}
            </div>
          </section>
        )}

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
