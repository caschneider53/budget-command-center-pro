import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const S = {
  layout: { display:'flex', minHeight:'100vh', background:'var(--bg)', color:'var(--text)', fontFamily:"'Inter',system-ui,sans-serif" },
  sidebar: { width:'220px', flexShrink:0, background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column' },
  logo: { padding:'20px 18px', borderBottom:'1px solid var(--border)' },
  logoMark: { fontSize:'15px', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'2px' },
  logoSub: { fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.1em' },
  nav: (a) => ({ display:'flex', alignItems:'center', gap:'9px', padding:'9px 18px', fontSize:'13px', fontWeight:a?600:400, color:a?'var(--blue)':'var(--muted)', background:a?'var(--blue-dim)':'transparent', borderLeft:a?'2px solid var(--blue)':'2px solid transparent', cursor:'pointer', transition:'all 120ms ease' }),
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'auto' },
  topbar: { padding:'14px 24px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 },
  topTitle: { fontSize:'18px', fontWeight:700, letterSpacing:'-0.02em' },
  btn: (c='var(--blue)') => ({ background:c, color:'#fff', padding:'8px 14px', borderRadius:'var(--r-sm)', fontSize:'12px', fontWeight:600, cursor:'pointer', border:'none', transition:'opacity 120ms' }),
  content: { padding:'20px 24px', flex:1 },
  kgrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'12px', marginBottom:'20px' },
  kpi: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px 18px' },
  klabel: { fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:'var(--muted)', marginBottom:'8px' },
  kval: { fontSize:'24px', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'3px', fontVariantNumeric:'tabular-nums lining-nums' },
  kmeta: (ok=true) => ({ fontSize:'11px', color:ok?'var(--green)':'var(--muted)', fontWeight:500 }),
  g2: { display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:'14px', marginBottom:'14px' },
  card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'18px 20px' },
  ctitle: { fontSize:'15px', fontWeight:700, marginBottom:'14px', letterSpacing:'-0.01em' },
  barBg: { height:'7px', background:'var(--surface-3)', borderRadius:'999px', overflow:'hidden', marginTop:'5px' },
  bar: (p,c) => ({ width:`${Math.min(p,100)}%`, height:'100%', background:`var(--${c})`, borderRadius:'999px', transition:'width .5s ease' }),
  row: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' },
  tag: (c='var(--blue)') => ({ fontSize:'10px', fontWeight:600, padding:'2px 7px', borderRadius:'999px', background:c+'22', color:c }),
  dot: (c) => ({ width:'7px', height:'7px', borderRadius:'50%', background:`var(--${c})`, display:'inline-block', marginRight:'7px', flexShrink:0 }),
  input: { background:'var(--surface-2)', border:'1px solid var(--border-2)', borderRadius:'var(--r-sm)', padding:'8px 11px', fontSize:'13px', color:'var(--text)', width:'100%', outline:'none' },
  label: { fontSize:'11px', color:'var(--muted)', marginBottom:'5px', display:'block' },
  fgrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' },
  modal: { position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, backdropFilter:'blur(4px)' },
  mbox: { background:'var(--surface)', border:'1px solid var(--border-2)', borderRadius:'var(--r-xl)', padding:'26px', width:'420px', maxWidth:'95vw', boxShadow:'0 24px 64px rgba(0,0,0,0.7)' },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 20px', color:'var(--muted)', textAlign:'center', gap:'10px' },
  emptyIcon: { fontSize:'32px', marginBottom:'4px' },
  emptyTitle: { fontSize:'14px', fontWeight:600, color:'var(--text)' },
  emptySub: { fontSize:'12px', maxWidth:'28ch', lineHeight:1.6 },
  saving: { position:'fixed', bottom:'20px', right:'20px', background:'var(--surface-3)', border:'1px solid var(--border-2)', borderRadius:'var(--r-md)', padding:'8px 14px', fontSize:'12px', color:'var(--muted)', zIndex:200, display:'flex', alignItems:'center', gap:'8px' },
  amsg: (ai) => ({ display:'flex', gap:'8px', flexDirection:ai?'row':'row-reverse', marginBottom:'12px', alignItems:'flex-start' }),
  abub: (ai) => ({ maxWidth:'78%', padding:'9px 13px', borderRadius:ai?'4px 13px 13px 13px':'13px 4px 13px 13px', background:ai?'var(--surface-2)':'var(--blue-dim)', fontSize:'13px', lineHeight:1.65 }),
}

