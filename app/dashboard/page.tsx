import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

const mockTransactions = [
  { id: 1, date: '2026-05-01', merchant: 'Whole Foods Market', amount: -127.43, category: 'Groceries', status: 'cleared' },
  { id: 2, date: '2026-05-02', merchant: 'Netflix', amount: -15.99, category: 'Entertainment', status: 'cleared' },
  { id: 3, date: '2026-05-03', merchant: 'Shell Gas Station', amount: -62.10, category: 'Auto & Gas', status: 'cleared' },
  { id: 4, date: '2026-05-03', merchant: 'Chipotle', amount: -14.75, category: 'Dining Out', status: 'needs-split' },
  { id: 5, date: '2026-05-04', merchant: 'Amazon', amount: -89.99, category: 'Shopping', status: 'auto-tagged' },
  { id: 6, date: '2026-05-04', merchant: 'Employer Direct Deposit', amount: 3200.00, category: 'Income', status: 'cleared' },
]

const budgetCategories = [
  { name: 'Groceries', spent: 284, budget: 400, color: 'bg-emerald-500', emoji: '🛒' },
  { name: 'Dining Out', spent: 156, budget: 200, color: 'bg-orange-500', emoji: '🍕' },
  { name: 'Auto & Gas', spent: 180, budget: 250, color: 'bg-blue-500', emoji: '🚗' },
  { name: 'Entertainment', spent: 45, budget: 100, color: 'bg-purple-500', emoji: '🎬' },
  { name: 'Shopping', spent: 312, budget: 300, color: 'bg-rose-500', emoji: '🛍️' },
  { name: 'Utilities', spent: 95, budget: 150, color: 'bg-yellow-500', emoji: '⚡' },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Budget Command Center
          </div>
          <nav className="flex items-center gap-2">
            {[['Dashboard', '/dashboard'], ['Budget', '/budget'], ['Transactions', '/transactions'], ['Goals', '/goals'], ['AI Coach', '/ai']].map(([label, href]) => (
              <Link key={href} href={href} className="px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium text-sm transition-colors">{label}</Link>
            ))}
          </nav>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Financial Dashboard</h1>
          <p className="text-slate-500">Your complete money picture — May 2026</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Available to Budget', value: '$4,238', change: '+12%', trend: 'up', gradient: 'from-indigo-500 to-purple-600' },
            { label: 'Forecasted Cash', value: '+$1,892', change: '+8%', trend: 'up', gradient: 'from-emerald-500 to-teal-600' },
            { label: 'Budget Health', value: '97%', change: '+3%', trend: 'up', gradient: 'from-blue-500 to-cyan-600' },
            { label: 'Savings Rate', value: '23%', change: '-1%', trend: 'down', gradient: 'from-rose-500 to-pink-600' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${kpi.gradient} mb-4`}>
                <div className="w-5 h-5 bg-white/30 rounded" />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">{kpi.value}</div>
              <div className="text-slate-500 text-sm mb-2">{kpi.label}</div>
              <div className={`text-sm font-semibold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {kpi.change} vs last month
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Cash Flow Chart placeholder */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Cash Flow — Last 6 Months</h2>
            <div className="flex items-end gap-3 h-40">
              {[
                { month: 'Dec', income: 75, expense: 60 },
                { month: 'Jan', income: 82, expense: 65 },
                { month: 'Feb', income: 70, expense: 55 },
                { month: 'Mar', income: 88, expense: 70 },
                { month: 'Apr', income: 92, expense: 68 },
                { month: 'May', income: 85, expense: 62 },
              ].map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1">
                    <div className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${d.income}px` }} />
                    <div className="flex-1 bg-rose-400 rounded-t" style={{ height: `${d.expense}px` }} />
                  </div>
                  <div className="text-xs text-slate-500">{d.month}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 bg-indigo-500 rounded" /><span className="text-slate-600">Income</span></div>
              <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 bg-rose-400 rounded" /><span className="text-slate-600">Expenses</span></div>
            </div>
          </div>

          {/* Budget Categories */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Budget Categories</h2>
              <Link href="/budget" className="text-indigo-600 text-sm font-medium hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {budgetCategories.map((cat) => {
                const pct = Math.min(Math.round((cat.spent / cat.budget) * 100), 100)
                const over = cat.spent > cat.budget
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">{cat.emoji} {cat.name}</span>
                      <span className={`text-sm font-semibold ${over ? 'text-rose-600' : 'text-slate-600'}`}>
                        ${cat.spent} / ${cat.budget}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${over ? 'bg-rose-500' : cat.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
            <div className="flex gap-3">
              <Link href="/transactions" className="px-4 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 font-medium">View All</Link>
              <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Sync Banks</button>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Merchant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.merchant}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full">{tx.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      tx.status === 'cleared' ? 'bg-emerald-100 text-emerald-700' :
                      tx.status === 'needs-split' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {tx.status === 'auto-tagged' ? 'Auto-Tagged' : tx.status === 'needs-split' ? 'Needs Split' : 'Cleared'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
