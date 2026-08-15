export default function Logo({ size = 28, color = '#f4ede4', bg = '#27423e' }: { size?: number; color?: string; bg?: string }) {
  return (
    <div
      className="rounded-lg flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: bg }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
