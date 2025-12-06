import React from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold mb-4">About Varsha Services</h1>
            <p className="text-gray-600 mb-4">We connect you with trusted, background-checked professionals to take care of everyday home services — from AC cleaning to full home deep-cleaning and beauty services at home.</p>

            <ul className="space-y-3 text-gray-700">
              <li>• Verified professionals with identity & background checks</li>
              <li>• Transparent pricing & easy rebook</li>
              <li>• 90-day warranty on qualifying services</li>
              <li>• Dedicated support and easy cancellations</li>
            </ul>

            <div className="mt-6">
              <Button onClick={() => navigate('/auth/register')}>Become a Customer</Button>
              <Button variant="ghost" className="ml-3" onClick={() => navigate('/auth/register')}>Become a Provider</Button>
            </div>
          </div>

          <div>
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">Our mission</h3>
                <p className="text-gray-600">To make home services delightful: dependable professionals, transparent pricing, and a smooth booking experience.</p>
              </div>

              <div className="p-6 border-t">
                <h4 className="font-semibold mb-2">Values</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>• Quality: We carefully vet every professional.</div>
                  <div>• Transparency: Clear pricing and honest reviews.</div>
                  <div>• Respect: Safe, respectful service delivery for every home.</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-sm text-gray-600">Satisfied customers</div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold">200+</div>
              <div className="text-sm text-gray-600">Cities & service areas</div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold">4.9 ★</div>
              <div className="text-sm text-gray-600">Average rating</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
