import { Redis } from '@upstash/redis'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

const redis = Redis.fromEnv()

const DEFAULT_DATA = {
  transactions: [],
  goals: [
    { id: 1, name: 'Emergency Fund', current: 0, target: 15000, color: 'green', icon: '🛡️' },
    { id: 2, name: 'Property Down Payment', current: 0, target: 35000, color: 'blue', icon: '🏡' },
    { id: 3, name: 'Truck Upgrade', current: 0, target: 8000, color: 'yellow', icon: '🚛' },
    { id: 4, name: 'Tool Investment', current: 0, target: 5000, color: 'purple', icon: '🔧' },
  ],
  budgets: [
    { name: 'Housing', budget: 2250, color: 'blue' },
    { name: 'Food & Groceries', budget: 800, color: 'green' },
    { name: 'Transportation', budget: 600, color: 'yellow' },
    { name: 'Utilities', budget: 350, color: 'purple' },
    { name: 'Entertainment', budget: 300, color: 'red' },
    { name: 'Health', budget: 250, color: 'green' },
  ]
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Not signed in' })

  const KEY = `budget_data_v1:${session.userId}`

  try {
    if (req.method === 'GET') {
      const data = await redis.get(KEY)
      return res.status(200).json(data || DEFAULT_DATA)
    }
    if (req.method === 'POST') {
      const body = req.body
      if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid body' })
      await redis.set(KEY, body)
      return res.status(200).json({ ok: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Redis error:', err)
    return res.status(500).json({ error: 'Database error', detail: err.message })
  }
}
