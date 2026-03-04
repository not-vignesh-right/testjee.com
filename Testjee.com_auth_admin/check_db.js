import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev'
const SUPABASE_KEY = 'sb_secret_9azvhGbk3Vuil7Toe6rr4A_oQoZM8al'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function check() {
    const { data, error } = await supabase.from('students').select('*')
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Students count:', data.length)
        console.log('Data sample:', data.slice(0, 2))
    }
}

check()
