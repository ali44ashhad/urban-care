import React from 'react'
import Card from '../../components/ui/Card'

export default function Cancellation() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-6">Cancellation Policy</h1>
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Customer Cancellations</h2>
                <p className="mb-2">You may cancel your booking at any time through your account dashboard or by contacting customer support. Cancellation fees apply based on timing:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>24+ hours before service:</strong> Free cancellation, full refund</li>
                  <li><strong>12-24 hours before service:</strong> 50% cancellation fee</li>
                  <li><strong>Less than 12 hours before service:</strong> 100% cancellation fee (no refund)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Provider Cancellations</h2>
                <p>
                  If a service provider cancels your booking, you will receive a full refund automatically. 
                  We will also help you find an alternative provider if available. In case of repeated 
                  cancellations by a provider, we take appropriate action to ensure service reliability.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Emergency Cancellations</h2>
                <p>
                  In case of emergencies or unforeseen circumstances, please contact our customer support 
                  team immediately. We will review each case individually and may waive cancellation fees 
                  at our discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Rescheduling</h2>
                <p>
                  You may reschedule your booking up to 24 hours before the scheduled service time at no 
                  additional charge, subject to provider availability. Rescheduling requests made less 
                  than 24 hours before service may be subject to availability and additional fees.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. No-Show Policy</h2>
                <p>
                  If a service provider arrives at the scheduled time and location but you are not available 
                  (no-show), the booking will be considered completed and no refund will be issued. Please 
                  ensure you are available at the scheduled time or cancel/reschedule in advance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. How to Cancel</h2>
                <p className="mb-2">You can cancel your booking through:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your account dashboard under "My Bookings"</li>
                  <li>Email to support@stunn.com with your booking reference number</li>
                  <li>Phone support (available during business hours)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Refund Processing</h2>
                <p>
                  If you are eligible for a refund based on our cancellation policy, the refund will be 
                  processed within 5-7 business days to your original payment method. Please refer to our 
                  Refund Policy for more details.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
                <p>
                  For questions about cancellations or to request special consideration, please contact us at{' '}
                  <a href="mailto:support@stunn.com" className="text-blue-600 hover:underline">
                    support@stunn.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
