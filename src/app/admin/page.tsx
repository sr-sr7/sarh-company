'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Property, SB_URL, SB_KEY } from '@/lib/supabase'
import { LOGO_GIF } from '@/lib/logo'

type Tab = 'properties' | 'reviews' | 'promo' | 'add' | 'users'

type Session = {
  username: string
  role: string
  permissions: Record<string, boolean>
  userId: string
  expires: number
}

type AdminUser = {
  id: string
  username: string
  role: string
  permissions: Record<string, boolean>
  created_at: string
}

// ─── Styles ───────────────────────────────────────────────────
const S = {
  page:  { minHeight:'100vh', background:'#faf8f5', fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl' as const },
  header:{ background:'#d3e2dc', color:'#1e3a34', padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(30,58,52,0.12)' },
  headerBrand:{ display:'flex', alignItems:'center', gap:12 },
  headerIcon:{ fontSize:'1.6rem' },
  headerTitle:{ fontWeight:700, fontSize:'1.1rem', color:'#1e3a34' },
  headerSub:{ fontSize:'0.7rem', color:'rgba(30,58,52,0.45)', letterSpacing:3, marginTop:2 },
  headerLink:{ color:'#2d5750', textDecoration:'none', fontSize:'0.85rem' },
  logoutBtn:{ background:'rgba(30,58,52,0.08)', color:'#1e3a34', border:'1px solid rgba(30,58,52,0.15)', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:'0.82rem', fontFamily:"'Tajawal','Cairo',sans-serif" },

  statsRow:{ padding:'24px 32px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 },
  statCard:(_bg:string)=>({ background:'#d3e2dc', color:'#1e3a34', borderRadius:16, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, border:'1px solid rgba(30,58,52,0.1)' }),
  statIcon:{ fontSize:'2rem' },
  statNum:{ fontWeight:800, fontSize:'2rem', lineHeight:1 },
  statLabel:{ fontSize:'0.75rem', opacity:0.8, marginTop:4 },

  tabsRow:{ padding:'0 32px', display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' as const },
  tabBtn:(active:boolean)=>({ padding:'10px 20px', borderRadius:10, fontSize:'0.85rem', fontWeight:700, cursor:'pointer', border: active ? '1px solid rgba(30,58,52,0.2)' : '1px solid rgba(30,58,52,0.12)', background: active ? '#d3e2dc' : '#fff', color: '#1e3a34', fontFamily:"'Tajawal','Cairo',sans-serif" }),

  msg:{ margin:'0 32px 16px', background:'#d3e2dc', color:'#1e3a34', padding:'12px 16px', borderRadius:10, fontSize:'0.85rem', fontWeight:600 },
  errMsg:{ margin:'0 32px 16px', background:'#fee', color:'#c00', padding:'12px 16px', borderRadius:10, fontSize:'0.85rem', fontWeight:600 },

  content:{ padding:'0 32px 64px' },

  // Table
  tableWrap:{ background:'#fff', borderRadius:16, border:'1px solid rgba(39,66,62,0.1)', overflow:'auto' },
  table:{ width:'100%', borderCollapse:'collapse' as const, fontSize:'0.85rem', minWidth:700 },
  th:{ textAlign:'right' as const, padding:'12px 16px', fontSize:'0.72rem', color:'#526266', fontWeight:600, borderBottom:'1px solid rgba(39,66,62,0.1)', background:'rgba(39,66,62,0.03)' },
  td:{ padding:'12px 16px', borderBottom:'1px solid rgba(39,66,62,0.05)', verticalAlign:'middle' as const },
  badge:(bg:string,c:string)=>({ background:bg, color:c, fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:50, display:'inline-block' }),
  editBtn:{ fontSize:'0.75rem', background:'rgba(39,66,62,0.08)', border:'1px solid rgba(39,66,62,0.15)', color:'#27423e', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontWeight:600, fontFamily:"'Tajawal','Cairo',sans-serif" },
  delBtn:{ fontSize:'0.75rem', background:'#fff5f5', border:'1px solid #fecaca', color:'#dc2626', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontWeight:600, fontFamily:"'Tajawal','Cairo',sans-serif" },
  statusSel:{ fontSize:'0.72rem', border:'1px solid rgba(39,66,62,0.15)', borderRadius:8, padding:'4px 8px', background:'#fff', fontFamily:"'Tajawal','Cairo',sans-serif", outline:'none' },
  emptyRow:{ textAlign:'center' as const, padding:'48px 0', color:'#7a9188' },

  // Form
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

  // Upload area
  uploadZone:{ border:'2px dashed rgba(39,66,62,0.25)', borderRadius:14, padding:24, textAlign:'center' as const, cursor:'pointer', transition:'border-color 0.2s', background:'#faf8f5' },
  uploadZoneHover:{ border:'2px dashed #41646d', background:'rgba(65,100,109,0.05)' },
  uploadIcon:{ fontSize:'2.5rem', display:'block', marginBottom:8 },
  uploadText:{ color:'#526266', fontSize:'0.85rem', lineHeight:1.6 },
  uploadHint:{ color:'#9aada7', fontSize:'0.75rem', marginTop:6 },
  uploadBtn:{ display:'inline-block', marginTop:12, background:'#d3e2dc', color:'#1e3a34', border:'1px solid rgba(30,58,52,0.2)', borderRadius:8, padding:'10px 20px', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" },
  thumbsRow:{ display:'flex', gap:10, flexWrap:'wrap' as const, marginTop:14 },
  thumb:{ position:'relative' as const, width:90, height:90, borderRadius:10, overflow:'hidden', border:'2px solid rgba(39,66,62,0.15)' },
  thumbImg:{ width:'100%', height:'100%', objectFit:'cover' as const },
  thumbVid:{ width:'100%', height:'100%', objectFit:'cover' as const, background:'#1e3a34' },
  thumbDel:{ position:'absolute' as const, top:4, right:4, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', borderRadius:50, width:22, height:22, fontSize:'0.7rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 },
  thumbMain:{ position:'absolute' as const, bottom:4, left:4, background:'#b8986a', color:'#fff', fontSize:'0.6rem', fontWeight:700, padding:'2px 6px', borderRadius:4 },
  progressBar:{ height:6, background:'rgba(39,66,62,0.1)', borderRadius:50, overflow:'hidden', marginTop:10 },
  progressFill:(pct:number)=>({ height:'100%', width:`${pct}%`, background:'#41646d', borderRadius:50, transition:'width 0.3s' }),
  uploadingText:{ fontSize:'0.8rem', color:'#41646d', marginTop:6 },

  // Form actions
  formBtns:{ display:'flex', gap:12, marginTop:32 },
  submitBtn:{ background:'#d3e2dc', color:'#1e3a34', padding:'12px 32px', borderRadius:10, fontWeight:700, fontSize:'0.95rem', border:'1px solid rgba(30,58,52,0.2)', cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" },
  cancelBtn:{ background:'#fff', color:'#526266', padding:'12px 32px', borderRadius:10, fontWeight:700, fontSize:'0.95rem', border:'1px solid rgba(30,58,52,0.15)', cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" },

  // Users section
  sectionCard:{ background:'#fff', borderRadius:16, border:'1px solid rgba(39,66,62,0.1)', padding:28, marginBottom:24 },
  sectionTitle:{ fontSize:'1rem', fontWeight:800, color:'#1e3a34', marginBottom:20 },
}

// ─── Permissions list ─────────────────────────────────────────
const PERMS: [string, string][] = [
  ['view_total',      'مشاهدة إجمالي العقارات'],
  ['view_active',     'مشاهدة العقارات النشطة'],
  ['view_inquiries',  'مشاهدة تعليقات العملاء'],
  ['view_promo',      'مشاهدة مسجلو العروض'],
  ['add_property',    'إضافة عقار'],
  ['edit_property',   'تعديل عقار'],
  ['delete_property', 'حذف عقار'],
]

// ─── توليد رقم عرض فريد ──────────────────────────────────────
async function generateListingNumber(): Promise<number> {
  const H = { 'apikey': SB_KEY, 'authorization': `Bearer ${SB_KEY}` }

  // جلب جميع الأرقام المستخدمة
  const res = await fetch(`${SB_URL}/rest/v1/used_listing_numbers?select=number&limit=100000`, { headers: H, cache: 'no-store' })
  const usedData = res.ok ? await res.json() : []
  const usedSet  = new Set<number>((usedData as any[]).map(r => r.number))

  // ابدأ بـ 3 خانات — إذا امتلأ النطاق انتقل لـ 4 وهكذا
  let digits = 3
  while (true) {
    const min   = Math.pow(10, digits - 1)   // 100 ثم 1000 ثم 10000...
    const max   = Math.pow(10, digits) - 1   // 999 ثم 9999 ثم 99999...
    const range = max - min + 1              // 900 ثم 9000...

    // جمع الأرقام المستخدمة في هذا النطاق
    let usedInRange = 0
    usedSet.forEach(n => { if (n >= min && n <= max) usedInRange++ })

    // إذا امتلأ النطاق كله، انتقل للنطاق التالي
    if (usedInRange >= range) { digits++; continue }

    // بناء قائمة الأرقام الحرة في هذا النطاق
    const free: number[] = []
    for (let n = min; n <= max; n++) {
      if (!usedSet.has(n)) free.push(n)
    }

    // اختر رقماً عشوائياً من الأرقام الحرة
    const num = free[Math.floor(Math.random() * free.length)]

    // احجز الرقم
    await fetch(`${SB_URL}/rest/v1/used_listing_numbers`, {
      method: 'POST',
      headers: { ...H, 'content-type': 'application/json', 'prefer': 'return=minimal' },
      body: JSON.stringify({ number: num }),
    })
    return num
  }
}

// ─── SHA-256 helper ───────────────────────────────────────────
async function sha256(msg: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── Upload helpers ────────────────────────────────────────────
const BUCKET = 'property-media'

async function uploadFile(file: File, onProgress: (pct: number) => void): Promise<string> {
  const isVideo = file.type.startsWith('video')
  const mimeExtMap: Record<string, string> = {
    'image/jpeg':'jpg','image/jpg':'jpg','image/png':'png','image/webp':'webp',
    'image/gif':'gif','image/heic':'jpg','image/heif':'jpg','image/bmp':'bmp',
    'video/mp4':'mp4','video/quicktime':'mov','video/avi':'avi',
    'video/webm':'webm','video/3gpp':'3gp','video/x-msvideo':'avi',
  }
  const rawExt = (file.name.split('.').pop() || '').replace(/[^a-zA-Z0-9]/g, '')
  const ext    = rawExt || mimeExtMap[file.type] || (isVideo ? 'mp4' : 'jpg')
  const folder = isVideo ? 'videos' : 'images'
  const path   = `${folder}/${Date.now()}${Math.random().toString(36).slice(2)}.${ext}`
  const ct = (file.type && /^[\x20-\x7E]+$/.test(file.type)) ? file.type : (isVideo ? 'video/mp4' : 'image/jpeg')
  let pct = 0
  const timer = setInterval(() => { pct = Math.min(pct + 10, 88); onProgress(pct) }, 250)
  try {
    const buffer = await file.arrayBuffer()
    const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: { 'authorization': `Bearer ${SB_KEY}`, 'content-type': ct, 'x-upsert': 'true' },
      body: buffer,
    })
    clearInterval(timer)
    if (!res.ok) throw new Error(`Upload error ${res.status}: ${await res.text().catch(() => String(res.status))}`)
    onProgress(100)
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`
  } catch (err) {
    clearInterval(timer)
    throw err
  }
}

// ─── Component ────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()

  // Auth
  const [session, setSession]       = useState<Session | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Data
  const [tab, setTab]               = useState<Tab>('properties')
  const [properties, setProperties] = useState<Property[]>([])
  const [reviews, setReviews]       = useState<any[]>([])
  const [promoLeads, setPromoLeads] = useState<any[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [msg, setMsg]               = useState('')
  const [msgType, setMsgType]       = useState<'ok'|'err'>('ok')
  const [editId, setEditId]         = useState<string | null>(null)
  const [maintenance, setMaintenance] = useState(false)
  const [togglingMaint, setTogglingMaint] = useState(false)

  // Upload state
  const [uploadingImg, setUploadingImg] = useState(false)
  const [uploadingVid, setUploadingVid] = useState(false)
  const [imgProgress, setImgProgress]   = useState(0)
  const [vidProgress, setVidProgress]   = useState(0)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const vidInputRef = useRef<HTMLInputElement>(null)

  // User management state
  const [newUsername, setNewUsername]       = useState('')
  const [newPassword, setNewPassword]       = useState('')
  const [newPerms, setNewPerms]             = useState<Record<string,boolean>>({})
  const [addingUser, setAddingUser]         = useState(false)
  const [newAdminPass, setNewAdminPass]     = useState('')
  const [confirmAdminPass, setConfirmAdminPass] = useState('')
  const [changingPass, setChangingPass]     = useState(false)

  const emptyForm = {
    title:'', description:'', type:'فيلا', operation:'للبيع',
    city:'بريدة', district:'', price:'', price_unit:'ريال',
    area:'', bedrooms:'0', bathrooms:'0', maid_rooms:'0', kitchens:'1',
    has_pool:false, has_parking:false, has_garden:false, has_annex:false,
    is_featured:false, is_new:true, whatsapp:'966552226345',
    status:'active',
    main_image:'' as string,
    images:[] as string[],
    video_url:'' as string,
    map_url:'' as string,
  }
  const [form, setForm] = useState(emptyForm)

  // ── Auth check on mount ──
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('sarh_session') || '{}')
      if (s.expires && s.expires > Date.now()) {
        setSession(s)
        setAuthChecked(true)
      } else {
        router.replace('/admin/login')
      }
    } catch {
      router.replace('/admin/login')
    }
  }, [])

  useEffect(() => {
    if (authChecked) loadAll()
  }, [authChecked])

  // ── Permission helper ──
  function can(perm: string) {
    if (!session) return false
    if (session.role === 'admin') return true
    return session.permissions?.all === true || session.permissions?.[perm] === true
  }

  // ── Logout ──
  function logout() {
    localStorage.removeItem('sarh_session')
    router.replace('/admin/login')
  }

  // ── Load data ──
  async function loadAll() {
    setLoading(true)
    const H = { 'apikey': SB_KEY, 'authorization': `Bearer ${SB_KEY}` }
    const isAdmin = session?.role === 'admin'
    const reqs: Promise<any>[] = [
      fetch(`${SB_URL}/rest/v1/properties?select=*&order=created_at.desc`, { headers: H }).then(r => r.ok ? r.json() : []),
      fetch(`${SB_URL}/rest/v1/inquiries?type=eq.review&select=*&order=created_at.desc`, { headers: H }).then(r => r.ok ? r.json() : []),
      fetch(`${SB_URL}/rest/v1/promo_leads?select=*&order=created_at.desc`, { headers: H }).then(r => r.ok ? r.json() : []),
    ]
    if (isAdmin) reqs.push(fetch(`${SB_URL}/rest/v1/admin_users?select=*&order=created_at.asc`, { headers: H }).then(r => r.ok ? r.json() : []))
    const [props, revs, promo, users] = await Promise.all(reqs)
    setProperties(Array.isArray(props) ? props : [])
    setReviews(Array.isArray(revs)     ? revs  : [])
    setPromoLeads(Array.isArray(promo) ? promo : [])
    if (isAdmin) setAdminUsers(Array.isArray(users) ? users : [])
    // Load maintenance state from inquiries table
    try {
      const mRes = await fetch(`${SB_URL}/rest/v1/inquiries?type=eq.__maintenance__&status=eq.on&select=id&limit=1`, { headers: H })
      const mData = mRes.ok ? await mRes.json() : []
      setMaintenance(Array.isArray(mData) && mData.length > 0)
    } catch {}
    setLoading(false)
  }

  // ── Toggle maintenance mode ──
  async function toggleMaintenance() {
    const H = { 'apikey': SB_KEY, 'authorization': `Bearer ${SB_KEY}` }
    setTogglingMaint(true)
    try {
      if (!maintenance) {
        // تفعيل الصيانة: أضف صف خاص في inquiries
        await fetch(`${SB_URL}/rest/v1/inquiries`, {
          method: 'POST',
          headers: { ...H, 'content-type': 'application/json', 'prefer': 'return=minimal' },
          body: JSON.stringify({
            client_name: '__SYSTEM__',
            client_phone: 'maintenance',
            message: 'maintenance_mode_active',
            type: '__maintenance__',
            status: 'on',
          }),
        })
        // كوكي bypass حتى الأدمن يبقى يتصفح
        document.cookie = 'sarh_admin_bypass=1; path=/; max-age=86400'
      } else {
        // إيقاف الصيانة: احذف الصف الخاص
        await fetch(`${SB_URL}/rest/v1/inquiries?type=eq.__maintenance__`, {
          method: 'DELETE',
          headers: H,
        })
      }
      setMaintenance(!maintenance)
    } catch (err) {
      console.error('maintenance toggle error:', err)
    }
    setTogglingMaint(false)
  }

  // ── Save property ──
  async function saveProperty(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      // توليد رقم عرض فريد للعقارات الجديدة فقط
      const listingNum = editId ? undefined : await generateListingNumber()

      const payload = {
        title: form.title, description: form.description || null, type: form.type,
        operation: form.operation, city: form.city, district: form.district || null,
        price: Number(form.price), price_unit: form.price_unit,
        area: form.area ? Number(form.area) : null, bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms), maid_rooms: Number(form.maid_rooms), kitchens: Number(form.kitchens),
        has_pool: form.has_pool, has_parking: form.has_parking,
        has_garden: form.has_garden, has_annex: form.has_annex, is_featured: form.is_featured, is_new: form.is_new,
        whatsapp: form.whatsapp, status: 'active',
        main_image: form.images[0] || form.main_image || null, images: form.images,
        video_url: form.video_url || null,
        map_url: form.map_url || null,
        ...(listingNum !== undefined && { listing_number: listingNum }),
      }
      const url = editId ? `${SB_URL}/rest/v1/properties?id=eq.${editId}` : `${SB_URL}/rest/v1/properties`
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'apikey': SB_KEY, 'authorization': `Bearer ${SB_KEY}`, 'content-type': 'application/json', 'prefer': 'return=minimal' },
        body: JSON.stringify(payload),
      })
      setSaving(false)
      if (!res.ok) { showMsg('❌ خطأ: ' + await res.text().catch(() => String(res.status)), 'err'); return }
      showMsg(editId ? '✅ تم التعديل بنجاح' : '✅ تمت الإضافة بنجاح', 'ok')
      setForm(emptyForm); setEditId(null); setTab('properties'); loadAll()
    } catch (err: any) {
      setSaving(false); showMsg('❌ خطأ: ' + err.message, 'err')
    }
  }

  function showMsg(text: string, type: 'ok'|'err') {
    setMsg(text); setMsgType(type)
    setTimeout(() => setMsg(''), 5000)
  }

  async function deleteProperty(id: string) {
    if (!confirm('هل تريد حذف هذا العقار؟')) return
    await fetch(`${SB_URL}/rest/v1/properties?id=eq.${id}`, {
      method: 'DELETE', headers: { 'apikey': SB_KEY, 'authorization': `Bearer ${SB_KEY}` },
    })
    loadAll()
  }

  function editProperty(p: Property) {
    setForm({
      title: p.title, description: p.description || '', type: p.type, operation: p.operation,
      city: p.city, district: p.district || '', price: String(p.price), price_unit: p.price_unit,
      area: p.area ? String(p.area) : '', bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms),
      maid_rooms: String(p.maid_rooms ?? 0), kitchens: String(p.kitchens ?? 1),
      has_pool: p.has_pool, has_parking: p.has_parking, has_garden: p.has_garden, has_annex: p.has_annex ?? false,
      is_featured: p.is_featured, is_new: p.is_new, whatsapp: p.whatsapp,
      main_image: p.main_image || '', status: p.status || 'active', images: p.images || [],
      video_url: p.video_url || '', map_url: p.map_url || '',
    })
    setEditId(p.id); setTab('add')
  }

  // ── Images ──
  async function handleImagesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadingImg(true); setImgProgress(0)
    const urls: string[] = [...form.images]
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadFile(files[i], (pct) => setImgProgress(Math.round((i / files.length) * 100 + pct / files.length)))
        urls.push(url)
      } catch (err: any) { showMsg('❌ فشل رفع الصورة: ' + err.message, 'err') }
    }
    setForm(f => ({ ...f, images: urls })); setUploadingImg(false); setImgProgress(100)
  }

  // ── Video ──
  async function handleVideoSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadingVid(true); setVidProgress(0)
    try {
      const url = await uploadFile(files[0], setVidProgress)
      setForm(f => ({ ...f, video_url: url }))
    } catch (err: any) { showMsg('❌ فشل رفع الفيديو: ' + err.message, 'err') }
    setUploadingVid(false); setVidProgress(100)
  }

  function removeImage(idx: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const f = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  // ── Add user ──
  async function addUser(e: React.FormEvent) {
    e.preventDefault()
    if (!newUsername.trim() || !newPassword.trim()) { showMsg('أدخل اسم المستخدم وكلمة المرور', 'err'); return }
    setAddingUser(true)
    try {
      const hash = await sha256(newPassword)
      const res = await fetch(`${SB_URL}/rest/v1/admin_users`, {
        method: 'POST',
        headers: { 'apikey': SB_KEY, 'authorization': `Bearer ${SB_KEY}`, 'content-type': 'application/json', 'prefer': 'return=minimal' },
        body: JSON.stringify({ username: newUsername.trim(), password_hash: hash, role: 'user', permissions: newPerms }),
      })
      if (!res.ok) throw new Error(await res.text())
      showMsg('✅ تم إضافة المستخدم بنجاح', 'ok')
      setNewUsername(''); setNewPassword(''); setNewPerms({})
      loadAll()
    } catch (err: any) { showMsg('❌ خطأ: ' + err.message, 'err') }
    setAddingUser(false)
  }

  // ── Delete user ──
  async function deleteUser(id: string, username: string) {
    if (id === session?.userId) { showMsg('❌ لا يمكنك حذف حسابك الخاص', 'err'); return }
    if (!confirm(`حذف المستخدم "${username}"؟`)) return
    await fetch(`${SB_URL}/rest/v1/admin_users?id=eq.${id}`, {
      method: 'DELETE', headers: { 'apikey': SB_KEY, 'authorization': `Bearer ${SB_KEY}` },
    })
    showMsg('✅ تم حذف المستخدم', 'ok')
    loadAll()
  }

  // ── Change admin password ──
  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newAdminPass.trim()) { showMsg('أدخل كلمة المرور الجديدة', 'err'); return }
    if (newAdminPass !== confirmAdminPass) { showMsg('❌ كلمتا المرور غير متطابقتين', 'err'); return }
    setChangingPass(true)
    try {
      const hash = await sha256(newAdminPass)
      const res = await fetch(`${SB_URL}/rest/v1/admin_users?id=eq.${session?.userId}`, {
        method: 'PATCH',
        headers: { 'apikey': SB_KEY, 'authorization': `Bearer ${SB_KEY}`, 'content-type': 'application/json', 'prefer': 'return=minimal' },
        body: JSON.stringify({ password_hash: hash }),
      })
      if (!res.ok) throw new Error(await res.text())
      showMsg('✅ تم تغيير كلمة المرور بنجاح', 'ok')
      setNewAdminPass(''); setConfirmAdminPass('')
    } catch (err: any) { showMsg('❌ خطأ: ' + err.message, 'err') }
    setChangingPass(false)
  }

  // ── Loading / auth redirect ──
  if (!authChecked) return (
    <div style={{ minHeight:'100vh', background:'#1e3a34', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#d3e2dc', fontFamily:'Tajawal', fontSize:'1rem' }}>جاري التحقق من الجلسة...</div>
    </div>
  )

  // ── Tabs visibility ──
  const visibleTabs = ([
    ['properties', '🏠 العقارات',                    true],
    ['reviews',    `⭐ التعليقات (${reviews.filter(r=>r.status==='pending').length} معلق)`, can('view_inquiries')],
    ['promo',      `🎁 العروض (${promoLeads.length})`, can('view_promo')],
    ['add',        editId ? '✏️ تعديل عقار' : '➕ إضافة عقار', can('add_property') || (!!editId && can('edit_property'))],
    ['users',      `👥 المستخدمون (${adminUsers.length})`, session?.role === 'admin'],
  ] as [Tab, string, boolean][]).filter(([,,show]) => show)

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
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' as const }}>
          <span style={{ color:'rgba(211,226,220,0.7)', fontSize:'0.82rem' }}>
            👤 {session?.username}
            {session?.role === 'admin' && <span style={{ background:'#b8986a', color:'#27423e', fontSize:'0.65rem', fontWeight:800, padding:'2px 8px', borderRadius:20, marginRight:6 }}>أدمن</span>}
          </span>
          {/* زر وضع الصيانة */}
          {session?.role === 'admin' && (
            <button
              onClick={toggleMaintenance}
              disabled={togglingMaint}
              title={maintenance ? 'الموقع محجوب الآن — اضغط لإعادة تشغيله' : 'اضغط لتفعيل وضع الصيانة'}
              style={{
                display:'flex', alignItems:'center', gap:8,
                background: maintenance ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.12)',
                border: maintenance ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(34,197,94,0.35)',
                color: maintenance ? '#fca5a5' : '#86efac',
                borderRadius:10, padding:'7px 16px', cursor: togglingMaint ? 'wait' : 'pointer',
                fontFamily:"'Tajawal','Cairo',sans-serif", fontSize:'0.82rem', fontWeight:700,
                transition:'all 0.2s',
              }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background: maintenance ? '#ef4444' : '#22c55e', display:'inline-block', boxShadow: maintenance ? '0 0 6px #ef4444' : '0 0 6px #22c55e' }} />
              {togglingMaint ? '⏳ جاري...' : maintenance ? '🔴 الصيانة مفعّلة' : '🟢 الموقع يعمل'}
            </button>
          )}
          <a href="/" style={S.headerLink}>← الموقع الرئيسي</a>
          <button onClick={logout} style={S.logoutBtn}>🚪 خروج</button>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {([
          can('view_total')     && { label:'إجمالي العقارات', value: properties.length,                               icon:'🏠', bg:'#27423e' },
          can('view_active')    && { label:'عقارات نشطة',     value: properties.filter(p=>p.status==='active').length, icon:'✅', bg:'#2d7d5a' },
          can('view_inquiries') && { label:'تعليقات معلقة',    value: reviews.filter(r=>r.status==='pending').length,   icon:'⭐', bg:'#41646d' },
          can('view_promo')     && { label:'مسجلو العروض',    value: promoLeads.length,                                icon:'🎁', bg:'#b8986a' },
        ] as any[]).filter(Boolean).map((s: any) => (
          <div key={s.label} style={S.statCard(s.bg)}>
            <span style={S.statIcon}>{s.icon}</span>
            <div>
              <div style={S.statNum}>{s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={S.tabsRow}>
        {visibleTabs.map(([t, l]) => (
          <button key={t} style={S.tabBtn(tab===t)}
            onClick={() => { setTab(t); if(t!=='add'){ setEditId(null); setForm(emptyForm) } }}>
            {l}
          </button>
        ))}
      </div>

      {msg && <div style={msgType==='ok' ? S.msg : S.errMsg}>{msg}</div>}

      <div style={S.content}>

        {/* ── PROPERTIES LIST ── */}
        {tab === 'properties' && (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['#','الصورة','العنوان','النوع','العملية','المدينة','السعر','الحالة','إجراءات'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={S.emptyRow}>جاري التحميل...</td></tr>
                ) : properties.length === 0 ? (
                  <tr><td colSpan={8} style={S.emptyRow}>لا توجد عقارات — أضف أول عقار ↑</td></tr>
                ) : properties.map(p => (
                  <tr key={p.id}>
                    <td style={{ ...S.td, width:64 }}>
                      {p.listing_number
                        ? <span style={{ background:'#d3e2dc', color:'#1e3a34', fontSize:'0.72rem', fontWeight:800, padding:'3px 8px', borderRadius:6, fontFamily:'monospace' }}>#{p.listing_number}</span>
                        : <span style={{ color:'#ccc', fontSize:'0.72rem' }}>—</span>}
                    </td>
                    <td style={S.td}>
                      {p.main_image
                        ? <img src={p.main_image} alt="" style={{ width:56, height:44, objectFit:'cover', borderRadius:8 }} />
                        : <div style={{ width:56, height:44, background:'#d3e2dc', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>🏠</div>}
                    </td>
                    <td style={{ ...S.td, fontWeight:600, color:'#1e3a34', maxWidth:200 }}>
                      <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                    </td>
                    <td style={{ ...S.td, color:'#526266' }}>{p.type}</td>
                    <td style={S.td}>
                      <span style={S.badge(p.operation==='للبيع'?'#27423e':'#2d7d5a', '#fff')}>{p.operation}</span>
                    </td>
                    <td style={{ ...S.td, color:'#526266' }}>{p.city}</td>
                    <td style={{ ...S.td, fontWeight:700, color:'#27423e' }}>
                      {new Intl.NumberFormat('ar-SA').format(p.price)}
                    </td>
                    <td style={S.td}>
                      <select value={p.status} style={S.statusSel}
                        onChange={async e => { await fetch(`${SB_URL}/rest/v1/properties?id=eq.${p.id}`,{method:'PATCH',headers:{'apikey':SB_KEY,'authorization':`Bearer ${SB_KEY}`,'content-type':'application/json','prefer':'return=minimal'},body:JSON.stringify({status:e.target.value})}); loadAll() }}>
                        <option value="active">نشط</option>
                        <option value="sold">مباع</option>
                        <option value="rented">مؤجر</option>
                        <option value="hidden">مخفي</option>
                      </select>
                    </td>
                    <td style={S.td}>
                      <div style={{ display:'flex', gap:8 }}>
                        {can('edit_property')   && <button style={S.editBtn} onClick={() => editProperty(p)}>تعديل</button>}
                        {can('delete_property') && <button style={S.delBtn}  onClick={() => deleteProperty(p.id)}>حذف</button>}
                        {!can('edit_property') && !can('delete_property') && <span style={{ color:'#9aada7', fontSize:'0.78rem' }}>—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === 'reviews' && can('view_inquiries') && (
          <div>
            {/* Filter tabs */}
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              {[
                { key:'pending',  label:'⏳ معلقة',     color:'#f59e0b' },
                { key:'approved', label:'✅ موافق عليها', color:'#22c55e' },
                { key:'rejected', label:'❌ مرفوضة',    color:'#ef4444' },
                { key:'',         label:'📋 الكل',       color:'#41646d' },
              ].map(f => {
                const count = f.key ? reviews.filter(r=>r.status===f.key).length : reviews.length
                return (
                  <span key={f.key} style={{ background:'#fff', border:`1px solid ${f.color}30`, color:f.color, borderRadius:50, padding:'6px 16px', fontSize:'0.8rem', fontWeight:700, cursor:'default' }}>
                    {f.label} ({count})
                  </span>
                )
              })}
            </div>

            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['العميل','التقييم','التعليق','العقار','التاريخ','الحالة','إجراء'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr><td colSpan={7} style={S.emptyRow}>لا توجد تعليقات بعد</td></tr>
                  ) : reviews.map(r => {
                    const rating = parseInt(r.client_phone) || 5
                    const stars  = '★'.repeat(rating) + '☆'.repeat(5 - rating)
                    const statusBadge = r.status === 'approved'
                      ? { bg:'#dcfce7', c:'#166534', label:'موافق عليه' }
                      : r.status === 'rejected'
                      ? { bg:'#fee2e2', c:'#991b1b', label:'مرفوض' }
                      : { bg:'#fef9c3', c:'#854d0e', label:'معلق' }

                    return (
                      <tr key={r.id} style={{ background: r.status==='pending' ? 'rgba(245,158,11,0.04)' : undefined }}>
                        <td style={{ ...S.td, fontWeight:700 }}>{r.client_name}</td>
                        <td style={{ ...S.td, color:'#f59e0b', fontSize:'1rem', letterSpacing:1 }}>{stars}</td>
                        <td style={{ ...S.td, color:'#526266', maxWidth:260 }}>
                          <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.message || '—'}</div>
                        </td>
                        <td style={{ ...S.td, fontSize:'0.78rem', color:'#9aada7' }}>
                          {r.property_id ? (
                            <a href={`/properties/${r.property_id}`} target="_blank" style={{ color:'#41646d', textDecoration:'none' }}>
                              عرض العقار ↗
                            </a>
                          ) : '—'}
                        </td>
                        <td style={{ ...S.td, color:'#9aada7', fontSize:'0.78rem' }}>
                          {new Date(r.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td style={S.td}>
                          <span style={{ ...S.badge(statusBadge.bg, statusBadge.c) }}>{statusBadge.label}</span>
                        </td>
                        <td style={S.td}>
                          <div style={{ display:'flex', gap:6 }}>
                            {r.status !== 'approved' && (
                              <button style={{ ...S.editBtn, background:'#dcfce7', border:'1px solid #86efac', color:'#166534' }}
                                onClick={async () => {
                                  await fetch(`${SB_URL}/rest/v1/inquiries?id=eq.${r.id}`, {
                                    method:'PATCH',
                                    headers:{ 'apikey':SB_KEY, 'authorization':`Bearer ${SB_KEY}`, 'content-type':'application/json', 'prefer':'return=minimal' },
                                    body: JSON.stringify({ status:'approved' })
                                  })
                                  loadAll()
                                }}>
                                ✅ موافقة
                              </button>
                            )}
                            {r.status !== 'rejected' && (
                              <button style={S.delBtn}
                                onClick={async () => {
                                  await fetch(`${SB_URL}/rest/v1/inquiries?id=eq.${r.id}`, {
                                    method:'PATCH',
                                    headers:{ 'apikey':SB_KEY, 'authorization':`Bearer ${SB_KEY}`, 'content-type':'application/json', 'prefer':'return=minimal' },
                                    body: JSON.stringify({ status:'rejected' })
                                  })
                                  loadAll()
                                }}>
                                ❌ رفض
                              </button>
                            )}
                            <button style={S.delBtn}
                              onClick={async () => {
                                if (!confirm('حذف هذا التعليق نهائياً؟')) return
                                await fetch(`${SB_URL}/rest/v1/inquiries?id=eq.${r.id}`, {
                                  method:'DELETE',
                                  headers:{ 'apikey':SB_KEY, 'authorization':`Bearer ${SB_KEY}` }
                                })
                                loadAll()
                              }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PROMO LEADS ── */}
        {tab === 'promo' && can('view_promo') && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ fontSize:'0.85rem', color:'#526266' }}>
                إجمالي المسجلين: <strong style={{ color:'#27423e' }}>{promoLeads.length}</strong>
              </div>
              <a
                href={`data:text/csv;charset=utf-8,﻿الاسم,رقم الهاتف,تاريخ التسجيل\n${promoLeads.map(l=>`${l.name},${l.phone},${new Date(l.created_at).toLocaleDateString('ar-SA')}`).join('\n')}`}
                download="promo_leads.csv"
                style={{ background:'#d3e2dc', color:'#1e3a34', padding:'8px 18px', borderRadius:10, fontSize:'0.8rem', fontWeight:700, textDecoration:'none' }}
              >
                ⬇️ تصدير CSV
              </a>
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['#','الاسم','رقم الهاتف','تاريخ التسجيل','إجراء'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {promoLeads.length === 0 ? (
                    <tr><td colSpan={5} style={S.emptyRow}>لا يوجد مسجلون في العروض بعد</td></tr>
                  ) : promoLeads.map((lead, idx) => (
                    <tr key={lead.id}>
                      <td style={{ ...S.td, color:'#9aada7', fontSize:'0.78rem', width:40 }}>{idx + 1}</td>
                      <td style={{ ...S.td, fontWeight:700, color:'#1e3a34' }}>{lead.name}</td>
                      <td style={S.td}>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <a href={`tel:${lead.phone}`} style={{ color:'#41646d', fontWeight:600 }}>{lead.phone}</a>
                          <a href={`https://wa.me/966${lead.phone.replace(/^0/,'')}`} target="_blank" rel="noopener noreferrer"
                            style={{ background:'#25D366', color:'#fff', fontSize:'0.72rem', fontWeight:700, padding:'3px 10px', borderRadius:50, textDecoration:'none' }}>واتساب</a>
                        </div>
                      </td>
                      <td style={{ ...S.td, color:'#9aada7', fontSize:'0.8rem' }}>
                        {new Date(lead.created_at).toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' })}
                      </td>
                      <td style={S.td}>
                        <button style={S.delBtn} onClick={async () => {
                          if (!confirm(`حذف ${lead.name} من قائمة العروض؟`)) return
                          await fetch(`${SB_URL}/rest/v1/promo_leads?id=eq.${lead.id}`, { method:'DELETE', headers:{'apikey':SB_KEY,'authorization':`Bearer ${SB_KEY}`} })
                          loadAll()
                        }}>حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ADD / EDIT FORM ── */}
        {tab === 'add' && (can('add_property') || (!!editId && can('edit_property'))) && (
          <form onSubmit={saveProperty} style={S.form}>
            <div style={S.formTitle}>{editId ? '✏️ تعديل العقار' : '➕ إضافة عقار جديد'}</div>
            <div style={S.formGrid}>

              <div style={S.fullCol}>
                <label style={S.label}>عنوان العقار *</label>
                <input required value={form.title} onChange={e=>f('title',e.target.value)} style={S.input} placeholder="مثال: فيلا فاخرة بحي النزهة شمال بريدة" />
              </div>

              <div style={S.fullCol}>
                <label style={S.label}>الوصف</label>
                <textarea value={form.description} onChange={e=>f('description',e.target.value)} rows={3} style={S.textarea} placeholder="وصف مفصّل عن العقار..." />
              </div>

              <div>
                <label style={S.label}>نوع العقار *</label>
                <select required value={form.type} onChange={e=>f('type',e.target.value)} style={S.select}>
                  {['فيلا','أرض','شقة','استراحة','دبلكس','محل تجاري','مستودع','مزرعة','قصر'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={S.label}>نوع العملية *</label>
                <select required value={form.operation} onChange={e=>f('operation',e.target.value)} style={S.select}>
                  {['للبيع','للإيجار','إيجار يومي','استثماري'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label style={S.label}>المدينة *</label>
                <select required value={form.city} onChange={e=>f('city',e.target.value)} style={S.select}>
                  {['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','الظهران','القطيف','الأحساء','الطائف','تبوك','أبها','خميس مشيط','بريدة','عنيزة','الرس','البكيرية','المذنب','حائل','ينبع','نجران','جازان','الباحة','عرعر','سكاكا','الخرج','الدوادمي'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={S.label}>الحي / المنطقة</label>
                <input value={form.district} onChange={e=>f('district',e.target.value)} style={S.input} placeholder="حي النزهة" />
              </div>

              <div>
                <label style={S.label}>السعر *</label>
                <input required type="number" value={form.price} onChange={e=>f('price',e.target.value)} style={S.input} placeholder="850000" />
              </div>

              <div>
                <label style={S.label}>وحدة السعر</label>
                <select value={form.price_unit} onChange={e=>f('price_unit',e.target.value)} style={S.select}>
                  {['ريال','ريال / سنة','ريال / شهر','ريال / يوم'].map(u=><option key={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label style={S.label}>المساحة (م²)</label>
                <input type="number" value={form.area} onChange={e=>f('area',e.target.value)} style={S.input} placeholder="400" />
              </div>

              <div>
                <label style={S.label}>عدد الغرف</label>
                <input type="number" min="0" value={form.bedrooms} onChange={e=>f('bedrooms',e.target.value)} style={S.input} />
              </div>

              <div>
                <label style={S.label}>عدد الحمامات</label>
                <input type="number" min="0" value={form.bathrooms} onChange={e=>f('bathrooms',e.target.value)} style={S.input} />
              </div>

              <div>
                <label style={S.label}>عدد غرف الخادمة</label>
                <input type="number" min="0" value={form.maid_rooms} onChange={e=>f('maid_rooms',e.target.value)} style={S.input} />
              </div>

              <div>
                <label style={S.label}>عدد المطابخ</label>
                <input type="number" min="0" value={form.kitchens} onChange={e=>f('kitchens',e.target.value)} style={S.input} />
              </div>

              <div>
                <label style={S.label}>رقم الواتساب</label>
                <input value={form.whatsapp} onChange={e=>f('whatsapp',e.target.value)} style={S.input} placeholder="966552226345" />
              </div>

              {/* Map Location */}
              <div style={S.fullCol}>
                <label style={S.label}>📍 موقع العقار على قوقل ماب</label>
                <div style={{ background:'#f0f7f4', border:'1px solid rgba(39,66,62,0.15)', borderRadius:12, padding:'14px 18px', marginBottom:12 }}>
                  <div style={{ fontSize:'0.8rem', color:'#41646d', fontWeight:700, marginBottom:8 }}>📋 كيفية تحديد الموقع:</div>
                  <ol style={{ margin:0, paddingRight:20, fontSize:'0.8rem', color:'#526266', lineHeight:2.2 }}>
                    <li>اضغط زر <strong>"فتح قوقل ماب"</strong> أدناه</li>
                    <li>ابحث عن موقع العقار وانتقل إليه</li>
                    <li>اضغط على الموقع الصحيح في الخريطة</li>
                    <li>اضغط <strong>"مشاركة"</strong> ثم انسخ الرابط</li>
                    <li>الصق الرابط في الحقل أدناه</li>
                  </ol>
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <input
                    value={form.map_url}
                    onChange={e => f('map_url', e.target.value)}
                    style={{ ...S.input, flex:1 }}
                    placeholder="https://maps.google.com/maps?q=... أو الصق رابط المشاركة هنا"
                  />
                  <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"
                    style={{ background:'#4285f4', color:'#fff', borderRadius:10, padding:'10px 16px', fontSize:'0.82rem', fontWeight:700, textDecoration:'none', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                    🗺️ فتح قوقل ماب
                  </a>
                </div>
                {form.map_url && (() => {
                  // استخرج إحداثيات من رابط قوقل ماب
                  const cm = form.map_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
                  const qm = form.map_url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
                  const coords = cm ? [parseFloat(cm[1]), parseFloat(cm[2])] : qm ? [parseFloat(qm[1]), parseFloat(qm[2])] : null
                  if (!coords) return (
                    <div style={{ marginTop:10, background:'#fff8e1', border:'1px solid #f0d060', borderRadius:10, padding:'10px 14px', fontSize:'0.8rem', color:'#7a6000' }}>
                      ⚠️ تعذّر استخراج الإحداثيات من الرابط. تأكد أن الرابط من قوقل ماب ويحتوي على <strong>@lat,lng</strong> — جرّب افتح الموقع في قوقل ماب ثم انسخ رابط الصفحة مباشرة من شريط العنوان.
                    </div>
                  )
                  const [lat, lng] = coords
                  const d = 0.005
                  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-d},${lat-d},${lng+d},${lat+d}&layer=mapnik&marker=${lat},${lng}`
                  return (
                    <div style={{ marginTop:12, borderRadius:12, overflow:'hidden', border:'2px solid rgba(39,66,62,0.15)' }}>
                      <div style={{ background:'#27423e', padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ color:'#d3e2dc', fontSize:'0.75rem', fontWeight:700 }}>📍 معاينة الموقع — {lat.toFixed(5)}, {lng.toFixed(5)}</span>
                        <button type="button" onClick={() => f('map_url','')}
                          style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#f4ede4', borderRadius:6, padding:'3px 10px', fontSize:'0.72rem', cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" }}>
                          ✕ مسح
                        </button>
                      </div>
                      <iframe src={osmSrc} width="100%" height="260" style={{ border:'none', display:'block' }} loading="lazy" title="معاينة الموقع" />
                    </div>
                  )
                })()}
                {!form.map_url && (
                  <div style={{ marginTop:8, fontSize:'0.75rem', color:'#9aada7' }}>
                    💡 اختياري — إذا لم تضف رابط سيتم عرض موقع المدينة تلقائياً
                  </div>
                )}
              </div>

              {/* Images */}
              <div style={S.fullCol}>
                <label style={S.label}>📸 صور العقار</label>
                <input ref={imgInputRef} type="file" accept="image/*" multiple capture={undefined} style={{ display:'none' }} onChange={e => handleImagesSelected(e.target.files)} />
                <div style={S.uploadZone} onClick={() => imgInputRef.current?.click()}>
                  <span style={S.uploadIcon}>🖼️</span>
                  <div style={S.uploadText}>اضغط لاختيار صور من جهازك أو جوالك</div>
                  <div style={S.uploadHint}>يدعم: JPG، PNG، WEBP — يمكنك اختيار أكثر من صورة</div>
                  <button type="button" style={S.uploadBtn}>اختر الصور</button>
                </div>
                {uploadingImg && (
                  <><div style={S.progressBar}><div style={S.progressFill(imgProgress)} /></div>
                  <div style={S.uploadingText}>⬆️ جاري رفع الصور... {imgProgress}%</div></>
                )}
                {form.images.length > 0 && (
                  <div style={S.thumbsRow}>
                    {form.images.map((url, idx) => (
                      <div key={url+idx} style={S.thumb}>
                        <img src={url} alt="" style={S.thumbImg} />
                        {idx === 0 && <span style={S.thumbMain}>رئيسية</span>}
                        <button type="button" style={S.thumbDel} onClick={() => removeImage(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length > 0 && (
                  <div style={{ fontSize:'0.75rem', color:'#7a9188', marginTop:8 }}>
                    💡 الصورة الأولى ستكون الصورة الرئيسية — اضغط ✕ لحذف أي صورة
                  </div>
                )}
              </div>

              {/* Video */}
              <div style={S.fullCol}>
                <label style={S.label}>🎥 فيديو العقار (اختياري)</label>
                <input ref={vidInputRef} type="file" accept="video/*" style={{ display:'none' }} onChange={e => handleVideoSelected(e.target.files)} />
                <div style={S.uploadZone} onClick={() => vidInputRef.current?.click()}>
                  <span style={S.uploadIcon}>🎬</span>
                  <div style={S.uploadText}>اضغط لاختيار فيديو من جهازك أو جوالك</div>
                  <div style={S.uploadHint}>يدعم: MP4، MOV، AVI — الحد الأقصى 50MB</div>
                  <button type="button" style={S.uploadBtn}>اختر فيديو</button>
                </div>
                {uploadingVid && (
                  <><div style={S.progressBar}><div style={S.progressFill(vidProgress)} /></div>
                  <div style={S.uploadingText}>⬆️ جاري رفع الفيديو... {vidProgress}%</div></>
                )}
                {form.video_url && (
                  <div style={{ marginTop:14, position:'relative', display:'inline-block' }}>
                    <video src={form.video_url} controls style={{ height:140, borderRadius:12, maxWidth:'100%', background:'#1e3a34' }} />
                    <button type="button"
                      style={{ ...S.thumbDel, position:'absolute', top:8, right:8, width:28, height:28, fontSize:'0.85rem' }}
                      onClick={() => setForm(f => ({ ...f, video_url:'' }))}>✕</button>
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div style={S.fullCol}>
                <label style={{ ...S.label, marginBottom:12 }}>المميزات والخيارات</label>
                <div style={S.checkRow}>
                  {[
                    ['has_pool','🏊 مسبح'],['has_parking','🚗 مواقف'],['has_garden','🌿 حديقة'],
                    ['has_annex','🏠 ملحق'],['is_featured','⭐ مميز'],['is_new','🆕 جديد'],
                  ].map(([k,l]) => (
                    <label key={k} style={S.checkLabel}>
                      <input type="checkbox" checked={(form as any)[k]} onChange={e=>f(k,e.target.checked)}
                        style={{ width:18, height:18, accentColor:'#27423e', cursor:'pointer' }} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={S.formBtns}>
              <button type="submit" disabled={saving || uploadingImg || uploadingVid}
                style={{ ...S.submitBtn, opacity:(saving||uploadingImg||uploadingVid)?0.6:1 }}>
                {saving ? 'جاري الحفظ...' : uploadingImg ? 'جاري رفع الصور...' : uploadingVid ? 'جاري رفع الفيديو...' : editId ? 'حفظ التعديلات' : 'إضافة العقار'}
              </button>
              <button type="button" style={S.cancelBtn}
                onClick={() => { setForm(emptyForm); setEditId(null); setTab('properties') }}>
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* ── USERS MANAGEMENT ── */}
        {tab === 'users' && session?.role === 'admin' && (
          <div>

            {/* Users list */}
            <div style={S.sectionCard}>
              <div style={S.sectionTitle}>👥 قائمة المستخدمين</div>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['اسم المستخدم','الدور','الصلاحيات','تاريخ الإنشاء','إجراء'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.length === 0 ? (
                      <tr><td colSpan={5} style={S.emptyRow}>لا يوجد مستخدمون بعد</td></tr>
                    ) : adminUsers.map(u => (
                      <tr key={u.id}>
                        <td style={{ ...S.td, fontWeight:700, color:'#1e3a34' }}>
                          {u.username}
                          {u.id === session.userId && <span style={{ background:'#d3e2dc', color:'#27423e', fontSize:'0.65rem', fontWeight:800, padding:'2px 8px', borderRadius:20, marginRight:8 }}>أنت</span>}
                        </td>
                        <td style={S.td}>
                          <span style={S.badge(u.role==='admin'?'#27423e':'#41646d','#fff')}>
                            {u.role === 'admin' ? 'أدمن' : 'مستخدم'}
                          </span>
                        </td>
                        <td style={{ ...S.td, fontSize:'0.75rem', color:'#526266', maxWidth:300 }}>
                          {u.role === 'admin' ? (
                            <span style={{ color:'#b8986a', fontWeight:700 }}>جميع الصلاحيات</span>
                          ) : Object.keys(u.permissions || {}).filter(k => (u.permissions as any)[k]).length === 0 ? (
                            <span style={{ color:'#9aada7' }}>لا صلاحيات</span>
                          ) : (
                            PERMS.filter(([k]) => (u.permissions as any)?.[k]).map(([,label]) => label).join(' • ')
                          )}
                        </td>
                        <td style={{ ...S.td, color:'#9aada7', fontSize:'0.78rem' }}>
                          {new Date(u.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td style={S.td}>
                          {u.id !== session.userId ? (
                            <button style={S.delBtn} onClick={() => deleteUser(u.id, u.username)}>حذف</button>
                          ) : <span style={{ color:'#9aada7', fontSize:'0.78rem' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add user form */}
            <div style={S.sectionCard}>
              <div style={S.sectionTitle}>➕ إضافة مستخدم جديد</div>
              <form onSubmit={addUser}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16, marginBottom:20 }}>
                  <div>
                    <label style={S.label}>اسم المستخدم *</label>
                    <input value={newUsername} onChange={e=>setNewUsername(e.target.value)} style={S.input} placeholder="username" required />
                  </div>
                  <div>
                    <label style={S.label}>كلمة المرور *</label>
                    <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={S.input} placeholder="••••••••" required />
                  </div>
                </div>

                <div style={{ marginBottom:20 }}>
                  <label style={{ ...S.label, marginBottom:12 }}>الصلاحيات</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:10 }}>
                    {PERMS.map(([key, label]) => (
                      <label key={key} style={{ ...S.checkLabel, background: newPerms[key] ? 'rgba(39,66,62,0.06)' : 'transparent', padding:'8px 12px', borderRadius:8, border:`1px solid ${newPerms[key] ? '#27423e' : 'rgba(39,66,62,0.12)'}`, transition:'all 0.2s' }}>
                        <input type="checkbox" checked={!!newPerms[key]}
                          onChange={e => setNewPerms(p => ({ ...p, [key]: e.target.checked }))}
                          style={{ width:16, height:16, accentColor:'#27423e', cursor:'pointer' }} />
                        <span style={{ fontSize:'0.85rem' }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={addingUser}
                  style={{ ...S.submitBtn, opacity: addingUser ? 0.6 : 1 }}>
                  {addingUser ? '⏳ جاري الإضافة...' : '✅ إضافة المستخدم'}
                </button>
              </form>
            </div>

            {/* Change admin password */}
            <div style={S.sectionCard}>
              <div style={S.sectionTitle}>🔐 تغيير كلمة مرور الأدمن</div>
              <form onSubmit={changePassword}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16, marginBottom:20 }}>
                  <div>
                    <label style={S.label}>كلمة المرور الجديدة *</label>
                    <input type="password" value={newAdminPass} onChange={e=>setNewAdminPass(e.target.value)} style={S.input} placeholder="••••••••" required />
                  </div>
                  <div>
                    <label style={S.label}>تأكيد كلمة المرور *</label>
                    <input type="password" value={confirmAdminPass} onChange={e=>setConfirmAdminPass(e.target.value)} style={S.input} placeholder="••••••••" required />
                  </div>
                </div>
                <button type="submit" disabled={changingPass}
                  style={{ ...S.submitBtn, opacity: changingPass ? 0.6 : 1 }}>
                  {changingPass ? '⏳ جاري التغيير...' : '🔑 تغيير كلمة المرور'}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
