export const SUPABASE_URL = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev'
// In Vite, environment variables exposed to the browser must start with VITE_
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbnVta3Vmcm5yamVuc21nb3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjQxNTQsImV4cCI6MjA2NzkwMDE1NH0.Gan0vhw4YvktYA-45OQGjO3RxmFGjxihBlzqtUnRuqo'

// We completely bypass the @supabase/supabase-js library because it strictly
// hard-errors in the browser if a service key ('sb_secret_...') is used. 
// Instead, we interact with the PostgREST REST API directly using fetch().
export const supabase = {
    from(tableName) {
        const tablePath = `/rest/v1/${tableName}`

        async function proxyRequest(endpoint, method, payload = null, headers = {}) {
            try {
                const res = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint, method, payload, headers })
                })
                const data = await res.json()
                return { data: res.ok ? data : null, error: res.ok ? null : data }
            } catch (e) {
                return { data: null, error: e }
            }
        }

        return {
            select(query = '*') {
                return {
                    async eq(column, value) {
                        return {
                            async maybeSingle() {
                                const res = await proxyRequest(`${tablePath}?select=${query}&${column}=eq.${value}`, 'GET')
                                return { data: res.data ? res.data[0] || null : null, error: res.error }
                            }
                        }
                    },
                    async in(column, arrayValues) {
                        const arrStr = arrayValues.map(v => `"${v}"`).join(',')
                        return proxyRequest(`${tablePath}?select=${query}&${column}=in.(${arrStr})`, 'GET')
                    },
                    async order(column, { ascending = true } = {}) {
                        return proxyRequest(`${tablePath}?select=${query}&order=${column}.${ascending ? 'asc' : 'desc'}`, 'GET')
                    },
                    async then(resolve) {
                        resolve(await proxyRequest(`${tablePath}?select=${query}`, 'GET'))
                    }
                }
            },
            update(updates) {
                return {
                    async eq(column, value) {
                        return proxyRequest(`${tablePath}?${column}=eq.${value}`, 'PATCH', updates, { 'Prefer': 'return=representation' })
                    }
                }
            },
            delete() {
                return {
                    async eq(column, value) {
                        return proxyRequest(`${tablePath}?${column}=eq.${value}`, 'DELETE')
                    }
                }
            }
        }
    }
}
