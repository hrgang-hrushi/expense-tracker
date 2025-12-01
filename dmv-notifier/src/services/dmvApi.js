// Mock DMV API for prototype

// A simple mock dataset organized by ZIP (pin code). Expand as needed.
const DATA_BY_ZIP = {
  '94103': [
    {
      id: 'loc-1',
      name: 'Central DMV',
      address: '123 Main St, San Francisco, CA',
      lat: 37.7749,
      lon: -122.4194,
      bookingUrl: 'https://example.com/book?loc=loc-1',
      slots: [
        { id: 's1', locationId: 'loc-1', start: new Date(Date.now() + 3600 * 1000).toISOString(), bookingUrl: 'https://example.com/book?slot=s1' },
        { id: 's2', locationId: 'loc-1', start: new Date(Date.now() + 7200 * 1000).toISOString(), bookingUrl: 'https://example.com/book?slot=s2' }
      ]
    },
    {
      id: 'loc-2',
      name: 'Northside DMV',
      address: '456 Oak Ave, San Francisco, CA',
      lat: 37.789,
      lon: -122.401,
      bookingUrl: 'https://example.com/book?loc=loc-2',
      slots: []
    }
  ],
  '10001': [
    {
      id: 'nyc-1',
      name: 'Midtown DMV',
      address: '789 W 34th St, New York, NY',
      lat: 40.7549,
      lon: -73.9840,
      bookingUrl: 'https://example.com/book?loc=nyc-1',
      slots: [
        { id: 'n1', locationId: 'nyc-1', start: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), bookingUrl: 'https://example.com/book?slot=n1' }
      ]
    }
  ]
}

export function getLocationsByZip(zip) {
  return new Promise((res) => {
    setTimeout(() => {
      if (!zip || typeof zip !== 'string' || !/^\d{5}$/.test(zip)) {
        // invalid zip -> return empty
        return res([])
      }
      const data = DATA_BY_ZIP[zip]
      if (!data) return res([])
      // return shallow clones so callers can mutate without affecting the store
      return res(data.map((d) => ({ ...d, slots: (d.slots || []).map((s) => ({ ...s })) })))
    }, 200)
  })
}

export function getSlotsForLocation(locationId) {
  for (const zip of Object.keys(DATA_BY_ZIP)) {
    const loc = DATA_BY_ZIP[zip].find((m) => m.id === locationId)
    if (loc) return new Promise((res) => setTimeout(() => res((loc.slots || []).map((s) => ({ ...s }))), 150))
  }
  return new Promise((res) => setTimeout(() => res([]), 150))
}
