import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'صرح العقارية'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #1e3a34 0%, #2d5a4e 60%, #41646d 100%)',
          fontFamily: 'serif',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            opacity: 0.06,
            background: 'repeating-linear-gradient(45deg, #d3e2dc 0px, #d3e2dc 1px, transparent 1px, transparent 60px)',
          }}
        />

        {/* Logo circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(211,226,220,0.12)',
            border: '2px solid rgba(211,226,220,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            fontSize: 60,
          }}
        >
          🏛
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#d3e2dc',
            letterSpacing: -1,
            marginBottom: 16,
          }}
        >
          صرح العقارية
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(211,226,220,0.7)',
            marginBottom: 48,
          }}
        >
          عقارات بريدة وعنيزة والقصيم
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #41646d, #d3e2dc, #41646d)',
          }}
        />

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            fontSize: 22,
            color: 'rgba(211,226,220,0.5)',
          }}
        >
          sarh-company.com
        </div>
      </div>
    ),
    { ...size }
  )
}
