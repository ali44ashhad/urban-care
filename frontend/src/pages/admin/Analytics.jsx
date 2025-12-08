import React, { useEffect, useState } from 'react'
import adminService from '../../services/admin.service'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30d')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await adminService.analytics({ range })
        if (mounted) setData(res.data || {})
      } catch (err) { 
        console.warn('Analytics endpoint not available', err)
        // Provide fallback empty data
        if (mounted) setData({ bookingsCount: 0, revenue: 0, avgRating: 0 })
      } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => (mounted = false)
  }, [range])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <button className={`px-3 py-2 rounded ${range==='7d' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`} onClick={() => setRange('7d')}>7d</button>
          <button className={`px-3 py-2 rounded ${range==='30d' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`} onClick={() => setRange('30d')}>30d</button>
          <button className={`px-3 py-2 rounded ${range==='90d' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`} onClick={() => setRange('90d')}>90d</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : !data ? (
        <div className="text-gray-500 text-center py-12">No analytics data available</div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Bookings</div>
                  <div className="text-3xl font-bold text-blue-900 mt-2">{data.bookingsCount ?? 0}</div>
                  <div className="text-xs text-blue-600 mt-1">in selected range</div>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-600 font-medium">Revenue</div>
                  <div className="text-3xl font-bold text-green-900 mt-2">₹{data.revenue ?? 0}</div>
                  <div className="text-xs text-green-600 mt-1">completed & warranty bookings</div>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-600 font-medium">Avg Rating</div>
                  <div className="text-3xl font-bold text-purple-900 mt-2">{data.avgRating ?? '—'}</div>
                  <div className="text-xs text-purple-600 mt-1">across services</div>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Status Breakdown - Doughnut Chart */}
            {data.statusBreakdown && data.statusBreakdown.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Status Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: data.statusBreakdown.map(s => s._id?.replace(/_/g, ' ').toUpperCase()),
                      datasets: [{
                        data: data.statusBreakdown.map(s => s.count),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',   // blue - pending
                          'rgba(16, 185, 129, 0.8)',   // green - completed
                          'rgba(249, 115, 22, 0.8)',   // orange - assigned
                          'rgba(139, 92, 246, 0.8)',   // purple - in_progress
                          'rgba(239, 68, 68, 0.8)',    // red - cancelled
                          'rgba(234, 179, 8, 0.8)',    // yellow - warranty_requested
                        ],
                        borderColor: [
                          'rgba(59, 130, 246, 1)',
                          'rgba(16, 185, 129, 1)',
                          'rgba(249, 115, 22, 1)',
                          'rgba(139, 92, 246, 1)',
                          'rgba(239, 68, 68, 1)',
                          'rgba(234, 179, 8, 1)',
                        ],
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 15,
                            font: { size: 12 }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            )}

            {/* Revenue Trend - Bar Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Volume</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: data.statusBreakdown?.map(s => s._id?.replace(/_/g, ' ').toUpperCase()) || ['No Data'],
                    datasets: [{
                      label: 'Bookings Count',
                      data: data.statusBreakdown?.map(s => s.count) || [0],
                      backgroundColor: 'rgba(59, 130, 246, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 2,
                      borderRadius: 8
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          font: { size: 11 }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        ticks: {
                          font: { size: 11 }
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Additional Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase">Total Bookings</div>
                <div className="text-2xl font-bold text-gray-800 mt-1">{data.bookingsCount ?? 0}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase">Completed</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {data.statusBreakdown?.find(s => s._id === 'completed')?.count ?? 0}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase">Pending</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {data.statusBreakdown?.find(s => s._id === 'pending')?.count ?? 0}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase">Warranty Claims</div>
                <div className="text-2xl font-bold text-orange-600 mt-1">
                  {data.statusBreakdown?.find(s => s._id === 'warranty_claimed')?.count ?? 0}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase">Cancelled</div>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  {data.statusBreakdown?.find(s => s._id === 'cancelled')?.count ?? 0}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
