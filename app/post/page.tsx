'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PostPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    phone: '',
    description: '',
  })
  const [imageUrl, setImageUrl] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const imagesArray = imageUrl.trim() ? [imageUrl.trim()] : []

    const { error } = await supabase.from('properties').insert([
      {
        title: formData.title,
        location: formData.location,
        price: parseFloat(formData.price) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        phone: formData.phone,
        description: formData.description,
        images: imagesArray,
        status: 'approved',
      },
    ])

    setLoading(false)

    if (error) {
      alert('Error creating listing: ' + error.message)
    } else {
      alert('Listing created successfully!')
      router.push('/')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Post a New Property</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Modern 2 Bed Apartment in Kilimani"
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Kilimani, Nairobi"
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (KSh)</label>
            <input
              type="number"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 45000"
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              placeholder="2"
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              placeholder="1"
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Phone</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 254712345678"
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed property specs..."
            className="w-full border rounded-lg p-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? 'Publishing...' : 'Publish Property'}
        </button>
      </form>
    </div>
  )
}
