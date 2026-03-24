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

async function getSubscriptions() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=subscription`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    })
    if (!res.ok) return []
    const rows = await res.json()
    return rows.map(r => r.subscription)
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const payload = JSON.stringify({
            title: '🔥 Server Test Notification',
            body: 'If you see this, the server-to-phone loop is WORKING!',
            icon: '/logo-192.png',
            badge: '/logo-192.png',
            url: '/'
        })

        const subscriptions = await getSubscriptions()
        if (subscriptions.length === 0) {
            return res.status(200).json({ success: false, message: 'No subscriptions found in database. Did you click the bell?' })
        }

        const results = await Promise.allSettled(
            subscriptions.map(sub => webpush.sendNotification(sub, payload))
        )

        const sent = results.filter(r => r.status === 'fulfilled').length
        const errors = results.filter(r => r.status === 'rejected').map(r => r.reason.message)

        return res.status(200).json({ 
            success: sent > 0, 
            sent, 
            total: subscriptions.length,
            errors 
        })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
