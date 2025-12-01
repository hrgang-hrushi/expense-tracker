import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'

function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await apiFetch('/api/contacts')
        if (!res) return
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setContacts(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load submissions')
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const toggleRead = async (id, current) => {
    try {
      const res = await apiFetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !current })
      })
      if (!res) return
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setContacts(prev => prev.map(c => (c._id === updated._id ? updated : c)))
    } catch (err) {
      console.error('Toggle read error', err)
      setError('Could not update')
    }
  }

  const toggleArchived = async (id, current) => {
    try {
      const res = await apiFetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !current })
      })
      if (!res) return
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setContacts(prev => prev.map(c => (c._id === updated._id ? updated : c)))
    } catch (err) {
      console.error('Toggle archived error', err)
      setError('Could not update')
    }
  }

  return (
    <div>
      <div className="data-table">
        <div className="table-header">
          <h3>Contact Submissions</h3>
        </div>

        {loading && <p>Loading…</p>}
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c._id} style={{ opacity: c.archived ? 0.5 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong>{c.fullName}</strong>
                      {c.read ? (
                        <span style={{ fontSize: 12, color: '#6b8' }}>Read</span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#f6a' }}>Unread</span>
                      )}
                      {c.archived && <span style={{ fontSize: 12, color: '#999' }}>Archived</span>}
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td style={{ maxWidth: 400 }}>{c.message || '-'}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => toggleRead(c._id, c.read)}>
                      {c.read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button className="btn-secondary" onClick={() => toggleArchived(c._id, c.archived)} style={{ marginLeft: 8 }}>
                      {c.archived ? 'Unarchive' : 'Archive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Contacts
