'use client'
import { useEffect, useRef } from 'react'
import { Property } from '@/lib/supabase'

// City center coordinates — Saudi Arabia
const CITY_COORDS: Record<string, [number, number]> = {
  'الرياض':         [24.7136, 46.6753],
  'جدة':            [21.4858, 39.1925],
  'مكة المكرمة':    [21.3891, 39.8579],
  'المدينة المنورة': [24.5247, 39.5692],
  'الدمام':         [26.4207, 50.0888],
  'الخبر':          [26.2172, 50.1971],
  'الظهران':        [26.2794, 50.1517],
  'القطيف':         [26.5593, 49.9952],
  'الأحساء':        [25.3792, 49.5878],
  'الطائف':         [21.2703, 40.4158],
  'تبوك':           [28.3835, 36.5662],
  'أبها':           [18.2164, 42.5053],
  'خميس مشيط':     [18.3066, 42.7289],
  'بريدة':          [26.3292, 43.9758],
  'عنيزة':          [26.0890, 43.9916],
  'الرس':           [25.8708, 43.5030],
  'البكيرية':       [26.1481, 43.6536],
  'المذنب':         [25.6198, 44.2876],
  'حائل':           [27.5114, 41.7208],
  'ينبع':           [24.0895, 38.0618],
  'نجران':          [17.5656, 44.2289],
  'جازان':          [16.8892, 42.5511],
  'الباحة':         [20.0129, 41.4677],
  'عرعر':           [30.9753, 41.0380],
  'سكاكا':          [29.9697, 40.2070],
  'الخرج':          [24.1559, 47.3006],
  'الدوادمي':       [24.5097, 44.3880],
}
const DEFAULT_CENTER: [number, number] = [24.7136, 46.6753]

function getCoords(p: Property, index: number): [number, number] {
  const base = CITY_COORDS[p.city] || DEFAULT_CENTER
  // Slight random offset so overlapping pins spread out
  const seed = (index * 7919) % 100
  return [base[0] + (seed - 50) * 0.0008, base[1] + ((seed * 13) % 100 - 50) * 0.0008]
}

export default function PropertyMap({ properties }: { properties: Property[] }) {
  const mapRef   = useRef<any>(null)
  const divRef   = useRef<HTMLDivElement>(null)
  const leafRef  = useRef<any>(null)

  useEffect(() => {
    if (!divRef.current || mapRef.current) return

    // Dynamically load Leaflet (avoids SSR issues)
    import('leaflet').then(L => {
      leafRef.current = L

      // Fix default icon URLs broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(divRef.current!, {
        center: DEFAULT_CENTER,
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      addMarkers(L, map, properties)
    })

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [])

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current || !leafRef.current) return
    // Clear old markers
    mapRef.current.eachLayer((l: any) => { if (l._popup) mapRef.current.removeLayer(l) })
    addMarkers(leafRef.current, mapRef.current, properties)
  }, [properties])

  function addMarkers(L: any, map: any, props: Property[]) {
    if (!props.length) return

    const bounds: [number, number][] = []

    props.forEach((p, i) => {
      const coords = getCoords(p, i)
      bounds.push(coords)

      // Custom colored pin
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;
          background:${p.is_featured ? '#b8986a' : '#27423e'};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid #fff;
          box-shadow:0 3px 10px rgba(0,0,0,0.35);
          cursor:pointer;
        "></div>`,
        iconSize:   [36, 36],
        iconAnchor: [18, 36],
        popupAnchor:[0, -38],
      })

      const waLink = `https://wa.me/${p.whatsapp}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن: ' + p.title)}`
      const imgHtml = p.main_image
        ? `<img src="${p.main_image}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px;display:block"/>`
        : `<div style="width:100%;height:80px;background:#d3e2dc;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;margin-bottom:8px">🏠</div>`

      const popup = L.popup({ maxWidth: 220, className: 'sarh-popup' }).setContent(`
        <div style="font-family:'Tajawal',sans-serif;direction:rtl;width:200px">
          ${imgHtml}
          ${p.is_featured ? '<span style="background:#b8986a;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:50px;margin-bottom:6px;display:inline-block">مميز ⭐</span>' : ''}
          <div style="font-weight:700;font-size:13px;color:#1e3a34;margin-bottom:4px;line-height:1.4">${p.title}</div>
          <div style="font-size:11px;color:#41646d;margin-bottom:6px">📍 ${p.district ? p.district + '، ' : ''}${p.city}</div>
          <div style="font-weight:800;font-size:15px;color:#27423e;margin-bottom:10px">
            ${Number(p.price).toLocaleString('ar-SA')} <span style="font-size:10px;font-weight:400;color:#9aada7">${p.price_unit}</span>
          </div>
          <a href="${waLink}" target="_blank"
            style="display:block;background:#25D366;color:#fff;text-align:center;padding:8px;border-radius:8px;font-weight:700;font-size:12px;text-decoration:none">
            💬 تواصل واتساب
          </a>
        </div>
      `)

      L.marker(coords, { icon }).addTo(map).bindPopup(popup)
    })

    // Fit map to all markers
    if (bounds.length === 1) {
      map.setView(bounds[0], 14)
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(39,66,62,0.15)', border: '1px solid rgba(39,66,62,0.12)' }}>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={divRef} style={{ height: 500, width: '100%' }} />
      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '8px 14px', fontSize: '0.75rem', zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, background: '#b8986a', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }} />
          <span style={{ color: '#526266' }}>عقار مميز</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, background: '#27423e', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }} />
          <span style={{ color: '#526266' }}>عقار عادي</span>
        </div>
      </div>
    </div>
  )
}
