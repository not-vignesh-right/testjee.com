import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev/rest/v1/'
const SUPABASE_KEY = 'sb_secret_9azvhGbk3Vuil7Toe6rr4A_oQoZM8al'

async function getOpenAPISchema() {
    const response = await fetch(SUPABASE_URL, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    })
    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('API Paths starting with /rpc/:', Object.keys(data.paths || {}).filter(k => k.startsWith('/rpc/')))
}

getOpenAPISchema()
