import React from 'react'
import Card from '../../components/ui/Card'

export default function Refund() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-6">Refund Policy</h1>
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Refund Eligibility</h2>
                <p>
                  Refunds may be available under certain circumstances as outlined in this policy. 
                  All refund requests are subject to review and approval by Stunn Platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Service Not Completed</h2>
                <p>
                  If a service provider fails to complete the booked service or cancels the service 
                  without providing adequate notice, you may be eligible for a full refund. Refunds 
                  will be processed within 5-7 business days to your original payment method.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Service Quality Issues</h2>
                <p>
                  If you are dissatisfied with the quality of service provided, please contact our 
                  customer support within 24 hours of service completion. We will investigate the 
                  issue and may offer a partial or full refund based on the circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Cancellation by Customer</h2>
                <p>
                  If you cancel a booking, refund eligibility depends on the cancellation timing:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>24+ hours before service:</strong> Full refund</li>
                  <li><strong>12-24 hours before service:</strong> 50% refund</li>
                  <li><strong>Less than 12 hours before service:</strong> No refund</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Processing Time</h2>
                <p>
                  Approved refunds will be processed within 5-7 business days. The refund will appear 
                  in your account depending on your payment method and bank processing times.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Non-Refundable Items</h2>
                <p className="mb-2">The following are generally non-refundable:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Services that have been completed to satisfaction</li>
                  <li>Services cancelled less than 12 hours before scheduled time</li>
                  <li>Any additional charges or fees agreed upon during service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. How to Request a Refund</h2>
                <p>
                  To request a refund, please contact our customer support team at{' '}
                  <a href="mailto:support@stunn.com" className="text-blue-600 hover:underline">
                    support@stunn.com
                  </a>{' '}
                  or through the contact form on our website. Please include your booking reference 
                  number and reason for the refund request.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Disputes</h2>
                <p>
                  If you have a dispute regarding a refund, please contact us first. We are committed 
                  to resolving all disputes fairly and promptly.
                </p>
              </section>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