const BILLS = [
  {name:'Mortgage', due:'May 12', amount:1450},
  {name:'Utilities', due:'May 14', amount:220},
  {name:'Auto Insurance', due:'May 17', amount:190},
  {name:'Internet', due:'May 18', amount:95},
  {name:'Electric', due:'May 20', amount:145},
  {name:'Gym Membership', due:'May 22', amount:45},
]

const NAV = [
  {label:'Dashboard', icon:'📊'},
  {label:'Budget', icon:'💰'},
  {label:'Transactions', icon:'💳'},
  {label:'Bills', icon:'🗓️'},
  {label:'Goals', icon:'🎯'},
  {label:'AI Coach', icon:'🤖'},
]

const AI_REPLIES = [
  "Based on your budget setup, start by logging your first transactions so I can give you personalized insights.",
  "Your goals are set up — now try adding your income sources first, then track expenses.",
  "To improve your savings rate, track every transaction for 30 days. Most people find 2–3 surprising categories they can trim.",
  "Your Housing budget is your biggest category. Once you log your mortgage or rent, you'll see exactly how much breathing room you have.",
  "Once you have 2+ weeks of transactions logged, I can identify your top spending categories and suggest specific cuts.",
]

function fmt(n) {
  return '$' + Math.abs(n).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})
}

// ── LOGIN SCREEN ──
function LoginScreen() {
  return (
    <div style={{minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'48px 40px', width:'380px', maxWidth:'95vw', textAlign:'center', boxShadow:'var(--shadow-lg)'}}>
        <div style={{fontSize:'40px', marginBottom:'16px'}}>💰</div>
        <div style={{fontSize:'22px', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'6px'}}>Budget Command Center</div>
        <div style={{fontSize:'13px', color:'var(--muted)', marginBottom:'32px', lineHeight:1.6}}>Track spending, hit your goals, and take control of your finances.</div>
        <button
          onClick={() => signIn('google')}
          style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'12px 20px', background:'var(--surface-2)', border:'1px solid var(--border-2)', borderRadius:'var(--r-md)', fontSize:'14px', fontWeight:600, cursor:'pointer', color:'var(--text)', transition:'background 150ms'}}
          onMouseEnter={e=>e.currentTarget.style.background='var(--surface-3)'}
          onMouseLeave={e=>e.currentTarget.style.background='var(--surface-2)'}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <div style={{marginTop:'20px', fontSize:'11px', color:'var(--muted)'}}>Your data is private and only visible to you.</div>
      </div>
    </div>
  )
}

