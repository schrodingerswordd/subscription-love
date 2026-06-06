import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { createClient } from '../utils/supabase/server'

const getSupabaseSession = createServerFn('GET', async () => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session ? {
    user: session.user,
    access_token: session.access_token,
    expires_at: session.expires_at,
  } : null
})

export const Route = createFileRoute('/test-supabase')({
  component: TestSupabase,
  loader: async () => {
    return await getSupabaseSession()
  }
})

function TestSupabase() {
  const session = Route.useLoaderData()
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Supabase SSR Test</h1>
      <div className="mt-4 p-4 bg-gray-100 rounded border border-gray-300">
        <h2 className="text-lg font-semibold mb-2">Session Data:</h2>
        <pre className="overflow-auto max-h-96 text-sm">
          {session ? JSON.stringify(session, null, 2) : 'No session found (User is not logged in or SSR failed)'}
        </pre>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>If you see "No session found" and you haven't logged in, that's expected.</p>
        <p>This test confirms that the Supabase client can be initialized and called on the server via TanStack Start's <code>createServerFn</code>.</p>
      </div>
    </div>
  )
}
