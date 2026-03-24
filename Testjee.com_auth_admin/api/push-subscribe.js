import webpush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const SUPABASE_URL = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev'
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY

webpush.setVapidDetails(
    'mailto:admin@testjee.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
)

export default async function handler(req, res) {
    // GET: return the VAPID public key for the browser to subscribe with
    if (req.method === 'GET') {
        return res.status(200).json({ publicKey: VAPID_PUBLIC_KEY })
    }

    // POST: save a new push subscription
    if (req.method === 'POST') {
        const { subscription, deviceId } = req.body

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription' })
        }

        try {
            // Upsert the subscription by device id
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/push_subscriptions?device_id=eq.${encodeURIComponent(deviceId)}`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({
                        device_id: deviceId,
                        subscription: subscription,
                        created_at: new Date().toISOString()
                    })
                }
            )

            if (!response.ok) {
                const err = await response.text()
                return res.status(500).json({ error: err })
            }

            return res.status(200).json({ success: true })
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
