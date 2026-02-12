import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button' 
import notificationsService from '../../services/notifications.service'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e?.preventDefault()
    setError(null)
    setSuccess(null)
    if (!form.name || !form.email || !form.message) {
      return setError('Please provide name, email and message.')
    }
    setLoading(true)
    try {
      await notificationsService.send({
        type: 'contact',
        payload: { ...form }
      })
      setSuccess('Thanks — we will get back to you soon.')
      setForm({ name: '', email: '', phone: '', message: '' })
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: 'Message sent successfully!', type: 'success' } 
      }))
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      details: ['support@stunn.com', 'bookings@stunn.com'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Phone',
      details: ['+91 63661 52660', 'Customer Support: +91 63661 52660'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Service Areas',
      details: ['Akshay Nagar, Bangalore', 'Other, Bangalore'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Response Time',
      details: ['Within 2 hours on weekdays', 'Within 4 hours on weekends'],
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const faqs = [
    {
      q: 'How quickly will I get a response?',
      a: 'We respond to all inquiries within 2 hours on weekdays and 4 hours on weekends.'
    },
    
    {
      q: 'Do you offer emergency services?',
      a: 'Yes! For urgent plumbing or electrical issues, call our emergency line at +91 63661 52660.'
    },
    {
      q: 'What are your business hours?',
      a: 'Our customer support is available 8 AM to 10 PM, 7 days a week.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629] text-white pt-20 pb-24">
        {/* Animated Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 top-8 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse" />
          <div className="absolute left-0 bottom-0 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-cyan-500/15 to-indigo-500/15 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium">Get in Touch</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              We're Here to
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Help You
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl leading-relaxed">
              Have questions about our services in Akshay Nagar or Other? Need support with a booking? 
              Our team is ready to assist you with quick, helpful responses.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-8 -mt-12 relative z-20">
        {/* Contact Info Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {contactInfo.map((info, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white mb-4`}>
                {info.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{info.title}</h3>
              <div className="space-y-1">
                {info.details.map((detail, detailIdx) => (
                  <p key={detailIdx} className="text-sm text-gray-600">{detail}</p>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Contact Form & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left Column - Contact Form */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a message</h2>
              <p className="text-gray-600">Fill out the form below and we'll get back to you shortly.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="+91 63661 52660"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message *
                </label>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="space-y-2">
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg">
                      {success}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    loading={loading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 rounded-xl"
                  >
                    Send Message
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setForm({ name: '', email: '', phone: '', message: '' })}
                    className="px-6 py-3 rounded-xl"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Right Column - FAQ & Additional Info */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* FAQ Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                    <p className="text-sm text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-8 border border-red-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Emergency Service</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Need immediate help with plumbing leaks or electrical issues?
                  </p>
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Call: +91 63661 52660</span>
                  </div>
                </div>
              </div>
            </div>

           
          </motion.div>
        </div>

        {/* Map & Location Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Service Areas</h2>
            <p className="text-gray-600">Currently serving these neighborhoods in Bangalore</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { 
                area: 'Akshay Nagar', 
                description: 'South Bangalore',
                services: ['AC Service', 'Plumbing', 'Electrical', 'Cleaning', 'Salon'],
                color: 'from-blue-500 to-purple-500'
              },
              { 
                area: 'Other', 
                description: 'South Bangalore',
                services: ['AC Service', 'Plumbing', 'Electrical', 'Cleaning', 'Salon'],
                color: 'from-purple-500 to-pink-500'
              }
            ].map((location, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
               
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{location.area}</h3>
                <p className="text-gray-600 mb-6">{location.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Available Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {location.services.map((service, serviceIdx) => (
                      <span key={serviceIdx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${location.area}+Bangalore`, '_blank')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View on Google Maps
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 text-white">
            <h2 className="text-3xl font-bold mb-4">Need Immediate Assistance?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our customer support team is ready to help you with bookings, service queries, or emergency requests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                onClick={() => window.location.href = 'tel:+916366152660'}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-2xl"
              >
                Call Now: <span className="font-bold">+91 63661 52660</span>
              </Button>
               
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}