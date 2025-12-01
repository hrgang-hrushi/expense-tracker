export async function apiFetch(path, opts = {}) {
  // Prefer Vite env var, then legacy REACT_APP, then localhost fallback
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
    || process.env.REACT_APP_API_BASE
    || 'http://localhost:4000'
  const url = path.startsWith('http') ? path : `${base}${path}`
  const token = localStorage.getItem('tbn_admin_token')
  const headers = opts.headers ? { ...opts.headers } : {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    const res = await fetch(url, { ...opts, headers })
    if (res.status === 401) {
      // token expired or invalid - clear and redirect to login
      localStorage.removeItem('tbn_admin_token')
      window.location.href = '/login'
      return null
    }
    return res
  } catch (err) {
    throw err
  }
}
