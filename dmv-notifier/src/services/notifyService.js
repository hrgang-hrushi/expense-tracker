// Minimal notify service stub for prototype - real implementation would use Web Push / websocket
export function requestPermission() {
  if (!('Notification' in window)) return Promise.resolve('unsupported')
  return Notification.requestPermission()
}

// placeholder to show how a real service might look
export const notifyService = {
  async subscribe(locationId, pref) {
    // Send to backend in a real app. Here we just resolve.
    return Promise.resolve({ ok: true })
  },
  async unsubscribe(locationId) {
    return Promise.resolve({ ok: true })
  }
}
