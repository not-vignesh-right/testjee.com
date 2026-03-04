export const SUPABASE_URL = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev'
// In Vite, environment variables exposed to the browser must start with VITE_
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbnVta3Vmcm5yamVuc21nb3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjQxNTQsImV4cCI6MjA2NzkwMDE1NH0.Gan0vhw4YvktYA-45OQGjO3RxmFGjxihBlzqtUnRuqo'

// We completely bypass the @supabase/supabase-js library because it strictly
// hard-errors in the browser if a service key ('sb_secret_...') is used. 
// Instead, we interact with the PostgREST REST API directly using fetch().
export const supabase = {
    from(tableName) {
        const tableUrl = `${SUPABASE_URL}/rest/v1/${tableName}`
        const headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }

        return {
            select(query = '*') {
                return {
                    async eq(column, value) {
                        return {
                            async maybeSingle() {
                                try {
                                    const res = await fetch(`${tableUrl}?select=${query}&${column}=eq.${value}`, { headers })
                                    const data = await res.json()
                                    return { data: data[0] || null, error: res.ok ? null : data }
                                } catch (e) { return { data: null, error: e } }
                            }
                        }
                    },
                    async in(column, arrayValues) {
                        try {
                            const arrStr = arrayValues.map(v => `"${v}"`).join(',')
                            const res = await fetch(`${tableUrl}?select=${query}&${column}=in.(${arrStr})`, { headers })
                            const data = await res.json()
                            return { data: res.ok ? data : null, error: res.ok ? null : data }
                        } catch (e) { return { data: null, error: e } }
                    },
                    async order(column, { ascending = true } = {}) {
                        try {
                            const res = await fetch(`${tableUrl}?select=${query}&order=${column}.${ascending ? 'asc' : 'desc'}`, { headers })
                            const data = await res.json()
                            return { data: res.ok ? data : null, error: res.ok ? null : data }
                        } catch (e) { return { data: null, error: e } }
                    },
                    async then(resolve) {
                        try {
                            const res = await fetch(`${tableUrl}?select=${query}`, { headers })
                            const data = await res.json()
                            resolve({ data: res.ok ? data : null, error: res.ok ? null : data })
                        } catch (e) { resolve({ data: null, error: e }) }
                    }
                }
            },
            update(updates) {
                return {
                    async eq(column, value) {
                        try {
                            const res = await fetch(`${tableUrl}?${column}=eq.${value}`, {
                                method: 'PATCH',
                                headers: { ...headers, 'Prefer': 'return=representation' },
                                body: JSON.stringify(updates)
                            })
                            const data = await res.json()
                            return { data: res.ok ? data : null, error: res.ok ? null : data }
                        } catch (e) { return { data: null, error: e } }
                    }
                }
            },
            delete() {
                return {
                    async eq(column, value) {
                        try {
                            const res = await fetch(`${tableUrl}?${column}=eq.${value}`, {
                                method: 'DELETE',
                                headers
                            })
                            return { data: res.ok ? true : null, error: res.ok ? null : await res.json() }
                        } catch (e) { return { data: null, error: e } }
                    }
                }
            }
        }
    }
}
