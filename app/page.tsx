import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Budget Command Center
        </div>
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium">Sign In</button>
            </SignInButton>
            <Link href="/sign-up">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Get Started</button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="px-4 py-2 text-indigo-600 font-medium">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          Command Your Finances
        </h1>
        <p className="text-2xl text-slate-600 mb-12 max-w-2xl mx-auto">
          AI-powered budgeting with bank sync, smart goals, and real-time cash flow forecasts.
        </p>
        <div className="flex gap-4 justify-center mb-20">
          <Link href="/sign-up">
            <button className="px-12 py-4 bg-indigo-600 text-white text-xl font-semibold rounded-xl shadow-2xl hover:bg-indigo-700">Start Free Trial</button>
          </Link>
        </div>

        {/* KPI Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { label: 'Available to Budget', value: '$4,238', color: 'text-indigo-600' },
            { label: 'Forecasted Cash', value: '+$1,892', color: 'text-green-600' },
            { label: 'Budget Health', value: '97%', color: 'text-blue-600' },
            { label: 'Savings Rate', value: '23%', color: 'text-purple-600' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-white/50 shadow-xl">
              <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-slate-600 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-4xl font-black text-center text-slate-900 mb-16">Everything You Need to Win at Money</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-3">AI Coach</h3>
            <p className="text-indigo-100">Get personalized spending advice and budget optimization.</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl text-white">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="text-2xl font-bold mb-3">Bank Sync</h3>
            <p className="text-emerald-100">Securely connect 12,000+ banks. Auto-import transactions.</p>
          </div>
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-8 rounded-3xl text-white">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-2xl font-bold mb-3">Forecasting</h3>
            <p className="text-rose-100">See your future balance with 95% accuracy.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-4xl font-black text-center text-slate-900 mb-16">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { name: 'Starter', price: 7, features: ['1 Account', 'Basic AI Coach', 'CSV Import'] },
            { name: 'Pro', price: 15, features: ['Unlimited Accounts', 'Bank Sync', 'Advanced AI'], popular: true },
            { name: 'Family', price: 24, features: ['Multi-Household', 'Shared Goals', 'Priority Support'] },
          ].map((plan) => (
            <div key={plan.name} className={`p-8 rounded-2xl border-2 ${plan.popular ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
              {plan.popular && <div className="text-indigo-600 font-bold text-sm mb-2">MOST POPULAR</div>}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-black mb-6">${plan.price}<span className="text-lg font-normal text-slate-500">/mo</span></div>
              <ul className="space-y-2 mb-8">
                {plan.features.map(f => <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>)}
              </ul>
              <Link href="/sign-up">
                <button className={`w-full py-3 rounded-xl font-semibold ${plan.popular ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>Get Started</button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400">© 2026 Budget Command Center Pro. Bank-level security. SOC 2 compliant.</p>
          <p className="text-slate-500 text-sm mt-2">✅ 14-day free trial · No credit card required · Cancel anytime</p>
        </div>
      </footer>
    </div>
  )
}
