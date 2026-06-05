import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getCookie, setCookie, deleteCookie } from 'vinxi/http'

export async function updateSession() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookie(name)
        },
        set(name: string, value: string, options: CookieOptions) {
          setCookie(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          deleteCookie(name)
        },
      },
    }
  )

  // This will refresh the session if needed by calling getUser()
  await supabase.auth.getUser()
}
