import { Client, Account, Databases } from 'appwrite'

// Prefer environment variables, but fall back to the provided project values if missing
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const project = import.meta.env.VITE_APPWRITE_PROJECT_ID || '692ef308000c58a666e5'

// Instantiate the client at module load so it can be imported anywhere
const client = new Client().setEndpoint(endpoint).setProject(project)
const account = new Account(client)
const databases = new Databases(client)

// Convenience initializer for older code paths
export function initAppwrite() {
  return { client, account, databases }
}

/**
 * Expose helper to initiate an Appwrite OAuth2 session using the Google provider.
 * Returns true when a redirect was initiated, false otherwise.
 */
export function createGoogleSession(successUrl = window.location.origin + '/oauth2callback', failureUrl = window.location.origin + '/?oauth_error=1') {
  // Debug logging to help diagnose invalid provider or URL issues
  try {
    console.log('[Appwrite] createOAuth2Session ->', { provider: 'google', successUrl, failureUrl })
  } catch (e) {
    // ignore logging errors in older browsers
  }

  try {
    // The SDK's Account instance will redirect the browser to the provider
    account.createOAuth2Session('google', successUrl, failureUrl)
    return true
  } catch (err) {
    console.error('Appwrite createOAuth2Session failed', err)
    return false
  }
}

// Export primary SDK objects for direct use elsewhere
export { client, account, databases }
