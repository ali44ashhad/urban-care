// src/App.jsx
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from './context/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import AdminShell from './components/layout/AdminShell'
import ProviderShell from './components/layout/ProviderShell'
import LoadingSpinner from './components/ui/LoadingSpinner'
import NotFound from './pages/errors/NotFound'
import ServerError from './pages/errors/ServerError'
import CategoryServices from './pages/public/CategoryServices.jsx'

// Lazy load large route bundles for performance
const Landing = lazy(() => import('./pages/public/Landing'))
const About = lazy(() => import('./pages/public/About'))
const Contact = lazy(() => import('./pages/public/Contact'))

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))

// Client pages
const ClientHome = lazy(() => import('./pages/client/ClientHome'))
const Cart = lazy(() => import('./pages/client/Cart'))
const ServiceDetail = lazy(() => import('./pages/client/ServiceDetail'))
const PickService = lazy(() => import('./pages/client/BookingFlow/PickService'))
const SelectSlot = lazy(() => import('./pages/client/BookingFlow/SelectSlot'))
const AddressForm = lazy(() => import('./pages/client/BookingFlow/AddressForm'))
const Confirmation = lazy(() => import('./pages/client/BookingFlow/Confirmation'))
const MyBookings = lazy(() => import('./pages/client/MyBookings'))
const BookingDetail = lazy(() => import('./pages/client/BookingDetail'))
const WarrantyRequests = lazy(() => import('./pages/client/WarrantyRequests'))
const Reviews = lazy(() => import('./pages/client/Reviews'))
const ClientProfile = lazy(() => import('./pages/client/Profile'))

// Provider pages
const ProviderDashboard = lazy(() => import('./pages/provider/ProviderDashboard'))
const ProviderBookings = lazy(() => import('./pages/provider/MyBookings'))
const ProviderBookingDetail = lazy(() => import('./pages/provider/BookingDetail'))
const ProviderWarranty = lazy(() => import('./pages/provider/WarrantyManagement'))
const ProviderProfile = lazy(() => import('./pages/provider/Profile'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ServicesMgmt = lazy(() => import('./pages/admin/ServicesMgmt'))
const CategoryMgmt = lazy(() => import('./pages/admin/CategoryMgmt'))
const ProvidersMgmt = lazy(() => import('./pages/admin/ProvidersMgmt'))
const BookingsMgmt = lazy(() => import('./pages/admin/BookingsMgmt'))
const WarrantyMgmt = lazy(() => import('./pages/admin/WarrantyMgmt'))
const ReviewsMgmt = lazy(() => import('./pages/admin/ReviewsMgmt'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const UsersMgmt = lazy(() => import('./pages/admin/UsersMgmt'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile')) 

// Utility: simple page-level layout wrapper to include header/footer
function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

// Protect route for authenticated users (any role)
function PrivateRoute({ children }) {
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/auth/login" replace />
  return children ?? <Outlet />
}

// Protect route for providers
function ProviderRoute({ children }) {
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/auth/login" replace />
  if (user.role !== 'provider') return <Navigate to="/" replace />
  return children ?? <Outlet />
}

// Protect route for admins
function AdminRoute({ children }) {
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/auth/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children ?? <Outlet />
}

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <Routes>

        {/* Public routes wrapped with header/footer */}
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="services/:category" element={<CategoryServices />} />

          {/* Auth */}
          <Route path="auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot" element={<ForgotPassword />} />
            <Route path="reset" element={<ResetPassword />} />
          </Route>

          {/* Client pages (public + authenticated flows) */}
          <Route path="service/:id" element={<ServiceDetail />} />

          {/* Booking flow is private — require login */}
          <Route element={<PrivateRoute />}>
            <Route path="client">
              <Route index element={<ClientHome />} />
              <Route path="cart" element={<Cart />} />
              <Route path="booking">
                <Route path="pick" element={<PickService />} />
                <Route path="select-slot" element={<SelectSlot />} />
                <Route path="address" element={<AddressForm />} />
                <Route path="confirmation" element={<Confirmation />} />
              </Route>

              <Route path="bookings" element={<MyBookings />} />
              <Route path="bookings/:id" element={<BookingDetail />} />
              <Route path="warranty" element={<WarrantyRequests />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="profile" element={<ClientProfile />} />
            </Route>
          </Route>
        </Route>

        {/* Provider routes — can have a provider shell or sidebar */}
        <Route path="/provider" element={
          <ProviderRoute>
            <ProviderShell />
          </ProviderRoute>
        }>
          <Route index element={<ProviderDashboard />} />
          <Route path="bookings" element={<ProviderBookings />} />
          <Route path="bookings/:id" element={<ProviderBookingDetail />} />
          <Route path="warranty" element={<ProviderWarranty />} />
          <Route path="profile" element={<ProviderProfile />} />
        </Route>

        {/* Admin routes — using AdminShell for admin layout */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminShell />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="services" element={<ServicesMgmt />} />
          <Route path="categories" element={<CategoryMgmt />} />
          <Route path="providers" element={<ProvidersMgmt />} />
          <Route path="bookings" element={<BookingsMgmt />} />
          <Route path="warranty" element={<WarrantyMgmt />} />
          <Route path="reviews" element={<ReviewsMgmt />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UsersMgmt />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Error handling */}
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
