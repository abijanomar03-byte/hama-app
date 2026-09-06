import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export function createServerSupabase(req: NextRequest): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Supabase environment variables are missing.')

  const authHeader = req.headers.get('authorization') || ''
  return createClient(url, anon, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} }
  })
}

export function createServiceSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function requireUser(req: NextRequest) {
  const supabase = createServerSupabase(req)
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Authentication required.')
  return { supabase, user: data.user }
}
