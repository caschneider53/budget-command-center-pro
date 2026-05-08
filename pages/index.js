import { useState } from 'react'
import Head from 'next/head'

const S = {
  layout: { display:'flex', minHeight:'100vh', background:'var(--bg)', color:'var(--text)', fontFamily:"'Inter',system-ui,sans-serif" },
  sidebar: { width:'220px', flexShrink:0, background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', padding:'0' },
  logo: { padding:'20px 18px', borderBottom:'1px solid var(--border)' },
  logoMark: { fontSize:'15px', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'2px' },
  logoSub: { fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.1em' },
  nav: (a) => ({ display:'flex', alignItems:'center', gap:'9px', padding:'9px 18px', fontSize:'13px', fontWeight: a?600:400, color: a?'var(--blue)':'var(--muted)', background: a?'var(--blue-dim)':'transparent', borderLeft: a?'2px solid var(--blue)':'2px solid transparent', cursor:'pointer', transition:'all 120ms ease' }),
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'auto' },
  topbar: { padding:'14px 24px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 },
  topTitle: { fontSize:'18px', fontWeight:700, letterSpacing:'-0.02em' },
  btn: (c='var(--blue)') => ({ background:c, color: c==='var(--blue)'?'#fff':'var(--muted)', padding:'8px 14px', borderRadius:'var(--r-sm)', fontSize:'12px', fontWeight:600, cursor:'pointer', border:'none', transition:'opacity 120ms' }),
  content: { padding:'20px 24px', flex:1 },
  kgrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'12px', marginBottom:'20px' },
  kpi: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px 18px' },
  klabel: { fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:'var(--muted)', marginBottom:'8px' },
  kval: { fontSize:'24px', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'3px', fontVariantNumeric:'tabular-nums lining-nums' },
  kmeta: (ok=true) => ({ fontSize:'11px', color: ok?'var(--green)':'var(--red)', fontWeight:500 }),
  g2: { display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:'14px', marginBottom:'14px' },
  g22: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' },
  card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'18px 20px' },
  ctitle: { fontSize:'15px', fontWeight:700, marginBottom:'14px', letterSpacing:'-0.01em' },
  barBg: { height:'7px', background:'var(--surface-3)', borderRadius:'999px', overflow:'hidden', marginTop:'5px' },
  bar: (p,c) => ({ width:`${Math.min(p,100)}%`, height:'100%', background:c, borderRadius:'999px', transition:'width .5s ease' }),
  row: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' },
  tag: (c='var(--blue)') => ({ fontSize:'10px', fontWeight:600, padding:'2px 7px', borderRadius:'999px', background:c+'22', color:c }),
  dot: (c) => ({ width:'7px', height:'7px', borderRadius:'50%', background:c, display:'inline-block', marginRight:'7px', flexShrink:0 }),
  input: { background:'var(--surface-2)', border:'1px solid var(--border-2)', borderRadius:'var(--r-sm)', padding:'8px 11px', fontSize:'13px', color:'var(--text)', width:'100%', outline:'none' },
  label: { fontSize:'11px', color:'var(--muted)', marginBottom:'5px', display:'block' },
  fgrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' },
  modal: { position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, backdropFilter:'blur(4px)' },
  mbox: { background:'var(--surface)', border:'1px solid var(--border-2)', borderRadius:'var(--r-xl)', padding:'26px', width:'420px', maxWidth:'95vw', boxShadow:'0 24px 64px rgba(0,0,0,0.7)' },
  amsg: (ai) => ({ display:'flex', gap:'8px', flexDirection:ai?'row':'row-reverse', marginBottom:'12px', alignItems:'flex-start' }),
  abub: (ai) => ({ maxWidth:'78%', padding:'9px 13px', borderRadius:ai?'4px 13px 13px 13px':'13px 4px 13px 13px', background:ai?'var(--surface-2)':'var(--blue-dim)', fontSize:'13px', lineHeight:1.65 }),
}

