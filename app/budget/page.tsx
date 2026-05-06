import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

const categories = [
  { name: 'Groceries', spent: 284, budget: 400, emoji: '🛒', color: 'bg-emerald-500' },
  { name: 'Dining Out', spent: 156, budget: 200, emoji: '🍕', color: 'bg-orange-500' },
  { name: 'Auto & Gas', spent: 180, budget: 250, emoji: '🚗', color: 'bg-blue-500' },
  { name: 'Entertainment', spent: 45, budget: 100, emoji: '🎬', color: 'bg-purple-500' },
  { name: 'Shopping', spent: 312, budget: 300, emoji: '🛍️', color: 'bg-rose-500' },
  { name: 'Utilities', spent: 95, budget: 150, emoji: '⚡', color: 'bg-yellow-500' },
  { name: 'Healthcare', spent: 0, budget: 100, emoji: '🏥', color: 'bg-pink-500' },
  { name: 'Subscriptions', spent: 48, budget: 50, emoji: '📱', color: 'bg-indigo-500' },
]

export default function BudgetPage() {
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0)
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0)
  const remaining = totalBudget - totalSpent

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Budget Command Center</div>
          <nav className="flex items-center gap-2">
            {[['Dashboard', '/dashboard'], ['Budget', '/budget'], ['Transactions', '/transactions'], ['Goals', '/goals'], ['AI Coach', '/ai']].map(([label, href]) => (
              <Link key={href} href={href} className="px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium text-sm">{label}</Link>
            ))}
          </nav>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Budget Planner</h1>
            <p className="text-slate-500">May 2026 — Track and manage your spending categories</p>
          </div>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">
            + Add Category
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Total Budget</div>
            <div className="text-3xl font-black text-slate-900">${totalBudget.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Total Spent</div>
            <div className="text-3xl font-black text-rose-600">${totalSpent.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Remaining</div>
            <div className={`text-3xl font-black ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${remaining.toLocaleString()}</div>
          </div>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const pct = Math.min(Math.round((cat.spent / cat.budget) * 100), 100)
            const over = cat.spent > cat.budget
            return (
              <div key={cat.name} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.emoji}</span>
                    <div>
                      <div className="font-bold text-slate-900">{cat.name}</div>
                      <div className="text-sm text-slate-500">${cat.budget}/month budget</div>
                    </div>
                  </div>
                  {over && (
                    <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">⚠️ Over Budget</span>
                  )}
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Spent: <strong className={over ? 'text-rose-600' : 'text-slate-900'}>${cat.spent}</strong></span>
                  <span className="text-slate-500">{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-3">
                  <div className={`h-3 rounded-full transition-all ${over ? 'bg-rose-500' : cat.color}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>${cat.budget - cat.spent > 0 ? cat.budget - cat.spent : 0} remaining</span>
                  <button className="text-indigo-600 hover:underline font-medium">Edit</button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
