/**
 * WebGL Utilities - Shared helpers for all WebGL accent effects
 */
(function () {
  'use strict';

  // Brand color palette
  var COLORS = {
    cyan: 0x1fcff1,
    purple: 0x8c01fa,
    green: 0x19fb9b,
    pink: 0xa228d4,
    yellow: 0xffd512
  };

  // Device / performance detection
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function isLowPower() {
    if (prefersReducedMotion) return true;
    var cores = navigator.hardwareConcurrency || 2;
    return isMobile && cores <= 4;
  }

  /**
   * Performance tier: 'high' | 'medium' | 'low' | 'off'
   */
  function getPerformanceTier() {
    if (prefersReducedMotion) return 'off';
    if (!isMobile) return 'high';
    if (isLowPower()) return 'low';
    return 'medium';
  }

  /**
   * Create and position a canvas inside a container element.
   * Returns { canvas, resize, destroy }
   */
  function createCanvas(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return null;

    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      var w = container.clientWidth;
      var h = container.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      return { width: w, height: h, dpr: dpr };
    }

    resize();

    var ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(function () {
        resize();
      });
      ro.observe(container);
    } else {
      window.addEventListener('resize', resize);
    }

    return {
      canvas: canvas,
      container: container,
      dpr: dpr,
      resize: resize,
      destroy: function () {
        if (ro) ro.disconnect();
        else window.removeEventListener('resize', resize);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };
  }

  /**
   * Intersection-observer based visibility control.
   * Calls onVisible(true/false) when element enters/leaves viewport.
   */
  function observeVisibility(element, onVisible) {
    if (!element) return function () {};

    if (typeof IntersectionObserver === 'undefined') {
      onVisible(true);
      return function () {};
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          onVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(element);
    return function () {
      observer.disconnect();
    };
  }

  // Export as global
  window.WebGLUtils = {
    COLORS: COLORS,
    isMobile: isMobile,
    prefersReducedMotion: prefersReducedMotion,
    isLowPower: isLowPower,
    getPerformanceTier: getPerformanceTier,
    createCanvas: createCanvas,
    observeVisibility: observeVisibility
  };
})();
