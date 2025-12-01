import React, { useState, useEffect } from 'react'
import { NotificationProvider, useNotifications } from './contexts/NotificationProvider'
import LocationPicker from './components/LocationPicker'
import LocationCard from './components/LocationCard'
import { getLocationsByZip } from './services/dmvApi'

function LocationsList({ searchZip }) {
  const [locations, setLocations] = useState([])
  const { prefs, registerPref, unregisterPref, simulateEventFor } = useNotifications()

  useEffect(() => {
    if (!searchZip) {
      setLocations([])
      return
    }
    let mounted = true
    getLocationsByZip(searchZip).then((res) => {
      if (mounted) setLocations(res)
    })
    return () => (mounted = false)
  }, [searchZip])

  return (
    <div className="locations-list">
      {locations.map((loc) => (
        <LocationCard
          key={loc.id}
          location={loc}
          isNotifying={!!prefs[loc.id]?.enabled}
          onToggle={(enabled) => (enabled ? registerPref(loc.id) : unregisterPref(loc.id))}
        />
      ))}
      {locations.length === 0 && <div className="empty">No locations — try a different zip</div>}

      <div className="dev-actions">
        <button
          className="btn muted"
          onClick={() => {
            // quick dev helper: simulate an open event for the first location
            if (locations[0]) simulateEventFor(locations[0].id)
          }}
        >
          Simulate event for first location
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [zip, setZip] = useState('94103')
  const [searchZip, setSearchZip] = useState('94103')

  return (
    <NotificationProvider>
      <div className="app-root">
        <header className="header">
          <h1>DMV Notifier</h1>
          <LocationPicker
            zip={zip}
            onZipChange={setZip}
            onSearch={() => setSearchZip(zip)}
          />
        </header>

        <main>
          <LocationsList searchZip={searchZip} />
        </main>

        <footer className="footer">Unofficial DMV Data Source — demo prototype</footer>
      </div>
    </NotificationProvider>
  )
}
