import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Replace these with actual Supabase URL and anon key for the project to work properly in a deployed state.
// Since we don't have the real keys yet, we'll initialize them with placeholders.
// The user should replace these in a .env file later, but for scaffolding we provide a dummy client that will fail gracefully or warn.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
