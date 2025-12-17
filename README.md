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

ClickSpark effect
- A lightweight click-spark effect is available. It is initialized in [index.html](index.html) and implemented in [click-spark.js](click-spark.js).
- To attach it to a different element, edit the inline script near the bottom of [index.html](index.html#L1) and change `document.querySelector('main.container')` to your target selector.
- Options: `sparkColor`, `sparkSize`, `sparkRadius`, `sparkCount`, `duration`, `easing` (`linear|ease-in|ease-in-out|ease-out`), `extraScale`.

LiquidEther effect
- A Three.js-based fluid effect is included. See [liquid-ether.js](liquid-ether.js) and [liquid-ether.css](liquid-ether.css). It mounts onto the container in [index.html](index.html) with id `liquid-ether`.
- To mount on a different element, change the selector in the inline init (`document.getElementById('liquid-ether')`) and ensure the element has an explicit height.
- Options: `colors`, `mouseForce`, `cursorSize`, `isViscous`, `viscous`, `iterationsViscous`, `iterationsPoisson`, `dt`, `BFECC`, `resolution`, `isBounce`, `autoDemo`, `autoSpeed`, `autoIntensity`, `takeoverDuration`, `autoResumeDelay`, `autoRampDuration`.
