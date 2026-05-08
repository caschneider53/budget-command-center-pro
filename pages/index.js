
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'

const DEFAULT_BUDGETS = {
  Housing: 2250,
  'Food & Groceries': 800,
  Transportation: 450,
  Utilities: 300,
  Insurance: 350,
  Health: 150,
  Personal: 250,
  Entertainment: 200,
  Savings: 1200,
  Debt: 400,
}

const DEFAULT_ASSETS = [
  { name: 'Checking', amount: 2500 },
  { name: 'Savings', amount: 6000 },
  { name: 'Truck', amount: 18000 },
  { name: 'Tools', amount: 5000 },
]

const DEFAULT_DEBTS = [
  { name: 'Mortgage', amount: 185000 },
  { name: 'Truck Loan', amount: 9500 },
  { name: 'Credit Cards', amount: 1800 },
]

const DEFAULT_GOALS = [
  { name: 'Emergency Fund', target: 10000, current: 6000 },
  { name: 'Property Down Payment', target: 25000, current: 8000 },
  { name: 'Tool Upgrade Fund', target: 3000, current: 1200 },
]

const NAV = [
  { label: 'Dashboard', icon: '📊' },
  { label: 'Budget', icon: '💰' },
  { label: 'Transactions', icon: '💳' },
  { label: 'Bills', icon: '🗓️' },
  { label: 'Goals', icon: '🎯' },
  { label: 'Net Worth', icon: '🏠' },
  { label: 'AI Coach', icon: '🤖' },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const recurringTemplates = [
  { name: 'Mortgage', category: 'Housing', amount: 1450, day: 12 },
  { name: 'Internet', category: 'Utilities', amount: 95, day: 18 },
  { name: 'Auto Insurance', category: 'Insurance', amount: 190, day: 17 },
  { name: 'Gym Membership', category: 'Health', amount: 45, day: 22 },
]

const fmt = (n = 0) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const pct = (n = 0) => `${Number(n || 0).toFixed(1)}%`
const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const labelForMonth = (key) => {
  const [y, m] = key.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}

function CircleChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  let start = 0
  const segments = data.map((item) => {
    const value = total ? (item.amount / total) * 100 : 0
    const seg = `${item.color} ${start}% ${start + value}%`
    start += value
    return seg
  })
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: total ? `conic-gradient(${segments.join(',')})` : 'var(--surface-3)',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--surface)', display: 'grid', placeItems: 'center', textAlign: 'center', border: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '.08em' }}>Spent</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{fmt(total)}</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 220 }}>
        {data.length ? data.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
              <span style={{ fontSize: 13 }}>{item.label}</span>
            </div>
            <strong style={{ fontSize: 13 }}>{fmt(item.amount)}</strong>
          </div>
        )) : <div style={{ color: 'var(--muted)', fontSize: 13 }}>Add transactions to see your spending breakdown.</div>}
      </div>
    </div>
  )
}

