import React, { useEffect, useState } from 'react'
import servicesService from '../../services/services.service'
import ServiceForm from '../../components/forms/ServiceForm'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ServicesMgmt() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        console.log('ServicesMgmt: Fetching services...')
        const res = await servicesService.list({ limit: 100 }) // Fetch more services
        console.log('ServicesMgmt: Full Response:', res)
        console.log('ServicesMgmt: res.data type:', typeof res.data, 'isArray:', Array.isArray(res.data))
        
        let serviceData = res.data || []
        
        if (!Array.isArray(serviceData)) {
          console.log('ServicesMgmt: Not array, checking nested properties...')
          console.log('ServicesMgmt: serviceData.items:', serviceData.items)
          console.log('ServicesMgmt: serviceData.services:', serviceData.services)
          serviceData = serviceData.items || serviceData.services || serviceData.data || []
        }
        
        if (!Array.isArray(serviceData)) {
          console.log('ServicesMgmt: Still not array, defaulting to empty')
          serviceData = []
        }
        
        console.log('ServicesMgmt: Final parsed services:', serviceData.length, 'items')
        console.log('ServicesMgmt: First service:', serviceData[0])
        
        if (mounted) setServices(serviceData)
      } catch (err) {
        console.error('ServicesMgmt: Error loading services', err)
        if (mounted) setError('Failed to load services')
      } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => mounted = false
  }, [])

  async function handleCreate(service) {
    console.log('handleCreate called with:', service)
    console.log('Current services count:', services.length)
    setServices(prev => {
      const updated = [service, ...prev]
      console.log('Updated services count:', updated.length)
      return updated
    })
    setShowForm(false)
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Service created', type: 'success' } }))
  }

  async function handleUpdate(updated) {
    setServices(prev => prev.map(s => (s._id === updated._id ? updated : s)))
    setEditing(null)
    setShowForm(false)
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Service updated', type: 'success' } }))
  }

  async function handleDelete(svc) {
    if (!confirm('Delete this service?')) return
    try {
      await servicesService.remove(svc._id || svc.id)
      setServices(prev => prev.filter(x => x._id !== (svc._id || svc.id)))
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Service deleted', type: 'info' } }))
    } catch (err) {
      alert('Delete failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-1">Manage all services</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>
          Add Service
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : services.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No services found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div
              key={service._id || service.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Service Image */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                {service.image || service.images?.[0] ? (
                  <img
                    src={service.image || service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Category Badge */}
                {service.category && (
                  <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {service.category}
                  </div>
                )}
              </div>

              {/* Service Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{service.title}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{service.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-green-600">₹{service.basePrice}</span>
                    {service.durationMin && (
                      <span className="text-sm text-gray-500 ml-2">• {service.durationMin} min</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(service); setShowForm(true) }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null) }}>
        <div className="p-4">
          <ServiceForm
            initial={editing}
            onSaved={(res) => {
              if (editing) handleUpdate(res)
              else handleCreate(res)
            }}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
          />
        </div>
      </Modal>
    </div>
  )
}
