import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev'
const SUPABASE_KEY = 'sb_secret_9azvhGbk3Vuil7Toe6rr4A_oQoZM8al'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function getFunctionDefinitions() {
    const functionsToInspect = ['submit_student_exam', 'admin_end_exam_and_calculate_ranks']

    for (const funcName of functionsToInspect) {
        console.log(`--- Definition for ${funcName} ---`)
        const { data, error } = await supabase.rpc('execute_sql_query', {
            sql_query: `
                SELECT pg_get_functiondef(p.oid) as def
                FROM pg_proc p
                WHERE p.proname = '${funcName}';
            `
        })

        if (error) {
            // If execute_sql_query RPC doesn't exist, we can use a raw SQL query or check another method.
            console.error(`Failed using execute_sql_query:`, error)
            
            // Let's try to query public schemas if possible or try directly
            const { data: dbData, error: dbErr } = await supabase
                .from('pg_proc')
                .select('*')
                .eq('proname', funcName)
            console.log('Direct query pg_proc result:', dbData, dbErr)
        } else {
            console.log(data?.[0]?.def || 'Function not found')
        }
    }
}

getFunctionDefinitions()
