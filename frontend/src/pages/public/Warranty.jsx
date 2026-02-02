import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function Warranty() {
  const navigate = useNavigate()
  const [activeClaimStep, setActiveClaimStep] = useState(1)

  const warrantyStats = [
    { value: '14 Days', label: 'Standard Warranty Period', icon: '📅', color: 'from-blue-500 to-cyan-500' },
    { value: '24 Hrs', label: 'Claim Resolution Time', icon: '⚡', color: 'from-purple-500 to-pink-500' },
    { value: '95%', label: 'Satisfaction Rate', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
    { value: '₹0', label: 'Warranty Claim Charges', icon: '💰', color: 'from-green-500 to-emerald-500' },
  ]

  const warrantyTiers = [
    {
      name: 'Basic Warranty',
      duration: '14 Days',
      icon: '🔧',
      color: 'from-blue-100 to-blue-50',
      features: [
        'Workmanship coverage',
        'Standard parts replacement',
        'Single visit support',
        'Basic troubleshooting',
        'Email support'
      ],
      services: ['Cleaning', 'Repair', 'Maintenance']
    },
    {
      name: 'Premium Warranty',
      duration: '30 Days',
      icon: '⭐',
      color: 'from-purple-100 to-purple-50',
      features: [
        'Extended workmanship coverage',
        'Premium parts replacement',
        'Unlimited visits',
        'Priority support',
        '24/7 phone support',
        'Free follow-up inspection'
      ],
      services: ['Installation', 'Renovation', 'Major Repairs'],
      popular: true
    },
    {
      name: 'Annual Protection',
      duration: '1 Year',
      icon: '🛡️',
      color: 'from-orange-100 to-orange-50',
      features: [
        'Comprehensive coverage',
        'All parts replacement',
        'Quarterly maintenance',
        'Dedicated technician',
        'Emergency support',
        'Discount on future services'
      ],
      services: ['All Services'],
      upgrade: true
    }
  ]

  const claimSteps = [
    {
      number: 1,
      title: 'Report Issue',
      description: 'Submit your warranty claim through the form below',
      icon: '📝',
      details: 'Provide service details and describe the issue'
    },
    {
      number: 2,
      title: 'Verification',
      description: 'Our team reviews your claim',
      icon: '✅',
      details: 'Check warranty validity and service history'
    },
    {
      number: 3,
      title: 'Schedule Visit',
      description: 'Book a technician visit',
      icon: '📅',
      details: 'Choose convenient time slot in your area'
    },
    {
      number: 4,
      title: 'Resolution',
      description: 'Technician resolves the issue',
      icon: '🔧',
      details: 'On-site service completion'
    },
    {
      number: 5,
      title: 'Confirmation',
      description: 'Confirm satisfaction',
      icon: '⭐',
      details: 'Rate service and close claim'
    }
  ]

  const activeWarranties = [
    {
      id: 'WR-2024-00123',
      service: 'AC Repair Service',
      provider: 'Rajesh Kumar',
      date: '2024-03-15',
      expiry: '2024-03-29',
      status: 'Active',
      location: 'Akshay Nagar'
    },
    {
      id: 'WR-2024-00145',
      service: 'Plumbing Repair',
      provider: 'Suresh Patel',
      date: '2024-03-10',
      expiry: '2024-03-24',
      status: 'Active',
      location: 'Other'
    }
  ]

  const warrantyTerms = [
    {
      term: 'Coverage Scope',
      description: 'Covers workmanship defects and service-related issues',
      details: ['Labor charges', 'Standard parts', 'Re-service if issue recurs']
    },
    {
      term: 'Exclusions',
      description: 'Not covered under warranty',
      details: ['Natural wear and tear', 'Customer-caused damage', 'Third-party parts', 'Services outside scope']
    },
    {
      term: 'Claim Process',
      description: 'Steps to file a warranty claim',
      details: ['Report within 14 days', 'Provide service details', 'Schedule technician visit', 'Resolution confirmation']
    },
    {
      term: 'Local Advantage',
      description: 'Benefits for Akshay Nagar & Other',
      details: ['Same-day claim processing', 'Local technician dispatch', 'Area-specific parts availability']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629] text-white pt-20 pb-16">
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
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium">Warranty Protected Services</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Your Service
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Warranty Shield
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Every service comes with our comprehensive warranty protection in 
              <span className="font-semibold text-white"> Akshay Nagar and Other</span>. 
              Your peace of mind is our priority.
            </p>
 
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 -mt-8 relative z-20">
        {/* Warranty Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {warrantyStats.map((stat, idx) => (
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
 
 

        {/* Claim Process */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Warranty Claim Process</h2>
            <p className="text-gray-600">Easy steps to get your issue resolved</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block"></div>

            <div className="space-y-8 md:space-y-0">
              {claimSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: idx % 2 === 0 ? -30 : 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className={`flex flex-col md:flex-row items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Step Content */}
                  <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div
                      className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${activeClaimStep === step.number ? 'border-blue-500' : 'border-gray-200'}`}
                      onClick={() => setActiveClaimStep(step.number)}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${activeClaimStep === step.number ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {step.number}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-2">{step.description}</p>
                      <p className="text-sm text-gray-600">{step.details}</p>
                    </div>
                  </div>

                  {/* Step Icon */}
                  <div className="hidden md:flex w-12 h-12 rounded-full bg-white border-4 border-white items-center justify-center z-10">
                    <div className="text-2xl">{step.icon}</div>
                  </div>

                  {/* Empty space for alternating layout */}
                  <div className="w-full md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Terms & Conditions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Warranty Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {warrantyTerms.map((term, idx) => (
              <Card key={idx} className="border border-gray-200">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{term.term}</h3>
                  <p className="text-gray-700 mb-4">{term.description}</p>
                  <ul className="space-y-2">
                    {term.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start text-gray-600">
                        <span className="text-blue-500 mr-2">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
 
        {/* CTA Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 text-white">
            <h2 className="text-3xl font-bold mb-4">Need Immediate Help?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Our local support team is ready to assist with your warranty claims in Akshay Nagar and Other
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-2xl font-semibold"
              >
                📞 Call Support
                <span className="font-bold">+91 98765 43210</span>
              </a>
              <Button
                variant="third"
                onClick={() => navigate('/help-center')}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-white/30 px-8 py-4 text-lg rounded-2xl"
              >
                Visit Help Center
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}