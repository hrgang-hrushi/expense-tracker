export function redirectToGoogle() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  if (!clientId) {
    // No client id configured — caller should fallback to a signup page
    return false
  }
  const redirect = encodeURIComponent(window.location.origin + '/oauth2callback')
  const scope = encodeURIComponent('openid email profile')
  const nonce = Math.random().toString(36).slice(2)
  try { sessionStorage.setItem('oauth_nonce', nonce) } catch (e) {}
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=id_token&scope=${scope}&prompt=select_account&nonce=${nonce}`
  window.location.href = url
  return true
}

/**
 * Start Google auth using Appwrite if Appwrite is configured, otherwise fall back
 * to the direct Google redirect flow.
 * Returns true when a redirect was initiated, false otherwise.
 */
export async function startGoogleAuth() {
  const appwriteProject = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''
  if (appwriteProject) {
    try {
      const mod = await import('./appwrite')
      const created = mod.createGoogleSession()
      if (created) return true
      // if Appwrite helper failed, fall through to direct Google
    } catch (err) {
      console.error('Failed to start Appwrite auth', err)
    }
  }
  return redirectToGoogle()
}
