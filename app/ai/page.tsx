'use client'
import { useState } from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am your Budget Command Center AI Coach. I can help you analyze your spending, optimize your budget, and work toward your financial goals. What would you like to know? (Note: This is informational only, not personalized financial advice.)' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Sorry, I could not process that.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI coach. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'How can I reduce my dining spending?',
    'Am I on track for my savings goals?',
    'What budget categories need attention?',
    'How do I import my bank transactions?',
  ]

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

      <main className="container mx-auto px-6 py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">AI Financial Coach</h1>
          <p className="text-slate-500">Ask me anything about your budget, spending, or goals.</p>
          <p className="text-xs text-slate-400 mt-1">* Informational only. Not personalized financial advice.</p>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)} className="px-4 py-2 bg-white text-slate-700 text-sm rounded-full border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-sm">
              {s}
            </button>
          ))}
        </div>

        {/* Chat container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 space-y-4 min-h-96 max-h-96 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="text-xs font-semibold text-indigo-600 mb-1">🤖 AI Coach</div>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me about your budget, spending, or goals..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
