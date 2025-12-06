import React, { useState } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Textarea from '../../components/ui/Input' // if you have a dedicated textarea component, replace accordingly
import notificationsService from '../../services/notifications.service'

/**
 * Contact page:
 * - Sends a message to the backend via notificationsService.send
 * - Alternatively you can implement a dedicated contact endpoint
 */

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e?.preventDefault()
    setError(null)
    setSuccess(null)
    if (!form.name || !form.email || !form.message) {
      return setError('Please provide name, email and message.')
    }
    setLoading(true)
    try {
      // Use notificationsService.send to forward the contact message to admin/system
      await notificationsService.send({
        type: 'contact',
        payload: { ...form }
      })
      setSuccess('Thanks — we will get back to you soon.')
      setForm({ name: '', email: '', phone: '', message: '' })
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Message sent', type: 'success' } }))
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Contact us</h2>
              <p className="text-gray-600 mb-4">Have a question or need help with a booking? Send us a message and we’ll reply within one business day.</p>

              <div className="text-sm text-gray-700 space-y-2">
                <div><strong>Email:</strong> support@varshaservices.example</div>
                <div><strong>Phone:</strong> +91 98765 43210</div>
                <div><strong>Office:</strong> 123 Varsha Street, City</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full name" value={form.name} onChange={(e) => setField('name', e.target.value)} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
              <Input label="Phone (optional)" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              <label className="block">
                <div className="text-sm font-medium text-gray-700 mb-1">Message</div>
                <textarea
                  rows={5}
                  className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)}
                />
              </label>

              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}

              <div className="flex gap-3">
                <Button type="submit" loading={loading}>Send message</Button>
                <Button variant="ghost" onClick={() => setForm({ name: '', email: '', phone: '', message: '' })}>Clear</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
