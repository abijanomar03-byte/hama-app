'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    const { data, error } = await supabase
      .from('properties')
      .select('*, images')
      .eq('status', 'approved')
      .or(`title.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`)

    if (!error && data) {
      setResults(data)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by location, title, or room details..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-500">Searching listings...</p>}

      {searched && !loading && results.length === 0 && (
        <p className="text-gray-500">No matching properties found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((property) => (
          <div key={property.id} className="border rounded-xl overflow-hidden flex gap-4 p-3 bg-white shadow-sm">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                No Photo
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                <p className="text-xs text-gray-500">{property.location}</p>
              </div>
              <div className="text-sm font-bold text-green-700">
                KSh {property.price?.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
