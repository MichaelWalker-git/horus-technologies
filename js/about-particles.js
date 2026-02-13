/**
 * About Section - Ambient Upward-Drifting Particles
 * Tiny data motes that fade in at the bottom and out at the top.
 * Uses Three.js with custom ShaderMaterial.
 */
(function () {
  'use strict';

  var Utils = window.WebGLUtils;
  if (!Utils) return;

  var tier = Utils.getPerformanceTier();
  // Disabled entirely on low tier and off
  if (tier === 'off' || tier === 'low') return;

  var PARTICLE_COUNTS = { high: 60, medium: 30 };
  var particleCount = PARTICLE_COUNTS[tier] || 30;

  var container = document.getElementById('about-canvas-container');
  if (!container) return;

  var aboutSection = container.closest('.about');
  if (!aboutSection) return;

  // Three.js setup
  var width = container.clientWidth;
  var height = container.clientHeight;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(0, width, 0, height, -100, 100);
  camera.position.z = 10;

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Particle data
  var positions = new Float32Array(particleCount * 3);
  var opacities = new Float32Array(particleCount);
  var particleSizes = new Float32Array(particleCount);
  var speeds = [];

  for (var i = 0; i < particleCount; i++) {
    positions[i * 3] = Math.random() * width;
    positions[i * 3 + 1] = Math.random() * height;
    positions[i * 3 + 2] = 0;

    opacities[i] = 0.2 + Math.random() * 0.3;
    particleSizes[i] = 1 + Math.random() * 2;
    speeds.push(0.2 + Math.random() * 0.5);
  }

  var geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('alpha', new THREE.BufferAttribute(opacities, 1));
  geom.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

  var mat = new THREE.ShaderMaterial({
    uniforms: {
      uHeight: { value: height }
    },
    vertexShader: [
      'attribute float alpha;',
      'attribute float size;',
      'uniform float uHeight;',
      'varying float vAlpha;',
      'void main() {',
      '  float y = position.y;',
      '  float fadeIn = smoothstep(0.0, uHeight * 0.15, y);',
      '  float fadeOut = 1.0 - smoothstep(uHeight * 0.85, uHeight, y);',
      '  vAlpha = alpha * fadeIn * fadeOut;',
      '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
      '  gl_PointSize = size * 2.0;',
      '  gl_Position = projectionMatrix * mvPosition;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying float vAlpha;',
      'void main() {',
      '  float d = length(gl_PointCoord - vec2(0.5));',
      '  if (d > 0.5) discard;',
      '  float soft = 1.0 - smoothstep(0.1, 0.5, d);',
      '  gl_FragColor = vec4(0.75, 0.85, 0.9, vAlpha * soft);',
      '}'
    ].join('\n'),
    transparent: true,
    depthWrite: false
  });

  var points = new THREE.Points(geom, mat);
  scene.add(points);

  var isVisible = false;
  var animId = null;

  function animate() {
    if (!isVisible) {
      animId = null;
      return;
    }
    animId = requestAnimationFrame(animate);

    var posArr = geom.attributes.position.array;

    for (var i = 0; i < particleCount; i++) {
      var iy = i * 3 + 1;
      posArr[iy] += speeds[i];

      // Tiny horizontal drift
      posArr[i * 3] += Math.sin(posArr[iy] * 0.01 + i) * 0.1;

      // Reset to bottom when reaching top
      if (posArr[iy] > height + 10) {
        posArr[iy] = -10;
        posArr[i * 3] = Math.random() * width;
      }
    }
    geom.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  // Visibility control
  Utils.observeVisibility(aboutSection, function (visible) {
    isVisible = visible;
    if (visible && !animId) animate();
  });

  // Resize handling
  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.right = width;
    camera.bottom = height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    mat.uniforms.uHeight.value = height;
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(onResize).observe(container);
  } else {
    window.addEventListener('resize', onResize);
  }
})();
