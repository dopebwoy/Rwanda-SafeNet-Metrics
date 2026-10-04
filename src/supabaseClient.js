import { createClient } from '@supabase/supabase-js'

// Replace with your actual Supabase URL and Anon Key from https://supabase.com
// Get these from: Project Settings → API → Project URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper: Get all districts with poverty data
export const getDistricts = async () => {
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .order('name')

  if (error) console.error('Error fetching districts:', error)
  return data || []
}

// Helper: Get household count by district
export const getHouseholdStats = async (districtId) => {
  const { data, error } = await supabase
    .from('households')
    .select('id, vulnerability_score')
    .eq('district_id', districtId)

  if (error) console.error('Error fetching households:', error)
  return data || []
}

// Helper: Get audit log entries
export const getAuditLog = async (limit = 10) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, user:users(name), action, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) console.error('Error fetching audit log:', error)
  return data || []
}

// Helper: Get filtered households by province and urban/rural
export const getFilteredHouseholds = async (province, urbanRural) => {
  let query = supabase.from('households').select('*')

  if (province && province !== 'All Provinces') {
    query = query.eq('province', province)
  }

  if (urbanRural && urbanRural !== 'All') {
    query = query.eq('urban_rural', urbanRural)
  }

  const { data, error } = await query

  if (error) console.error('Error filtering households:', error)
  return data || []
}

// Helper: Get user profile
export const getUserProfile = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) console.error('Error getting user:', error)
  return data?.user || null
}

// Helper: Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error signing out:', error)
}
