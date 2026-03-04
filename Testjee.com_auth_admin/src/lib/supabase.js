import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbnVta3Vmcm5yamVuc21nb3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjQxNTQsImV4cCI6MjA2NzkwMDE1NH0.Gan0vhw4YvktYA-45OQGjO3RxmFGjxihBlzqtUnRuqo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
