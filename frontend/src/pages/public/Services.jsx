import React, { useEffect, useState, useCallback } from "react";
import servicesService from '../../services/services.service'
import categoriesService from '../../services/categories.service'
import ServiceList from '../../components/lists/ServiceList'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuthContext } from '../../context/AuthContext'
import { createSlug } from '../../utils/formatters'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const PAGE_LIMIT = 20
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const fetchServices = useCallback(async (pageToLoad = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await servicesService.list({ page: pageToLoad, limit: PAGE_LIMIT })
      // Handle both array and object responses
      let serviceData = res.data || []
      if (!Array.isArray(serviceData)) {
        serviceData = serviceData.items || serviceData.services || serviceData.data || []
      }
      if (!Array.isArray(serviceData)) {
        serviceData = []
      }
      setServices(serviceData)
      setPage(pageToLoad)
      setHasMore(serviceData.length === PAGE_LIMIT)
    } catch (err) {
      console.error(err)
      setError('Unable to load services')
      setServices([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices(1)
  }, [fetchServices])

  const openBooking = useCallback((service) => {
    if (!user) {
      navigate('/auth/login', { state: { from: '/services' } })
      return
    }
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
      // Fetch categories to get the category slug
      const res = await categoriesService.list()
      const categories = res.data?.items || res.data || []
      const matchedCategory = categories.find(cat => 
        cat.name === service.category || cat.name?.toLowerCase() === service.category?.toLowerCase()
      )
      
      const categorySlug = matchedCategory?.slug
        ? createSlug(matchedCategory.slug)
        : createSlug(service.category)

      // Use service.slug (or title) as sub-category segment
      const subSlug = createSlug(service.slug || service.title || '')

      navigate(`/services/${categorySlug}/${subSlug}`)
    } catch (err) {
      console.error('Failed to load category:', err)
      const categorySlug = createSlug(service.category)
      const subSlug = createSlug(service.slug || service.title || '')
      navigate(`/services/${categorySlug}/${subSlug}`)
    }
  }, [navigate])

  const handleNextPage = () => {
    if (loading || !hasMore) return
    fetchServices(page + 1)
  }

  const handlePrevPage = () => {
    if (loading || page <= 1) return
    fetchServices(page - 1)
  }

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
          <>
            <ServiceList
              services={services}
              onBook={openBooking}
              onSelect={handleViewDetails}
              hideViewButton
            />

            {/* Pagination controls */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={loading || page <= 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  page <= 1 || loading
                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              <div className="text-sm text-gray-600">
                Page <span className="font-semibold">{page}</span>
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={loading || !hasMore}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  !hasMore || loading
                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
