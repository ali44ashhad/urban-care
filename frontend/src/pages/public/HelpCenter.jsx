import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function HelpCenter() {
  const navigate = useNavigate()

  const categories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      color: 'from-blue-500 to-cyan-500',
      questions: [
        {
          q: 'How do I book a service?',
          a: 'Browse our services, select the one you need, choose a time slot, provide your address in Akshay Nagar or Other, and confirm your booking. Our verified local professionals will arrive at your scheduled time.'
        },
        {
          q: 'Do I need to create an account?', 
          a: 'Yes, creating an account helps us track your bookings, manage warranties, and provide better localized service. You can sign up quickly with your email or phone number.'
        },
        {
          q: 'How do I pay for services?',
          a: 'We offer Payment on Delivery (POD) only. You can pay after the service is completed to your satisfaction. We accept cash, UPI, and card payments. No advance payment required.'
        }
      ]
    },
    {
      title: 'Booking & Scheduling',
      icon: '📅',
      color: 'from-purple-500 to-pink-500',
      questions: [
        {
          q: 'Can I reschedule my booking?',
          a: 'Yes, you can reschedule your booking up to 24 hours before the scheduled time. Simply go to "My Bookings" in your account and select the reschedule option.'
        },
        {
          q: 'What if I need to cancel?',
          a: 'You can cancel your booking anytime. Cancellation fees apply based on timing - free cancellation 24+ hours before, 50% fee for 12-24 hours, and full charge for less than 12 hours notice.'
        },
        {
          q: 'How do I track my booking?',
          a: 'Once booked, you\'ll receive confirmation details via SMS and email. You can track your booking status in real-time in the "My Bookings" section of your account.'
        }
      ]
    },
    {
      title: 'Service & Quality',
      icon: '💎',
      color: 'from-yellow-500 to-orange-500',
      questions: [
        {
          q: 'Are your service providers verified?',
          a: 'Yes, all our local service providers undergo rigorous background checks, identity verification, skill assessments, and area-specific training. We ensure only qualified professionals serve your neighborhood.'
        },
        {
          q: 'What if I\'m not satisfied with the service?',
          a: 'We offer a 14-day warranty on qualifying services. If you face any issues, contact our support team and we\'ll send a local technician to resolve it at no extra cost.'
        },
        {
          q: 'What materials do you use?',
          a: 'Our professionals use high-quality, industry-standard materials. For specific services, materials are included in the service price. You\'ll be informed beforehand if any additional materials are needed.'
        }
      ]
    },
    {
      title: 'Warranty & Support',
      icon: '🔒',
      color: 'from-green-500 to-emerald-500',
      questions: [
        {
          q: 'What is covered under warranty?',
          a: 'Our 14-day warranty covers workmanship issues and service-related problems. A warranty slip is provided after service completion. Contact us within 14 days if you experience any issues.'
        },
        {
          q: 'How do I claim warranty?',
          a: 'Go to "Warranty" in your account, select the service, describe the issue, and submit your claim. Our local support team will review and send a technician from your area to resolve it.'
        }
      ]
    }
  ]

  const quickLinks = [ 
    { title: 'My Warranty', icon: '📋', path: '/warranty', color: 'bg-purple-100 text-purple-600' },
    { title: 'Service Areas', icon: '🗺️', path: '/about', color: 'bg-green-100 text-green-600' },
    { title: 'Contact Support', icon: '💬', path: '/contact', color: 'bg-orange-100 text-orange-600' }
  ]

  const popularQuestions = [
    'How quickly can I get service in my area?',
    'Are technicians from my local area?',
    'What payment methods are accepted?',
    'How do I provide feedback?'
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
              <span className="text-sm font-medium">24/7 Customer Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Help & 
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Support Center
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get instant help, track your bookings, and find answers to all your questions about 
              our services in <span className="font-semibold text-white">Akshay Nagar and Other</span>.
            </p>
 
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 -mt-8 relative z-20">
        {/* Quick Actions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12"
        >
          {quickLinks.map((link, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(link.path)}
              className={`${link.color} rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-lg transition-shadow`}
            >
              <span className="text-2xl mb-2">{link.icon}</span>
              <span className="font-medium text-sm">{link.title}</span>
            </motion.button>
          ))}
        </motion.div>

     

        {/* FAQ Categories */}
        <div className="space-y-8">
          {categories.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * catIdx }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                  {category.icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
              </div>

              <Card className="mb-8">
                <div className="p-8">
                  <div className="space-y-6">
                    {category.questions.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * idx }}
                        className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold">Q</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.q}</h3>
                            <p className="text-gray-700 leading-relaxed">{item.a}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Support CTA */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 text-white text-center">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our local support team is available 24/7 to help with your queries about services in 
              Akshay Nagar and Other.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/contact')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-2xl"
              >
                Contact Support
              </Button>
              <Button
                variant="third"
                onClick={() => navigate('/services')}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-white/30 px-8 py-4 text-lg rounded-2xl"
              >
                Book Service Now
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Emergency Support */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl text-white">
                  🚨
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Emergency Support</h3>
                  <p className="text-gray-700 mb-2">
                    Need urgent help? Call our 24/7 emergency line for immediate assistance.
                  </p>
                  <div className="flex items-center gap-4">
                    <a
                      href="tel:+919876543210"
                      className="text-lg font-bold text-red-600 hover:text-red-700"
                    >
                      📞 +91 98765 43210
                    </a>
                    <span className="text-sm text-gray-600">Available 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}