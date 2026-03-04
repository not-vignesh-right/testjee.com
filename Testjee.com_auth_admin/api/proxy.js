export default async function handler(req, res) {
    // Only allow POST to proxy the requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get service key from Vercel backend environment
    const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
    if (!serviceKey) {
        return res.status(500).json({ error: 'Missing service key configuration' });
    }

    const { endpoint, method = 'GET', payload = null, headers = {} } = req.body;

    if (!endpoint) {
        return res.status(400).json({ error: 'Missing endpoint path' });
    }

    const url = `https://testjee-supabase-proxy.vigneshbswork.workers.dev${endpoint}`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
                'Prefer': headers.Prefer || 'return=representation',
                ...headers
            },
            body: payload ? JSON.stringify(payload) : undefined
        });

        const data = await response.text();
        let jsonData = data;

        // Try parsing JSON if possible (delete might be empty)
        try {
            if (data) jsonData = JSON.parse(data);
        } catch (e) { }

        // Return exactly what the database gives back
        return res.status(response.status).json(jsonData);
    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
