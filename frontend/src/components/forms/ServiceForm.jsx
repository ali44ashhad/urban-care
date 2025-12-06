import React, { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Select from '../ui/Select'
import Card from '../ui/Card'
import servicesService from '../../services/services.service'
import categoriesService from '../../services/categories.service'

/**
 * ServiceForm props:
 * - initial (optional) : existing service object for edit
 * - onSaved(service)
 */
export default function ServiceForm({ initial = null, onSaved = () => {} }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [data, setData] = useState({
    title: '',
    description: '',
    category: '',
    basePrice: '',
    duration: '',
    image: '',
    images: [], // Multiple images
    variants: [{ name: 'Standard', priceModifier: 0 }],
    featured: false,
    isActive: true,
    ...initial
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await categoriesService.list({ isActive: 'true' })
      const cats = res.data.items || res.data || []
      setCategories(cats)
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => { if (initial) setData(prev => ({ ...prev, ...initial })) }, [initial])

  function setField(k, v) { setData(d => ({ ...d, [k]: v })) }

  function setVariant(index, field, value) {
    setData(d => {
      const nv = [...(d.variants || [])]
      nv[index] = { ...nv[index], [field]: value }
      return { ...d, variants: nv }
    })
  }

  function addVariant() {
    setData(d => ({ ...d, variants: [...(d.variants || []), { name: 'New', priceModifier: 0 }] }))
  }
  function removeVariant(i) {
    setData(d => ({ ...d, variants: d.variants.filter((_, idx) => idx !== i) }))
  }

  function handleImage(file) {
    if (!file) { setField('image',''); return }
    const reader = new FileReader()
    reader.onload = (e) => setField('image', e.target.result)
    reader.readAsDataURL(file)
  }

  function handleMultipleImages(files) {
    if (!files || files.length === 0) return
    const fileArray = Array.from(files).slice(0, 6) // Max 6 images
    
    Promise.all(
      fileArray.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      })
    ).then(images => {
      setField('images', images)
    })
  }

  function removeImage(index) {
    setData(d => ({ ...d, images: d.images.filter((_, i) => i !== index) }))
  }

  async function save(e) {
    e?.preventDefault()
    setError(null)
    if (!data.title) return setError('Title is required')
    if (!data.basePrice) return setError('Base price required')

    console.log('ServiceForm: Saving data:', {
      title: data.title,
      category: data.category,
      basePrice: data.basePrice,
      image: data.image ? `${data.image.substring(0, 50)}...` : 'No image',
      imagesCount: data.images?.length || 0,
      imagesPreview: data.images?.map(img => img.substring(0, 30)) || []
    })

    setSaving(true)
    try {
      let res
      if (initial && initial._id) res = await servicesService.update(initial._id, data)
      else res = await servicesService.create(data)
      console.log('ServiceForm: API response:', res)
      console.log('ServiceForm: Calling onSaved with:', res.data)
      onSaved(res.data)
    } catch (err) {
      console.error('ServiceForm: Save error:', err)
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card header={<div className="flex items-center justify-between"><div className="text-lg font-semibold">{initial ? 'Edit Service' : 'Create Service'}</div></div>}>
      <form onSubmit={save} className="space-y-4">
        <Input label="Title" value={data.title} onChange={(e)=>setField('title', e.target.value)} required />
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <textarea 
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.description} 
            onChange={(e)=>setField('description', e.target.value)}
            rows="3"
            placeholder="Describe the service in detail..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
            <select 
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={data.category} 
              onChange={(e)=>setField('category', e.target.value)}
              required
              disabled={loadingCategories}
            >
              <option value="">{loadingCategories ? 'Loading categories...' : 'Select Category'}</option>
              {categories.map(cat => (
                <option key={cat._id || cat.slug} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input label="Base Price (₹)" value={data.basePrice} onChange={(e)=>setField('basePrice', e.target.value)} type="number" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Duration (e.g. 2 hours)" value={data.duration} onChange={(e)=>setField('duration', e.target.value)} placeholder="e.g., 1-2 hours" />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Main Image</label>
            <input type="file" accept="image/*" onChange={(e)=>handleImage(e.target.files?.[0])} className="text-sm" />
            {data.image && <img src={data.image} alt="preview" className="mt-2 w-40 h-24 object-cover rounded-lg border" />}
          </div>
        </div>

        {/* Multiple Images Upload */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Gallery Images (Max 6)</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={(e)=>handleMultipleImages(e.target.files)} 
            className="text-sm"
          />
          {data.images && data.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {data.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt={`gallery-${i}`} className="w-full h-24 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={data.featured} 
              onChange={(e)=>setField('featured', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Featured Service</span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Pricing Variants</div>
            <Button type="button" variant="secondary" size="sm" onClick={addVariant}>Add Variant</Button>
          </div>
          <div className="space-y-2">
            {data.variants?.map((v, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 items-center">
                <input 
                  className="rounded-xl border px-3 py-2" 
                  value={v.name} 
                  onChange={e=>setVariant(i,'name',e.target.value)}
                  placeholder="Variant name"
                />
                <input className="rounded-xl border px-3 py-2" value={v.priceModifier} onChange={e=>setVariant(i,'priceModifier',Number(e.target.value))} type="number" />
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={()=>removeVariant(i)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={data.featured} onChange={(e)=>setField('featured', e.target.checked)} />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>{initial ? 'Save changes' : 'Create service'}</Button>
        </div>
      </form>
    </Card>
  )
}
