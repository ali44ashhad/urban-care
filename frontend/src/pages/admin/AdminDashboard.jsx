import React, { useEffect, useState } from 'react'
import adminService from '../../services/admin.service'
import bookingsService from '../../services/bookings.service'
import servicesService from '../../services/services.service'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        console.log('AdminDashboard: Loading data...')
        const [bRes, sRes, pRes] = await Promise.allSettled([
          bookingsService.list(),
          servicesService.list(),
          adminService.listUsers({ role: 'provider' })
        ])

        console.log('AdminDashboard: Bookings result:', bRes)
        console.log('AdminDashboard: Services result:', sRes)
        console.log('AdminDashboard: Providers result:', pRes)

        const bookingsList = bRes.status === 'fulfilled' ? bRes.value.data : []
        const servicesList = sRes.status === 'fulfilled' ? sRes.value.data : []
        const providersList = pRes.status === 'fulfilled' ? pRes.value.data : []

        // Handle different response formats
        const bookings = Array.isArray(bookingsList) ? bookingsList : (bookingsList.items || bookingsList.data || [])
        const services = Array.isArray(servicesList) ? servicesList : (servicesList.items || servicesList.data || [])
        let providers = Array.isArray(providersList) ? providersList : (providersList.items || providersList.data || [])
        
        // Filter only providers
        providers = providers.filter(u => u.role === 'provider')

        console.log('AdminDashboard: Parsed data -', 
          'Bookings:', bookings.length, 
          'Services:', services.length, 
          'Providers:', providers.length)

        if (mounted) {
          // Calculate revenue only from completed and warranty_claimed bookings
          const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'warranty_claimed')
          const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0)
          
          setStats({
            totalBookings: bookings.length,
            totalServices: services.length,
            totalProviders: providers.length,
            recentBookings: bookings.slice(0, 5).length,
            revenue: totalRevenue,
            completedBookings: completedBookings.length,
            latestServices: services.slice(0, 5),
            latestBookings: bookings.slice(0, 5),
            topProviders: providers.slice(0, 5)
          })
        }
      } catch (err) {
        console.error('Admin dashboard load failed', err)
        if (mounted) {
          setStats({
            totalBookings: 0,
            totalServices: 0,
            totalProviders: 0,
            recentBookings: 0,
            revenue: 0,
            latestServices: [],
            latestBookings: [],
            topProviders: []
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => (mounted = false)
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Admin dashboard</h1>

      {loading ? (
           <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <div className="text-xs sm:text-sm text-gray-500">Total Bookings</div>
            <div className="text-2xl sm:text-3xl font-bold mt-2">{stats?.totalBookings ?? 0}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-2">All time</div>
          </Card>

          <Card>
            <div className="text-xs sm:text-sm text-gray-500">Revenue</div>
            <div className="text-2xl sm:text-3xl font-bold mt-2">₹{stats?.revenue ?? 0}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-2">
              From {stats?.completedBookings ?? 0} completed/warranty bookings
            </div>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <div className="text-xs sm:text-sm text-gray-500">Providers</div>
            <div className="text-2xl sm:text-3xl font-bold mt-2">{stats?.totalProviders ?? 0}</div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Button onClick={() => navigate('/admin/providers')} className="text-xs sm:text-sm">Manage Providers</Button>
              <Button variant="secondary" onClick={() => navigate('/admin/services')} className="text-xs sm:text-sm">Manage Services</Button>
            </div>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-3">
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Services Column */}
              <div className="flex flex-col">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Services: {stats?.totalServices ?? 0}</h4>
                <div className="space-y-2 flex-1">
                  {stats?.latestServices && stats.latestServices.length > 0 ? (
                    stats.latestServices.map((service, idx) => (
                      <div key={service._id || idx} className="p-2 bg-blue-50 rounded-lg text-xs sm:text-sm border border-blue-100">
                        <div className="font-medium text-gray-800">{service.title || 'N/A'}</div>
                        <div className="text-gray-600">₹{service.basePrice || 0}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-xs">No services available</div>
                  )}
                </div>
              </div>

              {/* Recent Bookings Column */}
              <div className="flex flex-col">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Recent Bookings: {stats?.recentBookings ?? 0}</h4>
                <div className="space-y-2 flex-1">
                  {stats?.latestBookings && stats.latestBookings.length > 0 ? (
                    stats.latestBookings.map((booking, idx) => (
                      <div key={booking._id || idx} className="p-2 bg-green-50 rounded-lg text-xs sm:text-sm border border-green-100">
                        <div className="font-medium text-gray-800">{booking.serviceId?.title || 'N/A'}</div>
                        <div className="text-gray-600">₹{booking.price || 0} • {booking.status || 'pending'}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-xs">No bookings available</div>
                  )}
                </div>
              </div>

              {/* Active Providers Column */}
              <div className="flex flex-col">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Active Providers: {stats?.totalProviders ?? 0}</h4>
                <div className="space-y-2 flex-1">
                  {stats?.topProviders && stats.topProviders.length > 0 ? (
                    stats.topProviders.map((provider, idx) => (
                      <div key={provider._id || idx} className="p-2 bg-purple-50 rounded-lg text-xs sm:text-sm border border-purple-100">
                        <div className="font-medium text-gray-800">{provider.name || 'N/A'}</div>
                        <div className="text-gray-600">{provider.email || 'N/A'}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-xs">No providers available</div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
