import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function About() {
  const navigate = useNavigate()

  const stats = [
    { value: '2,500+', label: 'Happy Customers in Bangalore', icon: '👥', color: 'from-blue-500 to-cyan-500' },
    { value: '2 Areas', label: 'Currently Serving', icon: '📍', color: 'from-purple-500 to-pink-500' },
    { value: '4.8 ★', label: 'Avg. Rating', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
    { value: '45+', label: 'Verified Professionals', icon: '👨‍🔧', color: 'from-green-500 to-emerald-500' },
  ]

  const serviceAreas = [
    { name: 'Akshay Nagar', icon: '🏙️', description: 'South Bangalore' },
    { name: 'JP Nagar', icon: '🏘️', description: 'South Bangalore' },
  ]

  const values = [
    {
      title: 'Local Expertise',
      description: 'Deep understanding of Bangalore neighborhoods ensures reliable service delivery.',
      icon: '🏡',
      points: ['Akshay Nagar specialists', 'JP Nagar experts', 'Local knowledge']
    },
    {
      title: 'Hyper-Local Quality',
      description: 'Focusing on 2 areas allows us to maintain exceptional service standards.',
      icon: '🎯',
      points: ['Dedicated teams', 'Faster response', 'Better coordination']
    },
    {
      title: 'Community Focused',
      description: 'Building strong relationships with customers in our service areas.',
      icon: '🤝',
      points: ['Neighborhood trust', 'Personalized service', 'Local references']
    }
  ]

  const expansionPlan = [
    { phase: 'Phase 1', areas: ['Akshay Nagar', 'JP Nagar'], status: 'Active', icon: '✅' },
    { phase: 'Phase 2', areas: ['Jaynagar', 'Banashankari'], status: 'Coming Soon', icon: '🔄' },
    { phase: 'Phase 3', areas: ['Bannerghatta', 'BTM Layout'], status: 'Planned', icon: '📋' },
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
            {/* Service Area Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium">Serving Bangalore Locally</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Bangalore's Trusted
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Home Service Partner
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl leading-relaxed">
              Stunn is Bangalore's hyper-local home service platform, currently serving <span className="font-semibold text-white">Akshay Nagar and JP Nagar</span>. 
              We connect you with verified, background-checked professionals who understand your neighborhood's specific needs.
            </p>
 

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/services')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 text-lg rounded-2xl"
              >
                Book Service in Your Area
              </Button>
              <Button
                variant="third"
                onClick={() => navigate('/auth/register')}
                className="bg-white/5 backdrop-blur-sm border-2 border-white/10 hover:border-white/20 px-8 py-4 text-lg rounded-2xl"
              >
               get started now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-8  -mt-12 relative z-20">
        {/* Stats Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-xl p-6 transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mb-4`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Current Service Areas */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Currently Serving</h2>
            <p className="text-gray-600">Hyper-local service in select Bangalore neighborhoods</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceAreas.map((area, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 * idx }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl">
                    {area.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{area.name}</h3>
                    <p className="text-gray-600">{area.description}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Same-day service available
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Dedicated local technicians
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Neighborhood-specific pricing
                  </li>
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Local Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                To become the most trusted home service provider in Bangalore by delivering exceptional quality 
                in every neighborhood we serve, starting with Akshay Nagar and JP Nagar.
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8"
            >
              <div className="text-4xl mb-4">🏙️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hyper-Local Approach</h2>
              <p className="text-gray-700 leading-relaxed">
                We believe in perfecting our service in select areas before expanding. This ensures 
                every customer in Akshay Nagar and JP Nagar receives our best possible service.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Choose Local Service?</h2>
            <p className="text-gray-600">Benefits of our focused approach</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 mb-4">{value.description}</p>
                <ul className="space-y-2">
                  {value.points.map((point, pointIdx) => (
                    <li key={pointIdx} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>
 

        {/* Service Promise */}
        <section className="mb-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Service Promise to Bangalore</h2>
              <p className="text-gray-600">What you can expect from Stunn</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🚀', title: 'Fast Response', desc: 'Quick service booking & technician dispatch' },
                { icon: '🔒', title: 'Verified Pros', desc: 'All technicians background-checked & rated' },
                { icon: '💎', title: 'Quality Assured', desc: '14-day warranty on all services' },
                { icon: '💰', title: 'Fair Pricing', desc: 'Transparent pricing with no hidden charges' },
              ].map((item, idx) => (
                <div key={idx} className="text-center p-5">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 text-white">
            <h2 className="text-3xl font-bold mb-4">Book Service in Your Area</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Currently available in Akshay Nagar and JP Nagar, Bangalore
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/services')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-2xl"
              >
                Check Available Services
              </Button>
              
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'Do you service areas outside Akshay Nagar and JP Nagar?',
                a: 'Currently, we only serve Akshay Nagar and JP Nagar in Bangalore. We\'re expanding soon to other areas. You can request your area using the form above.'
              },
              {
                q: 'How quickly can I get service in Akshay Nagar/JP Nagar?',
                a: 'Most services offer same-day or next-day slots based on technician availability in your specific neighborhood.'
              },
              {
                q: 'Are your technicians from the local area?',
                a: 'Yes! Our technicians live and work in the areas we serve, ensuring they understand local needs and can respond quickly.'
              },
              {
                q: 'Will you expand to my area soon?',
                a: 'Check our expansion plan above. You can also submit a request for your area, which helps us prioritize expansion.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}