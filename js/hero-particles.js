/**
 * Hero Section - Interactive Particle Network
 * Uses Three.js with OrthographicCamera for 2D-like positioning.
 * Particles form shifting constellations with mouse repulsion.
 */
(function () {
  'use strict';

  var Utils = window.WebGLUtils;
  if (!Utils) return;

  var tier = Utils.getPerformanceTier();
  if (tier === 'off') return;

  // Particle counts by tier
  var PARTICLE_COUNTS = { high: 180, medium: 100, low: 50 };
  var particleCount = PARTICLE_COUNTS[tier] || 100;
  var showLines = tier !== 'low';
  var enableMouse = tier !== 'low';
  var LINE_DISTANCE = 120;
  var MAX_LINES = tier === 'high' ? 300 : 150;

  var container = document.getElementById('hero-canvas-container');
  if (!container) return;

  var heroSection = container.closest('.hero');
  if (!heroSection) return;

  // Three.js setup
  var scene = new THREE.Scene();
  var width = container.clientWidth;
  var height = container.clientHeight;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var camera = new THREE.OrthographicCamera(0, width, 0, height, -100, 100);
  camera.position.z = 10;

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Mark hero as WebGL-active
  heroSection.classList.add('webgl-active');

  // Brand colors for particles
  var palette = [
    new THREE.Color(Utils.COLORS.cyan),
    new THREE.Color(Utils.COLORS.purple),
    new THREE.Color(Utils.COLORS.green),
    new THREE.Color(Utils.COLORS.pink)
  ];

  // Particle data arrays
  var positions = new Float32Array(particleCount * 3);
  var colors = new Float32Array(particleCount * 3);
  var sizes = new Float32Array(particleCount);
  var velocities = [];

  for (var i = 0; i < particleCount; i++) {
    // Bias particles toward the right half
    var x = width * (0.3 + Math.random() * 0.7);
    var y = Math.random() * height;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = 0;

    var color = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = 2 + Math.random() * 3;

    // Slow orbital drift
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.15 + Math.random() * 0.35;
    velocities.push({
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    });
  }

  // Points geometry
  var pointsGeom = new THREE.BufferGeometry();
  pointsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointsGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  pointsGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  var pointsMat = new THREE.ShaderMaterial({
    vertexShader: [
      'attribute float size;',
      'varying vec3 vColor;',
      'void main() {',
      '  vColor = color;',
      '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
      '  gl_PointSize = size * 2.0;',
      '  gl_Position = projectionMatrix * mvPosition;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vColor;',
      'void main() {',
      '  float d = length(gl_PointCoord - vec2(0.5));',
      '  if (d > 0.5) discard;',
      '  float alpha = 1.0 - smoothstep(0.2, 0.5, d);',
      '  gl_FragColor = vec4(vColor, alpha * 0.8);',
      '}'
    ].join('\n'),
    transparent: true,
    vertexColors: true,
    depthWrite: false
  });

  var points = new THREE.Points(pointsGeom, pointsMat);
  scene.add(points);

  // Connection lines
  var lineGeom, lineMat, lineSegments;
  if (showLines) {
    lineGeom = new THREE.BufferGeometry();
    var linePositions = new Float32Array(MAX_LINES * 6);
    var lineColors = new Float32Array(MAX_LINES * 6);
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    lineGeom.setDrawRange(0, 0);

    lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });

    lineSegments = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(lineSegments);
  }

  // Mouse tracking
  var mouse = { x: -9999, y: -9999 };
  if (enableMouse) {
    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

  var isVisible = false;
  var animId = null;

  function animate() {
    if (!isVisible) {
      animId = null;
      return;
    }
    animId = requestAnimationFrame(animate);

    var posArr = pointsGeom.attributes.position.array;

    for (var i = 0; i < particleCount; i++) {
      var ix = i * 3;
      var iy = i * 3 + 1;

      posArr[ix] += velocities[i].vx;
      posArr[iy] += velocities[i].vy;

      // Wrap around edges with padding
      if (posArr[ix] < -20) posArr[ix] = width + 20;
      if (posArr[ix] > width + 20) posArr[ix] = -20;
      if (posArr[iy] < -20) posArr[iy] = height + 20;
      if (posArr[iy] > height + 20) posArr[iy] = -20;

      // Mouse repulsion
      if (enableMouse && mouse.x > -9000) {
        var dx = posArr[ix] - mouse.x;
        var dy = posArr[iy] - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          var force = (150 - dist) / 150 * 2;
          posArr[ix] += (dx / dist) * force;
          posArr[iy] += (dy / dist) * force;
        }
      }
    }
    pointsGeom.attributes.position.needsUpdate = true;

    // Update connection lines
    if (showLines) {
      var lPos = lineGeom.attributes.position.array;
      var lCol = lineGeom.attributes.color.array;
      var lineCount = 0;

      for (var a = 0; a < particleCount && lineCount < MAX_LINES; a++) {
        for (var b = a + 1; b < particleCount && lineCount < MAX_LINES; b++) {
          var ax = posArr[a * 3];
          var ay = posArr[a * 3 + 1];
          var bx = posArr[b * 3];
          var by = posArr[b * 3 + 1];

          var ddx = ax - bx;
          var ddy = ay - by;
          var d2 = ddx * ddx + ddy * ddy;

          if (d2 < LINE_DISTANCE * LINE_DISTANCE) {
            var li = lineCount * 6;
            lPos[li] = ax;
            lPos[li + 1] = ay;
            lPos[li + 2] = 0;
            lPos[li + 3] = bx;
            lPos[li + 4] = by;
            lPos[li + 5] = 0;

            var alpha = 1 - Math.sqrt(d2) / LINE_DISTANCE;
            // Use first particle's color
            lCol[li] = colors[a * 3] * alpha;
            lCol[li + 1] = colors[a * 3 + 1] * alpha;
            lCol[li + 2] = colors[a * 3 + 2] * alpha;
            lCol[li + 3] = colors[b * 3] * alpha;
            lCol[li + 4] = colors[b * 3 + 1] * alpha;
            lCol[li + 5] = colors[b * 3 + 2] * alpha;

            lineCount++;
          }
        }
      }
      lineGeom.setDrawRange(0, lineCount * 2);
      lineGeom.attributes.position.needsUpdate = true;
      lineGeom.attributes.color.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  // Visibility control
  Utils.observeVisibility(heroSection, function (visible) {
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
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(onResize).observe(container);
  } else {
    window.addEventListener('resize', onResize);
  }
})();
