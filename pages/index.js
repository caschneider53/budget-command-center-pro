import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'

const DEFAULT_BUDGET_CATS = ['Housing','Food & Groceries','Transportation','Utilities','Insurance','Health','Personal','Entertainment','Savings','Debt']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const NAV = [
  {label:'Dashboard',icon:'📊'},
  {label:'Budget',icon:'💰'},
  {label:'Transactions',icon:'💳'},
  {label:'Bills',icon:'🗓️'},
  {label:'Goals',icon:'🎯'},
  {label:'Net Worth',icon:'🏠'},
  {label:'AI Coach',icon:'🤖'},
]
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899','#84cc16','#6366f1']
const fmt = (n=0) => `$${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`
const pct = (n=0) => `${Number(n||0).toFixed(1)}%`
const monthKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
const labelForMonth = k => { const [y,m]=k.split('-'); return `${MONTHS[Number(m)-1]} ${y}` }

function DonutChart({data}){
  const total = data.reduce((s,i)=>s+i.amount,0)
  let start=0
  const segs = data.map(i=>{const v=total?(i.amount/total)*100:0; const s=`${i.color} ${start}% ${start+v}%`; start+=v; return s})
  return (
    <div style={{display:'flex',gap:18,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{width:160,height:160,borderRadius:'50%',background:total?`conic-gradient(${segs.join(',')})` :'var(--surface-3)',display:'grid',placeItems:'center',flexShrink:0}}>
        <div style={{width:84,height:84,borderRadius:'50%',background:'var(--surface)',display:'grid',placeItems:'center',textAlign:'center',border:'1px solid var(--border)'}}>
          <div><div style={{fontSize:9,textTransform:'uppercase',color:'var(--muted)',letterSpacing:'.08em'}}>Spent</div><div style={{fontSize:13,fontWeight:800}}>{fmt(total)}</div></div>
        </div>
      </div>
      <div style={{flex:1,minWidth:180}}>
        {data.length ? data.map(i=>(
          <div key={i.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',gap:7}}><span style={{width:9,height:9,borderRadius:'50%',background:i.color,display:'inline-block'}}/><span style={{fontSize:12}}>{i.label}</span></div>
            <strong style={{fontSize:12}}>{fmt(i.amount)}</strong>
          </div>
        )) : <div style={{color:'var(--muted)',fontSize:13}}>Log transactions to see breakdown.</div>}
      </div>
    </div>
  )
}

function BarChart({items}){
  const max=Math.max(...items.map(i=>i.amount),1)
  return (
    <div style={{display:'grid',gap:10}}>
      {items.map(item=>(
        <div key={item.label}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}>
            <span style={{color:'var(--muted)'}}>{item.label}</span>
            <strong>{fmt(item.amount)}</strong>
          </div>
          <div style={{height:9,borderRadius:999,background:'var(--surface-3)',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${(item.amount/max)*100}%`,background:item.color,borderRadius:999}}/>
          </div>
        </div>
      ))}
    </div>
  )
}

function Modal({onClose,title,children}){
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'grid',placeItems:'center',padding:16,zIndex:100}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{width:'100%',maxWidth:460,background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:20,padding:24}}>
        <div style={{fontSize:18,fontWeight:800,marginBottom:16}}>{title}</div>
        {children}
      </div>
    </div>
  )
}

export default function Home(){
  const {data:session,status}=useSession()
  const [active,setActive]=useState('Dashboard')
  const [budgets,setBudgets]=useState({})           // {category: limit}
  const [transactions,setTransactions]=useState([]) // [{id,description,amount,category,type,date,month,recurring}]
  const [goals,setGoals]=useState([])               // [{id,name,target,current}]
  const [assets,setAssets]=useState([])             // [{id,name,amount}]
  const [debts,setDebts]=useState([])               // [{id,name,amount}]
  const [month,setMonth]=useState(monthKey())
  const [modal,setModal]=useState(null)
  const [txForm,setTxForm]=useState({date:new Date().toISOString().slice(0,10),description:'',amount:'',category:DEFAULT_BUDGET_CATS[0],type:'expense',recurring:false})
  const [goalForm,setGoalForm]=useState({name:'',target:'',current:''})
  const [assetForm,setAssetForm]=useState({name:'',amount:''})
  const [debtForm,setDebtForm]=useState({name:'',amount:''})
  const [budgetEdit,setBudgetEdit]=useState({key:'',value:''})

  useEffect(()=>{
    try{
      const d=localStorage.getItem('bcp-v3')
      if(d){const p=JSON.parse(d);setBudgets(p.budgets||{});setTransactions(p.transactions||[]);setGoals(p.goals||[]);setAssets(p.assets||[]);setDebts(p.debts||[])}
    }catch(e){}
  },[])

  useEffect(()=>{
    try{localStorage.setItem('bcp-v3',JSON.stringify({budgets,transactions,goals,assets,debts}))}catch(e){}
  },[budgets,transactions,goals,assets,debts])

  const curTx = useMemo(()=>transactions.filter(t=>t.month===month),[transactions,month])
  const income = curTx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const spending = curTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)
  const available = income-spending
  const savingsRate = income?((income-spending)/income)*100:0
  const allCats = [...new Set([...DEFAULT_BUDGET_CATS,...Object.keys(budgets)])]
  const byCategory = allCats.map((name,i)=>({
    label:name, amount:curTx.filter(t=>t.category===name&&t.type==='expense').reduce((s,t)=>s+t.amount,0),
    limit:budgets[name]||0, color:COLORS[i%COLORS.length]
  }))
  const topSpend = byCategory.filter(i=>i.amount>0).sort((a,b)=>b.amount-a.amount).slice(0,5)
  const recurringBills = curTx.filter(t=>t.recurring&&t.type==='expense').sort((a,b)=>new Date(a.date)-new Date(b.date))
  const totalAssets = assets.reduce((s,a)=>s+a.amount,0)
  const totalDebts = debts.reduce((s,d)=>s+d.amount,0)
  const netWorth = totalAssets-totalDebts
  const monthOptions = Array.from({length:12}).map((_,i)=>{const d=new Date();d.setMonth(d.getMonth()-i);return monthKey(d)})

  const addTx=()=>{
    if(!txForm.description||!txForm.amount)return
    const item={...txForm,id:Date.now(),amount:Number(txForm.amount),month:txForm.date.slice(0,7)}
    setTransactions(p=>[item,...p])
    setTxForm({date:new Date().toISOString().slice(0,10),description:'',amount:'',category:DEFAULT_BUDGET_CATS[0],type:'expense',recurring:false})
    setModal(null)
  }
  const addGoal=()=>{
    if(!goalForm.name||!goalForm.target)return
    setGoals(p=>[...p,{id:Date.now(),name:goalForm.name,target:Number(goalForm.target),current:Number(goalForm.current||0)}])
    setGoalForm({name:'',target:'',current:''})
    setModal(null)
  }
  const addAsset=()=>{
    if(!assetForm.name||!assetForm.amount)return
    setAssets(p=>[...p,{id:Date.now(),name:assetForm.name,amount:Number(assetForm.amount)}])
    setAssetForm({name:'',amount:''})
    setModal(null)
  }
  const addDebt=()=>{
    if(!debtForm.name||!debtForm.amount)return
    setDebts(p=>[...p,{id:Date.now(),name:debtForm.name,amount:Number(debtForm.amount)}])
    setDebtForm({name:'',amount:''})
    setModal(null)
  }
  const saveBudget=()=>{
    setBudgets(p=>({...p,[budgetEdit.key]:Number(budgetEdit.value||0)}))
    setModal(null)
  }
  const delTx=id=>setTransactions(p=>p.filter(t=>t.id!==id))
  const delGoal=id=>setGoals(p=>p.filter(g=>g.id!==id))
  const delAsset=id=>setAssets(p=>p.filter(a=>a.id!==id))
  const delDebt=id=>setDebts(p=>p.filter(d=>d.id!==id))

  const coachMsg = useMemo(()=>{
    if(!income)return 'Start by logging your income for the month so I can help you build a zero-based budget.'
    if(savingsRate<10)return `Your savings rate is ${pct(savingsRate)} — try to hit at least 15%. Look for your biggest expense category and see if you can trim it.`
    if(topSpend[0]?.amount>(topSpend[0]?.limit||Infinity))return `You are over budget in ${topSpend[0].label}. Adjust that limit or cut spending there this month.`
    return `Good work — savings rate is ${pct(savingsRate)}. Keep recurring bills funded and push extra money toward your highest-priority goal.`
  },[income,savingsRate,topSpend])

  const iBtn=(label,onClick,color='var(--blue)')=>(<button onClick={onClick} style={{background:color,color:'#fff',border:'none',borderRadius:10,padding:'10px 14px',fontWeight:700,cursor:'pointer',fontSize:13}}>{label}</button>)
  const oBtn=(label,onClick)=>(<button onClick={onClick} style={{background:'var(--surface-2)',color:'var(--text)',border:'1px solid var(--border-2)',borderRadius:10,padding:'10px 14px',cursor:'pointer',fontSize:13}}>{label}</button>)
  const inp=(val,onChange,props={})=>(<input value={val} onChange={e=>onChange(e.target.value)} style={{background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)',borderRadius:10,padding:11,width:'100%'}} {...props}/>)

  if(status==='loading')return null
  if(!session)return(
    <>
      <Head><title>Budget Command Center Pro</title></Head>
      <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#080e1c',fontFamily:'Inter,system-ui,sans-serif',padding:24}}>
        <div style={{width:'100%',maxWidth:480,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:24,padding:36}}>
          <div style={{fontSize:12,textTransform:'uppercase',letterSpacing:'.16em',color:'#93c5fd',marginBottom:10}}>Budget Pro</div>
          <h1 style={{fontSize:32,fontWeight:900,color:'#fff',margin:'0 0 12px',lineHeight:1.1}}>Your personal money command center.</h1>
          <p style={{color:'rgba(255,255,255,.65)',lineHeight:1.7,marginBottom:28}}>Track income, budget by category, watch bills, set goals, and build net worth — all in one place.</p>
          <button onClick={()=>signIn('google')} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:12,padding:'14px 20px',fontWeight:800,cursor:'pointer',fontSize:15}}>Continue with Google →</button>
        </div>
      </div>
    </>
  )

  return(
    <>
      <Head><title>Budget Command Center Pro</title><meta name="viewport" content="width=device-width,initial-scale=1"/></Head>
      <style jsx global>{`
        *{box-sizing:border-box;}html,body,#__next{margin:0;min-height:100%;}
        body{
          --bg:#080e1c;--surface:#0f1826;--surface-2:#162033;--surface-3:#1e2d45;
          --border:rgba(148,163,184,.14);--border-2:rgba(148,163,184,.22);
          --text:#ddeeff;--muted:#7a90ab;
          --blue:#3b82f6;--blue-dim:rgba(59,130,246,.12);
          --green:#10b981;--red:#ef4444;--yellow:#f59e0b;
          --r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:20px;
          background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;
        }
        button,input,select{font:inherit;}
        @media(max-width:860px){
          .layout{flex-direction:column!important;}
          .sidebar{width:100%!important;border-right:none!important;border-bottom:1px solid var(--border);}
          .navrow{display:flex;overflow:auto;padding-bottom:6px;}
          .g2{grid-template-columns:1fr!important;}
          .topbar{flex-direction:column;align-items:flex-start!important;gap:10px;padding:14px 16px!important;}
          .content{padding:14px!important;}
        }
      `}</style>
      <div className="layout" style={{display:'flex',minHeight:'100vh'}}>
        <aside className="sidebar" style={{width:230,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',flexShrink:0}}>
          <div style={{padding:'22px 18px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:17,fontWeight:900}}>💰 Budget Pro</div>
            <div style={{fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.18em',marginTop:4}}>Command Center</div>
          </div>
          <nav className="navrow" style={{padding:10}}>
            {NAV.map(item=>{
              const on=active===item.label
              return(<button key={item.label} onClick={()=>setActive(item.label)} style={{display:'flex',width:'100%',alignItems:'center',gap:9,padding:'10px 12px',marginBottom:4,background:on?'var(--blue-dim)':'transparent',color:on?'#fff':'var(--muted)',border:`1px solid ${on?'rgba(59,130,246,.28)':'transparent'}`,borderRadius:12,cursor:'pointer',textAlign:'left',fontSize:13,fontWeight:on?700:500}}>
                <span>{item.icon}</span><span>{item.label}</span>
              </button>)
            })}
          </nav>
          <div style={{marginTop:'auto',padding:'16px 18px',borderTop:'1px solid var(--border)',fontSize:12}}>
            <div style={{color:'var(--muted)',marginBottom:6}}>{session.user?.name}</div>
            <button onClick={()=>signOut()} style={{background:'transparent',color:'var(--muted)',border:'1px solid var(--border-2)',borderRadius:8,padding:'8px 10px',cursor:'pointer',fontSize:11}}>Sign out</button>
          </div>
        </aside>

        <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'auto'}}>
          <div className="topbar" style={{padding:'16px 24px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:20,fontWeight:900}}>{active}</div>
              <div style={{color:'var(--muted)',fontSize:12,marginTop:3}}>{labelForMonth(month)}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <select value={month} onChange={e=>setMonth(e.target.value)} style={{background:'var(--surface-2)',color:'var(--text)',border:'1px solid var(--border-2)',borderRadius:10,padding:'9px 12px',fontSize:13}}>
                {monthOptions.map(m=><option key={m} value={m}>{labelForMonth(m)}</option>)}
              </select>
              {iBtn('+ Add Transaction',()=>setModal('tx'))}
            </div>
          </div>

          <div className="content" style={{padding:22,flex:1}}>
            {/* KPI Row */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12,marginBottom:18}}>
              {[
                ['Available to Budget',fmt(available),available>=0?'Cash left':'Over budget',available>=0?'var(--green)':'var(--red)'],
                ['Monthly Income',fmt(income),`${curTx.filter(t=>t.type==='income').length} deposits`,'var(--muted)'],
                ['Monthly Spending',fmt(spending),`${curTx.filter(t=>t.type==='expense').length} transactions`,'var(--muted)'],
                ['Savings Rate',pct(savingsRate),income?'Of income saved':'Log income first',savingsRate>=15?'var(--green)':'var(--muted)'],
              ].map(([label,value,meta,color])=>(
                <div key={label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'16px 18px'}}>
                  <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--muted)',marginBottom:8}}>{label}</div>
                  <div style={{fontSize:26,fontWeight:900,letterSpacing:'-.03em'}}>{value}</div>
                  <div style={{fontSize:12,color,marginTop:4}}>{meta}</div>
                </div>
              ))}
            </div>

            {/* DASHBOARD */}
            {active==='Dashboard'&&(
              <div className="g2" style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:14}}>
                <div style={{display:'grid',gap:14}}>
                  <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                      <div style={{fontSize:15,fontWeight:800}}>Spending Breakdown</div>
                    </div>
                    <DonutChart data={topSpend}/>
                  </div>
                  <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                      <div style={{fontSize:15,fontWeight:800}}>Budget Categories</div>
                      <button onClick={()=>setActive('Budget')} style={{background:'transparent',color:'var(--blue)',border:'none',cursor:'pointer',fontWeight:700,fontSize:13}}>Edit budgets</button>
                    </div>
                    {byCategory.map((item,i)=>{
                      const used=item.limit?(item.amount/item.limit)*100:0
                      return(
                        <div key={item.label} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                          <div style={{display:'flex',justifyContent:'space-between',gap:12,marginBottom:5}}>
                            <div style={{fontSize:13,fontWeight:600}}>{item.label}</div>
                            <div style={{fontSize:12,color:used>100?'var(--red)':'var(--muted)'}}>{fmt(item.amount)}{item.limit?` / ${fmt(item.limit)}`:''}</div>
                          </div>
                          {item.limit>0&&<div style={{height:7,borderRadius:999,background:'var(--surface-3)',overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(used,100)}%`,background:used>100?'var(--red)':item.color,borderRadius:999}}/></div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={{display:'grid',gap:14}}>
                  <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                    <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>Top Spending</div>
                    {topSpend.length?<BarChart items={topSpend}/>:<div style={{color:'var(--muted)',fontSize:13}}>No expenses logged yet this month.</div>}
                  </div>
                  <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                    <div style={{fontSize:15,fontWeight:800,marginBottom:12}}>Recurring Bills</div>
                    {recurringBills.length?recurringBills.map(b=>(
                      <div key={b.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                        <div><div style={{fontSize:13,fontWeight:700}}>{b.description}</div><div style={{fontSize:11,color:'var(--muted)'}}>{b.date}</div></div>
                        <div style={{fontWeight:700}}>{fmt(b.amount)}</div>
                      </div>
                    )):<div style={{color:'var(--muted)',fontSize:13}}>Add transactions and mark them recurring to see them here.</div>}
                  </div>
                  <div style={{background:'linear-gradient(135deg,rgba(59,130,246,.15),rgba(16,185,129,.1))',border:'1px solid rgba(59,130,246,.2)',borderRadius:16,padding:20}}>
                    <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.12em',color:'#93c5fd',marginBottom:8}}>AI Coach</div>
                    <div style={{color:'#dbeafe',lineHeight:1.7,fontSize:14}}>{coachMsg}</div>
                  </div>
                </div>
              </div>
            )}

            {/* BUDGET */}
            {active==='Budget'&&(
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>Monthly Budget Limits</div>
                {allCats.map((key,idx)=>{
                  const limit=budgets[key]||0
                  const spent=byCategory.find(x=>x.label===key)?.amount||0
                  const used=limit?(spent/limit)*100:0
                  return(
                    <div key={key} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:6}}>
                        <div><div style={{fontSize:14,fontWeight:700}}>{key}</div><div style={{fontSize:12,color:'var(--muted)'}}>{fmt(spent)} spent</div></div>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <span style={{fontWeight:700}}>{limit?fmt(limit):'Not set'}</span>
                          <button onClick={()=>{setBudgetEdit({key,value:limit||''});setModal('budget')}} style={{background:'var(--surface-2)',color:'var(--text)',border:'1px solid var(--border-2)',borderRadius:9,padding:'7px 10px',cursor:'pointer',fontSize:12}}>Edit</button>
                        </div>
                      </div>
                      {limit>0&&<div style={{height:9,background:'var(--surface-3)',borderRadius:999,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(used,100)}%`,background:used>100?'var(--red)':COLORS[idx%COLORS.length],borderRadius:999}}/></div>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* TRANSACTIONS */}
            {active==='Transactions'&&(
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>Transactions — {labelForMonth(month)}</div>
                {curTx.length?curTx.map(item=>(
                  <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700}}>{item.description}</div>
                      <div style={{fontSize:11,color:'var(--muted)'}}>{item.date} • {item.category}{item.recurring?' • recurring':''}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{fontWeight:800,color:item.type==='income'?'var(--green)':'var(--text)'}}>{item.type==='income'?'+':'-'}{fmt(item.amount).replace('$','')}</div>
                      <button onClick={()=>delTx(item.id)} style={{background:'transparent',color:'var(--muted)',border:'none',cursor:'pointer',fontSize:16}} title="Delete">×</button>
                    </div>
                  </div>
                )):<div style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:40}}>No transactions in {labelForMonth(month)} yet. Click "+ Add Transaction" to start.</div>}
              </div>
            )}

            {/* BILLS */}
            {active==='Bills'&&(
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <div style={{fontSize:15,fontWeight:800}}>Recurring Bills</div>
                  <button onClick={()=>setModal('tx')} style={{background:'var(--blue)',color:'#fff',border:'none',borderRadius:10,padding:'9px 12px',cursor:'pointer',fontWeight:700,fontSize:12}}>+ Add Bill</button>
                </div>
                {recurringBills.length?recurringBills.map(bill=>(
                  <div key={bill.id} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                    <div><div style={{fontSize:14,fontWeight:700}}>{bill.description}</div><div style={{fontSize:11,color:'var(--muted)'}}>Due {bill.date} • {bill.category}</div></div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}><strong>{fmt(bill.amount)}</strong><button onClick={()=>delTx(bill.id)} style={{background:'transparent',color:'var(--muted)',border:'none',cursor:'pointer',fontSize:16}}>×</button></div>
                  </div>
                )):<div style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:40}}>No recurring bills yet. Add a transaction and check "Mark as recurring" to have it appear here.</div>}
              </div>
            )}

            {/* GOALS */}
            {active==='Goals'&&(
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <div style={{fontSize:15,fontWeight:800}}>Savings Goals</div>
                  {iBtn('+ Add Goal',()=>setModal('goal'))}
                </div>
                {goals.length?goals.map(goal=>{
                  const progress=goal.target?(goal.current/goal.target)*100:0
                  return(
                    <div key={goal.id} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',gap:12,marginBottom:6}}>
                        <div><div style={{fontSize:14,fontWeight:700}}>{goal.name}</div><div style={{fontSize:12,color:'var(--muted)'}}>{fmt(goal.current)} saved of {fmt(goal.target)}</div></div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:12,color:'var(--muted)'}}>{pct(progress)}</span><button onClick={()=>delGoal(goal.id)} style={{background:'transparent',color:'var(--muted)',border:'none',cursor:'pointer',fontSize:16}}>×</button></div>
                      </div>
                      <div style={{height:9,background:'var(--surface-3)',borderRadius:999,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(progress,100)}%`,background:'var(--green)',borderRadius:999}}/></div>
                    </div>
                  )
                }):<div style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:40}}>No goals yet. Click "+ Add Goal" to create your first savings target.</div>}
              </div>
            )}

            {/* NET WORTH */}
            {active==='Net Worth'&&(
              <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <div style={{fontSize:15,fontWeight:800}}>Assets</div>
                    {iBtn('+ Add Asset',()=>setModal('asset'))}
                  </div>
                  {assets.length?assets.map(item=>(
                    <div key={item.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:13}}>{item.name}</span>
                      <div style={{display:'flex',gap:10,alignItems:'center'}}><strong>{fmt(item.amount)}</strong><button onClick={()=>delAsset(item.id)} style={{background:'transparent',color:'var(--muted)',border:'none',cursor:'pointer',fontSize:16}}>×</button></div>
                    </div>
                  )):<div style={{color:'var(--muted)',fontSize:13}}>No assets added yet.</div>}
                  {assets.length>0&&<div style={{display:'flex',justifyContent:'space-between',paddingTop:12,fontWeight:800,fontSize:14}}><span>Total</span><span>{fmt(totalAssets)}</span></div>}
                </div>
                <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <div style={{fontSize:15,fontWeight:800}}>Debts</div>
                    {iBtn('+ Add Debt',()=>setModal('debt'))}
                  </div>
                  {debts.length?debts.map(item=>(
                    <div key={item.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:13}}>{item.name}</span>
                      <div style={{display:'flex',gap:10,alignItems:'center'}}><strong>{fmt(item.amount)}</strong><button onClick={()=>delDebt(item.id)} style={{background:'transparent',color:'var(--muted)',border:'none',cursor:'pointer',fontSize:16}}>×</button></div>
                    </div>
                  )):<div style={{color:'var(--muted)',fontSize:13}}>No debts added yet.</div>}
                  {debts.length>0&&<div style={{display:'flex',justifyContent:'space-between',paddingTop:12,fontWeight:800,fontSize:14}}><span>Total</span><span>{fmt(totalDebts)}</span></div>}
                </div>
                <div style={{gridColumn:'1/-1',background:netWorth>=0?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)',border:`1px solid ${netWorth>=0?'rgba(16,185,129,.2)':'rgba(239,68,68,.2)'}`,borderRadius:16,padding:22}}>
                  <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--muted)',marginBottom:8}}>Net Worth</div>
                  <div style={{fontSize:34,fontWeight:900}}>{fmt(netWorth)}</div>
                  <div style={{color:'var(--muted)',marginTop:8,fontSize:13}}>Assets {fmt(totalAssets)} − Debts {fmt(totalDebts)}. Update monthly to track your real progress.</div>
                </div>
              </div>
            )}

            {/* AI COACH */}
            {active==='AI Coach'&&(
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
                <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>AI Coach</div>
                <div style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:12,padding:16,lineHeight:1.75,fontSize:14,marginBottom:14}}>{coachMsg}</div>
                <div style={{fontSize:13,color:'var(--muted)'}}>Tips: log every income source, mark regular bills as recurring, set budget limits for each category, and add your assets and debts to Net Worth to see your complete financial picture.</div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {modal==='tx'&&(
        <Modal onClose={()=>setModal(null)} title="Add Transaction">
          <div style={{display:'grid',gap:12}}>
            {inp(txForm.description,v=>setTxForm({...txForm,description:v}),{placeholder:'Description'})}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {inp(txForm.amount,v=>setTxForm({...txForm,amount:v}),{type:'number',placeholder:'Amount'})}
              {inp(txForm.date,v=>setTxForm({...txForm,date:v}),{type:'date'})}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <select value={txForm.category} onChange={e=>setTxForm({...txForm,category:e.target.value})} style={{background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)',borderRadius:10,padding:11}}>
                {allCats.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <select value={txForm.type} onChange={e=>setTxForm({...txForm,type:e.target.value})} style={{background:'var(--surface-2)',border:'1px solid var(--border-2)',color:'var(--text)',borderRadius:10,padding:11}}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:9,fontSize:13,color:'var(--muted)',cursor:'pointer'}}>
              <input type="checkbox" checked={txForm.recurring} onChange={e=>setTxForm({...txForm,recurring:e.target.checked})}/> Mark as recurring (shows in Bills)
            </label>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
            {oBtn('Cancel',()=>setModal(null))}
            {iBtn('Save Transaction',addTx)}
          </div>
        </Modal>
      )}
      {modal==='budget'&&(
        <Modal onClose={()=>setModal(null)} title={`Edit Budget — ${budgetEdit.key}`}>
          {inp(String(budgetEdit.value),v=>setBudgetEdit({...budgetEdit,value:v}),{type:'number',placeholder:'Monthly limit ($)'})}
          <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
            {oBtn('Cancel',()=>setModal(null))}
            {iBtn('Save',saveBudget)}
          </div>
        </Modal>
      )}
      {modal==='goal'&&(
        <Modal onClose={()=>setModal(null)} title="Add Goal">
          <div style={{display:'grid',gap:12}}>
            {inp(goalForm.name,v=>setGoalForm({...goalForm,name:v}),{placeholder:'Goal name (e.g. Property Down Payment)'})}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {inp(goalForm.target,v=>setGoalForm({...goalForm,target:v}),{type:'number',placeholder:'Target ($)'})}
              {inp(goalForm.current,v=>setGoalForm({...goalForm,current:v}),{type:'number',placeholder:'Already saved ($)'})}
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
            {oBtn('Cancel',()=>setModal(null))}
            {iBtn('Save Goal',addGoal)}
          </div>
        </Modal>
      )}
      {modal==='asset'&&(
        <Modal onClose={()=>setModal(null)} title="Add Asset">
          <div style={{display:'grid',gap:12}}>
            {inp(assetForm.name,v=>setAssetForm({...assetForm,name:v}),{placeholder:'Asset name (e.g. Savings, Truck, House)'})}
            {inp(assetForm.amount,v=>setAssetForm({...assetForm,amount:v}),{type:'number',placeholder:'Current value ($)'})}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
            {oBtn('Cancel',()=>setModal(null))}
            {iBtn('Save',addAsset)}
          </div>
        </Modal>
      )}
      {modal==='debt'&&(
        <Modal onClose={()=>setModal(null)} title="Add Debt">
          <div style={{display:'grid',gap:12}}>
            {inp(debtForm.name,v=>setDebtForm({...debtForm,name:v}),{placeholder:'Debt name (e.g. Mortgage, Truck Loan)'})}
            {inp(debtForm.amount,v=>setDebtForm({...debtForm,amount:v}),{type:'number',placeholder:'Balance owed ($)'})}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18}}>
            {oBtn('Cancel',()=>setModal(null))}
            {iBtn('Save',addDebt)}
          </div>
        </Modal>
      )}
    </>
  )
}
