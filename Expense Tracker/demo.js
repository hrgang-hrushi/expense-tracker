(() => {
  // Bundler-free demo derived from ColorBends shader
  const MAX_COLORS = 8;

  const frag = `#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer; // in NDC [-1,1]
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-6.0 / exp(6.0 * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-6.0 / exp(6.0 * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}`;

  const vert = `varying vec2 vUv;void main(){vUv = uv;gl_Position = vec4(position,1.0);}`;

  const container = document.getElementById('demo-root');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const geometry = new THREE.PlaneGeometry(2,2);

  const defaultColors = ["#ff5c7a","#8a5cff","#00ffd1"];
  const toVec3 = (hex) => {
    const h = hex.replace('#','').trim();
    const v = (h.length===3)
      ? [parseInt(h[0]+h[0],16),parseInt(h[1]+h[1],16),parseInt(h[2]+h[2],16)]
      : [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
    return new THREE.Vector3(v[0]/255,v[1]/255,v[2]/255);
  };

  const uColorsArray = Array.from({length:MAX_COLORS},()=>new THREE.Vector3(0,0,0));
  const arr = defaultColors.map(toVec3);
  for (let i=0;i<MAX_COLORS;i++){ if(i<arr.length) uColorsArray[i].copy(arr[i]); }

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uCanvas: {value: new THREE.Vector2(1,1)},
      uTime: {value:0},
      uSpeed: {value:0.3},
      uRot: {value: new THREE.Vector2(1,0)},
      uColorCount: {value: arr.length},
      uColors: {value: uColorsArray},
      uTransparent: {value:1},
      uScale: {value:1.2},
      uFrequency: {value:1.4},
      uWarpStrength: {value:1.2},
      uPointer: {value: new THREE.Vector2(0,0)},
      uMouseInfluence: {value:0.8},
      uParallax: {value:0.6},
      uNoise: {value:0.08}
    },
    transparent: true,
    premultipliedAlpha: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setClearColor(0x000000,0);
  container.appendChild(renderer.domElement);

  function resize(){
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w,h,false);
    material.uniforms.uCanvas.value.set(w,h);
  }
  window.addEventListener('resize', resize);
  resize();

  let last = performance.now();
  function animate(){
    const now = performance.now();
    const dt = (now-last)/1000;
    last = now;
    material.uniforms.uTime.value += dt;
    // rotate a bit
    const deg = (30 % 360);
    const rad = deg * Math.PI / 180;
    material.uniforms.uRot.value.set(Math.cos(rad), Math.sin(rad));
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // pointer
  container.addEventListener('pointermove', (e)=>{
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX-rect.left)/(rect.width||1))*2 - 1;
    const y = -(((e.clientY-rect.top)/(rect.height||1))*2 -1);
    material.uniforms.uPointer.value.set(x,y);
  });

})();
