'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*, images')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProperties(data)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Featured Properties</h1>
        <Link
          href="/post"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          + Post Property
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading listings...</p>
      ) : properties.length === 0 ? (
        <p className="text-gray-500">No properties available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white">
              {property.images && property.images.length > 0 ? (
                <div className="relative h-48 w-full bg-gray-100">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                      +{property.images.length - 1} photos
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}

              <div className="p-4">
                <h2 className="font-semibold text-lg line-clamp-1">{property.title}</h2>
                <p className="text-gray-500 text-sm mb-2">{property.location}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-green-700">
                    KSh {property.price?.toLocaleString()}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {property.bedrooms} Bed | {property.bathrooms} Bath
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
