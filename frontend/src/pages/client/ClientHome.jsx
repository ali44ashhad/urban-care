import React, { useEffect, useState, useCallback } from "react";
import servicesService from '../../services/services.service'
import ServiceList from '../../components/lists/ServiceList'
import HeroModern from '../../components/HeroModern'
import HowItWorks from '../../components/HowItWorks' 
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ServiceDetailModal from "../../components/ServiceDetailModal";

export default function ClientHome() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await servicesService.list()
        // Handle both array and object responses
        let serviceData = res.data || []
        if (!Array.isArray(serviceData)) {
          serviceData = serviceData.items || serviceData.services || serviceData.data || []
        }
        if (!Array.isArray(serviceData)) {
          serviceData = []
        }
        if (mounted) setServices(serviceData)
      } catch (err) {
        console.error(err)
        if (mounted) {
          setError('Unable to load services')
          setServices([])
        }
      } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => mounted = false
  }, [])

  const openBooking = useCallback((service) => {
    setSelectedService(service)
    // set draft for booking flow and navigate to pick service
    sessionStorage.setItem('bookingDraft', JSON.stringify({ service }))
    navigate('/client/booking/pick')
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroModern
        onSearch={() => { document.querySelector('#services-scroll')?.scrollIntoView({ behavior: 'smooth' }) }}
        onBook={(service) => openBooking(service)}
      />

      <div id="services-scroll" className="max-w-7xl mx-auto py-6 sm:py-8 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Services</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{services.length} services available</p>
          </div>
        </div>

        {loading ? (
             <LoadingSpinner />
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <ServiceList services={services} onBook={openBooking} />
        )}
      </div>

      <HowItWorks />

      {/* Booking modal (optional) */}
      {selectedService && (
        <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </div>
  )
}
