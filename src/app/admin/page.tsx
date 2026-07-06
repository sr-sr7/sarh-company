'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Property } from '@/lib/supabase'
import { LOGO_GIF } from '@/lib/logo'

type Tab = 'properties' | 'reviews' | 'promo' | 'add' | 'users'
type Role = 'admin' | 'user'
type Session = { id: string; username: string; role: Role; permissions: Record<string, boolean> }
type AdminUser = { id: string; username: string; role: Role; permissions: Record<string, boolean>; created_at: string }

const PERMS: [string, string][] = [
  ['view_properties',  '👁 مشاهدة العقارات'],
  ['add_property',     '➕ إضافة عقار'],
  ['edit_property',    '✏️ تعديل عقار'],
  ['delete_property',  '🗑️ حذف عقار'],
  ['view_reviews',     '⭐ مشاهدة التعليقات'],
  ['manage_reviews',   '✅ إدارة التعليقات'],
  ['view_promo',       '🎁 مشاهدة العروض'],
  ['manage_promo',     '🗑️ حذف سجلات العروض'],
  ['maintenance',      '🔧 وضع الصيانة'],
]

// ─── Styles ───────────────────────────────────────────────────
const S = {
  page:  { minHeight:'100vh', background:'#faf8f5', fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl' as const },
  header:{ background:'#d3e2dc', color:'#1e3a34', padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(30,58,52,0.12)', flexWrap:'wrap' as const, gap:12 },
  headerBrand:{ display:'flex', alignItems:'center', gap:12 },
  headerTitle:{ fontWeight:700, fontSize:'1.1rem', color:'#1e3a34' },
  headerSub:{ fontSize:'0.7rem', color:'rgba(30,58,52,0.45)', letterSpacing:3, marginTop:2 },
  logoutBtn:{ background:'rgba(30,58,52,0.08)', color:'#1e3a34', border:'1px solid rgba(30,58,52,0.15)', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:'0.82rem', fontFamily:"'Tajawal','Cairo',sans-serif" },
  statsRow:{ padding:'24px 32px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 },
  statCard:{ background:'#d3e2dc', color:'#1e3a34', borderRadius:16, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, border:'1px solid rgba(30,58,52,0.1)' },
  statIcon:{ fontSize:'2rem' },
  statNum:{ fontWeight:800, fontSize:'2rem', lineHeight:1 },
  statLabel:{ fontSize:'0.75rem', opacity:0.8, marginTop:4 },
  tabsRow:{ padding:'0 32px', display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' as const },
  tabBtn:(a:boolean)=>({ padding:'10px 20px', borderRadius:10, fontSize:'0.85rem', fontWeight:700, cursor:'pointer', border:a?'1px solid rgba(30,58,52,0.2)':'1px solid rgba(30,58,52,0.12)', background:a?'#d3e2dc':'#fff', color:'#1e3a34', fontFamily:"'Tajawal','Cairo',sans-serif" }),
  msg:{ margin:'0 32px 16px', background:'#d3e2dc', color:'#1e3a34', padding:'12px 16px', borderRadius:10, fontSize:'0.85rem', fontWeight:600 },
  errMsg:{ margin:'0 32px 16px', background:'#fee2e2', color:'#cc0000', padding:'12px 16px', borderRadius:10, fontSize:'0.85rem', fontWeight:600 },
  content:{ padding:'0 32px 64px' },
  tableWrap:{ background:'#fff', borderRadius:16, border:'1px solid rgba(39,66,62,0.1)', overflow:'auto' },
  table:{ width:'100%', borderCollapse:'collapse' as const, fontSize:'0.85rem', minWidth:600 },
  th:{ textAlign:'right' as const, padding:'12px 16px', fontSize:'0.72rem', color:'#526266', fontWeight:600, borderBottom:'1px solid rgba(39,66,62,0.1)', background:'rgba(39,66,62,0.03)' },
  td:{ padding:'12px 16px', borderBottom:'1px solid rgba(39,66,62,0.05)', verticalAlign:'middle' as const },
  badge:(bg:string,c:string)=>({ background:bg, color:c, fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:50, display:'inline-block' }),
  editBtn:{ fontSize:'0.75rem', background:'rgba(39,66,62,0.08)', border:'1px solid rgba(39,66,62,0.15)', color:'#27423e', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontWeight:600, fontFamily:"'Tajawal','Cairo',sans-serif" },
  delBtn:{ fontSize:'0.75rem', background:'#fff5f5', border:'1px solid #fecaca', color:'#dc2626', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontWeight:600, fontFamily:"'Tajawal','Cairo',sans-serif" },
  statusSel:{ fontSize:'0.72rem', border:'1px solid rgba(39,66,62,0.15)', borderRadius:8, padding:'4px 8px', background:'#fff', fontFamily:"'Tajawal','Cairo',sans-serif", outline:'none' },
  emptyRow:{ textAlign:'center' as const, padding:'48px 0', color:'#7a9188' },
  card:{ background:'#fff', borderRadius:16, border:'1px solid rgba(39,66,62,0.1)', padding:28, marginBottom:24 },
  cardTitle:{ fontSize:'1rem', fontWeight:800, color:'#1e3a34', marginBottom:20 },
  form:{ background:'#fff', borderRadius:16, border:'1px solid rgba(39,66,62,0.1)', padding:32, maxWidth:900 },
  formTitle:{ fontSize:'1.4rem', fontWeight:800, color:'#1e3a34', marginBottom:32 },
  formGrid:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 },
  fullCol:{ gridColumn:'1 / -1' as const },
  label:{ display:'block', fontSize:'0.72rem', color:'#526266', fontWeight:700, marginBottom:6 },
  input:{ width:'100%', background:'#faf8f5', border:'1px solid rgba(39,66,62,0.15)', borderRadius:10, padding:'10px 14px', fontSize:'0.9rem', outline:'none', fontFamily:"'Tajawal','Cairo',sans-serif", boxSizing:'border-box' as const },
  textarea:{ width:'100%', background:'#faf8f5', border:'1px solid rgba(39,66,62,0.15)', borderRadius:10, padding:'10px 14px', fontSize:'0.9rem', outline:'none', fontFamily:"'Tajawal','Cairo',sans-serif", resize:'vertical' as const, boxSizing:'border-box' as const },
  select:{ width:'100%', background:'#faf8f5', border:'1px solid rgba(39,66,62,0.15)', borderRadius:10, padding:'10px 14px', fontSize:'0.9rem', outline:'none', fontFamily:"'Tajawal','Cairo',sans-serif", boxSizing:'border-box' as const },
  checkRow:{ display:'flex', flexWrap:'wrap' as const, gap:16, marginTop:4 },
  checkLabel:{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:'0.9rem', color:'#526266' },
  uploadZone:{ border:'2px dashed rgba(39,66,62,0.25)', borderRadius:14, padding:24, textAlign:'center' as const, cursor:'pointer', background:'#faf8f5' },
  uploadIcon:{ fontSize:'2.5rem', display:'block', marginBottom:8 },
  uploadText:{ color:'#526266', fontSize:'0.85rem', lineHeight:1.6 },
  uploadHint:{ color:'#9aada7', fontSize:'0.75rem', marginTop:6 },
  uploadBtn:{ display:'inline-block', marginTop:12, background:'#d3e2dc', color:'#1e3a34', border:'1px solid rgba(30,58,52,0.2)', borderRadius:8, padding:'10px 20px', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" },
  thumbsRow:{ display:'flex', gap:10, flexWrap:'wrap' as const, marginTop:14 },
  thumb:{ position:'relative' as const, width:90, height:90, borderRadius:10, overflow:'hidden', border:'2px solid rgba(39,66,62,0.15)' },
  thumbImg:{ width:'100%', height:'100%', objectFit:'cover' as const },
  thumbDel:{ position:'absolute' as const, top:4, right:4, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', borderRadius:50, width:22, height:22, fontSize:'0.7rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  thumbMain:{ position:'absolute' as const, bottom:4, left:4, background:'#b8986a', color:'#fff', fontSize:'0.6rem', fontWeight:700, padding:'2px 6px', borderRadius:4 },
  progressBar:{ height:6, background:'rgba(39,66,62,0.1)', borderRadius:50, overflow:'hidden', marginTop:10 },
  progressFill:(p:number)=>({ height:'100%', width:`${p}%`, background:'#41646d', borderRadius:50, transition:'width 0.3s' }),
  uploadingText:{ fontSize:'0.8rem', color:'#41646d', marginTop:6 },
  formBtns:{ display:'flex', gap:12, marginTop:32 },
  submitBtn:{ background:'#d3e2dc', color:'#1e3a34', padding:'12px 32px', borderRadius:10, fontWeight:700, fontSize:'0.95rem', border:'1px solid rgba(30,58,52,0.2)', cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" },
  cancelBtn:{ background:'#fff', color:'#526266', padding:'12px 32px', borderRadius:10, fontWeight:700, fontSize:'0.95rem', border:'1px solid rgba(30,58,52,0.15)', cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" },
}

const emptyForm = {
  title:'', description:'', type:'فيلا', operation:'للبيع',
  city:'بريدة', district:'', price:'', price_unit:'ريال', bid_price:'',
  area:'', north_len:'', south_len:'', east_len:'', west_len:'', built_area:'',
  facade:'', street_width:'', property_age:'', deed_type:'', bank_finance:false,
  bedrooms:'0', bathrooms:'0', maid_rooms:'0', kitchens:'1',
  has_pool:false, has_parking:false, has_garden:false, has_annex:false,
  is_featured:false, is_new:true, whatsapp:'966552226345',
  status:'active', main_image:'', images:[] as string[], video_url:'', map_url:'',
}

async function apiUpload(file: File, onProgress: (p: number) => void): Promise<string> {
  const fd = new FormData(); fd.append('file', file)
  let pct = 0
  const timer = setInterval(() => { pct = Math.min(pct + 10, 88); onProgress(pct) }, 250)
  try {
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    clearInterval(timer)
    if (!res.ok) throw new Error((await res.json()).error || 'فشل الرفع')
    onProgress(100)
    return (await res.json()).url
  } catch (err) { clearInterval(timer); throw err }
}

export default function AdminPage() {
  const router = useRouter()
  const [session, setSession]         = useState<Session | null>(null)
  const [tab, setTab]                 = useState<Tab>('properties')
  const [properties, setProperties]   = useState<Property[]>([])
  const [reviews, setReviews]         = useState<any[]>([])
  const [promoLeads, setPromoLeads]   = useState<any[]>([])
  const [adminUsers, setAdminUsers]   = useState<AdminUser[]>([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [msg, setMsg]                 = useState('')
  const [msgType, setMsgType]         = useState<'ok'|'err'>('ok')
  const [editId, setEditId]           = useState<string | null>(null)
  const [maintenance, setMaintenance] = useState(false)
  const [togglingMaint, setTogglingMaint] = useState(false)
  const [form, setForm]               = useState(emptyForm)

  // Upload state
  const [uploadingImg, setUploadingImg] = useState(false)
  const [uploadingVid, setUploadingVid] = useState(false)
  const [imgProgress, setImgProgress]   = useState(0)
  const [vidProgress, setVidProgress]   = useState(0)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const vidInputRef = useRef<HTMLInputElement>(null)

  // Users form state
  const [newUser, setNewUser]       = useState({ username:'', password:'', role:'user' as Role, permissions:{} as Record<string,boolean> })
  const [addingUser, setAddingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      if (d.id) setSession(d)
      else router.replace('/admin/login')
    }).catch(() => router.replace('/admin/login'))
  }, [])

  useEffect(() => { if (session) loadAll() }, [session])

  function can(perm: string) {
    if (!session) return false
    if (session.role === 'admin') return true
    return session.permissions?.all === true || session.permissions?.[perm] === true
  }

  async function loadAll() {
    setLoading(true)
    try {
      const reqs: Promise<Response>[] = [
        fetch('/api/admin/properties'),
        fetch('/api/admin/inquiries'),
        fetch('/api/admin/promo'),
        fetch('/api/admin/maintenance'),
      ]
      if (session?.role === 'admin') reqs.push(fetch('/api/admin/users'))
      const results = await Promise.all(reqs)
      const [p, i, pro, m, u] = await Promise.all(results.map(r => r.json()))
      setProperties(Array.isArray(p.data) ? p.data : [])
      setReviews(Array.isArray(i.data) ? i.data.filter((r:any) => r.type === 'review') : [])
      setPromoLeads(Array.isArray(pro.data) ? pro.data : [])
      setMaintenance(!!m.active)
      if (u) setAdminUsers(Array.isArray(u.data) ? u.data : [])
    } catch {}
    setLoading(false)
  }

  function showMsg(text: string, type: 'ok'|'err' = 'ok') {
    setMsg(text); setMsgType(type)
    setTimeout(() => setMsg(''), 5000)
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
  }

  async function toggleMaintenance() {
    if (!can('maintenance')) return
    setTogglingMaint(true)
    const res = await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable: !maintenance }),
    })
    if (res.ok) {
      setMaintenance(!maintenance)
      if (!maintenance) document.cookie = 'sarh_admin_bypass=1; path=/; max-age=86400'
    }
    setTogglingMaint(false)
  }

  // ── Property CRUD ──
  async function saveProperty(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      let listingNumber: number | undefined
      if (!editId) {
        const lr = await fetch('/api/admin/listing-number', { method: 'POST' })
        if (lr.ok) listingNumber = (await lr.json()).number
      }
      const payload: any = {
        title: form.title, description: form.description || null,
        type: form.type, operation: form.operation, city: form.city,
        district: form.district || null, price: Number(form.price), price_unit: form.price_unit,
        bid_price:  form.bid_price  ? Number(form.bid_price)  : null,
        north_len:    form.north_len    ? Number(form.north_len)    : null,
        south_len:    form.south_len    ? Number(form.south_len)    : null,
        east_len:     form.east_len     ? Number(form.east_len)     : null,
        west_len:     form.west_len     ? Number(form.west_len)     : null,
        built_area:   form.built_area   ? Number(form.built_area)   : null,
        facade:       form.facade       || null,
        street_width: form.street_width ? Number(form.street_width) : null,
        property_age: form.property_age || null,
        deed_type:    form.deed_type    || null,
        bank_finance: form.bank_finance,
        area: form.area ? Number(form.area) : null, bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms), maid_rooms: Number(form.maid_rooms), kitchens: Number(form.kitchens),
        has_pool: form.has_pool, has_parking: form.has_parking, has_garden: form.has_garden,
        has_annex: form.has_annex, is_featured: form.is_featured, is_new: form.is_new,
        whatsapp: form.whatsapp, status: form.status,
        main_image: form.images[0] || form.main_image || null, images: form.images,
        video_url: form.video_url || null, map_url: form.map_url || null,
      }
      if (listingNumber !== undefined) payload.listing_number = listingNumber
      const url = editId ? `/api/admin/properties/${editId}` : '/api/admin/properties'
      const res = await fetch(url, { method: editId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) { showMsg('❌ خطأ: ' + (data.error || res.status), 'err'); setSaving(false); return }
      showMsg(editId ? '✅ تم التعديل بنجاح' : '✅ تمت الإضافة بنجاح')
      setForm(emptyForm); setEditId(null); setTab('properties'); loadAll()
    } catch (err: any) { showMsg('❌ ' + err.message, 'err') }
    setSaving(false)
  }

  async function deleteProperty(id: string) {
    if (!confirm('هل تريد حذف هذا العقار؟')) return
    const res = await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' })
    res.ok ? loadAll() : showMsg('❌ فشل الحذف', 'err')
  }

  function editProperty(p: Property) {
    setForm({
      title:p.title, description:p.description||'', type:p.type, operation:p.operation,
      city:p.city, district:p.district||'', price:String(p.price), price_unit:p.price_unit, bid_price:p.bid_price?String(p.bid_price):'',
      north_len:p.north_len?String(p.north_len):'', south_len:p.south_len?String(p.south_len):'',
      east_len:p.east_len?String(p.east_len):'', west_len:p.west_len?String(p.west_len):'',
      built_area:p.built_area?String(p.built_area):'',
      facade:p.facade||'', street_width:p.street_width?String(p.street_width):'',
      property_age:p.property_age||'', deed_type:p.deed_type||'', bank_finance:p.bank_finance??false,
      area:p.area?String(p.area):'', bedrooms:String(p.bedrooms), bathrooms:String(p.bathrooms),
      maid_rooms:String(p.maid_rooms??0), kitchens:String(p.kitchens??1),
      has_pool:p.has_pool, has_parking:p.has_parking, has_garden:p.has_garden, has_annex:p.has_annex??false,
      is_featured:p.is_featured, is_new:p.is_new, whatsapp:p.whatsapp,
      main_image:p.main_image||'', status:p.status||'active',
      images:p.images||[], video_url:p.video_url||'', map_url:p.map_url||'',
    })
    setEditId(p.id); setTab('add')
  }

  async function changeStatus(id: string, status: string) {
    await fetch(`/api/admin/properties/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status}) })
    loadAll()
  }

  // ── Review actions ──
  async function reviewAction(id: string, action: 'approved'|'rejected'|'delete') {
    if (action === 'delete') {
      if (!confirm('حذف هذا التعليق؟')) return
      await fetch(`/api/admin/inquiries/${id}`, { method:'DELETE' })
    } else {
      await fetch(`/api/admin/inquiries/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:action}) })
    }
    loadAll()
  }

  // ── Promo ──
  async function deletePromo(id: string, name: string) {
    if (!confirm(`حذف ${name}؟`)) return
    await fetch(`/api/admin/promo/${id}`, { method:'DELETE' })
    loadAll()
  }

  // ── Upload ──
  async function handleImagesSelected(files: FileList | null) {
    if (!files?.length) return
    setUploadingImg(true); setImgProgress(0)
    const urls = [...form.images]
    for (let i = 0; i < files.length; i++) {
      try { urls.push(await apiUpload(files[i], p => setImgProgress(Math.round((i/files.length)*100 + p/files.length)))) }
      catch (err: any) { showMsg('❌ فشل رفع الصورة: ' + err.message, 'err') }
    }
    setForm(f => ({...f, images:urls})); setUploadingImg(false); setImgProgress(100)
  }

  async function handleVideoSelected(files: FileList | null) {
    if (!files?.length) return
    setUploadingVid(true); setVidProgress(0)
    try { setForm(f => ({...f, video_url: ''})); const url = await apiUpload(files[0], setVidProgress); setForm(f => ({...f, video_url:url})) }
    catch (err: any) { showMsg('❌ فشل رفع الفيديو: ' + err.message, 'err') }
    setUploadingVid(false); setVidProgress(100)
  }

  function removeImage(idx: number) { setForm(f => ({...f, images:f.images.filter((_,i)=>i!==idx)})) }
  const ff = (k: string, v: any) => setForm(p => ({...p, [k]:v}))

  // ── User management ──
  async function addUser(e: React.FormEvent) {
    e.preventDefault()
    if (!newUser.username.trim() || !newUser.password.trim()) { showMsg('أدخل اسم المستخدم وكلمة المرور', 'err'); return }
    setAddingUser(true)
    try {
      const res = await fetch('/api/admin/users', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (!res.ok) { showMsg('❌ ' + (data.error || 'فشل الإضافة'), 'err'); setAddingUser(false); return }
      showMsg('✅ تم إضافة المستخدم بنجاح')
      setNewUser({ username:'', password:'', role:'user', permissions:{} })
      loadAll()
    } catch { showMsg('❌ حدث خطأ', 'err') }
    setAddingUser(false)
  }

  async function saveUserEdit() {
    if (!editingUser) return
    const res = await fetch(`/api/admin/users/${editingUser.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ role: editingUser.role, permissions: editingUser.permissions }),
    })
    if (res.ok) { showMsg('✅ تم تحديث الصلاحيات'); setEditingUser(null); loadAll() }
    else showMsg('❌ فشل التحديث', 'err')
  }

  async function deleteUser(id: string, username: string) {
    if (!confirm(`حذف المستخدم "${username}"؟`)) return
    const res = await fetch(`/api/admin/users/${id}`, { method:'DELETE' })
    res.ok ? (showMsg('✅ تم الحذف'), loadAll()) : showMsg('❌ فشل الحذف', 'err')
  }

  // ── Visible tabs ──
  const tabs: [Tab, string, boolean][] = [
    ['properties', '🏠 العقارات',                                       true],
    ['reviews',    `⭐ التعليقات (${reviews.filter(r=>r.status==='pending').length} معلق)`, can('view_reviews')],
    ['promo',      `🎁 العروض (${promoLeads.length})`,                    can('view_promo')],
    ['add',        editId ? '✏️ تعديل عقار' : '➕ إضافة عقار',            can('add_property')||(!!editId&&can('edit_property'))],
    ['users',      `👥 المستخدمون (${adminUsers.length})`,                session?.role==='admin'],
  ]

  if (!session) return (
    <div style={{ minHeight:'100vh', background:'#1e3a34', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#d3e2dc', fontFamily:'Tajawal' }}>جاري التحقق...</div>
    </div>
  )

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <div style={S.headerBrand}>
          <img src={LOGO_GIF} alt="صرح" width={44} height={44} style={{ borderRadius:10, filter:'brightness(0.15) saturate(1.5)' }} />
          <div>
            <div style={S.headerTitle}>صرح العقارية</div>
            <div style={S.headerSub}>لوحة التحكم</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' as const }}>
          <span style={{ color:'rgba(30,58,52,0.7)', fontSize:'0.82rem' }}>
            👤 {session.username}
            {session.role === 'admin' && <span style={{ background:'#b8986a', color:'#fff', fontSize:'0.65rem', fontWeight:800, padding:'2px 8px', borderRadius:20, marginRight:6 }}>مالك</span>}
          </span>
          {can('maintenance') && (
            <button onClick={toggleMaintenance} disabled={togglingMaint}
              style={{ display:'flex', alignItems:'center', gap:8, background:maintenance?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.12)', border:maintenance?'1px solid rgba(239,68,68,0.4)':'1px solid rgba(34,197,94,0.35)', color:maintenance?'#fca5a5':'#86efac', borderRadius:10, padding:'7px 16px', cursor:togglingMaint?'wait':'pointer', fontFamily:"'Tajawal','Cairo',sans-serif", fontSize:'0.82rem', fontWeight:700 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:maintenance?'#ef4444':'#22c55e', display:'inline-block', boxShadow:maintenance?'0 0 6px #ef4444':'0 0 6px #22c55e' }} />
              {togglingMaint ? '⏳ جاري...' : maintenance ? '🔴 الصيانة مفعّلة' : '🟢 الموقع يعمل'}
            </button>
          )}
          <a href="/" style={{ color:'#2d5750', textDecoration:'none', fontSize:'0.85rem' }}>← الموقع الرئيسي</a>
          <button onClick={logout} style={S.logoutBtn}>🚪 خروج</button>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {[
          { label:'إجمالي العقارات', value:properties.length,                                icon:'🏠' },
          { label:'عقارات نشطة',     value:properties.filter(p=>p.status==='active').length, icon:'✅' },
          can('view_reviews') && { label:'تعليقات معلقة', value:reviews.filter(r=>r.status==='pending').length, icon:'⭐' },
          can('view_promo')   && { label:'مسجلو العروض',  value:promoLeads.length,                             icon:'🎁' },
        ].filter(Boolean).map((s:any) => (
          <div key={s.label} style={S.statCard}>
            <span style={S.statIcon}>{s.icon}</span>
            <div><div style={S.statNum}>{s.value}</div><div style={S.statLabel}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={S.tabsRow}>
        {tabs.filter(([,,show])=>show).map(([t,l])=>(
          <button key={t} style={S.tabBtn(tab===t)}
            onClick={()=>{ setTab(t); if(t!=='add'){ setEditId(null); setForm(emptyForm) } }}>
            {l}
          </button>
        ))}
      </div>

      {msg && <div style={msgType==='ok'?S.msg:S.errMsg}>{msg}</div>}

      <div style={S.content}>

        {/* ── PROPERTIES ── */}
        {tab==='properties' && (
          <>
          <div style={{ marginBottom:16, position:'relative' }}>
            <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:'1rem', opacity:0.4 }}>🔍</span>
            <input
              type="text"
              placeholder="ابحث بالعنوان أو الحي أو رقم العرض..."
              onChange={e => {
                const v = e.target.value.toLowerCase()
                ;(window as any)._propSearch = v
                document.querySelectorAll('tr[data-pid]').forEach((tr: any) => {
                  tr.style.display = tr.dataset.search?.includes(v) ? '' : 'none'
                })
              }}
              style={{ width:'100%', padding:'11px 40px 11px 14px', borderRadius:12, border:'1.5px solid rgba(39,66,62,0.18)', fontSize:'0.9rem', fontFamily:"'Tajawal','Cairo',sans-serif", outline:'none', background:'#faf8f5', boxSizing:'border-box' as const, direction:'rtl' }}
            />
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>{['#','الصورة','العنوان','النوع','العملية','المدينة','السعر','الحالة','إجراءات'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={9} style={S.emptyRow}>جاري التحميل...</td></tr>
                : properties.length===0 ? <tr><td colSpan={9} style={S.emptyRow}>لا توجد عقارات</td></tr>
                : properties.map(p=>(
                  <tr key={p.id} data-pid={p.id} data-search={[p.title,p.district,p.city,p.type,String(p.listing_number||'')].join(' ').toLowerCase()}>
                    <td style={{...S.td,width:64}}>
                      {p.listing_number ? <span style={{background:'#d3e2dc',color:'#1e3a34',fontSize:'0.72rem',fontWeight:800,padding:'3px 8px',borderRadius:6,fontFamily:'monospace'}}>#{p.listing_number}</span> : <span style={{color:'#ccc',fontSize:'0.72rem'}}>—</span>}
                    </td>
                    <td style={S.td}>
                      {p.main_image ? <img src={p.main_image} alt="" style={{width:56,height:44,objectFit:'cover',borderRadius:8}} />
                        : <div style={{width:56,height:44,background:'#d3e2dc',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>🏠</div>}
                    </td>
                    <td style={{...S.td,fontWeight:600,color:'#1e3a34',maxWidth:200}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</div></td>
                    <td style={{...S.td,color:'#526266'}}>{p.type}</td>
                    <td style={S.td}><span style={S.badge(p.operation==='للبيع'?'#27423e':'#2d7d5a','#fff')}>{p.operation}</span></td>
                    <td style={{...S.td,color:'#526266'}}>{p.city}</td>
                    <td style={{...S.td,fontWeight:700,color:'#27423e'}}>{new Intl.NumberFormat('ar-SA').format(p.price)}</td>
                    <td style={S.td}>
                      <select value={p.status} style={S.statusSel} onChange={e=>changeStatus(p.id,e.target.value)}>
                        <option value="active">نشط</option><option value="sold">مباع</option>
                        <option value="rented">مؤجر</option><option value="hidden">مخفي</option>
                      </select>
                    </td>
                    <td style={S.td}>
                      <div style={{display:'flex',gap:8}}>
                        {can('edit_property')   && <button style={S.editBtn} onClick={()=>editProperty(p)}>تعديل</button>}
                        {can('delete_property') && <button style={S.delBtn}  onClick={()=>deleteProperty(p.id)}>حذف</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* ── REVIEWS ── */}
        {tab==='reviews' && can('view_reviews') && (
          <div>
            <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
              {[{key:'pending',label:'⏳ معلقة',c:'#f59e0b'},{key:'approved',label:'✅ موافق',c:'#22c55e'},{key:'rejected',label:'❌ مرفوضة',c:'#ef4444'},{key:'',label:'📋 الكل',c:'#41646d'}].map(f=>(
                <span key={f.key} style={{background:'#fff',border:`1px solid ${f.c}40`,color:f.c,borderRadius:50,padding:'6px 16px',fontSize:'0.8rem',fontWeight:700}}>
                  {f.label} ({f.key?reviews.filter(r=>r.status===f.key).length:reviews.length})
                </span>
              ))}
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead><tr>{['العميل','التقييم','التعليق','التاريخ','الحالة','إجراء'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {reviews.length===0 ? <tr><td colSpan={6} style={S.emptyRow}>لا توجد تعليقات بعد</td></tr>
                  : reviews.map(r=>{
                    const stars='★'.repeat(Math.min(parseInt(r.client_phone)||5,5))+'☆'.repeat(Math.max(0,5-(parseInt(r.client_phone)||5)))
                    const badge=r.status==='approved'?{bg:'#dcfce7',c:'#166534',l:'موافق'}:r.status==='rejected'?{bg:'#fee2e2',c:'#991b1b',l:'مرفوض'}:{bg:'#fef9c3',c:'#854d0e',l:'معلق'}
                    return (
                      <tr key={r.id} style={{background:r.status==='pending'?'rgba(245,158,11,0.04)':undefined}}>
                        <td style={{...S.td,fontWeight:700}}>{r.client_name}</td>
                        <td style={{...S.td,color:'#f59e0b',letterSpacing:1}}>{stars}</td>
                        <td style={{...S.td,color:'#526266',maxWidth:260}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.message||'—'}</div></td>
                        <td style={{...S.td,color:'#9aada7',fontSize:'0.78rem'}}>{new Date(r.created_at).toLocaleDateString('ar-SA')}</td>
                        <td style={S.td}><span style={S.badge(badge.bg,badge.c)}>{badge.l}</span></td>
                        <td style={S.td}>
                          {can('manage_reviews') && (
                            <div style={{display:'flex',gap:6}}>
                              {r.status!=='approved' && <button style={{...S.editBtn,background:'#dcfce7',border:'1px solid #86efac',color:'#166534'}} onClick={()=>reviewAction(r.id,'approved')}>✅ موافقة</button>}
                              {r.status!=='rejected' && <button style={S.delBtn} onClick={()=>reviewAction(r.id,'rejected')}>❌ رفض</button>}
                              <button style={S.delBtn} onClick={()=>reviewAction(r.id,'delete')}>🗑️</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PROMO ── */}
        {tab==='promo' && can('view_promo') && (
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div style={{fontSize:'0.85rem',color:'#526266'}}>إجمالي المسجلين: <strong style={{color:'#27423e'}}>{promoLeads.length}</strong></div>
              <a href={`data:text/csv;charset=utf-8,﻿الاسم,رقم الهاتف,تاريخ التسجيل\n${promoLeads.map(l=>`${l.name},${l.phone},${new Date(l.created_at).toLocaleDateString('ar-SA')}`).join('\n')}`} download="promo_leads.csv"
                style={{background:'#d3e2dc',color:'#1e3a34',padding:'8px 18px',borderRadius:10,fontSize:'0.8rem',fontWeight:700,textDecoration:'none'}}>⬇️ تصدير CSV</a>
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead><tr>{['#','الاسم','رقم الهاتف','التاريخ','إجراء'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {promoLeads.length===0 ? <tr><td colSpan={5} style={S.emptyRow}>لا يوجد مسجلون بعد</td></tr>
                  : promoLeads.map((l,idx)=>(
                    <tr key={l.id}>
                      <td style={{...S.td,color:'#9aada7',fontSize:'0.78rem',width:40}}>{idx+1}</td>
                      <td style={{...S.td,fontWeight:700,color:'#1e3a34'}}>{l.name}</td>
                      <td style={S.td}>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <a href={`tel:${l.phone}`} style={{color:'#41646d',fontWeight:600}}>{l.phone}</a>
                          <a href={`https://wa.me/966${l.phone.replace(/^0/,'')}`} target="_blank" rel="noopener noreferrer"
                            style={{background:'#25D366',color:'#fff',fontSize:'0.72rem',fontWeight:700,padding:'3px 10px',borderRadius:50,textDecoration:'none'}}>واتساب</a>
                        </div>
                      </td>
                      <td style={{...S.td,color:'#9aada7',fontSize:'0.8rem'}}>{new Date(l.created_at).toLocaleDateString('ar-SA',{year:'numeric',month:'long',day:'numeric'})}</td>
                      <td style={S.td}>{can('manage_promo') && <button style={S.delBtn} onClick={()=>deletePromo(l.id,l.name)}>حذف</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ADD / EDIT FORM ── */}
        {tab==='add' && (can('add_property')||(!!editId&&can('edit_property'))) && (
          <form onSubmit={saveProperty} style={S.form}>
            <div style={S.formTitle}>{editId?'✏️ تعديل العقار':'➕ إضافة عقار جديد'}</div>
            <div style={S.formGrid}>
              <div style={S.fullCol}><label style={S.label}>عنوان العقار *</label><input required value={form.title} onChange={e=>ff('title',e.target.value)} style={S.input} placeholder="مثال: فيلا فاخرة بحي النزهة" /></div>
              <div style={S.fullCol}><label style={S.label}>الوصف</label><textarea value={form.description} onChange={e=>ff('description',e.target.value)} rows={3} style={S.textarea} placeholder="وصف مفصّل..." /></div>
              <div><label style={S.label}>نوع العقار *</label><select required value={form.type} onChange={e=>ff('type',e.target.value)} style={S.select}>{['فيلا','أرض','شقة','استراحة','دبلكس','محل تجاري','مستودع','مزرعة','قصر','وحدة علوية','وحدة أرضية','دور أرضي','دور علوي'].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={S.label}>نوع العملية *</label><select required value={form.operation} onChange={e=>ff('operation',e.target.value)} style={S.select}>{['للبيع','للإيجار','إيجار يومي','استثماري','على السوم'].map(o=><option key={o}>{o}</option>)}</select></div>
              <div><label style={S.label}>المدينة *</label><select required value={form.city} onChange={e=>ff('city',e.target.value)} style={S.select}>{['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','الظهران','القطيف','الأحساء','الطائف','تبوك','أبها','خميس مشيط','بريدة','عنيزة','الرس','البكيرية','المذنب','حائل','ينبع','نجران','جازان','الباحة','عرعر','سكاكا','الخرج','الدوادمي'].map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={S.label}>الحي / المنطقة</label><input value={form.district} onChange={e=>ff('district',e.target.value)} style={S.input} placeholder="حي النزهة" /></div>
              {form.operation === 'على السوم' ? (
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={S.label}>وصل السوم الآن (ريال)</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={e => ff('price', e.target.value)}
                        style={S.input}
                        placeholder="اختياري — آخر سوم وصل إليه"
                      />
                    </div>
                    <div>
                      <label style={S.label}>سعر الحد (ريال)</label>
                      <input
                        type="number"
                        value={form.bid_price}
                        onChange={e => ff('bid_price', e.target.value)}
                        style={S.input}
                        placeholder="اختياري — السعر المطلوب للبيع"
                      />
                    </div>
                  </div>
                  <p style={{ fontSize:'0.75rem', color:'#b8986a', margin:'8px 0 0' }}>
                    العقار على السوم — أدخل آخر سوم وصل إليه وسعر الحد إن وُجد
                  </p>
                </div>
              ) : (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={S.label}>السعر *</label>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => ff('price', e.target.value)}
                      style={{ ...S.input, flex:1 }}
                      placeholder={form.price_unit === 'آخر سوم' ? 'آخر سومة (اختياري)' : 'مثال: 850000'}
                      required={form.price_unit !== 'آخر سوم'}
                    />
                    <select value={form.price_unit} onChange={e => { ff('price_unit', e.target.value); if(e.target.value === 'آخر سوم') ff('price','') }} style={{ ...S.select, width:140, flexShrink:0 }}>
                      {['ريال','ريال / سنة','ريال / شهر','ريال / يوم','آخر سوم'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  {form.price_unit === 'آخر سوم' && (
                    <p style={{ fontSize:'0.75rem', color:'#b8986a', marginTop:6, margin:'6px 0 0' }}>
                      اخترت "آخر سوم" — حقل السعر اختياري، اتركه فارغاً أو أدخل آخر سومة
                    </p>
                  )}
                </div>
              )}
              <div><label style={S.label}>المساحة (م²)</label><input type="number" value={form.area} onChange={e=>ff('area',e.target.value)} style={S.input} placeholder="400" /></div>
              <div><label style={S.label}>مسطح البناء (م²)</label><input type="number" value={form.built_area} onChange={e=>ff('built_area',e.target.value)} style={S.input} placeholder="اختياري — للعقارات المبنية" /></div>
              <div style={S.fullCol}>
                <label style={S.label}>أطوال الأضلاع (م) — اختياري</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10 }}>
                  <div><label style={{ fontSize:'0.75rem', color:'#7a9e96', marginBottom:4, display:'block' }}>شمال</label><input type="number" value={form.north_len} onChange={e=>ff('north_len',e.target.value)} style={S.input} placeholder="م" /></div>
                  <div><label style={{ fontSize:'0.75rem', color:'#7a9e96', marginBottom:4, display:'block' }}>جنوب</label><input type="number" value={form.south_len} onChange={e=>ff('south_len',e.target.value)} style={S.input} placeholder="م" /></div>
                  <div><label style={{ fontSize:'0.75rem', color:'#7a9e96', marginBottom:4, display:'block' }}>شرق</label><input type="number" value={form.east_len} onChange={e=>ff('east_len',e.target.value)} style={S.input} placeholder="م" /></div>
                  <div><label style={{ fontSize:'0.75rem', color:'#7a9e96', marginBottom:4, display:'block' }}>غرب</label><input type="number" value={form.west_len} onChange={e=>ff('west_len',e.target.value)} style={S.input} placeholder="م" /></div>
                </div>
              </div>
              <div>
                <label style={S.label}>الواجهة</label>
                <select value={form.facade} onChange={e=>ff('facade',e.target.value)} style={S.select}>
                  {['','شمالية','��نوبية','شرقية','غربية','شمالية شرقية','شمالية غربية','جنوبية شرقية','جنوبية غربية'].map(f=><option key={f} value={f}>{f||'-- اختر --'}</option>)}
                </select>
              </div>
              <div><label style={S.label}>عرض الشارع (م)</label><input type="number" value={form.street_width} onChange={e=>ff('street_width',e.target.value)} style={S.input} placeholder="20" /></div>
              <div><label style={S.label}>عمر العقار (سنة)</label><input type="number" min="0" value={form.property_age} onChange={e=>ff('property_age',e.target.value)} style={S.input} placeholder="0 = جديد" /></div>
              <div>
                <label style={S.label}>نوع الصك</label>
                <select value={form.deed_type} onChange={e=>ff('deed_type',e.target.value)} style={S.select}>
                  {['','صك إلكتروني','صك ورقي','صك مشاع','وثيقة'].map(d=><option key={d} value={d}>{d||'-- اختر --'}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:24 }}>
                <input type="checkbox" id="bank_finance" checked={form.bank_finance} onChange={e=>ff('bank_finance',e.target.checked)} style={{ width:18, height:18, cursor:'pointer' }} />
                <label htmlFor="bank_finance" style={{ ...S.label, marginBottom:0, cursor:'pointer' }}>يقبل التمويل البنكي</label>
              </div>
              <div><label style={S.label}>عدد الغرف</label><input type="number" min="0" value={form.bedrooms} onChange={e=>ff('bedrooms',e.target.value)} style={S.input} /></div>
              <div><label style={S.label}>عدد الحمامات</label><input type="number" min="0" value={form.bathrooms} onChange={e=>ff('bathrooms',e.target.value)} style={S.input} /></div>
              <div><label style={S.label}>غرف الخادمة</label><input type="number" min="0" value={form.maid_rooms} onChange={e=>ff('maid_rooms',e.target.value)} style={S.input} /></div>
              <div><label style={S.label}>عدد المطابخ</label><input type="number" min="0" value={form.kitchens} onChange={e=>ff('kitchens',e.target.value)} style={S.input} /></div>
              <div><label style={S.label}>رقم الواتساب</label><input value={form.whatsapp} onChange={e=>ff('whatsapp',e.target.value)} style={S.input} placeholder="966552226345" /></div>
              {/* Map */}
              <div style={S.fullCol}>
                <label style={S.label}>📍 موقع العقار على قوقل ماب</label>
                <div style={{background:'#f0f7f4',border:'1px solid rgba(39,66,62,0.15)',borderRadius:12,padding:'14px 18px',marginBottom:12}}>
                  <div style={{fontSize:'0.8rem',color:'#41646d',fontWeight:700,marginBottom:8}}>📋 كيفية تحديد الموقع:</div>
                  <ol style={{margin:0,paddingRight:20,fontSize:'0.8rem',color:'#526266',lineHeight:2.2}}>
                    <li>اضغط <strong>"فتح قوقل ماب"</strong> أدناه</li><li>ابحث عن الموقع واضغط عليه</li>
                    <li>اضغط <strong>"مشاركة"</strong> وانسخ الرابط</li><li>الصقه أدناه</li>
                  </ol>
                </div>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <input value={form.map_url} onChange={e=>ff('map_url',e.target.value)} style={{...S.input,flex:1}} placeholder="https://maps.google.com/..." />
                  <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"
                    style={{background:'#4285f4',color:'#fff',borderRadius:10,padding:'10px 16px',fontSize:'0.82rem',fontWeight:700,textDecoration:'none',whiteSpace:'nowrap',flexShrink:0}}>🗺️ فتح قوقل ماب</a>
                </div>
                {form.map_url && (()=>{
                  const cm=form.map_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/), qm=form.map_url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/), llm=form.map_url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/), d3m=form.map_url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/), pbm=form.map_url.match(/pb=.*!3d(-?\d+\.\d+).*!4d(-?\d+\.\d+)/)
                  const raw=cm||qm||llm||d3m||pbm, coords=raw?[parseFloat(raw[1]),parseFloat(raw[2])]:null
                  if(!coords) return <div style={{marginTop:10,background:'#fff8e1',border:'1px solid #f0d060',borderRadius:10,padding:'12px 16px',fontSize:'0.8rem',color:'#7a6000'}}>⚠️ تعذّر استخراج الإحداثيات — افتح الرابط في المتصفح وانسخ الرابط الطويل من شريط العنوان</div>
                  const [lat,lng]=coords, d=0.005
                  return <div style={{marginTop:12,borderRadius:12,overflow:'hidden',border:'2px solid rgba(39,66,62,0.15)'}}>
                    <div style={{background:'#27423e',padding:'8px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{color:'#d3e2dc',fontSize:'0.75rem',fontWeight:700}}>📍 {lat.toFixed(5)}, {lng.toFixed(5)}</span>
                      <button type="button" onClick={()=>ff('map_url','')} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'#f4ede4',borderRadius:6,padding:'3px 10px',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Tajawal','Cairo',sans-serif"}}>✕ مسح</button>
                    </div>
                    <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-d},${lat-d},${lng+d},${lat+d}&layer=mapnik&marker=${lat},${lng}`} width="100%" height="260" style={{border:'none',display:'block'}} loading="lazy" title="معاينة الموقع" />
                  </div>
                })()}
                {!form.map_url && <div style={{marginTop:8,fontSize:'0.75rem',color:'#9aada7'}}>💡 اختياري</div>}
              </div>
              {/* Images */}
              <div style={S.fullCol}>
                <label style={S.label}>📸 صور العقار</label>
                <input ref={imgInputRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>handleImagesSelected(e.target.files)} />
                <div style={S.uploadZone} onClick={()=>imgInputRef.current?.click()}>
                  <span style={S.uploadIcon}>🖼️</span>
                  <div style={S.uploadText}>اضغط لاختيار صور</div>
                  <div style={S.uploadHint}>JPG، PNG، WEBP</div>
                  <button type="button" style={S.uploadBtn}>اختر الصور</button>
                </div>
                {uploadingImg && <><div style={S.progressBar}><div style={S.progressFill(imgProgress)}/></div><div style={S.uploadingText}>⬆️ {imgProgress}%</div></>}
                {form.images.length>0 && <div style={S.thumbsRow}>{form.images.map((url,idx)=><div key={url+idx} style={S.thumb}><img src={url} alt="" style={S.thumbImg}/>{idx===0&&<span style={S.thumbMain}>رئيسية</span>}<button type="button" style={S.thumbDel} onClick={()=>removeImage(idx)}>✕</button></div>)}</div>}
              </div>
              {/* Video — TikTok link */}
              <div style={S.fullCol}>
                <label style={S.label}>🎵 رابط فيديو تيك توك (اختياري)</label>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={e => setForm(f => ({...f, video_url: e.target.value}))}
                  style={{...S.input, fontFamily:'monospace', fontSize:'0.82rem'}}
                  placeholder="https://www.tiktok.com/@username/video/123456..."
                />
                {form.video_url && (
                  <div style={{marginTop:8, fontSize:'0.75rem', color:'#b8986a', display:'flex', alignItems:'center', gap:6}}>
                    <span>✓</span> سيُعرض الفيديو في صفحة العقار بعد تحميل الصفحة
                    <button type="button" onClick={()=>setForm(f=>({...f,video_url:''}))} style={{marginRight:'auto',background:'none',border:'none',color:'#e57373',cursor:'pointer',fontSize:'0.8rem',fontFamily:'Tajawal,sans-serif'}}>حذف الرابط ✕</button>
                  </div>
                )}
              </div>
              {/* Checkboxes */}
              <div style={S.fullCol}>
                <label style={{...S.label,marginBottom:12}}>المميزات</label>
                <div style={S.checkRow}>
                  {[['has_pool','🏊 مسبح'],['has_parking','🚗 مواقف'],['has_garden','🌿 حديقة'],['has_annex','🏠 ملحق'],['is_featured','⭐ مميز'],['is_new','🆕 جديد']].map(([k,l])=>(
                    <label key={k} style={S.checkLabel}><input type="checkbox" checked={(form as any)[k]} onChange={e=>ff(k,e.target.checked)} style={{width:18,height:18,accentColor:'#27423e',cursor:'pointer'}}/>{l}</label>
                  ))}
                </div>
              </div>
            </div>
            <div style={S.formBtns}>
              <button type="submit" disabled={saving||uploadingImg||uploadingVid} style={{...S.submitBtn,opacity:(saving||uploadingImg||uploadingVid)?0.6:1}}>
                {saving?'جاري الحفظ...':uploadingImg?'رفع الصور...':uploadingVid?'رفع الفيديو...':editId?'حفظ التعديلات':'إضافة العقار'}
              </button>
              <button type="button" style={S.cancelBtn} onClick={()=>{setForm(emptyForm);setEditId(null);setTab('properties')}}>إلغاء</button>
            </div>
          </form>
        )}

        {/* ── USERS MANAGEMENT ── */}
        {tab==='users' && session.role==='admin' && (
          <div>

            {/* Users list */}
            <div style={S.card}>
              <div style={S.cardTitle}>👥 المستخدمون الحاليون</div>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead><tr>{['اسم المستخدم','الدور','الصلاحيات','تاريخ الإنشاء','إجراء'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {adminUsers.length===0 ? <tr><td colSpan={5} style={S.emptyRow}>لا يوجد مستخدمون مضافون بعد</td></tr>
                    : adminUsers.map(u=>(
                      <tr key={u.id}>
                        <td style={{...S.td,fontWeight:700,color:'#1e3a34'}}>{u.username}</td>
                        <td style={S.td}><span style={S.badge(u.role==='admin'?'#27423e':'#41646d','#fff')}>{u.role==='admin'?'أدمن':'مستخدم'}</span></td>
                        <td style={{...S.td,fontSize:'0.75rem',color:'#526266',maxWidth:300}}>
                          {u.role==='admin' ? <span style={{color:'#b8986a',fontWeight:700}}>جميع الصلاحيات</span>
                            : PERMS.filter(([k])=>u.permissions?.[k]).map(([,l])=>l).join(' • ') || <span style={{color:'#9aada7'}}>بدون صلاحيات</span>}
                        </td>
                        <td style={{...S.td,color:'#9aada7',fontSize:'0.78rem'}}>{new Date(u.created_at).toLocaleDateString('ar-SA')}</td>
                        <td style={S.td}>
                          <div style={{display:'flex',gap:8}}>
                            <button style={S.editBtn} onClick={()=>setEditingUser({...u})}>تعديل</button>
                            <button style={S.delBtn} onClick={()=>deleteUser(u.id,u.username)}>حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit user permissions modal */}
            {editingUser && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
                <div style={{background:'#fff',borderRadius:20,padding:32,width:'100%',maxWidth:560,maxHeight:'90vh',overflow:'auto',direction:'rtl',fontFamily:"'Tajawal','Cairo',sans-serif"}}>
                  <div style={{fontSize:'1.1rem',fontWeight:800,color:'#1e3a34',marginBottom:24}}>✏️ تعديل صلاحيات: {editingUser.username}</div>
                  <div style={{marginBottom:20}}>
                    <label style={S.label}>الدور</label>
                    <select value={editingUser.role} onChange={e=>setEditingUser(u=>u?{...u,role:e.target.value as Role}:u)} style={S.select}>
                      <option value="user">مستخدم</option>
                      <option value="admin">أدمن (جميع الصلاحيات)</option>
                    </select>
                  </div>
                  {editingUser.role==='user' && (
                    <div style={{marginBottom:24}}>
                      <label style={{...S.label,marginBottom:12}}>الصلاحيات</label>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
                        {PERMS.map(([key,label])=>(
                          <label key={key} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,border:`1px solid ${editingUser.permissions?.[key]?'#27423e':'rgba(39,66,62,0.15)'}`,background:editingUser.permissions?.[key]?'rgba(39,66,62,0.06)':'#faf8f5',cursor:'pointer',transition:'all 0.2s'}}>
                            <input type="checkbox" checked={!!editingUser.permissions?.[key]}
                              onChange={e=>setEditingUser(u=>u?{...u,permissions:{...u.permissions,[key]:e.target.checked}}:u)}
                              style={{width:18,height:18,accentColor:'#27423e',cursor:'pointer'}}/>
                            <span style={{fontSize:'0.85rem',color:'#1e3a34'}}>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{display:'flex',gap:12}}>
                    <button onClick={saveUserEdit} style={S.submitBtn}>💾 حفظ</button>
                    <button onClick={()=>setEditingUser(null)} style={S.cancelBtn}>إلغاء</button>
                  </div>
                </div>
              </div>
            )}

            {/* Add new user */}
            <div style={S.card}>
              <div style={S.cardTitle}>➕ إضافة مستخدم جديد</div>
              <form onSubmit={addUser}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginBottom:20}}>
                  <div><label style={S.label}>اسم المستخدم *</label><input value={newUser.username} onChange={e=>setNewUser(u=>({...u,username:e.target.value}))} style={S.input} placeholder="username" required /></div>
                  <div><label style={S.label}>كلمة المرور *</label><input type="password" value={newUser.password} onChange={e=>setNewUser(u=>({...u,password:e.target.value}))} style={S.input} placeholder="••••••••" required /></div>
                  <div><label style={S.label}>الدور</label>
                    <select value={newUser.role} onChange={e=>setNewUser(u=>({...u,role:e.target.value as Role}))} style={S.select}>
                      <option value="user">مستخدم (صلاحيات محددة)</option>
                      <option value="admin">أدمن (جميع الصلاحيات)</option>
                    </select>
                  </div>
                </div>
                {newUser.role==='user' && (
                  <div style={{marginBottom:20}}>
                    <label style={{...S.label,marginBottom:12}}>الصلاحيات</label>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
                      {PERMS.map(([key,label])=>(
                        <label key={key} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,border:`1px solid ${newUser.permissions[key]?'#27423e':'rgba(39,66,62,0.15)'}`,background:newUser.permissions[key]?'rgba(39,66,62,0.06)':'#faf8f5',cursor:'pointer',transition:'all 0.2s'}}>
                          <input type="checkbox" checked={!!newUser.permissions[key]}
                            onChange={e=>setNewUser(u=>({...u,permissions:{...u.permissions,[key]:e.target.checked}}))}
                            style={{width:18,height:18,accentColor:'#27423e',cursor:'pointer'}}/>
                          <span style={{fontSize:'0.85rem',color:'#1e3a34'}}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <button type="submit" disabled={addingUser} style={{...S.submitBtn,opacity:addingUser?0.6:1}}>
                  {addingUser?'⏳ جاري الإضافة...':'✅ إضافة المستخدم'}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
