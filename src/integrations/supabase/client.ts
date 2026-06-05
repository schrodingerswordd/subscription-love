import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export const supabase = createBrowserClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)
