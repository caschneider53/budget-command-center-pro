import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

const transactions = [
  { id: 1, date: '2026-05-04', merchant: 'Employer Direct Deposit', amount: 3200.00, category: 'Income', status: 'cleared', account: 'Checking' },
  { id: 2, date: '2026-05-04', merchant: 'Amazon', amount: -89.99, category: 'Shopping', status: 'auto-tagged', account: 'Visa Card' },
  { id: 3, date: '2026-05-03', merchant: 'Chipotle', amount: -14.75, category: 'Dining Out', status: 'needs-split', account: 'Visa Card' },
  { id: 4, date: '2026-05-03', merchant: 'Shell Gas Station', amount: -62.10, category: 'Auto & Gas', status: 'cleared', account: 'Checking' },
  { id: 5, date: '2026-05-02', merchant: 'Netflix', amount: -15.99, category: 'Entertainment', status: 'cleared', account: 'Visa Card' },
  { id: 6, date: '2026-05-01', merchant: 'Whole Foods Market', amount: -127.43, category: 'Groceries', status: 'cleared', account: 'Checking' },
  { id: 7, date: '2026-04-30', merchant: 'Planet Fitness', amount: -24.99, category: 'Health', status: 'cleared', account: 'Checking' },
  { id: 8, date: '2026-04-29', merchant: 'Target', amount: -78.32, category: 'Shopping', status: 'auto-tagged', account: 'Visa Card' },
]

export default function TransactionsPage() {
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
            <h1 className="text-4xl font-black text-slate-900 mb-2">Transactions</h1>
            <p className="text-slate-500">All your transactions in one place</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm">📄 Upload CSV</button>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 text-sm">Sync Banks</button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex gap-4 items-center">
          <input type="text" placeholder="Search transactions..." className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none">
            <option>All Categories</option>
            <option>Groceries</option>
            <option>Dining Out</option>
            <option>Shopping</option>
            <option>Income</option>
          </select>
          <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none">
            <option>All Accounts</option>
            <option>Checking</option>
            <option>Visa Card</option>
          </select>
        </div>

        {/* Transactions table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Merchant</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.merchant}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{tx.account}</td>
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
                  <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${
                    tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
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
