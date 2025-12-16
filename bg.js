/* bg.js
   Color Bends / Colorful shader background (bundler-free)
   Lightweight implementation using three.js. It renders a fullscreen
   plane with a fragment shader inspired by reactbits Color Bends.
*/
(function(){
  if(typeof THREE === 'undefined'){
    console.warn('three.js not loaded — bg shader disabled');
    return;
  }

  const container = document.getElementById('bg-root');
  if(!container) return;

  const frag = `precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uScale;
  uniform float uFrequency;
  uniform float uWarpStrength;
  uniform vec3 uColors[3];

  void main(){
    float t = uTime * 0.4;
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= 1.7778; // preserve aspect
    vec2 q = p / max(uScale, 0.0001);
    q += 0.3 * cos(t + q.yx * uFrequency);
    vec3 col = vec3(0.0);
    float a = 0.0;
    for(int i=0;i<3;i++){
      float w = 0.5 + 0.5 * sin(3.0*float(i) + length(q) * (uWarpStrength*2.0) - t);
      col += uColors[i] * w;
      a += w;
    }
    col = col / 3.0;
    gl_FragColor = vec4(col, 1.0);
  }`;

  const vert = `varying vec2 vUv;void main(){vUv = uv;gl_Position = vec4(position,1.0);}`;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const geo = new THREE.PlaneGeometry(2,2);

  const colors = ['#454545ff','#000000ff','#464343ff'].map(hex=>{
    const h = hex.replace('#','');s
    const g = parseInt(h.substring(2,4),16)/255;
    const b = parseInt(h.substring(4,6),16)/255;
    return new THREE.Color(r,g,b);
  });

  const uniforms = {
    uTime: {value: 0},
    uPointer: {value: new THREE.Vector2(0,0)},
    uScale: {value: 1.4},
    uFrequency: {value: 1.6},
    uWarpStrength: {value: 1.2},
    uColors: {value: [colors[0], colors[1], colors[2]]}
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: uniforms,
    depthWrite: false,
    depthTest: false,
    transparent: true
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:false});
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  container.appendChild(renderer.domElement);

  function resize(){
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w,h,false);
  }
  window.addEventListener('resize', resize);
  resize();

  let last = performance.now();
  function animate(){
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    uniforms.uTime.value += dt;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // pointer move to add slight parallax
  window.addEventListener('pointermove', (e)=>{
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / (rect.width||1)) * 2 - 1;
    const y = -(((e.clientY - rect.top) / (rect.height||1)) * 2 - 1);
    uniforms.uPointer.value.set(x,y);
  });

})();
