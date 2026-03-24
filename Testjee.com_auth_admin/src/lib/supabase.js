export const SUPABASE_URL = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev'

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

        // Chainable query builder
        function buildQuery(baseSelect = '*') {
            let selectCols = baseSelect
            let filters = []
            let orderClause = null
            let inClause = null
            let singleRow = false

            const builder = {
                select(cols = '*') {
                    selectCols = cols
                    return builder
                },
                eq(column, value) {
                    filters.push(`${column}=eq.${value}`)
                    return builder
                },
                in(column, arrayValues) {
                    const arrStr = arrayValues.join(',')
                    inClause = `${column}=in.(${arrStr})`
                    return builder
                },
                order(column, { ascending = true } = {}) {
                    orderClause = `order=${column}.${ascending ? 'asc' : 'desc'}`
                    return builder
                },
                maybeSingle() {
                    singleRow = true
                    return builder
                },
                async then(resolve, reject) {
                    try {
                        let qs = `select=${selectCols}`
                        if (filters.length) qs += '&' + filters.join('&')
                        if (inClause) qs += '&' + inClause
                        if (orderClause) qs += '&' + orderClause
                        const endpoint = `${tablePath}?${qs}`
                        const res = await proxyRequest(endpoint, 'GET')
                        if (singleRow) {
                            resolve({ data: res.data ? (res.data[0] || null) : null, error: res.error })
                        } else {
                            resolve(res)
                        }
                    } catch (e) {
                        reject(e)
                    }
                }
            }
            return builder
        }

        return {
            select(cols = '*') {
                return buildQuery(cols)
            },
            update(updates) {
                return {
                    eq(column, value) {
                        return proxyRequest(`${tablePath}?${column}=eq.${value}`, 'PATCH', updates, { 'Prefer': 'return=representation' })
                    }
                }
            },
            delete() {
                return {
                    eq(column, value) {
                        return proxyRequest(`${tablePath}?${column}=eq.${value}`, 'DELETE')
                    }
                }
            }
        }
    }
}
