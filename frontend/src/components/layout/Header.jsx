import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import logo from "../../assets/logo.png";
export default function Header() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in a panel route (admin, provider, or client panel)
  const isPanelRoute = location.pathname.startsWith('/admin') || 
                       location.pathname.startsWith('/provider') || 
                       location.pathname.startsWith('/client');
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

  // Menu items based on role
  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { label: "Dashboard", path: "/admin" },
        { label: "Services", path: "/admin/services" },
        { label: "Categories", path: "/admin/categories" },
        { label: "Providers", path: "/admin/providers" },
        { label: "Bookings", path: "/admin/bookings" },
        { label: "Warranty", path: "/admin/warranty" },
        { label: "Reviews", path: "/admin/reviews" },
        { label: "Analytics", path: "/admin/analytics" },
        { label: "Users", path: "/admin/users" },
        { label: "Profile", path: "/admin/profile" },
      ];
    } else if (user?.role === 'provider') {
      return [
        { label: "Dashboard", path: "/provider" },
        { label: "My Bookings", path: "/provider/bookings" },
        { label: "Warranty", path: "/provider/warranty" },
        { label: "Profile", path: "/provider/profile" },
      ];
    }
    return [];
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className={`mx-auto ${isPanelRoute ? '' : 'max-w-7xl'} px-4 md:px-8 py-3 md:py-4`}>
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link
  to="/"
  onClick={() => setMobileMenuOpen(false)}
  className="flex items-center"
>
  <img
    src={logo}
    alt="Logo"
    className="h-8 md:h-10 w-auto"
  />
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
                    onClick={() => handleLocationChange('Other')}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                      selectedLocation === 'Other' ? 'bg-blue-50 text-blue-600 font-medium' : ''
                    }`}
                  >
                    Other Locations
                  </button>
                </div>
              )}
            </div>

            <Link to="/" className="hover:text-blue-600 transition text-sm lg:text-base">
              Home
            </Link>

            {user && user.role === 'client' && (
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

          {/* Mobile Icons */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Cart Icon */}
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            {/* Location Selector Mobile - Only for client */}
            {user?.role === 'client' && (
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
                    <option value="Other">Other Locations</option>
                  </select>
                </div>
              </div>
            )}

            {/* Admin/Provider Menu Items */}
            {(user?.role === 'admin' || user?.role === 'provider') && (
              <div className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Menu</div>
                {getMenuItems().map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Client Menu Items */}
            {(!user || user.role === 'client') && (
              <>
                <Link
                  to="/"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>

                {user && user.role === 'client' && (
                  <Link
                    to="/client/bookings"
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                )}
              </>
            )}

            {/* Auth Section */}
            {!user ? (
              <div className="space-y-2 pt-2 border-t mt-2">
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
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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