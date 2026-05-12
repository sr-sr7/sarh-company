'use client'
import { useEffect, useState } from 'react'
import type { Property } from '@/lib/supabase'

type Tab = 'properties' | 'add' | 'inquiries'

const TYPES = ['فيلا', 'دور علوي', 'دور أرضي', 'شقة', 'دبلكس', 'أرض', 'استراحة', 'محل تجاري', 'مستودع', 'مزرعة', 'قصر']
const OPS = ['للبيع', 'للإيجار', 'إيجار يومي', 'استثماري']
const CITIES = ['بريدة', 'عنيزة', 'الرس', 'البكيرية', 'المذنب']
const PRICE_UNITS = ['ريال', 'ريال / شهر', 'ريال / سنة', 'ريال / يوم', 'على السوم']

const emptyForm = {
  title: '', description: '', type: 'فيلا', operation: 'للبيع', status: 'active',
  city: 'بريدة', district: '', price: '', price_unit: 'ريال', area: '',
  bedrooms: '0', bathrooms: '0', has_pool: false, has_parking: false, has_garden: false,
  main_image: '', is_featured: false, is_new: true, whatsapp: '966552226345',
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [pwInput, setPwInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [tab, setTab] = useState<Tab>('properties')
  const [properties, setProperties] = useState<Property[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const r = await fetch('/api/admin/properties')
    if (r.ok) { setAuthed(true); loadAll() } else { setAuthed(false) }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoggingIn(true); setLoginError('')
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwInput }) })
    setLoggingIn(false)
    if (r.ok) { setAuthed(true); setPwInput(''); loadAll() }
    else { const j = await r.json().catch(() => ({})); setLoginError(j.error || 'فشل تسجيل الدخول') }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthed(false)
  }

  async function loadAll() {
    setLoading(true)
    const [pr, ir] = await Promise.all([
      fetch('/api/admin/properties').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/admin/inquiries').then(r => r.json()).catch(() => ({ data: [] })),
    ])
    setProperties(pr.data || [])
    setInquiries(ir.data || [])
    setLoading(false)
  }

  function startEdit(p: Property) {
    setForm({
      title: p.title, description: p.description || '', type: p.type, operation: p.operation,
      status: p.status, city: p.city, district: p.district || '', price: String(p.price),
      price_unit: p.price_unit, area: p.area ? String(p.area) : '',
      bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms),
      has_pool: p.has_pool, has_parking: p.has_parking, has_garden: p.has_garden,
      main_image: p.main_image || '', is_featured: p.is_featured, is_new: p.is_new,
      whatsapp: p.whatsapp,
    })
    setEditId(p.id); setTab('add')
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload: any = {
      ...form,
      price: Number(form.price) || 0,
      area: form.area ? Number(form.area) : null,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
    }
    const url = editId ? '/api/admin/properties/' + editId : '/api/admin/properties'
    const r = await fetch(url, { method: editId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (r.ok) {
      setMsg(editId ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح')
      setForm(emptyForm); setEditId(null); setTab('properties'); loadAll()
      setTimeout(() => setMsg(''), 3000)
    } else {
      const j = await r.json().catch(() => ({}))
      setMsg('خطأ: ' + (j.error || 'فشل الحفظ'))
    }
  }

  async function remove(id: string) {
    if (!confirm('هل تريد حذف هذا العقار نهائياً؟')) return
    const r = await fetch('/api/admin/properties/' + id, { method: 'DELETE' })
    if (r.ok) loadAll(); else alert('فشل الحذف')
  }

  async function toggleStatus(p: Property, newStatus: string) {
    const r = await fetch('/api/admin/properties/' + p.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
    if (r.ok) loadAll()
  }

  if (authed === null) return (<div className="min-h-screen bg-cream flex items-center justify-center" dir="rtl"><div className="text-moss-500">جاري التحقق...</div></div>)

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4" dir="rtl">
        <form onSubmit={login} className="bg-white rounded-3xl border border-ink/10 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto bg-ink rounded-2xl flex items-center justify-center mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f4ede4" strokeWidth="2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>
            </div>
            <h1 className="font-amiri text-2xl text-ink font-medium">لوحة تحكم صرح</h1>
            <p className="text-sm text-moss-500 mt-1">أدخل كلمة السر للمتابعة</p>
          </div>
          <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)} placeholder="كلمة السر" className="w-full bg-cream border border-ink/15 rounded-xl px-4 py-3 text-sm outline-none focus:border-ink mb-3" autoFocus />
          {loginError && <div className="text-red-600 text-xs mb-3 text-center">{loginError}</div>}
          <button type="submit" disabled={loggingIn} className="w-full bg-ink text-sand py-3.5 rounded-xl text-sm font-medium hover:bg-ink-900 transition disabled:opacity-60">{loggingIn ? 'جاري الدخول...' : 'دخول'}</button>
          <a href="/" className="block text-center text-xs text-moss-500 mt-4 hover:text-ink">← الرجوع للموقع</a>
        </form>
      </div>
    )
  }

  const input = "w-full bg-cream border border-ink/15 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink"
  const label = "block text-xs text-moss-500 mb-1 font-medium"
  const tabBaseCls = "shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition "
  const tabActive = "bg-ink text-sand"
  const tabInactive = "bg-white border border-ink/15 text-moss-500"
  const opSale = "bg-ink text-sand"
  const opOther = "bg-moss-600 text-sand"

  const stats = [
    { label: 'إجمالي العقارات', value: properties.length, bg: 'bg-ink' },
    { label: 'عقارات نشطة', value: properties.filter(p => p.status === 'active').length, bg: 'bg-moss-600' },
    { label: 'طلبات جديدة', value: inquiries.filter(i => i.status === 'جديد').length, bg: 'bg-[#2d7d5a]' },
  ]

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <div className="bg-ink text-sand px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sand rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3a34" strokeWidth="2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>
          </div>
          <div className="leading-none">
            <div className="font-amiri text-lg">صرح — لوحة التحكم</div>
            <div className="text-[10px] opacity-60 tracking-widest mt-0.5">ADMIN PANEL</div>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/" className="text-xs text-sand/70 hover:text-sand px-3 py-1.5">الموقع</a>
          <button onClick={logout} className="text-xs bg-sand/10 hover:bg-sand/20 px-3 py-1.5 rounded-lg transition">خروج</button>
        </div>
      </div>

      <div className="px-4 md:px-8 py-5 grid grid-cols-3 gap-3 md:gap-4">
        {stats.map(s => (
          <div key={s.label} className={s.bg + " text-sand rounded-xl p-4 md:p-5"}>
            <div className="font-amiri text-2xl md:text-3xl font-medium">{s.value}</div>
            <div className="text-[11px] opacity-80 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-4 md:px-8 flex gap-2 mb-5 overflow-x-auto">
        {(['properties', 'add', 'inquiries'] as Tab[]).map(t => {
          const labels: Record<Tab, string> = { properties: 'العقارات', add: editId ? 'تعديل عقار' : 'إضافة عقار', inquiries: 'الطلبات' }
          return (
            <button key={t} onClick={() => { setTab(t); if (t !== 'add') { setEditId(null); setForm(emptyForm) } }} className={tabBaseCls + (tab === t ? tabActive : tabInactive)}>{labels[t]}</button>
          )
        })}
      </div>

      {msg && <div className="mx-4 md:mx-8 mb-4 bg-accent text-ink px-4 py-3 rounded-lg text-sm font-medium">{msg}</div>}

      <div className="px-4 md:px-8 pb-12">
        {tab === 'properties' && (
          <div className="bg-white rounded-xl border border-ink/10 overflow-hidden overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-moss-500 text-sm">جاري التحميل...</div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 text-moss-500 text-sm">لا توجد عقارات — أضف أول عقار</div>
            ) : (
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-ink/5 border-b border-ink/10">
                  <tr>{['العنوان','النوع','العملية','المدينة','السعر','الحالة','إجراءات'].map(h => <th key={h} className="text-right px-4 py-3 text-xs text-moss-500 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {properties.map(p => (
                    <tr key={p.id} className="border-b border-ink/5 hover:bg-cream/50 transition">
                      <td className="px-4 py-3 font-medium text-ink max-w-xs truncate">{p.title}</td>
                      <td className="px-4 py-3 text-moss-500">{p.type}</td>
                      <td className="px-4 py-3"><span className={"text-xs px-2 py-1 rounded-md font-medium " + (p.operation === 'للبيع' ? opSale : opOther)}>{p.operation}</span></td>
                      <td className="px-4 py-3 text-moss-500">{p.city}</td>
                      <td className="px-4 py-3 font-amiri text-ink font-medium">{p.price > 0 ? new Intl.NumberFormat('ar-SA').format(p.price) : p.price_unit}</td>
                      <td className="px-4 py-3">
                        <select value={p.status} onChange={e => toggleStatus(p, e.target.value)} className="text-xs border border-ink/15 rounded-md px-2 py-1 bg-white outline-none">
                          <option value="active">نشط</option>
                          <option value="sold">مباع</option>
                          <option value="rented">مؤجر</option>
                          <option value="hidden">مخفي</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => startEdit(p)} className="text-xs bg-ink/5 border border-ink/15 text-ink px-3 py-1.5 rounded-md hover:bg-ink/10 transition font-medium">تعديل</button>
                          <button onClick={() => remove(p.id)} className="text-xs bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 transition font-medium">حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'inquiries' && (
          <div className="bg-white rounded-xl border border-ink/10 overflow-hidden overflow-x-auto">
            {inquiries.length === 0 ? (
              <div className="text-center py-12 text-moss-500 text-sm">لا توجد طلبات بعد</div>
            ) : (
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-ink/5 border-b border-ink/10"><tr>{['الاسم','الهاتف','العقار','الرسالة','التاريخ','الحالة'].map(h => <th key={h} className="text-right px-4 py-3 text-xs text-moss-500 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {inquiries.map(i => (
                    <tr key={i.id} className="border-b border-ink/5">
                      <td className="px-4 py-3 font-medium">{i.client_name}</td>
                      <td className="px-4 py-3 text-moss-600"><a href={'tel:' + i.client_phone} className="hover:underline">{i.client_phone}</a></td>
                      <td className="px-4 py-3 text-moss-500 max-w-xs truncate">{i.properties?.title || '—'}</td>
                      <td className="px-4 py-3 text-moss-500 max-w-xs truncate">{i.message || '—'}</td>
                      <td className="px-4 py-3 text-moss-500 text-xs">{new Date(i.created_at).toLocaleDateString('ar-SA')}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-accent text-ink px-2 py-1 rounded-md">{i.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'add' && (
          <form onSubmit={save} className="bg-white rounded-xl border border-ink/10 p-5 md:p-8 max-w-4xl">
            <h2 className="font-amiri text-2xl text-ink font-medium mb-6">{editId ? 'تعديل العقار' : 'إضافة عقار جديد'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className={label}>عنوان العقار *</label><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={input} placeholder="مثال: فيلا فاخرة بحي النزهة" /></div>
              <div className="md:col-span-2"><label className={label}>الوصف</label><textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={input} placeholder="وصف مفصل عن العقار..." /></div>
              <div><label className={label}>نوع العقار *</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={input}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className={label}>نوع العملية *</label><select value={form.operation} onChange={e => setForm(f => ({ ...f, operation: e.target.value }))} className={input}>{OPS.map(o => <option key={o}>{o}</option>)}</select></div>
              <div><label className={label}>المدينة *</label><select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={input}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className={label}>الحي / المنطقة</label><input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className={input} placeholder="حي النزهة" /></div>
              <div><label className={label}>السعر *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={input} placeholder="850000 — أو 0 لو السعر على السوم" /></div>
              <div><label className={label}>وحدة السعر</label><select value={form.price_unit} onChange={e => setForm(f => ({ ...f, price_unit: e.target.value }))} className={input}>{PRICE_UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
              <div><label className={label}>المساحة (م²)</label><input type="number" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} className={input} placeholder="400" /></div>
              <div><label className={label}>رابط الصورة الرئيسية</label><input value={form.main_image} onChange={e => setForm(f => ({ ...f, main_image: e.target.value }))} className={input} placeholder="https://images.unsplash.com/..." /></div>
              <div><label className={label}>عدد الغرف</label><input type="number" min="0" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} className={input} /></div>
              <div><label className={label}>عدد الحمامات</label><input type="number" min="0" value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))} className={input} /></div>
              <div className="md:col-span-2"><label className={label}>رقم الواتساب</label><input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} className={input} placeholder="966552226345" /></div>
              <div className="md:col-span-2">
                <label className={label + ' mb-3'}>المميزات</label>
                <div className="flex flex-wrap gap-3">
                  {([['has_pool','مسبح'],['has_parking','مواقف'],['has_garden','حديقة'],['is_featured','مميز'],['is_new','جديد']] as [keyof typeof form, string][]).map(([k, l]) => (
                    <label key={k as string} className="flex items-center gap-2 cursor-pointer text-sm text-moss-600">
                      <input type="checkbox" checked={form[k] as boolean} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} className="w-4 h-4 accent-ink" />{l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="submit" disabled={saving} className="bg-ink text-sand px-7 py-3 rounded-xl font-medium text-sm hover:bg-ink-900 transition disabled:opacity-60">{saving ? 'جاري الحفظ...' : (editId ? 'حفظ التعديلات' : 'إضافة العقار')}</button>
              <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); setTab('properties') }} className="bg-white border border-ink/20 text-moss-600 px-7 py-3 rounded-xl font-medium text-sm hover:border-ink/40 transition">إلغاء</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
