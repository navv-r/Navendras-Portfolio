/* ════════════════════════════════════════════════════════════════
   ScratchReveal — hides its children behind an animated dotted grid
   that ripples like an ocean. The visitor swipes their cursor (or
   finger) across it to erase the cover and reveal the text beneath;
   once `threshold` (70%) of the area is cleared, the rest auto-reveals
   and stays revealed for the rest of the session.
   ════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from 'react';

export default function ScratchReveal({ children, threshold = 0.7, className = '' }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { revealedRef.current = true; setRevealed(true); return; }

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');

    // offscreen mask: white where the user has erased
    const mask = document.createElement('canvas');
    const mctx = mask.getContext('2d');
    // small canvas used only to measure how much has been erased
    const sample = document.createElement('canvas');
    const sctx = sample.getContext('2d');

    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = null;
    let moveCount = 0;

    // cover colors, re-read so a theme toggle is reflected
    let baseColor = '#0f2750';
    let accentRGB = '76, 240, 111';
    const readColors = () => {
      const cs = getComputedStyle(canvas);
      baseColor = (cs.getPropertyValue('--card') || baseColor).trim();
      accentRGB = (cs.getPropertyValue('--accent-rgb') || accentRGB).trim();
    };

    const resize = () => {
      W = wrap.offsetWidth;
      H = wrap.offsetHeight;
      if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mask.width = W; mask.height = H;
      const ss = 70;                       // sample resolution
      sample.width = ss; sample.height = Math.max(1, Math.round((H / W) * ss));
    };

    // ── erase a soft circle into the mask, interpolating from last point ──
    let last = null;
    const stamp = (x, y) => {
      const rad = Math.max(26, Math.min(W, H) * 0.085);
      const g = mctx.createRadialGradient(x, y, 0, x, y, rad);
      // softer falloff = feathered edges, so trails blend smoothly
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.55, 'rgba(255,255,255,0.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      mctx.fillStyle = g;
      mctx.beginPath();
      mctx.arc(x, y, rad, 0, Math.PI * 2);
      mctx.fill();
    };
    const erase = (x, y) => {
      if (last) {
        const dx = x - last.x, dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.ceil(dist / 4);   // denser stamps = smoother stroke
        for (let i = 1; i <= steps; i++) stamp(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
      } else {
        stamp(x, y);
      }
      last = { x, y };
    };

    const coverage = () => {
      sctx.clearRect(0, 0, sample.width, sample.height);
      sctx.drawImage(mask, 0, 0, sample.width, sample.height);
      const data = sctx.getImageData(0, 0, sample.width, sample.height).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 40) cleared++;
      return cleared / (sample.width * sample.height);
    };

    const onMove = (e) => {
      if (revealedRef.current) return;
      const r = canvas.getBoundingClientRect();
      erase(e.clientX - r.left, e.clientY - r.top);
      if (++moveCount % 4 === 0 && coverage() >= threshold) {
        revealedRef.current = true;
        setRevealed(true);
      }
    };
    const onLeave = () => { last = null; };

    // ── the ocean of dots ──
    const draw = (tMs) => {
      const t = tMs / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, W, H);

      const s = 13;
      for (let y = -s; y <= H + s; y += s) {
        for (let x = 0; x <= W + s; x += s) {
          const wave = Math.sin(x * 0.045 + t * 1.1)
                     + Math.sin(y * 0.06 + t * 1.5)
                     + Math.sin((x + y) * 0.028 + t * 0.8);
          const n = (wave + 3) / 6;             // 0..1
          const oy = wave * 3;
          const rad = 1 + n * 1.5;
          ctx.beginPath();
          ctx.arc(x, y + oy, rad, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${accentRGB}, ${0.28 + n * 0.55})`;
          ctx.fill();
        }
      }

      // punch the erased holes through the cover
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(mask, 0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';

      if (!revealedRef.current) raf = requestAnimationFrame(draw);
    };

    readColors();
    resize();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => { if (!revealedRef.current) resize(); });
    ro.observe(wrap);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    const colorTimer = setInterval(readColors, 500);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(colorTimer);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [threshold]);

  return (
    <div className={`scratch ${className}`} ref={wrapRef}>
      <div className="scratch-under">{children}</div>
      <canvas
        ref={canvasRef}
        className={`scratch-cover${revealed ? ' scratch-cover--gone' : ''}`}
        aria-hidden="true"
      />
    </div>
  );
}
