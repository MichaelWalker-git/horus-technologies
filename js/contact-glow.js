/**
 * Contact Section - Mouse Glow Trail
 * 2D Canvas API implementation (no Three.js needed).
 * Soft glowing orb follows the mouse with an eased delay,
 * colors shift between green and purple.
 */
(function () {
  'use strict';

  var Utils = window.WebGLUtils;
  if (!Utils) return;

  // Skip entirely on mobile (no mouse = no effect) or reduced motion
  if (Utils.isMobile || Utils.prefersReducedMotion) return;

  var canvas = document.getElementById('contact-glow-canvas');
  if (!canvas) return;

  var contactSection = canvas.closest('.contact');
  if (!contactSection) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width, height;

  function resize() {
    width = contactSection.clientWidth;
    height = contactSection.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  // Mouse state
  var mouse = { x: -9999, y: -9999 };
  var glow = { x: -9999, y: -9999 };
  var isHovering = false;

  contactSection.addEventListener('mousemove', function (e) {
    var rect = contactSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    isHovering = true;
  });

  contactSection.addEventListener('mouseleave', function () {
    isHovering = false;
  });

  // Trail history (last N positions for fading trail)
  var trail = [];
  var TRAIL_LENGTH = 8;

  var isVisible = false;
  var animId = null;
  var time = 0;

  function animate() {
    if (!isVisible) {
      animId = null;
      return;
    }
    animId = requestAnimationFrame(animate);
    time += 0.015;

    ctx.clearRect(0, 0, width, height);

    if (!isHovering) {
      // Fade out trail
      if (trail.length > 0) {
        trail.length = Math.max(0, trail.length - 1);
        drawTrail();
      }
      return;
    }

    // Ease glow toward mouse
    glow.x += (mouse.x - glow.x) * 0.08;
    glow.y += (mouse.y - glow.y) * 0.08;

    // Store trail point
    trail.push({ x: glow.x, y: glow.y, t: time });
    if (trail.length > TRAIL_LENGTH) trail.shift();

    drawTrail();

    // Main glow orb
    var colorT = (Math.sin(time * 2) + 1) / 2;
    var r = Math.round(25 + colorT * (140 - 25));
    var g = Math.round(251 + colorT * (1 - 251));
    var b = Math.round(155 + colorT * (250 - 155));

    var gradient = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 75);
    gradient.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ', 0.4)');
    gradient.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ', 0.1)');
    gradient.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ', 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(glow.x, glow.y, 75, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTrail() {
    for (var i = 0; i < trail.length; i++) {
      var p = trail[i];
      var age = (time - p.t);
      var alpha = Math.max(0, 0.15 - age * 0.3);
      if (alpha <= 0) continue;

      var colorT = (Math.sin(p.t * 2) + 1) / 2;
      var r = Math.round(25 + colorT * (140 - 25));
      var g = Math.round(251 + colorT * (1 - 251));
      var b = Math.round(155 + colorT * (250 - 155));

      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 50);
      grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')');
      grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ', 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 50, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Visibility control
  Utils.observeVisibility(contactSection, function (visible) {
    isVisible = visible;
    if (visible && !animId) animate();
  });

  // Resize handling
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(contactSection);
  } else {
    window.addEventListener('resize', resize);
  }
})();
