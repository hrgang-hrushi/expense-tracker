/*
  ClickSpark (Vanilla JS)
  Usage:
    const instance = ClickSpark.attach(element, {
      sparkColor: '#fff', sparkSize: 10, sparkRadius: 15,
      sparkCount: 8, duration: 400, easing: 'ease-out', extraScale: 1.0
    });
    // instance.detach() to remove
*/

(function () {
  function ease(t, mode) {
    switch (mode) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default: // ease-out
        return t * (2 - t);
    }
  }

  function attach(element, options) {
    if (!element) throw new Error('ClickSpark: element is required');

    var opts = Object.assign({
      sparkColor: '#fff',
      sparkSize: 10,
      sparkRadius: 15,
      sparkCount: 8,
      duration: 400,
      easing: 'ease-out',
      extraScale: 1.0,
      lineWidth: 2
    }, options || {});

    // Ensure parent can position overlay
    var computed = window.getComputedStyle(element);
    if (computed.position === 'static') {
      element.style.position = 'relative';
    }

    var canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.userSelect = 'none';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    element.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var sparks = [];
    var animationId = null;
    var resizeTimeout = null;
    var ro = null;

    function resizeCanvas() {
      var rect = element.getBoundingClientRect();
      var width = Math.floor(rect.width);
      var height = Math.floor(rect.height);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    function handleResize() {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    }

    // Observe parent size changes
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handleResize);
      ro.observe(element);
    }
    resizeCanvas();

    function draw(timestamp) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var duration = opts.duration;
      var easingMode = opts.easing;
      var sparkColor = opts.sparkColor;
      var sparkSize = opts.sparkSize;
      var sparkRadius = opts.sparkRadius;
      var extraScale = opts.extraScale;

      sparks = sparks.filter(function (spark) {
        var elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        var progress = elapsed / duration;
        var eased = ease(progress, easingMode);

        var distance = eased * sparkRadius * extraScale;
        var lineLength = sparkSize * (1 - eased);

        var x1 = spark.x + distance * Math.cos(spark.angle);
        var y1 = spark.y + distance * Math.sin(spark.angle);
        var x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        var y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = opts.lineWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      animationId = window.requestAnimationFrame(draw);
    }

    animationId = window.requestAnimationFrame(draw);

    function onClick(e) {
      var rect = element.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var now = performance.now();
      var count = opts.sparkCount;
      var newSparks = new Array(count).fill(0).map(function (_, i) {
        return {
          x: x,
          y: y,
          angle: (2 * Math.PI * i) / count,
          startTime: now
        };
      });
      sparks.push.apply(sparks, newSparks);
    }

    element.addEventListener('click', onClick, { passive: true });

    function detach() {
      element.removeEventListener('click', onClick);
      if (animationId) window.cancelAnimationFrame(animationId);
      if (ro) ro.disconnect();
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    return { detach: detach };
  }

  window.ClickSpark = { attach: attach };
})();
