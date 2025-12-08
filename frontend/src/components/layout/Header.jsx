import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

export default function Header() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationDropdownRef = useRef(null);

  // Check cart on mount and when storage changes
  useEffect(() => {
    updateCartCount();
    
    // Load saved location
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    } else {
      // Default to Akshay Nagar
      setSelectedLocation('Akshay Nagar');
      localStorage.setItem('selectedLocation', 'Akshay Nagar');
    }
    
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  // Close location dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    if (showLocationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLocationDropdown]);

  const updateCartCount = () => {
    const draft = sessionStorage.getItem('bookingDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Check for both old format (service) and new format (items array)
        const count = parsed.items?.length || (parsed.service ? 1 : 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  const handleCartClick = () => {
    navigate('/client/cart')
    setMobileMenuOpen(false)
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    localStorage.setItem('selectedLocation', location);
    setShowLocationDropdown(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            onClick={() => setMobileMenuOpen(false)}
          >
            UrbanCare
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-gray-700">
            {/* Location Selector */}
            <div className="relative" ref={locationDropdownRef}>
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition border border-gray-200"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">{selectedLocation}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showLocationDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => handleLocationChange('Akshay Nagar')}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                      selectedLocation === 'Akshay Nagar' ? 'bg-blue-50 text-blue-600 font-medium' : ''
                    }`}
                  >
                    Akshay Nagar, Bangalore
                  </button>
                  <button
                    onClick={() => handleLocationChange('JP Nagar')}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                      selectedLocation === 'JP Nagar' ? 'bg-blue-50 text-blue-600 font-medium' : ''
                    }`}
                  >
                    JP Nagar, Bangalore
                  </button>
                </div>
              )}
            </div>

            <Link to="/" className="hover:text-blue-600 transition text-sm lg:text-base">
              Home
            </Link>

            {user && user.role !== 'admin' && (
              <Link to="/client/bookings" className="hover:text-blue-600 transition text-sm lg:text-base">
                My Bookings
              </Link>
            )}

            {/* Cart Icon */}
            {user && user.role === 'client' && (
              <button
                onClick={handleCartClick}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
                title="View Cart"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell - Show for logged in users */}
            {user && <NotificationBell />}

            {/* Role-based links */}
            {user?.role === "admin" && (
              <Link to="/admin" className="hover:text-blue-600 transition text-sm lg:text-base">
                Admin Dashboard
              </Link>
            )}

            {/* Auth */}
            {!user ? (
              <div className="flex items-center gap-2 lg:gap-3">
                <Link
                  to="/auth/login"
                  className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm lg:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-3 lg:px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm lg:text-base"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* User Avatar & Name - Show only for client/provider, not admin */}
                {user.role !== 'admin' && (
                  <Link
                    to={user.role === 'provider' ? '/provider' : `/${user.role}/profile`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-gray-700 font-medium hover:text-blue-600">Hi, {user.name}</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 lg:px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 text-sm lg:text-base"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            {/* Location Selector Mobile */}
            <div className="px-4 py-2 mb-2">
              <label className="block text-xs text-gray-500 mb-2">Select Location</label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                >
                  <option value="Akshay Nagar">Akshay Nagar, Bangalore</option>
                  <option value="JP Nagar">JP Nagar, Bangalore</option>
                </select>
              </div>
            </div>

            <Link
              to="/"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {user && user.role !== 'admin' && (
              <Link
                to="/client/bookings"
                className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Bookings
              </Link>
            )}

            {/* Cart Icon for Mobile */}
            {user && user.role === 'client' && (
              <button
                onClick={() => {
                  handleCartClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Cart
                </span>
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            {!user ? (
              <div className="space-y-2 pt-2">
                <Link
                  to="/auth/login"
                  className="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="block px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-center hover:bg-blue-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t mt-2">
                {user.role !== 'admin' && (
                  <Link
                    to={user.role === 'provider' ? '/provider' : `/${user.role}/profile`}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-800">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mt-2"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
   
 
