# Collaborative Editor (demo)

This is a minimal front-end scaffold for a real-time collaborative code editor.

Run locally:

1. cd collab-editor
2. npm install
3. npm run dev

Notes:
- Collaboration is mocked via `useCollaboration` to simulate peers joining and cursor movement.
- The bottom toolbar is the primary place for actions and expands/collapses smoothly.
- The code editor uses `@uiw/react-codemirror` with a JS language mode.

This scaffold focuses on layout, component structure, and UX patterns rather than production networking logic.
