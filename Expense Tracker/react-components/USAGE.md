Install
-------

CLI / Manual

pnpm
npm
yarn
bun

Example (add the helper package via npx):

```bash
npx shadcn@latest add @react-bits/BlurText-JS-CSS
```

Usage
-----

1. Import and use the component in your React app:

```jsx
import BlurText from "./react-components/BlurText";

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

<BlurText
  text="Isn't this so cool?!"
  delay={150}
  animateBy="words"
  direction="top"
  onAnimationComplete={handleAnimationComplete}
  className="text-2xl mb-8"
/>
```

Notes
-----
- The component uses `motion/react` for animation. Install a compatible Motion library (for example `motion` / `framer-motion` depending on your stack). Example:

```bash
npm install motion
```

- The component file is at `react-components/BlurText.jsx`. Import it into any React component and pass the props shown above.

- The implementation uses the browser `IntersectionObserver` to trigger the animation when the element enters view.
