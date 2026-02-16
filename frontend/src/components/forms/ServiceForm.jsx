import React, { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Select from '../ui/Select'
import Card from '../ui/Card'
import servicesService from '../../services/services.service'
import categoriesService from '../../services/categories.service'
import subcategoriesService from '../../services/subcategories.service'

/**
 * ServiceForm props:
 * - initial (optional) : existing service object for edit
 * - onSaved(service)
 * - onCancel() (optional) : called when user cancels / closes form
 */
export default function ServiceForm({ initial = null, onSaved = () => {}, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [data, setData] = useState({
    title: '',
    description: '',
    category: '',
    subCategoryId: '',
    basePrice: '',
    duration: '',
    image: '',
    images: [],
    variants: [{ name: 'Standard', priceModifier: 0 }],
    featured: false,
    isActive: true,
    hasWarranty: true,
    warrantyDurationDays: 14,
    ...initial
  })
  const [subcategories, setSubcategories] = useState([])

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

  useEffect(() => {
    if (!data.category) {
      setSubcategories([])
      setField('subCategoryId', '')
      return
    }
    const cat = categories.find(c => c.name === data.category)
    if (!cat?._id) {
      setSubcategories([])
      return
    }
    subcategoriesService.listByCategory(cat._id)
      .then(res => {
        const list = res.data?.items || []
        setSubcategories(Array.isArray(list) ? list : [])
      })
      .catch(() => setSubcategories([]))
  }, [data.category, categories])

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
      const payload = { ...data }
      if (!payload.subCategoryId) delete payload.subCategoryId
      payload.warrantyDurationDays = payload.warrantyDurationDays ? Number(payload.warrantyDurationDays) : 0
      payload.hasWarranty = payload.warrantyDurationDays > 0
      let res
      if (initial && initial._id) res = await servicesService.update(initial._id, payload)
      else res = await servicesService.create(payload)
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
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            {initial ? 'Edit Service' : 'Create Service'}
          </div>
          {/* Close / Cancel button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="ml-4 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      }
    >
      <form onSubmit={save} className="space-y-4">
        <Input
          label="Title"
          value={data.title}
          onChange={(e) => setField('title', e.target.value)}
          required
        />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <textarea
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.description}
            onChange={(e) => setField('description', e.target.value)}
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
              onChange={(e) => setField('category', e.target.value)}
              required
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories ? 'Loading categories...' : 'Select Category'}
              </option>
              {categories.map((cat) => (
                <option key={cat._id || cat.slug} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Sub-category (optional)</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={data.subCategoryId || ''}
              onChange={(e) => setField('subCategoryId', e.target.value)}
            >
              <option value="">None</option>
              {subcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Base Price (₹)"
            value={data.basePrice}
            onChange={(e) => setField('basePrice', e.target.value)}
            type="number"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Duration (e.g. 2 hours)"
            value={data.duration}
            onChange={(e) => setField('duration', e.target.value)}
            placeholder="e.g., 1-2 hours"
          />
          <Input
            label="Warranty (days)"
            type="number"
            min={0}
            value={data.warrantyDurationDays ?? 0}
            onChange={(e) => setField('warrantyDurationDays', e.target.value ? Number(e.target.value) : 0)}
            placeholder="e.g. 14, 30, 90 (0 = no warranty)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Main Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files?.[0])}
              className="text-sm"
            />
            {data.image && (
              <img
                src={data.image}
                alt="preview"
                className="mt-2 w-40 h-24 object-cover rounded-lg border"
              />
            )}
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>
            {initial ? 'Save changes' : 'Create service'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
