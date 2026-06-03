'use client'
import { useEffect } from 'react'

export default function PushNotifications() {
  useEffect(() => {
    async function init() {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return

        const { PushNotifications } = await import('@capacitor/push-notifications')

        // طلب إذن الإشعارات
        const permission = await PushNotifications.requestPermissions()
        if (permission.receive === 'granted') {
          await PushNotifications.register()
        }

        // استقبال الـ token
        PushNotifications.addListener('registration', (token) => {
          console.log('FCM Token:', token.value)
          // يمكن حفظ الـ token في Supabase لاحقاً
        })

        // استقبال الإشعار وهو التطبيق مفتوح
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          alert(`📢 ${notification.title}\n${notification.body}`)
        })

        // الضغط على الإشعار
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Notification tapped:', action)
        })

      } catch (e) {
        console.log('Push notifications not available:', e)
      }
    }
    init()
  }, [])

  return null
}
