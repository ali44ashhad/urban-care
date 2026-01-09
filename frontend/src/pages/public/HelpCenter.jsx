import React from 'react'
import Card from '../../components/ui/Card'

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-6">Help Center</h1>
            <p className="text-gray-600 mb-8">
              Find answers to common questions and get help with your service bookings.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">How do I book a service?</h3>
                    <p className="text-gray-700">
                      Browse our services, select the one you need, choose a time slot, provide your address, 
                      and confirm your booking. Our verified professionals will arrive at your scheduled time.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Do I need to create an account?</h3>
                    <p className="text-gray-700">
                      Yes, creating an account helps us track your bookings, manage warranties, and provide 
                      better service. You can sign up quickly with your email or phone number.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">How do I pay for services?</h3>
                    <p className="text-gray-700">
                      We offer Payment on Delivery (POD). You can pay after the service is completed to your 
                      satisfaction. We accept cash, UPI, and card payments.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Booking & Scheduling</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Can I reschedule my booking?</h3>
                    <p className="text-gray-700">
                      Yes, you can reschedule your booking up to 24 hours before the scheduled time. 
                      Simply go to "My Bookings" and select the reschedule option.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">What if I need to cancel?</h3>
                    <p className="text-gray-700">
                      You can cancel your booking anytime. Cancellation fees apply based on timing - 
                      free cancellation 24+ hours before, 50% fee for 12-24 hours, and full charge 
                      for less than 12 hours notice.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">How do I track my booking?</h3>
                    <p className="text-gray-700">
                      Once booked, you'll receive confirmation details via SMS and email. You can track 
                      your booking status in the "My Bookings" section of your account.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Service & Quality</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Are your service providers verified?</h3>
                    <p className="text-gray-700">
                      Yes, all our service providers undergo background checks, identity verification, 
                      and skill assessments. We ensure only qualified professionals serve you.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">What if I'm not satisfied with the service?</h3>
                    <p className="text-gray-700">
                      We offer a 14-day warranty on qualifying services. If you face any issues, 
                      contact our support team and we'll send a technician to resolve it at no extra cost.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">What materials do you use?</h3>
                    <p className="text-gray-700">
                      Our professionals use high-quality, industry-standard materials. For specific 
                      services, materials are included in the service price. You'll be informed 
                      beforehand if any additional materials are needed.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Warranty & Support</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">What is covered under warranty?</h3>
                    <p className="text-gray-700">
                      Our 14-day warranty covers workmanship issues and service-related problems. 
                      A warranty slip is provided after service completion. Contact us within 14 days 
                      if you experience any issues.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">How do I claim warranty?</h3>
                    <p className="text-gray-700">
                      Go to "Warranty" in your account, select the service, describe the issue, and 
                      submit your claim. Our team will review and send a technician to resolve it.
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Still need help?</h3>
                <p className="text-blue-800 mb-4">
                  If you couldn't find the answer you're looking for, our support team is here to help.
                </p>
                <div className="flex gap-4">
                  <a
                    href="/contact"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Contact Us
                  </a>
                   
                </div>
              </section>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
