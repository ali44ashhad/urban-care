import React, { useState } from 'react'
import Card from '../../components/ui/Card'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What services does Stunn offer?',
          a: 'Stunn offers a wide range of professional home care services including AC cleaning, deep cleaning, plumbing, electrical work, beauty services, and more. Browse our services page to see the complete list.'
        },
        {
          q: 'In which cities do you operate?',
          a: 'Currently, we operate in Bangalore with plans to expand to more cities. We serve areas like Akshay Nagar, Other, and surrounding locations.'
        },
        {
          q: 'How do I know if a service is available in my area?',
          a: 'You can check service availability by entering your location during the booking process. Our system will show you available time slots and services for your area.'
        }
      ] 
    },
    {
      category: 'Booking & Payment',
      questions: [
        {
          q: 'How do I book a service?',
          a: 'Simply browse our services, select the one you need, choose a convenient time slot, provide your address, and confirm your booking. The entire process takes just a few minutes.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept cash, UPI, debit cards, and credit cards. Payment is made after service completion (Payment on Delivery).'
        },
        {
          q: 'Do I need to pay upfront?',
          a: 'No, you don\'t need to pay upfront. We offer Payment on Delivery (POD) - you pay only after the service is completed to your satisfaction.'
        },
        {
          q: 'Can I get a refund if I cancel?',
          a: 'Refund policies vary based on cancellation timing. Free cancellation 24+ hours before service, 50% refund for 12-24 hours notice, and no refund for less than 12 hours. See our Refund Policy for details.'
        }
      ]
    },
    {
      category: 'Service Providers',
      questions: [
        {
          q: 'Are your service providers verified?',
          a: 'Yes, all our service providers undergo thorough background checks, identity verification, and skill assessments. We ensure only qualified and trustworthy professionals serve you.'
        },
        {
          q: 'What if I\'m not satisfied with the service?',
          a: 'We offer a 14-day warranty on qualifying services. If you face any issues, contact our support team and we\'ll send a technician to resolve it at no extra cost.'
        },
        {
          q: 'Can I request a specific service provider?',
          a: 'While we can\'t guarantee a specific provider, we ensure all our professionals meet our quality standards. You can leave special instructions during booking.'
        }
      ]
    },
    {
      category: 'Warranty & Support',
      questions: [
        {
          q: 'What is covered under warranty?',
          a: 'Our 14-day warranty covers workmanship issues and service-related problems. A warranty slip is provided after service completion. Contact us within 14 days if you experience any issues.'
        },
        {
          q: 'How do I claim warranty?',
          a: 'Go to "Warranty" in your account, select the service, describe the issue, and submit your claim. Our team will review and send a technician to resolve it.'
        },
        {
          q: 'What if the issue occurs after 14 days?',
          a: 'While our standard warranty is 14 days, we\'re committed to customer satisfaction. Contact our support team and we\'ll review your case individually.'
        }
      ]
    },
    {
      category: 'Cancellation & Rescheduling',
      questions: [
        {
          q: 'Can I cancel my booking?',
          a: 'Yes, you can cancel your booking anytime. Cancellation fees apply based on timing - free cancellation 24+ hours before, 50% fee for 12-24 hours, and full charge for less than 12 hours notice.'
        },
        {
          q: 'How do I reschedule my booking?',
          a: 'You can reschedule your booking up to 24 hours before the scheduled time. Go to "My Bookings" and select the reschedule option to choose a new time slot.'
        },
        {
          q: 'What happens if the service provider cancels?',
          a: 'If a service provider cancels, you\'ll receive a full refund automatically. We\'ll also help you find an alternative provider if available.'
        }
      ]
    }
  ]

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our services, booking process, and policies.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">{section.category}</h2>
                <div className="space-y-4">
                  {section.questions.map((faq, faqIndex) => {
                    const globalIndex = sectionIndex * 100 + faqIndex
                    const isOpen = openIndex === globalIndex
                    
                    return (
                      <div key={faqIndex} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <button
                          onClick={() => toggleQuestion(globalIndex)}
                          className="w-full text-left flex items-center justify-between gap-4 py-2"
                        >
                          <h3 className="text-lg font-medium text-gray-900 pr-8">{faq.q}</h3>
                          <svg
                            className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="mt-3 pl-0">
                            <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/help-center"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Visit Help Center
              </a>
              <a
                href="/contact"
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Contact Support
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
