import React from 'react'
import Card from '../../components/ui/Card'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using RAWW Platform, you accept and agree to be bound by the 
                  terms and provision of this agreement. If you do not agree to these Terms of Service, 
                  please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Use of the Platform</h2>
                <p className="mb-2">You agree to use the platform only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use the platform in any way that violates any applicable law or regulation</li>
                  <li>Transmit any malicious code or harmful content</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the platform or servers</li>
                  <li>Attempt to gain unauthorized access to any portion of the platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Service Bookings</h2>
                <p>
                  When you book a service through our platform, you enter into a contract with the 
                  service provider. RAWW acts as an intermediary platform connecting customers 
                  with service providers. We are not responsible for the quality, safety, or legality 
                  of services provided by third-party service providers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Payment Terms</h2>
                <p>
                  Payment for services is processed through secure third-party payment processors. 
                  You agree to provide accurate payment information and authorize us to charge your 
                  payment method for services booked through the platform. All fees are non-refundable 
                  unless otherwise stated in our Refund Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Cancellation and Refunds</h2>
                <p>
                  Cancellation and refund policies are outlined in our Cancellation Policy and Refund 
                  Policy. Please review these policies before booking a service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Warranty</h2>
                <p>
                  Certain services may come with a warranty as specified at the time of booking. 
                  Warranty terms and conditions are provided separately and are subject to the 
                  service provider's warranty policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
                <p>
                  RAWW Platform shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages resulting from your use of or inability to 
                  use the platform or services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. We will notify 
                  users of any material changes by posting the new Terms on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Contact Information</h2>
                <p>
                  If you have questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:legal@raww.com" className="text-blue-600 hover:underline">
                    legal@raww.com
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
