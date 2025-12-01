# DMV Notifier — Prototype

This is a small prototype (React + Vite) demonstrating the one-screen DMV Notifier MVP.

Quick start:

```bash
cd dmv-notifier
npm install
npm run dev
```

Open http://localhost:5173 (or the port printed by Vite).

What it includes:
- Minimal UI: search by ZIP (mocked), list of locations, notify toggle on cards.
- LocalStorage-backed notification preferences.
- A dev "Simulate event" button to emulate a slot opening (in-app alert).

Mock notification server:

Start the mock notification server (in a separate terminal):

```bash
cd dmv-notifier/server
npm install
npm start
```

By default it listens on port 4000. To simulate a slot opening and have the server broadcast to subscribed clients:

```bash
curl -X POST http://localhost:4000/emit -H 'Content-Type: application/json' -d '{"locationId":"loc-1","slot":{"id":"s-demo","start":"2025-10-27T15:00:00.000Z","bookingUrl":"https://example.com/book?slot=s-demo"}}'
```

Clients that have toggled "Notify Me" for `loc-1` will receive the `slot_open` event and see a demo notification or in-app prompt.

Notes:
- This is a UI-only prototype. Real push notifications and a backend would be added in subsequent tasks.
