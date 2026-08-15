'use client'
import { useEffect, useRef } from 'react'
import { Property } from '@/lib/supabase'

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
const DEFAULT_CENTER: [number, number] = [26.3292, 43.9758]

function getCoords(p: Property, index: number): [number, number] {
  if (p.lat && p.lng) return [p.lat, p.lng]
  const base = CITY_COORDS[p.city] || DEFAULT_CENTER
  const seed = (index * 7919) % 100
  return [base[0] + (seed - 50) * 0.0008, base[1] + ((seed * 13) % 100 - 50) * 0.0008]
}

export default function PropertyMap({ properties, onPinClick }: {
  properties: Property[]
  onPinClick?: (p: Property) => void
}) {
  const mapRef      = useRef<any>(null)
  const divRef      = useRef<HTMLDivElement>(null)
  const leafRef     = useRef<any>(null)
  const myMarkerRef = useRef<any>(null)

  useEffect(() => {
    if (!divRef.current || mapRef.current) return

    import('leaflet').then(L => {
      leafRef.current = L
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(divRef.current!, {
        center: DEFAULT_CENTER,
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      addMarkers(L, map, properties)

      // زر تحديد الموقع
      const LocateControl = L.Control.extend({
        onAdd() {
          const btn = L.DomUtil.create('button', '')
          btn.title = 'موقعي الحالي'
          btn.style.cssText = `
            width:36px;height:36px;background:#fff;border:none;border-radius:8px;
            cursor:pointer;display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);font-size:18px;
          `
          btn.innerHTML = '📍'
          L.DomEvent.on(btn, 'click', L.DomEvent.stopPropagation)
          L.DomEvent.on(btn, 'click', () => {
            btn.innerHTML = '⏳'
            if (!navigator.geolocation) { btn.innerHTML = '📍'; return }
            navigator.geolocation.getCurrentPosition(
              ({ coords }) => {
                const { latitude: lat, longitude: lng } = coords
                map.setView([lat, lng], 15)

                if (myMarkerRef.current) myMarkerRef.current.remove()
                const myIcon = L.divIcon({
                  className: '',
                  html: `<div style="
                    width:18px;height:18px;background:#4285f4;
                    border-radius:50%;border:3px solid #fff;
                    box-shadow:0 0 0 4px rgba(66,133,244,0.3);
                  "></div>`,
                  iconSize: [18, 18],
                  iconAnchor: [9, 9],
                })
                myMarkerRef.current = L.marker([lat, lng], { icon: myIcon })
                  .addTo(map)
                  .bindPopup('<div style="font-family:Tajawal;direction:rtl;font-weight:700;color:#1e3a34">موقعك الحالي</div>')
                  .openPopup()
                btn.innerHTML = '📍'
              },
              () => { btn.innerHTML = '📍'; alert('تعذّر تحديد الموقع. تأكد من منح الإذن.') }
            )
          })
          return btn
        },
      })
      new LocateControl({ position: 'topleft' }).addTo(map)
    })

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !leafRef.current) return
    mapRef.current.eachLayer((l: any) => { if (l._popup || l.options?.icon) mapRef.current.removeLayer(l) })
    addMarkers(leafRef.current, mapRef.current, properties)
  }, [properties])

  function addMarkers(L: any, map: any, props: Property[]) {
    if (!props.length) return
    const bounds: [number, number][] = []

    props.forEach((p, i) => {
      const coords = getCoords(p, i)
      bounds.push(coords)
      const hasRealCoords = !!(p.lat && p.lng)

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:32px;height:32px;
          background:${hasRealCoords ? '#1e3a34' : '#b8986a'};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:2px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          cursor:pointer;
        "></div>`,
        iconSize:   [32, 32],
        iconAnchor: [16, 32],
        popupAnchor:[0, -34],
      })

      const waLink = `https://wa.me/${p.whatsapp}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن: ' + p.title)}`
      const imgHtml = p.main_image
        ? `<img src="${p.main_image}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;display:block"/>`
        : `<div style="width:100%;height:70px;background:#f4ede4;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:8px">🏠</div>`

      const popup = L.popup({ maxWidth: 210, className: 'sarh-popup' }).setContent(`
        <div style="font-family:'Tajawal',sans-serif;direction:rtl;width:190px">
          ${imgHtml}
          <div style="font-size:0.7rem;font-weight:800;color:#b8986a;margin-bottom:3px">${p.operation} · ${p.type}</div>
          <div style="font-weight:700;font-size:12px;color:#1e3a34;margin-bottom:4px;line-height:1.4">${p.title}</div>
          <div style="font-size:11px;color:#7a9188;margin-bottom:6px">📍 ${p.district ? p.district + '، ' : ''}${p.city}</div>
          <div style="font-weight:800;font-size:14px;color:#1e3a34;margin-bottom:10px">
            ${Number(p.price).toLocaleString('ar-SA')} <span style="font-size:10px;font-weight:400;color:#9aada7">${p.price_unit}</span>
          </div>
          <div style="display:flex;gap:6px">
            <a href="/properties/${p.id}"
              style="flex:1;display:block;background:#1e3a34;color:#f4ede4;text-align:center;padding:7px;border-radius:8px;font-weight:700;font-size:11px;text-decoration:none">
              التفاصيل
            </a>
            <a href="${waLink}" target="_blank"
              style="flex:1;display:block;background:#25D366;color:#fff;text-align:center;padding:7px;border-radius:8px;font-weight:700;font-size:11px;text-decoration:none">
              واتساب
            </a>
          </div>
        </div>
      `)

      const marker = L.marker(coords, { icon }).addTo(map).bindPopup(popup)
      if (onPinClick) {
        marker.on('click', () => onPinClick(p))
      }
    })

    if (bounds.length === 1) {
      map.setView(bounds[0], 15)
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [48, 48] })
    }
  }

  return (
    <div style={{ width:'100%', height:'100%' }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={divRef} style={{ width:'100%', height:'100%' }} />
    </div>
  )
}