function Bars({ items }) {
  const max = Math.max(...items.map(i => i.amount), 1)
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: 'var(--muted)' }}>{item.label}</span>
            <strong>{fmt(item.amount)}</strong>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(item.amount / max) * 100}%`, background: item.color, borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const [active, setActive] = useState('Dashboard')
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS)
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState(DEFAULT_GOALS)
  const [assets, setAssets] = useState(DEFAULT_ASSETS)
  const [debts, setDebts] = useState(DEFAULT_DEBTS)
  const [month, setMonth] = useState(monthKey())
  const [showTxModal, setShowTxModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [showDebtModal, setShowDebtModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState({ key: '', value: '' })
  const [tx, setTx] = useState({ date: new Date().toISOString().slice(0, 10), description: '', amount: '', category: 'Food & Groceries', type: 'expense', recurring: false })
  const [assetForm, setAssetForm] = useState({ name: '', amount: '' })
  const [debtForm, setDebtForm] = useState({ name: '', amount: '' })

  useEffect(() => {
    const stored = localStorage.getItem('budget-pro-data-v2')
    if (stored) {
      const parsed = JSON.parse(stored)
      setBudgets(parsed.budgets || DEFAULT_BUDGETS)
      setTransactions(parsed.transactions || [])
      setGoals(parsed.goals || DEFAULT_GOALS)
      setAssets(parsed.assets || DEFAULT_ASSETS)
      setDebts(parsed.debts || DEFAULT_DEBTS)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('budget-pro-data-v2', JSON.stringify({ budgets, transactions, goals, assets, debts }))
  }, [budgets, transactions, goals, assets, debts])

  const currentTx = useMemo(() => transactions.filter((t) => t.month === month), [transactions, month])
  const income = currentTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const spending = currentTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const available = income - spending
  const savingsRate = income ? ((income - spending) / income) * 100 : 0
  const recurringBills = currentTx.filter(t => t.recurring && t.type === 'expense').sort((a, b) => new Date(a.date) - new Date(b.date))
  const byCategory = Object.entries(budgets).map(([name, limit], idx) => {
    const amount = currentTx.filter(t => t.category === name && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#84cc16', '#6366f1']
    return { label: name, amount, limit, color: colors[idx % colors.length] }
  })
  const topSpend = byCategory.filter(i => i.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 5)
  const totalAssets = assets.reduce((s, a) => s + Number(a.amount), 0)
  const totalDebts = debts.reduce((s, d) => s + Number(d.amount), 0)
  const netWorth = totalAssets - totalDebts

  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return monthKey(d)
  })

  const addTransaction = () => {
    if (!tx.description || !tx.amount) return
    const m = tx.date.slice(0, 7)
    const item = { ...tx, id: Date.now(), amount: Number(tx.amount), month: m }
    setTransactions(prev => [item, ...prev])
    setTx({ date: new Date().toISOString().slice(0, 10), description: '', amount: '', category: 'Food & Groceries', type: 'expense', recurring: false })
    setShowTxModal(false)
  }

  const seedRecurring = () => {
    const [year, mon] = month.split('-')
    const seeded = recurringTemplates.map((b, i) => ({
      id: Date.now() + i,
      description: b.name,
      amount: b.amount,
      category: b.category,
      type: 'expense',
      recurring: true,
      date: `${year}-${mon}-${String(b.day).padStart(2, '0')}`,
      month,
    }))
    setTransactions(prev => {
      const existing = new Set(prev.filter(t => t.month === month).map(t => t.description + t.amount))
      const fresh = seeded.filter(t => !existing.has(t.description + t.amount))
      return [...fresh, ...prev]
    })
  }

  const saveBudget = () => {
    setBudgets(prev => ({ ...prev, [editingBudget.key]: Number(editingBudget.value || 0) }))
    setShowBudgetModal(false)
  }

  const addAsset = () => {
    if (!assetForm.name || !assetForm.amount) return
    setAssets(prev => [...prev, { name: assetForm.name, amount: Number(assetForm.amount) }])
    setAssetForm({ name: '', amount: '' })
    setShowAssetModal(false)
  }

  const addDebt = () => {
    if (!debtForm.name || !debtForm.amount) return
    setDebts(prev => [...prev, { name: debtForm.name, amount: Number(debtForm.amount) }])
    setDebtForm({ name: '', amount: '' })
    setShowDebtModal(false)
  }

  const coachMessage = useMemo(() => {
    if (!income) return 'Log income first so I can help you build a real zero-based plan.'
    if (savingsRate < 10) return 'Your savings rate is low this month. Trim your top spending category or move extra income to Savings.'
    if (topSpend[0]?.amount > (topSpend[0]?.limit || 0)) return `You are over budget in ${topSpend[0].label}. Adjust that category or move money from a lower-priority bucket.`
    return 'You are in a solid spot this month. Keep recurring bills funded and move extra cash toward your property or emergency goals.'
  }, [income, savingsRate, topSpend])

  if (status === 'loading') return null
  if (!session) {
    return (
      <>
        <Head><title>Budget Command Center Pro</title></Head>
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b1020', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 520, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: 32 }}>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.16em', color: '#93c5fd', marginBottom: 12 }}>Budget Pro</div>
            <h1 style={{ fontSize: 34, lineHeight: 1.05, margin: 0, marginBottom: 12 }}>Your personal money command center.</h1>
            <p style={{ color: 'rgba(255,255,255,.72)', lineHeight: 1.7, marginBottom: 24 }}>Track cash flow, set category budgets, watch recurring bills, and build net worth in one place.</p>
            <button onClick={() => signIn('google')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 18px', fontWeight: 700, cursor: 'pointer' }}>Continue with Google</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Budget Command Center Pro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>{`
        * { box-sizing: border-box; }
        html, body, #__next { margin: 0; min-height: 100%; }
        body {
          --bg: #0b1220;
          --surface: #121a2b;
          --surface-2: #182235;
          --surface-3: #22304a;
          --border: rgba(148, 163, 184, .16);
          --border-2: rgba(148, 163, 184, .24);
          --text: #e5eefc;
          --muted: #93a4bf;
          --blue: #3b82f6;
          --blue-dim: rgba(59,130,246,.12);
          --green: #10b981;
          --yellow: #f59e0b;
          --red: #ef4444;
          --purple: #8b5cf6;
          --r-sm: 10px;
          --r-md: 14px;
          --r-lg: 18px;
          --r-xl: 24px;
          background: var(--bg);
          color: var(--text);
          font-family: Inter, system-ui, sans-serif;
        }
        button, input, select { font: inherit; }
        @media (max-width: 900px) {
          .layout { flex-direction: column; }
          .sidebar { width: 100% !important; border-right: none !important; border-bottom: 1px solid var(--border); }
          .navWrap { display: flex; overflow: auto; padding-bottom: 8px; }
          .contentWrap { padding: 16px !important; }
          .grid2 { grid-template-columns: 1fr !important; }
          .topbar { padding: 14px 16px !important; align-items: flex-start !important; gap: 10px; flex-direction: column; }
        }
      `}</style>

      <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <aside className="sidebar" style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '22px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>💰 Budget Pro</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.16em', marginTop: 4 }}>Command Center</div>
          </div>
          <div className="navWrap" style={{ padding: 12 }}>
            {NAV.map((item) => {
              const on = active === item.label
              return (
                <button key={item.label} onClick={() => setActive(item.label)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '11px 12px', marginBottom: 6, background: on ? 'var(--blue-dim)' : 'transparent', color: on ? '#fff' : 'var(--muted)', border: `1px solid ${on ? 'rgba(59,130,246,.24)' : 'transparent'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <span>{item.icon}</span><span style={{ fontSize: 13, fontWeight: on ? 700 : 500 }}>{item.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="topbar" style={{ padding: '16px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{active}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>{labelForMonth(month)}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '9px 12px' }}>
                {monthOptions.map(m => <option key={m} value={m}>{labelForMonth(m)}</option>)}
              </select>
              <button onClick={() => setShowTxModal(true)} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>+ Add Transaction</button>
              <button onClick={() => signOut()} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          <div className="contentWrap" style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 16 }}>
              {[
                ['Available to Budget', fmt(available), available >= 0 ? 'Cash left this month' : 'Over budget right now', available >= 0 ? 'var(--green)' : 'var(--red)'],
                ['Monthly Income', fmt(income), `${currentTx.filter(t => t.type === 'income').length} deposits logged`, 'var(--muted)'],
                ['Monthly Spending', fmt(spending), `${currentTx.filter(t => t.type === 'expense').length} transactions logged`, 'var(--muted)'],
                ['Savings Rate', pct(savingsRate), income ? 'Income not spent' : 'Log income first', savingsRate >= 15 ? 'var(--green)' : 'var(--muted)'],
              ].map(([label, value, meta, color]) => (
                <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '16px 18px' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.03em' }}>{value}</div>
                  <div style={{ fontSize: 12, color }}>{meta}</div>
                </div>
              ))}
            </div>

            {active === 'Dashboard' && (
              <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1.25fr .95fr', gap: 14 }}>
                <section style={{ display: 'grid', gap: 14 }}>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>Spending Breakdown</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Top categories this month</div>
                    </div>
                    <CircleChart data={topSpend} />
                  </div>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>Budget Categories</div>
                      <button onClick={() => setActive('Budget')} style={{ background: 'transparent', color: 'var(--blue)', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Edit budgets</button>
                    </div>
                    <div>
                      {byCategory.map(item => {
                        const used = item.limit ? (item.amount / item.limit) * 100 : 0
                        return (
                          <div key={item.label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                              <div style={{ fontSize: 12, color: used > 100 ? 'var(--red)' : 'var(--muted)' }}>{fmt(item.amount)} / {fmt(item.limit)}</div>
                            </div>
                            <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-3)', marginTop: 6, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(used, 100)}%`, background: used > 100 ? 'var(--red)' : item.color, borderRadius: 999 }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>

                <section style={{ display: 'grid', gap: 14 }}>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Top Spending</div>
                    {topSpend.length ? <Bars items={topSpend} /> : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No expense data yet for this month.</div>}
                  </div>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>Recurring Bills</div>
                      <button onClick={seedRecurring} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}>Auto-add</button>
                    </div>
                    {recurringBills.length ? recurringBills.map(bill => (
                      <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{bill.description}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{bill.date} • {bill.category}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(bill.amount)}</div>
                      </div>
                    )) : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No recurring bills loaded for this month yet.</div>}
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.18), rgba(16,185,129,.14))', border: '1px solid rgba(59,130,246,.22)', borderRadius: 18, padding: 20 }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: '#bfdbfe', marginBottom: 8 }}>AI Coach</div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>This month&apos;s guidance</div>
                    <div style={{ color: '#dbeafe', lineHeight: 1.7, fontSize: 14 }}>{coachMessage}</div>
                  </div>
                </section>
              </div>
            )}

            {active === 'Budget' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Edit Monthly Budgets</div>
                {Object.entries(budgets).map(([key, value], idx) => {
                  const spent = byCategory.find(x => x.label === key)?.amount || 0
                  const used = value ? (spent / value) * 100 : 0
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#84cc16', '#6366f1']
                  return (
                    <div key={key} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{key}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(spent)} spent</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <strong>{fmt(value)}</strong>
                          <button onClick={() => { setEditingBudget({ key, value }); setShowBudgetModal(true) }} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}>Edit</button>
                        </div>
                      </div>
                      <div style={{ height: 10, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(used, 100)}%`, background: used > 100 ? 'var(--red)' : colors[idx % colors.length], borderRadius: 999 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {active === 'Transactions' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Transactions</div>
                {currentTx.length ? currentTx.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{item.description}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.date} • {item.category}{item.recurring ? ' • recurring' : ''}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: item.type === 'income' ? 'var(--green)' : 'var(--text)' }}>{item.type === 'income' ? '+' : '-'}{fmt(item.amount).replace('$', '')}</div>
                  </div>
                )) : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No transactions in {labelForMonth(month)} yet.</div>}
              </div>
            )}

            {active === 'Bills' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Recurring & Upcoming Bills</div>
                  <button onClick={seedRecurring} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontWeight: 700 }}>Load default bills</button>
                </div>
                {recurringBills.length ? recurringBills.map((bill) => (
                  <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{bill.description}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Due {bill.date} • {bill.category}</div>
                    </div>
                    <strong>{fmt(bill.amount)}</strong>
                  </div>
                )) : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No recurring bills for this month. Click “Load default bills” to add them.</div>}
              </div>
            )}

            {active === 'Goals' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Savings Goals</div>
                {goals.map((goal) => {
                  const progress = goal.target ? (goal.current / goal.target) * 100 : 0
                  return (
                    <div key={goal.name} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{goal.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(goal.current)} saved of {fmt(goal.target)}</div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{pct(progress)}</div>
                      </div>
                      <div style={{ height: 10, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: 'var(--green)', borderRadius: 999 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {active === 'Net Worth' && (
              <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>Assets</div>
                    <button onClick={() => setShowAssetModal(true)} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}>+ Add Asset</button>
                  </div>
                  {assets.map((item, i) => <div key={item.name + i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}><span>{item.name}</span><strong>{fmt(item.amount)}</strong></div>)}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, fontWeight: 800 }}><span>Total Assets</span><span>{fmt(totalAssets)}</span></div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>Debts</div>
                    <button onClick={() => setShowDebtModal(true)} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}>+ Add Debt</button>
                  </div>
                  {debts.map((item, i) => <div key={item.name + i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}><span>{item.name}</span><strong>{fmt(item.amount)}</strong></div>)}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, fontWeight: 800 }}><span>Total Debts</span><span>{fmt(totalDebts)}</span></div>
                </div>
                <div style={{ gridColumn: '1 / -1', background: netWorth >= 0 ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)', border: `1px solid ${netWorth >= 0 ? 'rgba(16,185,129,.24)' : 'rgba(239,68,68,.24)'}`, borderRadius: 18, padding: 20 }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>Net Worth</div>
                  <div style={{ fontSize: 34, fontWeight: 900 }}>{fmt(netWorth)}</div>
                  <div style={{ color: 'var(--muted)', marginTop: 8 }}>Assets minus liabilities. Keep updating this monthly to see real progress.</div>
                </div>
              </div>
            )}

            {active === 'AI Coach' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>AI Coach Notes</div>
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, lineHeight: 1.7, fontSize: 14 }}>{coachMessage}</div>
                <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>Next step ideas: log every income source, mark bills recurring, edit your budget caps, and track your house and debts in Net Worth.</div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showTxModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 460, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Add Transaction</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <input value={tx.description} onChange={(e) => setTx({ ...tx, description: e.target.value })} placeholder="Description" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input type="number" value={tx.amount} onChange={(e) => setTx({ ...tx, amount: e.target.value })} placeholder="Amount" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }} />
                <input type="date" value={tx.date} onChange={(e) => setTx({ ...tx, date: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select value={tx.category} onChange={(e) => setTx({ ...tx, category: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }}>
                  {Object.keys(budgets).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={tx.type} onChange={(e) => setTx({ ...tx, type: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                <input type="checkbox" checked={tx.recurring} onChange={(e) => setTx({ ...tx, recurring: e.target.checked })} /> Mark as recurring
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowTxModal(false)} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addTransaction} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontWeight: 700 }}>Save Transaction</button>
            </div>
          </div>
        </div>
      )}

      {showBudgetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 380, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Edit Budget</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{editingBudget.key}</div>
            <input type="number" value={editingBudget.value} onChange={(e) => setEditingBudget({ ...editingBudget, value: e.target.value })} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowBudgetModal(false)} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveBudget} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontWeight: 700 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAssetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 380, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Add Asset</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <input value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} placeholder="Asset name" style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }} />
              <input type="number" value={assetForm.amount} onChange={(e) => setAssetForm({ ...assetForm, amount: e.target.value })} placeholder="Amount" style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowAssetModal(false)} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addAsset} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontWeight: 700 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showDebtModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 380, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Add Debt</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <input value={debtForm.name} onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })} placeholder="Debt name" style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }} />
              <input type="number" value={debtForm.amount} onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })} placeholder="Amount" style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: 10, padding: 12 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowDebtModal(false)} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addDebt} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontWeight: 700 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
