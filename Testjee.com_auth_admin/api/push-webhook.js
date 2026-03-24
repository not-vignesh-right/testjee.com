import webpush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
const SUPABASE_URL = 'https://testjee-supabase-proxy.vigneshbswork.workers.dev'
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY

webpush.setVapidDetails(
    'mailto:admin@testjee.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
)

// Fetch all push subscriptions from Supabase
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

    // Verify webhook secret
    const secret = req.headers['x-webhook-secret']
    if (secret !== WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        const body = req.body
        const type = body.type // 'INSERT' or 'UPDATE'
        const record = body.record || body
        const oldRecord = body.old_record || {}

        let title = ''
        let message = ''
        let url = '/'

        const studentName = record.student_name || 'A student'

        if (type === 'INSERT') {
            title = '📋 New Registration Request'
            message = `${studentName} is waiting for approval!`
        } else if (type === 'UPDATE') {
            const newTests = record.number_of_tests || 0
            const oldTests = oldRecord.number_of_tests || 0

            // If test count went up, it's a request for more tests
            if (newTests > oldTests) {
                title = '📝 Test Request'
                message = `${studentName} is requesting more tests! (Now at ${newTests})`
                url = `/students/${record.student_id}`
            } else {
                // Not a relevant update, don't send notification
                return res.status(200).json({ sent: 0, message: 'Irrelevant update' })
            }
        } else {
            // Unhandled event type
            return res.status(200).json({ sent: 0, message: 'Event ignored' })
        }

        const payload = JSON.stringify({
            title,
            body: message,
            icon: '/logo-192.png',
            badge: '/logo-192.png',
            url
        })

        const subscriptions = await getSubscriptions()

        if (subscriptions.length === 0) {
            return res.status(200).json({ sent: 0, message: 'No subscriptions found' })
        }

        const results = await Promise.allSettled(
            subscriptions.map(sub => webpush.sendNotification(sub, payload))
        )

        const sent = results.filter(r => r.status === 'fulfilled').length
        return res.status(200).json({ sent, total: subscriptions.length })

    } catch (error) {
        console.error('Push webhook error:', error)
        return res.status(500).json({ error: error.message })
    }
}
