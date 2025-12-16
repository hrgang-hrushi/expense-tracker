Little Standards — local static copy

This folder contains a small static replica of the Framer page so you can run it locally.

How to run

1. From the repository root, open a terminal and run:

   cd framer-site-local
   npm start

2. Then open http://localhost:5000 in your browser.

Notes
- The page is a hand-made static copy with a client-side expense list stored in localStorage.
- If you want to serve on a different port, set PORT in the environment before running, e.g. `PORT=3000 npm start`.
   
Install

CLI / Manual

pnpm, npm, yarn, bun or npx

```bash
# install (example using npm)
npm install three
npm install --save react react-dom
```

Add the ColorBends component files which are included in `src/ColorBends.jsx` and `src/ColorBends.css`.

Quick usage (React)

```jsx
import ColorBends from './src/ColorBends';

<ColorBends
   colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
   rotation={30}
   speed={0.3}
   scale={1.2}
   frequency={1.4}
   warpStrength={1.2}
   mouseInfluence={0.8}
   parallax={0.6}
   noise={0.08}
   transparent
/>
```

Notes
- The component depends on `three` and React. If your project uses a bundler (Vite, webpack, CRA) ensure `three` is installed and available.
- The shader supports up to 8 colors; pass fewer colors to use defaults.
