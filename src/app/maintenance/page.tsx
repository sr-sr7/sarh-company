import { LOGO_GIF } from '@/lib/logo'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const metadata = {
  title: 'صرح العقارية — تحت الإنشاء',
  robots: { index: false },
}

async function getReason(): Promise<string> {
  try {
    const { data } = await supabaseAdmin
      .from('inquiries').select('message')
      .eq('type', '__maintenance__').eq('status', 'on').limit(1).single()
    return data?.message || ''
  } catch { return '' }
}

export default async function MaintenancePage() {
  const reason = await getReason()
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
        <style>{`
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Tajawal','Cairo',sans-serif; }
          @keyframes float {
            0%,100% { transform: translateY(0px) rotate(0deg); }
            33%      { transform: translateY(-12px) rotate(1deg); }
            66%      { transform: translateY(-6px) rotate(-1deg); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%,100% { opacity:1; transform:scale(1); }
            50%     { opacity:0.6; transform:scale(0.95); }
          }
          @keyframes shimmer {
            0%   { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          .gear { animation: spin 8s linear infinite; display:inline-block; }
          .gear2 { animation: spin 5s linear infinite reverse; display:inline-block; }
          .float-card { animation: float 6s ease-in-out infinite; }
          .pulse-dot { animation: pulse 2s ease-in-out infinite; }
          .bar {
            height: 4px;
            border-radius: 2px;
            background: linear-gradient(90deg, #f4ede4 0%, #b8986a 40%, #27423e 70%, #f4ede4 100%);
            background-size: 400px 100%;
            animation: shimmer 2.5s linear infinite;
          }
        `}</style>
      </head>
      <body style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1e3a34 0%,#27423e 40%,#3d5a52 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', direction:'rtl' }}>

        {/* Decorative background circles */}
        <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
          {[
            { w:400, h:400, top:-100, right:-100, op:0.06 },
            { w:300, h:300, bottom:-80, left:-80,  op:0.05 },
            { w:200, h:200, top:'40%', left:'10%', op:0.04 },
          ].map((c,i) => (
            <div key={i} style={{ position:'absolute', width:c.w, height:c.h, top:c.top, right:c.right, bottom:c.bottom, left:c.left, borderRadius:'50%', border:'1px solid rgba(211,226,220,0.2)', opacity:c.op, background:'rgba(211,226,220,0.05)' }} />
          ))}
        </div>

        {/* Main card */}
        <div className="float-card" style={{ position:'relative', zIndex:1, background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)', border:'1px solid rgba(211,226,220,0.15)', borderRadius:28, padding:'52px 48px', maxWidth:520, width:'100%', textAlign:'center', boxShadow:'0 32px 80px rgba(0,0,0,0.4)' }}>

          {/* Logo */}
          <div style={{ marginBottom:28 }}>
            <img src={LOGO_GIF} alt="صرح" width={72} height={72} style={{ borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', border:'2px solid rgba(184,152,106,0.4)' }} />
          </div>

          {/* Brand */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:'1.8rem', fontWeight:900, color:'#fff', letterSpacing:1, marginBottom:4 }}>
              صرح <span style={{ color:'#b8986a' }}>العقارية</span>
            </div>
            <div style={{ fontSize:'0.7rem', color:'rgba(211,226,220,0.45)', letterSpacing:4 }}>SARH REAL ESTATE</div>
          </div>

          {/* Icon */}
          <div style={{ fontSize:'2.8rem', marginBottom:24 }}>🏗️</div>

          {/* Title */}
          <h1 style={{ fontSize:'1.6rem', fontWeight:900, color:'#fff', marginBottom:12, lineHeight:1.4 }}>
            الموقع تحت الإنشاء
          </h1>
          <p style={{ color:'rgba(211,226,220,0.75)', fontSize:'0.95rem', lineHeight:1.8, marginBottom:32 }}>
            {reason || 'جاري استكمال جميع المتطلبات النظامية للموقع.'}<br/>
            سنعود قريباً إن شاء الله ✨
          </p>

          {/* Progress bar */}
          <div style={{ marginBottom:32 }}>
            <div className="bar" />
          </div>

          {/* Info cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:32 }}>
            {[
              { icon:'📋', label:'استكمال المتطلبات', desc:'نظامية ورقية' },
              { icon:'⏱️', label:'قريباً', desc:'سنعود بإذن الله' },
            ].map(card => (
              <div key={card.label} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(211,226,220,0.1)', borderRadius:14, padding:'14px 12px' }}>
                <div style={{ fontSize:'1.5rem', marginBottom:6 }}>{card.icon}</div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:'0.82rem', marginBottom:2 }}>{card.label}</div>
                <div style={{ color:'rgba(211,226,220,0.55)', fontSize:'0.72rem' }}>{card.desc}</div>
              </div>
            ))}
          </div>

          {/* WhatsApp contact */}
          <a
            href="https://wa.me/966552226345?text=السلام عليكم، متى سيعود الموقع؟"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#25D366', color:'#fff', borderRadius:12, padding:'13px 28px', fontWeight:800, fontSize:'0.95rem', textDecoration:'none', boxShadow:'0 4px 20px rgba(37,211,102,0.35)', transition:'all 0.2s' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.479 2 2 6.478 2 12.004c0 1.85.484 3.584 1.332 5.09L2.05 21.95l4.945-1.297A10.01 10.01 0 0012.004 22C17.53 22 22 17.522 22 12.004 22 6.479 17.53 2 12.004 2zm0 18.371a8.322 8.322 0 01-4.246-1.16l-.305-.18-3.151.828.843-3.065-.2-.32a8.32 8.32 0 01-1.278-4.47c0-4.6 3.742-8.343 8.337-8.343 4.593 0 8.335 3.742 8.335 8.343 0 4.6-3.742 8.367-8.335 8.367z"/></svg>
            تواصل معنا عبر واتساب
          </a>

          {/* Footer note */}
          <p style={{ marginTop:24, color:'rgba(211,226,220,0.3)', fontSize:'0.7rem' }}>
            © صرح العقارية — جميع الحقوق محفوظة
          </p>
        </div>

      </body>
    </html>
  )
}