const CATS = [
  {name:'Housing', budget:2250, spent:1850, color:'var(--blue)'},
  {name:'Food & Groceries', budget:800, spent:640, color:'var(--green)'},
  {name:'Transportation', budget:600, spent:390, color:'var(--yellow)'},
  {name:'Utilities', budget:350, spent:290, color:'var(--purple)'},
  {name:'Entertainment', budget:300, spent:180, color:'var(--red)'},
  {name:'Health', budget:250, spent:115, color:'var(--green)'},
]

const INIT_TXNS = [
  {id:1, name:'Home Depot', category:'Housing', date:'May 7', amount:-284.16, type:'expense'},
  {id:2, name:'Costco', category:'Food', date:'May 6', amount:-146.72, type:'expense'},
  {id:3, name:'Client Invoice #48', category:'Income', date:'May 5', amount:2400.00, type:'income'},
  {id:4, name:'Shell Gas', category:'Transportation', date:'May 5', amount:-62.40, type:'expense'},
  {id:5, name:'Verizon', category:'Utilities', date:'May 4', amount:-85.00, type:'expense'},
  {id:6, name:'Netflix', category:'Entertainment', date:'May 3', amount:-22.99, type:'expense'},
  {id:7, name:'Walmart', category:'Food', date:'May 3', amount:-93.44, type:'expense'},
  {id:8, name:'Client Invoice #47', category:'Income', date:'May 1', amount:1800.00, type:'income'},
]

const BILLS = [
  {name:'Mortgage', due:'May 12', amount:1450},
  {name:'Utilities', due:'May 14', amount:220},
  {name:'Auto Insurance', due:'May 17', amount:190},
  {name:'Internet', due:'May 18', amount:95},
  {name:'Electric', due:'May 20', amount:145},
  {name:'Gym Membership', due:'May 22', amount:45},
]

const GOALS = [
  {name:'Emergency Fund', current:8200, target:15000, color:'var(--green)', icon:'\uD83D\uDEE1\uFE0F'},
  {name:'Property Down Payment', current:12500, target:35000, color:'var(--blue)', icon:'\uD83C\uDFE1'},
  {name:'Truck Upgrade', current:3100, target:8000, color:'var(--yellow)', icon:'\uD83D\uDE9B'},
  {name:'Tool Investment', current:1400, target:5000, color:'var(--purple)', icon:'\uD83D\uDD27'},
]

const NAV = [
  {label:'Dashboard', icon:'\uD83D\uDCCA'},
  {label:'Budget', icon:'\uD83D\uDCB0'},
  {label:'Transactions', icon:'\uD83D\uDCB3'},
  {label:'Bills', icon:'\uD83D\uDDD3\uFE0F'},
  {label:'Goals', icon:'\uD83C\uDFAF'},
  {label:'AI Coach', icon:'\uD83E\uDD16'},
]

const AI_REPLIES = [
  "Based on your data, your biggest opportunity is reducing Housing costs — currently at 82% of budget. Even saving $150/month there adds $1,800/year to goals.",
  "Your Property Down Payment goal needs $22,500 more. At your current savings rate, you can reach it in approximately 18 months.",
  "You have strong income this month. Consider moving an extra $400 into your Emergency Fund to hit your target faster.",
  "Your Transportation spending is 65% of budget — well controlled. Keep that discipline and you'll free up budget elsewhere.",
  "Bills due in the next 14 days total $1,260. Your available budget easily covers this — no action needed.",
]

