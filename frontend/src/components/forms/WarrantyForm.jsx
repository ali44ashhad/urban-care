import React, { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import warrantyService from '../../services/warranty.service'

/**
 * props:
 * - bookingId (required)
 * - onSubmitted()
 */
export default function WarrantyForm({ bookingId, onSubmitted = () => {} }) {
  const [issue, setIssue] = useState('')
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleFiles(files) {
    const arr = Array.from(files)
    // keep as File objects; you may convert to base64 here or send FormData in service
    setAttachments(arr)
  }

  async function submit(e) {
    e?.preventDefault()
    console.log('Submit called, bookingId:', bookingId, 'issue:', issue)
    
    if (!bookingId) {
      console.error('No bookingId provided')
      return setError('Invalid booking')
    }
    if (!issue) {
      console.error('No issue provided')
      return setError('Please describe the issue')
    }

    setLoading(true); setError(null)
    try {
      // prepare formdata for attachments
      const fd = new FormData()
      fd.append('bookingId', bookingId)
      fd.append('issueDetails', issue)
      attachments.forEach((f,i) => fd.append('attachments', f, f.name))
      
      console.log('Sending warranty request...', { bookingId, issueDetails: issue, attachments: attachments.length })
      const response = await warrantyService.create(fd) // ensure backend accepts multipart/form
      console.log('Warranty response:', response)
      
      onSubmitted()
    } catch (err) {
      console.error('Warranty submission error:', err)
      setError(err.response?.data?.message || err.message || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow space-y-4">
      <h4 className="text-lg font-semibold">Request Warranty</h4>
      <Input label="Describe the issue" value={issue} onChange={(e)=>setIssue(e.target.value)} />
      <div>
        <label className="text-sm text-gray-700">Attachments (optional)</label>
        <input type="file" onChange={(e)=>handleFiles(e.target.files)} multiple className="mt-2" />
        <div className="text-xs text-gray-500 mt-1">{attachments.length} file(s) selected</div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>Submit Claim</Button>
        <Button variant="ghost" type="button" onClick={() => { setIssue(''); setAttachments([]) }}>Reset</Button>
      </div>
    </form>
  )
}
