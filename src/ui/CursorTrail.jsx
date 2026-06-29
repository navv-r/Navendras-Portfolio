/* ── Modest cursor trail ── */
import { useEffect, useRef } from 'react';

export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#4d82ff', '#9cb88a'];
    let tickCount = 0;

    const onMove = (e) => {
      tickCount++;
      if (tickCount % 2 !== 0) return; // thin it out — modest, not a comet
      particles.push({
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 2 + 1.2,
        life: 1,
        decay: Math.random() * 0.02 + 0.03,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      if (particles.length > 60) particles.splice(0, particles.length - 60);
    };
    window.addEventListener('mousemove', onMove);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);
      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life * 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.life -= p.decay;
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-canvas" />;
}
