import React, { useState, useMemo } from "react";
import { useAuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function ServiceCardComponent({ service, onSelect, onBook, isSelected = false }) {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasDiscount = service.discount && service.discount > 0;

  const finalPrice = useMemo(() => {
    return hasDiscount
      ? service.basePrice - (service.basePrice * service.discount) / 100
      : service.basePrice;
  }, [service.basePrice, service.discount, hasDiscount]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div
      className={`group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform ${
        isSelected ? "ring-2 ring-blue-300 scale-[1.01]" : "hover:-translate-y-1"
      }`}
    >
      {/* Image Wrapper */}
      <div className="relative h-40 sm:h-48 bg-gray-100 overflow-hidden">
        {(service.image || service.images?.[0]) && !imageError ? (
          <>
            <img
              src={service.image || service.images[0]}
              alt={service.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              width="640"
              height="360"
            />

            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {service.discount}% OFF
          </div>
        )}

        {/* Rating Badge */}
        {service.rating && service.reviewCount > 0 && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            {renderStars(service.rating)}
            <span className="text-gray-700 ml-1">{service.rating}</span>
          </div>
        )}

        {/* Category */}
        {service.category && (
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {service.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {service.title}
        </h3>

        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 space-x-3 sm:space-x-4">
          {service.duration && (
            <div className="flex items-center space-x-1">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{service.duration}</span>
            </div>
          )}

          {service.features && service.features.length > 0 && (
            <div className="flex items-center space-x-1">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{service.features.length} features</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-green-600">₹{finalPrice}</span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ₹{service.basePrice}
              </span>
            )}
          </div>
        </div>

        {/* CTA Button - Hide for admin users */}
        {user?.role !== 'admin' && (
          <button
            onClick={() => {
              if (!user) {
                window.dispatchEvent(new CustomEvent('app:toast', {
                  detail: { message: 'Please login to add service to cart', type: 'warning' }
                }))
                navigate('/auth/login', { state: { from: window.location.pathname } })
                return
              }
              if (onSelect) onSelect(service);
              if (onBook) onBook(service);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 text-white py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base min-h-[44px]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{isSelected ? "Added to Cart" : "Add to Cart"}</span>
          </button>
        )}
        
        {/* View Details for admin */}
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              if (onSelect) onSelect(service);
            }}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 active:scale-95 text-white py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base min-h-[44px]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View Details</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default React.memo(ServiceCardComponent);