// ── MAIN APP ──
function App({ session }) {
  const [tab, setTab] = useState('Dashboard')
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState('')
  const [txns, setTxns] = useState([])
  const [goals, setGoals] = useState([])
  const [budgets, setBudgets] = useState([])
  const [form, setForm] = useState({name:'', category:'Housing', amount:'', type:'expense'})
  const [msgs, setMsgs] = useState([
    {ai:true, text:`Welcome back, ${session.user.name.split(' ')[0]}! Your data is saved automatically. Add transactions to get started.`},
  ])
  const [aiIn, setAiIn] = useState('')

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(data => { setTxns(data.transactions||[]); setGoals(data.goals||[]); setBudgets(data.budgets||[]); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const saveData = useCallback((t, g, b) => {
    setSaveStatus('saving')
    fetch('/api/data', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({transactions:t, goals:g, budgets:b}) })
      .then(() => { setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''), 2000) })
      .catch(() => setSaveStatus(''))
  }, [])

  const income = txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const spent = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Math.abs(t.amount),0)
  const available = income - spent
  const savingsRate = income > 0 ? ((income-spent)/income*100).toFixed(1) : '0.0'
  const catSpend = (name) => txns.filter(t=>t.type==='expense'&&t.category===name).reduce((s,t)=>s+Math.abs(t.amount),0)

  function addTxn() {
    if (!form.name || !form.amount) return
    const amt = parseFloat(form.amount)
    if (isNaN(amt)||amt<=0) return
    const newTxn = {id:Date.now(), ...form, amount:form.type==='expense'?-Math.abs(amt):Math.abs(amt), date:'Today'}
    const newTxns = [newTxn, ...txns]
    setTxns(newTxns); saveData(newTxns, goals, budgets)
    setModal(false); setForm({name:'', category:'Housing', amount:'', type:'expense'})
  }

  function deleteTxn(id) {
    const newTxns = txns.filter(t=>t.id!==id)
    setTxns(newTxns); saveData(newTxns, goals, budgets)
  }

  function updateGoal(idx, val) {
    const newGoals = goals.map((g,i)=>i===idx?{...g,current:val}:g)
    setGoals(newGoals); saveData(txns, newGoals, budgets)
  }

  function sendAi(e) {
    if (e&&e.key&&e.key!=='Enter') return
    if (!aiIn.trim()) return
    const q = aiIn.trim(); setMsgs(m=>[...m,{ai:false,text:q}]); setAiIn('')
    setTimeout(()=>setMsgs(m=>[...m,{ai:true,text:AI_REPLIES[Math.floor(Math.random()*AI_REPLIES.length)]}]),700)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)',color:'var(--muted)',fontFamily:'Inter,sans-serif',flexDirection:'column',gap:'12px'}}>
      <div style={{fontSize:'28px'}}>💰</div><div style={{fontSize:'14px'}}>Loading your budget...</div>
    </div>
  )

  return (
    <div style={S.layout}>
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoMark}>💰 Budget Pro</div>
          <div style={S.logoSub}>Command Center</div>
        </div>
        <nav style={{flex:1, paddingTop:'8px'}}>
          {NAV.map(n=>(
            <div key={n.label} style={S.nav(tab===n.label)} onClick={()=>setTab(n.label)}>
              <span style={{fontSize:'14px'}}>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
        </nav>
        <div style={{padding:'14px 18px', borderTop:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
            {session.user.image && <img src={session.user.image} alt="" width="28" height="28" style={{borderRadius:'50%'}} />}
            <div>
              <div style={{fontWeight:600,fontSize:'12px',color:'var(--text)'}}>{session.user.name}</div>
              <div style={{color:'var(--muted)',fontSize:'10px'}}>May 2026</div>
            </div>
          </div>
          <button onClick={()=>signOut()} style={{width:'100%',padding:'6px',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',fontSize:'11px',color:'var(--muted)',cursor:'pointer'}}>Sign out</button>
        </div>
      </aside>

      <div style={S.main}>
        <div style={S.topbar}>
          <div style={S.topTitle}>{tab}</div>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <span style={{fontSize:'12px',color:'var(--muted)'}}>May 2026</span>
            <button style={S.btn()} onClick={()=>setModal(true)}>+ Add Transaction</button>
          </div>
        </div>

        <div style={S.content}>
          {tab==='Dashboard' && (
            <>
              <div style={S.kgrid}>
                <div style={S.kpi}><div style={S.klabel}>Available to Budget</div><div style={S.kval}>{fmt(available)}</div><div style={S.kmeta(available>=0)}>{income===0?'Add income to get started':available>=0?'Looking good':'Over budget'}</div></div>
                <div style={S.kpi}><div style={S.klabel}>Monthly Income</div><div style={S.kval}>{fmt(income)}</div><div style={S.kmeta(true)}>{txns.filter(t=>t.type==='income').length} deposit{txns.filter(t=>t.type==='income').length!==1?'s':''} logged</div></div>
                <div style={S.kpi}><div style={S.klabel}>Monthly Spending</div><div style={S.kval}>{fmt(spent)}</div><div style={S.kmeta(true)}>{txns.filter(t=>t.type==='expense').length} transaction{txns.filter(t=>t.type==='expense').length!==1?'s':''} logged</div></div>
                <div style={S.kpi}><div style={S.klabel}>Savings Rate</div><div style={S.kval}>{savingsRate}%</div><div style={S.kmeta(parseFloat(savingsRate)>0)}>{income===0?'Log income first':parseFloat(savingsRate)>15?'Great rate!':'Keep going'}</div></div>
              </div>
              <div style={S.g2}>
                <div style={S.card}>
                  <div style={S.ctitle}>Budget Categories</div>
                  {budgets.map(c=>{
                    const s=catSpend(c.name); const pct=c.budget>0?Math.round(s/c.budget*100):0
                    return (<div key={c.name} style={{marginBottom:'13px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'3px'}}>
                        <span style={{display:'flex',alignItems:'center'}}><span style={S.dot(c.color)}/>{c.name}</span>
                        <span style={{color:'var(--muted)',fontVariantNumeric:'tabular-nums'}}>{fmt(s)} <span style={{color:'var(--faint)'}}>/ ${c.budget.toLocaleString()}</span></span>
                      </div>
                      <div style={S.barBg}><div style={S.bar(pct,c.color)}/></div>
                    </div>)
                  })}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  <div style={S.card}>
                    <div style={S.ctitle}>Recent Transactions</div>
                    {txns.length===0?(<div style={S.empty}><div style={S.emptyIcon}>💳</div><div style={S.emptyTitle}>No transactions yet</div><div style={S.emptySub}>Click "+ Add Transaction" to log your first one.</div></div>)
                    :txns.slice(0,5).map(t=>(<div key={t.id} style={S.row}><div><div style={{fontWeight:500,fontSize:'13px'}}>{t.name}</div><div style={{fontSize:'11px',color:'var(--muted)'}}>{t.category} · {t.date}</div></div><div style={{fontWeight:700,fontSize:'13px',color:t.amount>0?'var(--green)':'var(--text)',fontVariantNumeric:'tabular-nums'}}>{t.amount>0?'+':''}{fmt(t.amount)}</div></div>))}
                  </div>
                  <div style={S.card}>
                    <div style={S.ctitle}>Bills Due Soon</div>
                    {BILLS.slice(0,3).map(b=>(<div key={b.name} style={S.row}><div><div style={{fontWeight:500,fontSize:'13px'}}>{b.name}</div><div style={{fontSize:'11px',color:'var(--muted)'}}>{b.due}</div></div><div style={{fontWeight:700,fontSize:'13px',fontVariantNumeric:'tabular-nums'}}>${b.amount.toLocaleString()}</div></div>))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab==='Budget' && (
            <>
              <div style={S.kgrid}>
                <div style={S.kpi}><div style={S.klabel}>Total Budgeted</div><div style={S.kval}>${budgets.reduce((s,c)=>s+c.budget,0).toLocaleString()}</div></div>
                <div style={S.kpi}><div style={S.klabel}>Total Spent</div><div style={S.kval}>{fmt(spent)}</div><div style={S.kmeta(true)}>{income>0?Math.round(spent/income*100)+'% of income':'Log income first'}</div></div>
                <div style={S.kpi}><div style={S.klabel}>Remaining</div><div style={S.kval}>{fmt(budgets.reduce((s,c)=>s+c.budget,0)-spent)}</div></div>
              </div>
              <div style={S.card}>
                <div style={S.ctitle}>Category Breakdown</div>
                {budgets.map(c=>{const s=catSpend(c.name);const pct=Math.round(s/c.budget*100);return(<div key={c.name} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'7px'}}><div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',fontWeight:600}}><span style={S.dot(c.color)}/>{c.name}</div><div style={{display:'flex',gap:'10px',alignItems:'center'}}><span style={{fontSize:'12px',color:'var(--muted)',fontVariantNumeric:'tabular-nums'}}>{fmt(s)} / ${c.budget.toLocaleString()}</span><span style={S.tag(pct>80?'var(--red)':pct>60?'var(--yellow)':'var(--green)')}>{pct}%</span></div></div><div style={S.barBg}><div style={S.bar(pct,c.color)}/></div></div>)})}
              </div>
            </>
          )}

          {tab==='Transactions' && (
            <div style={S.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <div style={S.ctitle}>All Transactions</div>
                <button style={S.btn()} onClick={()=>setModal(true)}>+ Add</button>
              </div>
              {txns.length===0?(<div style={S.empty}><div style={S.emptyIcon}>📋</div><div style={S.emptyTitle}>No transactions yet</div><div style={S.emptySub}>Start logging your income and expenses.</div><button style={{...S.btn(),marginTop:'8px'}} onClick={()=>setModal(true)}>+ Add First Transaction</button></div>)
              :(<table><thead><tr style={{borderBottom:'1px solid var(--border)'}}>{['Date','Description','Category','Amount','Type',''].map((h,i)=>(<th key={i} style={{textAlign:'left',padding:'8px 10px',fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.09em',color:'var(--muted)',fontWeight:600}}>{h}</th>))}</tr></thead>
              <tbody>{txns.map(t=>(<tr key={t.id} style={{borderBottom:'1px solid var(--border)',transition:'background 120ms'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><td style={{padding:'10px',color:'var(--muted)',fontSize:'12px'}}>{t.date}</td><td style={{padding:'10px',fontWeight:500,fontSize:'13px'}}>{t.name}</td><td style={{padding:'10px'}}><span style={S.tag()}>{t.category}</span></td><td style={{padding:'10px',fontWeight:700,fontSize:'13px',color:t.amount>0?'var(--green)':'var(--text)',fontVariantNumeric:'tabular-nums'}}>{t.amount>0?'+':''}{fmt(t.amount)}</td><td style={{padding:'10px'}}><span style={S.tag(t.type==='income'?'var(--green)':'var(--muted)')}>{t.type}</span></td><td style={{padding:'10px'}}><button onClick={()=>deleteTxn(t.id)} style={{color:'var(--muted)',fontSize:'14px',padding:'2px 6px',borderRadius:'4px',transition:'color 120ms'}} onMouseEnter={e=>e.currentTarget.style.color='var(--red)'} onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}>✕</button></td></tr>))}</tbody></table>)}
            </div>
          )}

          {tab==='Bills' && (
            <>
              <div style={S.kgrid}>
                <div style={S.kpi}><div style={S.klabel}>Due This Month</div><div style={S.kval}>${BILLS.reduce((s,b)=>s+b.amount,0).toLocaleString()}</div></div>
                <div style={S.kpi}><div style={S.klabel}>Bills Count</div><div style={S.kval}>{BILLS.length}</div></div>
                <div style={S.kpi}><div style={S.klabel}>Largest Bill</div><div style={S.kval}>${Math.max(...BILLS.map(b=>b.amount)).toLocaleString()}</div></div>
              </div>
              <div style={S.card}>
                <div style={S.ctitle}>Upcoming Bills</div>
                {BILLS.map(b=>(<div key={b.name} style={{...S.row,padding:'13px 0'}}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={{width:'34px',height:'34px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>🗓️</div><div><div style={{fontWeight:600,fontSize:'13px'}}>{b.name}</div><div style={{fontSize:'11px',color:'var(--muted)'}}>Due {b.due}</div></div></div><div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontWeight:700,fontSize:'15px',fontVariantNumeric:'tabular-nums'}}>${b.amount.toLocaleString()}</span><span style={S.tag('var(--yellow)')}>Upcoming</span></div></div>))}
              </div>
            </>
          )}

          {tab==='Goals' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'14px'}}>
              {goals.map((g,gi)=>{const pct=g.target>0?Math.round(g.current/g.target*100):0;return(
                <div key={g.id||gi} style={{...S.card,display:'flex',flexDirection:'column',gap:'13px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'22px'}}>{g.icon}</span><div><div style={{fontWeight:700,fontSize:'14px'}}>{g.name}</div><div style={{fontSize:'11px',color:'var(--muted)'}}>Target: ${g.target.toLocaleString()}</div></div></div>
                  <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px',fontSize:'12px'}}><span style={{fontWeight:600,fontVariantNumeric:'tabular-nums'}}>${g.current.toLocaleString()} saved</span><span style={S.tag(`var(--${g.color})`)}>{pct}%</span></div><div style={S.barBg}><div style={S.bar(pct,g.color)}/></div></div>
                  <input style={{...S.input,fontSize:'12px',padding:'6px 8px'}} type="number" placeholder="Update saved amount & press Enter..." onKeyDown={e=>{if(e.key==='Enter'&&e.target.value){const val=parseFloat(e.target.value);if(!isNaN(val)&&val>=0){updateGoal(gi,val);e.target.value=''}}}}/>
                  <div style={{fontSize:'11px',color:'var(--muted)',fontVariantNumeric:'tabular-nums'}}>${(g.target-g.current).toLocaleString()} remaining</div>
                </div>
              )})}
            </div>
          )}

          {tab==='AI Coach' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'14px',height:'calc(100vh - 130px)'}}>
              <div style={{...S.card,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                <div style={S.ctitle}>AI Budget Coach 🤖</div>
                <div style={{flex:1,overflowY:'auto',marginBottom:'14px',display:'flex',flexDirection:'column'}}>
                  {msgs.map((m,i)=>(<div key={i} style={S.amsg(m.ai)}>{m.ai&&<div style={{width:'26px',height:'26px',borderRadius:'50%',background:'var(--blue-dim)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'13px'}}>🤖</div>}<div style={S.abub(m.ai)}>{m.text}</div></div>))}
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  <input style={S.input} value={aiIn} onChange={e=>setAiIn(e.target.value)} onKeyDown={sendAi} placeholder="Ask about spending, goals, or savings tips..."/>
                  <button style={S.btn()} onClick={()=>sendAi(null)}>Send</button>
                </div>
              </div>
              <div style={{...S.card,overflow:'auto'}}>
                <div style={S.ctitle}>Suggested Questions</div>
                {['How can I save faster for my down payment?','Where should I focus my budget first?','What savings rate should I aim for?','How do I build my emergency fund faster?'].map(q=>(
                  <div key={q} onClick={()=>setAiIn(q)} style={{fontSize:'12px',color:'var(--muted)',padding:'9px 11px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',marginBottom:'8px',cursor:'pointer',lineHeight:1.55,transition:'background 120ms'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-3)'} onMouseLeave={e=>e.currentTarget.style.background='var(--surface-2)'}>💡 {q}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {saveStatus && (<div style={S.saving}>{saveStatus==='saving'?<><span style={{fontSize:'10px'}}>⏳</span> Saving...</>:<><span style={{color:'var(--green)',fontSize:'12px'}}>✓</span> Saved</>}</div>)}

      {modal && (
        <div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div style={S.mbox}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <div style={{fontSize:'17px',fontWeight:700}}>Add Transaction</div>
              <button style={{color:'var(--muted)',fontSize:'20px',lineHeight:1}} onClick={()=>setModal(false)}>×</button>
            </div>
            <div style={S.fgrid}>
              <div><label style={S.label}>Description</label><input style={S.input} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Mortgage"/></div>
              <div><label style={S.label}>Amount ($)</label><input style={S.input} type="number" step="0.01" min="0" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="0.00"/></div>
            </div>
            <div style={S.fgrid}>
              <div><label style={S.label}>Category</label><select style={S.input} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{['Housing','Food & Groceries','Transportation','Utilities','Entertainment','Health','Other'].map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={S.label}>Type</label><select style={S.input} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}><option value="expense">Expense</option><option value="income">Income</option></select></div>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'6px'}}>
              <button style={{...S.btn('var(--surface-3)'),color:'var(--muted)'}} onClick={()=>setModal(false)}>Cancel</button>
              <button style={S.btn()} onClick={addTxn}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ROOT — handles auth state
export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)',color:'var(--muted)',fontFamily:'Inter,sans-serif',flexDirection:'column',gap:'12px'}}>
      <div style={{fontSize:'28px'}}>💰</div><div style={{fontSize:'14px'}}>Loading...</div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Budget Command Center Pro</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
      </Head>
      {session ? <App session={session}/> : <LoginScreen/>}
    </>
  )
}
