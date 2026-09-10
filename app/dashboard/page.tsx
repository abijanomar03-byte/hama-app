'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  title: string
  price: number
  location: string
  status: string
}

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMyListings() {
      const { data, error } = await supabase.from('properties').select('*')
      if (!error && data) {
        setProperties(data as Property[])
      }
      setLoading(false)
    }
    fetchMyListings()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      {loading ? (
        <p className="text-gray-500">Loading your listings...</p>
      ) : properties.length === 0 ? (
        <p className="text-gray-500">You have no active property listings.</p>
      ) : (
        <div className="space-y-4">
          {properties.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.location} - KSh {item.price.toLocaleString()}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium uppercase">
                {item.status || 'Active'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