export default function Home() {
  const [tab, setTab] = useState('Dashboard')
  const [modal, setModal] = useState(false)
  const [txns, setTxns] = useState(INIT_TXNS)
  const [form, setForm] = useState({name:'', category:'Food', amount:'', type:'expense'})
  const [msgs, setMsgs] = useState([
    {ai:true, text:"Hi! I'm your AI Budget Coach. I can help you analyze spending, plan savings, and reach your financial goals faster. What would you like to know?"},
  ])
  const [aiIn, setAiIn] = useState('')

  const income = txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const spent = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Math.abs(t.amount),0)

  function addTxn() {
    if (!form.name || !form.amount) return
    const amt = parseFloat(form.amount)
    setTxns(p=>[{id:Date.now(), ...form, amount:form.type==='expense'?-Math.abs(amt):Math.abs(amt), date:'Today'}, ...p])
    setModal(false)
    setForm({name:'', category:'Food', amount:'', type:'expense'})
  }

  function sendAi(e) {
    if (e && e.key && e.key !== 'Enter') return
    if (!aiIn.trim()) return
    const q = aiIn.trim()
    setMsgs(m=>[...m, {ai:false,text:q}])
    setAiIn('')
    setTimeout(()=>{
      setMsgs(m=>[...m, {ai:true, text:AI_REPLIES[Math.floor(Math.random()*AI_REPLIES.length)]}])
    }, 700)
  }

  return (
    <>
      <Head>
        <title>Budget Command Center Pro</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>

      <div style={S.layout}>
        {/* SIDEBAR */}
        <aside style={S.sidebar}>
          <div style={S.logo}>
            <div style={S.logoMark}>💰 Budget Pro</div>
            <div style={S.logoSub}>Command Center</div>
          </div>
          <nav style={{flex:1, paddingTop:'8px'}}>
            {NAV.map(n=>(
              <div key={n.label} style={S.nav(tab===n.label)} onClick={()=>setTab(n.label)}>
                <span style={{fontSize:'14px'}}>{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div style={{padding:'14px 18px', borderTop:'1px solid var(--border)', fontSize:'12px'}}>
            <div style={{fontWeight:600, color:'var(--text)', marginBottom:'2px'}}>Chris Schneider</div>
            <div style={{color:'var(--muted)', fontSize:'11px'}}>Personal Budget · May 2026</div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div style={S.main}>
          <div style={S.topbar}>
            <div style={S.topTitle}>{tab}</div>
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
              <span style={{fontSize:'12px', color:'var(--muted)'}}>May 2026</span>
              <button style={S.btn()} onClick={()=>setModal(true)}>+ Add Transaction</button>
            </div>
          </div>

          <div style={S.content}>

            {/* ── DASHBOARD ── */}
            {tab==='Dashboard' && (
              <>
                <div style={S.kgrid}>
                  {[
                    ['Available to Budget','$3,420','↑ +$310 this month',true],
                    ['Monthly Income','$'+income.toLocaleString(),''+txns.filter(t=>t.type==='income').length+' deposits',true],
                    ['Monthly Spending','$'+spent.toFixed(0),'72% of monthly income',false],
                    ['Savings Rate','18.4%','↑ +3.1% vs last month',true],
                  ].map(([l,v,m,ok])=>(
                    <div key={l} style={S.kpi}>
                      <div style={S.klabel}>{l}</div>
                      <div style={S.kval}>{v}</div>
                      <div style={S.kmeta(ok)}>{m}</div>
                    </div>
                  ))}
                </div>
                <div style={S.g2}>
                  <div style={S.card}>
                    <div style={S.ctitle}>Budget Categories</div>
                    {CATS.map(c=>(
                      <div key={c.name} style={{marginBottom:'13px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'3px'}}>
                          <span style={{display:'flex',alignItems:'center'}}><span style={S.dot(c.color)}/>{c.name}</span>
                          <span style={{color:'var(--muted)', fontVariantNumeric:'tabular-nums'}}>${c.spent} <span style={{color:'var(--faint)'}}>/ ${c.budget}</span></span>
                        </div>
                        <div style={S.barBg}><div style={S.bar(Math.round(c.spent/c.budget*100),c.color)}/></div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    <div style={S.card}>
                      <div style={S.ctitle}>Recent Transactions</div>
                      {txns.slice(0,4).map(t=>(
                        <div key={t.id} style={S.row}>
                          <div>
                            <div style={{fontWeight:500,fontSize:'13px'}}>{t.name}</div>
                            <div style={{fontSize:'11px',color:'var(--muted)'}}>{t.category} · {t.date}</div>
                          </div>
                          <div style={{fontWeight:700,fontSize:'13px',color:t.amount>0?'var(--green)':'var(--text)',fontVariantNumeric:'tabular-nums'}}>{t.amount>0?'+':''}{t.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                    <div style={S.card}>
                      <div style={S.ctitle}>Bills Due Soon</div>
                      {BILLS.slice(0,3).map(b=>(
                        <div key={b.name} style={S.row}>
                          <div>
                            <div style={{fontWeight:500,fontSize:'13px'}}>{b.name}</div>
                            <div style={{fontSize:'11px',color:'var(--muted)'}}>{b.due}</div>
                          </div>
                          <div style={{fontWeight:700,fontSize:'13px',fontVariantNumeric:'tabular-nums'}}>${b.amount.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── BUDGET ── */}
            {tab==='Budget' && (
              <>
                <div style={S.kgrid}>
                  <div style={S.kpi}><div style={S.klabel}>Total Budgeted</div><div style={S.kval}>$4,550</div></div>
                  <div style={S.kpi}><div style={S.klabel}>Total Spent</div><div style={S.kval}>$3,465</div><div style={S.kmeta(true)}>76% of budget used</div></div>
                  <div style={S.kpi}><div style={S.klabel}>Remaining</div><div style={S.kval} >$1,085</div><div style={S.kmeta(true)}>On track</div></div>
                </div>
                <div style={S.card}>
                  <div style={S.ctitle}>Category Breakdown</div>
                  {CATS.map(c=>{
                    const pct = Math.round(c.spent/c.budget*100)
                    return (
                      <div key={c.name} style={{padding:'12px 0', borderBottom:'1px solid var(--border)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'7px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',fontWeight:600}}>
                            <span style={S.dot(c.color)}/>{c.name}
                          </div>
                          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                            <span style={{fontSize:'12px',color:'var(--muted)',fontVariantNumeric:'tabular-nums'}}>${c.spent} / ${c.budget}</span>
                            <span style={S.tag(pct>80?'var(--red)':pct>60?'var(--yellow)':'var(--green)')}>{pct}%</span>
                          </div>
                        </div>
                        <div style={S.barBg}><div style={S.bar(pct,c.color)}/></div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── TRANSACTIONS ── */}
            {tab==='Transactions' && (
              <div style={S.card}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                  <div style={S.ctitle}>All Transactions</div>
                  <button style={S.btn()} onClick={()=>setModal(true)}>+ Add</button>
                </div>
                <table>
                  <thead>
                    <tr style={{borderBottom:'1px solid var(--border)'}}>
                      {['Date','Description','Category','Amount','Type'].map(h=>(
                        <th key={h} style={{textAlign:'left',padding:'8px 10px',fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.09em',color:'var(--muted)',fontWeight:600}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map(t=>(
                      <tr key={t.id} style={{borderBottom:'1px solid var(--border)',transition:'background 120ms'}}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'10px',color:'var(--muted)',fontSize:'12px'}}>{t.date}</td>
                        <td style={{padding:'10px',fontWeight:500,fontSize:'13px'}}>{t.name}</td>
                        <td style={{padding:'10px'}}><span style={S.tag()}>{t.category}</span></td>
                        <td style={{padding:'10px',fontWeight:700,fontSize:'13px',color:t.amount>0?'var(--green)':'var(--text)',fontVariantNumeric:'tabular-nums'}}>{t.amount>0?'+':''}{t.amount.toFixed(2)}</td>
                        <td style={{padding:'10px'}}><span style={S.tag(t.type==='income'?'var(--green)':'var(--muted)')}>{t.type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── BILLS ── */}
            {tab==='Bills' && (
              <>
                <div style={S.kgrid}>
                  <div style={S.kpi}><div style={S.klabel}>Due This Month</div><div style={S.kval}>$2,245</div></div>
                  <div style={S.kpi}><div style={S.klabel}>Due Next 14 Days</div><div style={S.kval}>$1,955</div><div style={S.kmeta(false)}>↑ Needs coverage</div></div>
                  <div style={S.kpi}><div style={S.klabel}>Bills Count</div><div style={S.kval}>{BILLS.length}</div><div style={S.kmeta(true)}>All upcoming</div></div>
                </div>
                <div style={S.card}>
                  <div style={S.ctitle}>Upcoming Bills</div>
                  {BILLS.map(b=>(
                    <div key={b.name} style={{...S.row, padding:'13px 0'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div style={{width:'34px',height:'34px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>🗓️</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:'13px'}}>{b.name}</div>
                          <div style={{fontSize:'11px',color:'var(--muted)'}}>Due {b.due}</div>
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <span style={{fontWeight:700,fontSize:'15px',fontVariantNumeric:'tabular-nums'}}>${b.amount.toLocaleString()}</span>
                        <span style={S.tag('var(--yellow)')}>Upcoming</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── GOALS ── */}
            {tab==='Goals' && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'14px'}}>
                {GOALS.map(g=>{
                  const pct = Math.round(g.current/g.target*100)
                  return (
                    <div key={g.name} style={{...S.card,display:'flex',flexDirection:'column',gap:'13px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <span style={{fontSize:'22px'}}>{g.icon}</span>
                        <div>
                          <div style={{fontWeight:700,fontSize:'14px'}}>{g.name}</div>
                          <div style={{fontSize:'11px',color:'var(--muted)'}}>Target: ${g.target.toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px',fontSize:'12px'}}>
                          <span style={{fontWeight:600,fontVariantNumeric:'tabular-nums'}}>${g.current.toLocaleString()} saved</span>
                          <span style={S.tag(g.color)}>{pct}%</span>
                        </div>
                        <div style={S.barBg}><div style={S.bar(pct,g.color)}/></div>
                      </div>
                      <div style={{fontSize:'11px',color:'var(--muted)',fontVariantNumeric:'tabular-nums'}}>${(g.target-g.current).toLocaleString()} remaining to reach this goal</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── AI COACH ── */}
            {tab==='AI Coach' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'14px',height:'calc(100vh - 130px)'}}>
                <div style={{...S.card,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                  <div style={S.ctitle}>AI Budget Coach 🤖</div>
                  <div style={{flex:1,overflowY:'auto',marginBottom:'14px',display:'flex',flexDirection:'column'}}>
                    {msgs.map((m,i)=>(
                      <div key={i} style={S.amsg(m.ai)}>
                        {m.ai && <div style={{width:'26px',height:'26px',borderRadius:'50%',background:'var(--blue-dim)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'13px'}}>🤖</div>}
                        <div style={S.abub(m.ai)}>{m.text}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:'8px'}}>
                    <input style={S.input} value={aiIn} onChange={e=>setAiIn(e.target.value)} onKeyDown={sendAi} placeholder="Ask about spending, goals, or savings tips..." />
                    <button style={S.btn()} onClick={()=>sendAi(null)}>Send</button>
                  </div>
                </div>
                <div style={{...S.card,overflow:'auto'}}>
                  <div style={S.ctitle}>Suggested Questions</div>
                  {[
                    'How can I save faster for my down payment?',
                    'Where am I overspending this month?',
                    'How long until I reach my emergency fund goal?',
                    'What should I cut to improve my savings rate?',
                  ].map(q=>(
                    <div key={q} onClick={()=>{setAiIn(q)}} style={{fontSize:'12px',color:'var(--muted)',padding:'9px 11px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',marginBottom:'8px',cursor:'pointer',lineHeight:1.55,transition:'background 120ms'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--surface-3)'}
                      onMouseLeave={e=>e.currentTarget.style.background='var(--surface-2)'}>
                      💡 {q}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ADD TRANSACTION MODAL */}
      {modal && (
        <div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div style={S.mbox}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <div style={{fontSize:'17px',fontWeight:700}}>Add Transaction</div>
              <button style={{color:'var(--muted)',fontSize:'20px',lineHeight:1}} onClick={()=>setModal(false)}>×</button>
            </div>
            <div style={S.fgrid}>
              <div>
                <label style={S.label}>Description</label>
                <input style={S.input} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Home Depot" />
              </div>
              <div>
                <label style={S.label}>Amount ($)</label>
                <input style={S.input} type="number" step="0.01" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="0.00" />
              </div>
            </div>
            <div style={S.fgrid}>
              <div>
                <label style={S.label}>Category</label>
                <select style={S.input} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {['Housing','Food','Transportation','Utilities','Entertainment','Health','Income','Other'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Type</label>
                <select style={S.input} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'6px'}}>
              <button style={S.btn('transparent')} onClick={()=>setModal(false)}>Cancel</button>
              <button style={S.btn()} onClick={addTxn}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
