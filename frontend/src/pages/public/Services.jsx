import React, { useEffect, useState, useCallback } from "react";
import servicesService from '../../services/services.service'
import categoriesService from '../../services/categories.service'
import ServiceList from '../../components/lists/ServiceList'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuthContext } from '../../context/AuthContext'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuthContext()
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
    if (!user) {
      navigate('/auth/login', { state: { from: '/services' } })
      return
    }
    setSelectedService(service)
    // set draft for booking flow and navigate to pick service
    sessionStorage.setItem('bookingDraft', JSON.stringify({ service }))
    navigate('/client/booking/pick')
  }, [navigate, user])

  const handleViewDetails = useCallback(async (service) => {
    if (!service?.category) {
      console.warn('Service does not have a category')
      return
    }

    try {
      // Fetch categories to get the slug
      const res = await categoriesService.list()
      const categories = res.data?.items || res.data || []
      const matchedCategory = categories.find(cat => 
        cat.name === service.category || cat.name?.toLowerCase() === service.category?.toLowerCase()
      )
      
      if (matchedCategory?.slug) {
        // Navigate to the category page
        navigate(`/services/${matchedCategory.slug}`)
      } else {
        console.warn('Category slug not found for:', service.category)
        // Fallback: try to create a slug from category name
        const slug = service.category.toLowerCase().replace(/\s+/g, '-')
        navigate(`/services/${slug}`)
      }
    } catch (err) {
      console.error('Failed to load category:', err)
      // Fallback: try to create a slug from category name
      const slug = service.category.toLowerCase().replace(/\s+/g, '-')
      navigate(`/services/${slug}`)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our wide range of professional home care services. All services are provided by verified and trusted professionals.
          </p>
        </div>

        {/* Services Count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">All Services</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {loading ? 'Loading...' : `${services.length} services available`}
            </p>
          </div>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-2">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Try again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No services available at the moment.</p>
          </div>
        ) : (
          <ServiceList services={services} onBook={openBooking} onSelect={handleViewDetails} />
        )}
      </div>
    </div>
  )
}
