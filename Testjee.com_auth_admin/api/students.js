export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get environment variables directly from process.env (Server-side)
    const supabaseUrl = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev';
    const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

    if (!serviceKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing service key' });
    }

    try {
        // Make the explicit fetch request Server-Side to bypass browser RLS checks entirely
        const response = await fetch(`${supabaseUrl}/rest/v1/students?select=*&order=creation_date.desc`, {
            method: 'GET',
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Supabase proxy responded with ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch students', details: error.message });
    }
}
