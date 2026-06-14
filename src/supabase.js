import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || SUPABASE_URL.includes('VOTRE_ID')) {
  console.warn('⚠️ Configure ton .env avec les vraies clés Supabase !')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
