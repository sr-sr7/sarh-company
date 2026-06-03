'use client'
import { useEffect } from 'react'

export default function CapacitorInit() {
  useEffect(() => {
    async function init() {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return

        const { StatusBar, Style } = await import('@capacitor/status-bar')
        await StatusBar.setStyle({ style: Style.Light })
        await StatusBar.setOverlaysWebView({ overlay: false })

        // Apply safe area as CSS variable
        const inset = await StatusBar.getInfo?.() 
        document.documentElement.style.setProperty('--status-bar-height', '54px')
      } catch (e) {
        // Not on native, ignore
      }
    }
    init()
  }, [])

  return null
}
