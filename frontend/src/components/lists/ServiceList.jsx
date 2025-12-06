import React from 'react'
import ServiceCard from '../ServiceCard'

export default function ServiceList({ services = [], onSelect = ()=>{}, onBook = ()=>{}, selectedServiceId = null }) {
  console.log('ServiceList rendering with:', services.length, 'services')
  console.log('Services data:', services)
  
  if (!services || services.length === 0) {
    return <div className="text-gray-600">No services found</div>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {services.map(s => (
        <ServiceCard
          key={s.id || s._id}
          service={s}
          onSelect={() => onSelect(s)}
          onBook={() => onBook(s)}
          isSelected={selectedServiceId === (s.id || s._id)}
        />
      ))}
    </div>
  )
}
