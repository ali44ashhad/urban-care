import React from 'react'
import Card from '../../components/ui/Card'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                <p>
                  RAWW Platform ("we," "our," or "us") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                  when you use our platform to book home services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="mb-2">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name, email address, phone number, and postal address</li>
                  <li>Payment information (processed securely through third-party payment processors)</li>
                  <li>Service booking details and preferences</li>
                  <li>Reviews and ratings you submit</li>
                  <li>Communication preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="mb-2">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Process and manage your service bookings</li>
                  <li>Communicate with you about your bookings and our services</li>
                  <li>Send you promotional materials (with your consent)</li>
                  <li>Improve our platform and services</li>
                  <li>Detect and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Information Sharing</h2>
                <p>
                  We share your information with service providers who perform services on our behalf, 
                  such as payment processing and customer support. We also share necessary booking 
                  information with service providers to complete your bookings. We do not sell your 
                  personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
                <p className="mb-2">You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify inaccurate or incomplete data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:privacy@raww.com" className="text-blue-600 hover:underline">
                    privacy@raww.com
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
