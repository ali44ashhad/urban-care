import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { readDraft, writeDraft } from './bookingStore'
import servicesService from '../../../services/services.service'
import Button from '../../../components/ui/Button'
import Select from '../../../components/ui/Select'
import Input from '../../../components/ui/Input'

export default function PickService() {
  const navigate = useNavigate()
  const draft = readDraft()
  const [service, setService] = useState(draft.service || null)
  const [variant, setVariant] = useState(draft.variant || (draft.service?.variants?.[0]?.name))
  const [notes, setNotes] = useState(draft.notes || '')
  const [loading, setLoading] = useState(!service)
  const [servicesList, setServicesList] = useState([])

  useEffect(() => {
    let mounted = true
    if (!service) {
      servicesService.list().then(r => { if (mounted) setServicesList(r.data || []) }).catch(()=>{}).finally(()=> mounted && setLoading(false))
    } else setLoading(false)
    return () => mounted = false
  }, [service])

  function selectService(s) {
    setService(s)
    setVariant(s?.variants?.[0]?.name)
  }

  async function proceed() {
    if (!service) return alert('Select a service')
    writeDraft({ service, variant, notes })
    navigate('/client/booking/select-slot')
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Book a service</h2>

      {!service ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicesList.map(s => (
              <div key={s._id || s.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer" onClick={() => selectService(s)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-gray-500">{s.category}</div>
                  </div>
                  <div className="text-lg font-bold">₹{s.basePrice}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="text-xl font-semibold">{service.title}</div>
              <div className="text-sm text-gray-600">{service.description}</div>
            </div>
            <div className="text-lg font-bold">₹{service.basePrice}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Choose variant" value={variant} onChange={(e)=> setVariant(e.target.value)}
              options={(service.variants || []).map(v => ({ value: v.name, label: `${v.name} ${v.priceModifier ? `(₹${v.priceModifier >=0 ? '+' : ''}${v.priceModifier})` : ''}` }))} />
            <Input label="Notes for provider (optional)" value={notes} onChange={(e)=>setNotes(e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={proceed}>Next: Choose slot</Button>
            <Button variant="ghost" onClick={() => { writeDraft({}); navigate(-1) }}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}
