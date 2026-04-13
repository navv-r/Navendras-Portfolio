import { useCallback, useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  SiHtml5, SiCss, SiJavascript, SiTypescript,
  SiReact, SiNextdotjs, SiRedux, SiNodedotjs,
} from 'react-icons/si';
import './App.css';

/* ── EmailJS config — replace these three values ── */
const EJS_SERVICE_ID  = 'service_g1pstsc';
const EJS_TEMPLATE_ID = 'template_qhlj3ro';
const EJS_PUBLIC_KEY  = 'VwH5xvKzzdxR_BhUd';

/* ── Project data ── */
const PROJECTS = [
  {
    title: 'Summarist Internship',
    desc: 'A Next.js audiobook platform with user authentication, book browsing, personal collections, in-app audio playback, and a premium subscription tier.',
    color: '#2dc96e',
    label: 'Summarist',
    link: 'https://advanced-tech-internship.vercel.app/',
    image: '/summarist.png',
  },
  {
    title: 'NFT Marketplace Internship',
    desc: 'A React-based NFT auction platform where users can browse trending and personalised listings, place bids, and track live countdown timers showing each NFT\'s remaining availability.',
    color: '#7c5cbf',
    label: 'NFT Market',
    link: 'https://navendra-internship.vercel.app/',
    image: '/nft.png',
  },
  {
    title: 'Movie Finder Clone Project',
    desc: 'A vanilla JavaScript movie search app that lets users find any film by title or keyword, with a sorting dropdown for quick and easy browsing.',
    color: '#9e9e9e',
    label: 'Movie Finder',
    link: 'https://react-final-project-ruddy-five.vercel.app/',
    image: '/movie.png',
  },
  {
    title: 'Skinstric Internship',
    desc: 'An AI-powered skincare platform built in React with Tailwind CSS. Users capture or upload a photo and receive demographic, gender, and age analysis via an AI endpoint API.',
    color: '#c8c8c8',
    label: 'Skinstric',
    link: 'https://skinstric-internship-pi.vercel.app',
    image: '/skinstric.png',
  },
];

/* ── Cursor trail ── */
function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    let mouse = { x: -200, y: -200 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#6c63ff', '#00b894', '#a29bfe', '#00cec9', '#fd79a8'];

    const onMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      mouse = { x, y };
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.2;
        const size = Math.random() * 3 + 1;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const type = Math.random() < 0.3 ? 'hex' : 'dot';
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          life: 1,
          decay: Math.random() * 0.025 + 0.018,
          size, color, type,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.12,
        });
      }
    };
    window.addEventListener('mousemove', onMove);

    const onTouch = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      onMove({ clientX: touch.clientX, clientY: touch.clientY });
    };
    window.addEventListener('touchmove', onTouch, { passive: true });

    const drawHex = (ctx, x, y, r) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        i === 0 ? ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
                : ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
      }
      ctx.closePath();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 18);
      grad.addColorStop(0, 'rgba(108,99,255,0.35)');
      grad.addColorStop(1, 'rgba(108,99,255,0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#a29bfe';
      ctx.fill();

      particles = particles.filter(p => p.life > 0);
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.type === 'hex') {
          drawHex(ctx, 0, 0, p.size * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.8;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
        }
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.vy += 0.02;
        p.life -= p.decay; p.rotation += p.rotSpeed; p.size *= 0.97;
      }
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-canvas" />;
}

/* ── Typewriter ── */
function TypeWriter({ words }) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const word = words[wordIndex];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        const next = word.slice(0, text.length + 1);
        setText(next);
        if (next === word) setIsPaused(true);
      } else {
        const next = word.slice(0, text.length - 1);
        setText(next);
        if (next === '') { setIsDeleting(false); setWordIndex(i => (i + 1) % words.length); }
      }
    }, isDeleting ? 40 : 85);
    return () => clearTimeout(timer);
  }, [text, isDeleting, isPaused, wordIndex, words]);

  useEffect(() => {
    if (!isPaused) return;
    const timer = setTimeout(() => { setIsPaused(false); setIsDeleting(true); }, 1800);
    return () => clearTimeout(timer);
  }, [isPaused]);

  return <span>{text}<span className="tw-cursor">|</span></span>;
}

/* ── Scramble label ── */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

function ScrambleLabel({ text }) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(null);

  const scramble = () => {
    let iter = 0;
    const totalFrames = text.length * 4;
    cancelAnimationFrame(frameRef.current);
    const tick = () => {
      setDisplay(
        text.split('').map((char, i) =>
          i < Math.floor(iter / 4)
            ? char
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        ).join('')
      );
      iter++;
      if (iter <= totalFrames) frameRef.current = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const reset = () => { cancelAnimationFrame(frameRef.current); setDisplay(text); };

  return (
    <span className="techstack-label" onMouseEnter={scramble} onMouseLeave={reset}>
      {display}
    </span>
  );
}

/* ── Letter fly animation ── */
function LetterFly() {
  return (
    <div className="letter-stage">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="speed-streak"
          style={{
            top: `${56 + (i - 4) * 5}%`,
            animationDelay: `${0.22 + i * 0.04}s`,
            width: `${30 + Math.round(Math.sin(i) * 15 + 20)}%`,
            opacity: 0.4 + (i % 3) * 0.15,
          }}
        />
      ))}
      <div className="letter-envelope">
        <div className="letter-glow" />
        <svg width="76" height="60" viewBox="0 0 76 60" fill="none">
          {/* Body */}
          <rect x="1" y="16" width="74" height="43" rx="5" fill="var(--surface)" stroke="#6c63ff" strokeWidth="1.8"/>
          {/* Bottom left fold */}
          <line x1="1" y1="59" x2="34" y2="37" stroke="#6c63ff" strokeWidth="1.2" strokeOpacity="0.4"/>
          {/* Bottom right fold */}
          <line x1="75" y1="59" x2="42" y2="37" stroke="#6c63ff" strokeWidth="1.2" strokeOpacity="0.4"/>
          {/* Flap crease */}
          <path d="M1 16 L38 38 L75 16" fill="none" stroke="#6c63ff" strokeWidth="1.8"/>
          {/* Open flap */}
          <path className="envelope-flap" d="M1 16 L38 1 L75 16" fill="#6c63ff" fillOpacity="0.18" stroke="#6c63ff" strokeWidth="1.8"/>
          {/* Wax seal */}
          <circle cx="38" cy="37" r="6" fill="#6c63ff" fillOpacity="0.45"/>
          <circle cx="38" cy="37" r="3" fill="#a29bfe"/>
        </svg>
        {/* Dotted trail */}
        <div className="letter-trail">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="trail-dot" style={{ animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Scroll reveal ── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── CountUp ── */
function CountUp({ target, duration }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  const ms = duration ?? Math.max(600, Math.min(target * 6, 1800));

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / ms, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick);
          else setCount(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, ms]);

  return <span ref={ref}>{count}+</span>;
}

/* ── Sci-Fi Theme Transition ── */
const ANIM_DURATION = 1400;
const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ@#$%&[]<>|/\\'.split('');

function easeOutCubicFn(t) { return 1 - Math.pow(1 - t, 3); }
function easeInCubicFn(t)  { return t * t * t; }

function SciFiTransition({ mode, onThemeChange, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const W = (canvas.width  = window.innerWidth);
    const H = (canvas.height = window.innerHeight);

    // Toggle button center (fixed bottom-right 24px, 48×48)
    const OX = W - 48;
    const OY = H - 48;
    const MAX_R = Math.hypot(W, H) * 1.08;

    // Matrix rain (to-dark)
    const CS  = Math.max(13, Math.min(18, W / 55));
    const COLS = Math.ceil(W / CS);
    const drops = Array.from({ length: COLS }, () => -(Math.random() * H));

    // Burst particles (both modes)
    const BURST = Array.from({ length: 70 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 80 + Math.random() * 500,
      r    : 1.2 + Math.random() * 2.8,
      hue  : mode === 'to-dark'
        ? 230 + Math.random() * 50
        : 170 + Math.random() * 70,
    }));

    // Scan lines (to-light)
    const SCANS = Array.from({ length: 6 }, (_, i) => ({
      offset: i / 6,
      speed : 0.6 + Math.random() * 0.5,
    }));

    // Glitch bars (to-dark)
    const GLITCH = Array.from({ length: 8 }, () => ({
      y     : Math.random() * H,
      w     : 60 + Math.random() * 260,
      x     : Math.random() * W,
      startT: 0.05 + Math.random() * 0.35,
      dur   : 0.06 + Math.random() * 0.1,
    }));

    let t0 = null;
    let themeFlipped = false;
    let rafId;

    const frame = (ts) => {
      if (!t0) t0 = ts;
      const t = Math.min((ts - t0) / ANIM_DURATION, 1);

      if (!themeFlipped && t >= 0.42) { themeFlipped = true; onThemeChange(); }

      ctx.clearRect(0, 0, W, H);

      const expandT  = Math.min(t / 0.60, 1);
      const r        = MAX_R * easeOutCubicFn(expandT);
      const fadeT    = t > 0.72 ? (t - 0.72) / 0.28 : 0;
      ctx.globalAlpha = Math.max(0, 1 - easeInCubicFn(fadeT));

      /* ── shared: burst particles ── */
      const burstT = Math.min(t / 0.5, 1);
      for (const p of BURST) {
        const dist = p.speed * easeOutCubicFn(burstT);
        const px = OX + Math.cos(p.angle) * dist;
        const py = OY + Math.sin(p.angle) * dist;
        const a  = (1 - burstT) * 0.85;
        if (a <= 0.01) continue;
        ctx.beginPath();
        ctx.arc(px, py, p.r * (1 - burstT * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},78%,65%,${a})`;
        ctx.shadowColor = `hsl(${p.hue},78%,65%)`;
        ctx.shadowBlur  = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (mode === 'to-dark') {
        /* ══════════════ VOID COLLAPSE ══════════════ */

        // Dark expanding circle with contents
        ctx.save();
        ctx.beginPath();
        ctx.arc(OX, OY, r, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, W, H);

        // Subtle hex grid
        const HS = 38;
        ctx.strokeStyle = 'rgba(108,99,255,0.13)';
        ctx.lineWidth = 0.6;
        for (let row = -1; row * HS * 1.5 < H + HS; row++) {
          for (let col = -1; col * HS * 1.73 < W + HS; col++) {
            const hx = col * HS * 1.73 + (row % 2 === 0 ? 0 : HS * 0.865);
            const hy = row * HS * 1.5;
            if (Math.hypot(hx - OX, hy - OY) > r + HS) continue;
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
              const a = (Math.PI / 3) * k - Math.PI / 6;
              k === 0
                ? ctx.moveTo(hx + HS * 0.48 * Math.cos(a), hy + HS * 0.48 * Math.sin(a))
                : ctx.lineTo(hx + HS * 0.48 * Math.cos(a), hy + HS * 0.48 * Math.sin(a));
            }
            ctx.closePath();
            ctx.stroke();
          }
        }

        // Matrix rain
        ctx.font = `${CS}px "JetBrains Mono",monospace`;
        for (let i = 0; i < COLS; i++) {
          const cx2 = i * CS;
          for (let j = 0; j < 18; j++) {
            const cy2 = drops[i] - j * CS;
            if (cy2 < -CS || cy2 > H) continue;
            // rough circle clip check
            if (Math.hypot(cx2 - OX, cy2 - OY) > r) continue;
            const char  = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            const alpha = (1 - j / 18) * Math.min(t * 2.5, 1) * 0.85;
            ctx.fillStyle = j === 0
              ? `rgba(220,210,255,${alpha})`
              : j < 4
              ? `rgba(162,155,254,${alpha})`
              : `rgba(108,99,255,${alpha * 0.65})`;
            ctx.fillText(char, cx2, cy2);
          }
          drops[i] += CS * 0.45;
          if (drops[i] > H + CS * 12) drops[i] = -(CS * (4 + Math.random() * 8));
        }

        // Glitch horizontal bars
        for (const g of GLITCH) {
          if (t > g.startT && t < g.startT + g.dur) {
            const lt = (t - g.startT) / g.dur;
            ctx.fillStyle = `rgba(108,99,255,${0.55 * Math.sin(lt * Math.PI)})`;
            ctx.fillRect(g.x, g.y, g.w, 2);
            ctx.fillStyle = `rgba(0,184,148,${0.35 * Math.sin(lt * Math.PI)})`;
            ctx.fillRect(g.x + 8, g.y + 2, g.w * 0.6, 1);
          }
        }

        // Constellation dots inside void
        const numDots = Math.floor(80 * Math.min(t * 3, 1));
        for (let d = 0; d < numDots; d++) {
          const seed = d * 137.508;
          const dx = (Math.sin(seed * 0.7) * 0.5 + 0.5) * W;
          const dy = (Math.cos(seed * 0.3) * 0.5 + 0.5) * H;
          if (Math.hypot(dx - OX, dy - OY) > r * 0.92) continue;
          const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(ts * 0.003 + d));
          ctx.beginPath();
          ctx.arc(dx, dy, 0.8 + (d % 3) * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,190,255,${twinkle * 0.7})`;
          ctx.fill();
        }

        ctx.restore();

        // Neon ring at boundary edge
        if (expandT < 1) {
          const rw  = Math.min(55, r * 0.12);
          const gr  = ctx.createRadialGradient(OX, OY, r - rw, OX, OY, r + 12);
          const iA  = 0.65 * (1 - expandT * 0.7);
          gr.addColorStop(0,   'rgba(108,99,255,0)');
          gr.addColorStop(0.35,`rgba(108,99,255,${iA})`);
          gr.addColorStop(0.7, `rgba(162,155,254,${iA * 1.3})`);
          gr.addColorStop(1,   'rgba(108,99,255,0)');
          ctx.beginPath();
          ctx.arc(OX, OY, r, 0, Math.PI * 2);
          ctx.strokeStyle = gr;
          ctx.lineWidth   = rw + 10;
          ctx.stroke();

          // Secondary outer electric arc ring
          ctx.beginPath();
          ctx.arc(OX, OY, r + 18, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,184,148,${0.3 * (1 - expandT)})`;
          ctx.lineWidth   = 2;
          ctx.setLineDash([6, 14]);
          ctx.lineDashOffset = -ts * 0.12;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Outside glitch scanlines
        if (expandT < 0.95) {
          const ng = Math.floor(6 * t);
          for (let g = 0; g < ng; g++) {
            const gy = (H * (g + 1)) / (ng + 1) + Math.sin(ts * 0.02 + g) * 12;
            ctx.fillStyle = `rgba(108,99,255,${0.12 * Math.random()})`;
            ctx.fillRect(Math.sin(ts * 0.01 + g) * 30, gy, W * (0.1 + 0.4 * Math.random()), 1.5);
          }
        }

      } else {
        /* ══════════════ PHOTON SURGE ══════════════ */

        // Bright expanding circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(OX, OY, r, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = '#f5f5f8';
        ctx.fillRect(0, 0, W, H);

        // Grid lines
        const GS = 44;
        ctx.strokeStyle = 'rgba(108,99,255,0.07)';
        ctx.lineWidth   = 0.6;
        for (let gx = 0; gx < W; gx += GS) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
        }
        for (let gy = 0; gy < H; gy += GS) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
        }

        // Sweeping scan lines
        for (const sc of SCANS) {
          const sy  = ((t * sc.speed + sc.offset) % 1) * H;
          const sg  = ctx.createLinearGradient(0, sy - 35, 0, sy + 35);
          const sA  = 0.22 * (1 - fadeT);
          sg.addColorStop(0,   'rgba(108,99,255,0)');
          sg.addColorStop(0.45,`rgba(108,99,255,${sA})`);
          sg.addColorStop(0.5, `rgba(162,155,254,${sA * 1.4})`);
          sg.addColorStop(0.55,`rgba(108,99,255,${sA})`);
          sg.addColorStop(1,   'rgba(108,99,255,0)');
          ctx.fillStyle = sg;
          ctx.fillRect(0, sy - 35, W, 70);
        }

        // Light data particles
        const numLP = Math.floor(50 * Math.min(t * 2.5, 1));
        for (let d = 0; d < numLP; d++) {
          const seed = d * 113.7;
          const lx   = (Math.sin(seed * 0.5 + ts * 0.001) * 0.5 + 0.5) * W;
          const ly   = (Math.cos(seed * 0.8) * 0.5 + 0.5) * H - (t * 80);
          if (Math.hypot(lx - OX, ly - OY) > r * 0.95) continue;
          ctx.beginPath();
          ctx.arc(lx, ly, 1 + (d % 3) * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(108,99,255,${0.4 + 0.4 * Math.abs(Math.sin(ts * 0.004 + d))})`;
          ctx.shadowColor = '#6c63ff';
          ctx.shadowBlur  = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();

        // Lens flare rays from origin
        if (expandT < 0.9) {
          const numRays = 20;
          for (let i = 0; i < numRays; i++) {
            const angle   = (i / numRays) * Math.PI * 2 + ts * 0.0005;
            const rayLen  = r * 1.4;
            const rayAlpha = 0.18 * (1 - expandT) * (1 - fadeT);
            if (rayAlpha < 0.005) continue;
            ctx.save();
            ctx.translate(OX, OY);
            ctx.rotate(angle);
            const rg = ctx.createLinearGradient(0, 0, rayLen, 0);
            rg.addColorStop(0,   `rgba(162,155,254,${rayAlpha * 2.5})`);
            rg.addColorStop(0.25,`rgba(162,155,254,${rayAlpha})`);
            rg.addColorStop(1,   'rgba(162,155,254,0)');
            const rw2 = 6 + Math.sin(ts * 0.008 + i * 0.7) * 3;
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.moveTo(0, -rw2 * 0.5);
            ctx.lineTo(rayLen, 0);
            ctx.lineTo(0, rw2 * 0.5);
            ctx.fill();
            ctx.restore();
          }
        }

        // Energy ring at boundary
        if (expandT < 1) {
          const rw  = Math.min(65, r * 0.13);
          const gr  = ctx.createRadialGradient(OX, OY, r - rw, OX, OY, r + 18);
          const iA  = 0.7 * (1 - expandT * 0.65);
          gr.addColorStop(0,   'rgba(0,184,148,0)');
          gr.addColorStop(0.3, `rgba(0,184,148,${iA})`);
          gr.addColorStop(0.65,`rgba(108,99,255,${iA * 1.2})`);
          gr.addColorStop(1,   'rgba(108,99,255,0)');
          ctx.beginPath();
          ctx.arc(OX, OY, r, 0, Math.PI * 2);
          ctx.strokeStyle = gr;
          ctx.lineWidth   = rw + 8;
          ctx.stroke();

          // Electric dashed outer ring
          ctx.beginPath();
          ctx.arc(OX, OY, r + 22, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,184,148,${0.28 * (1 - expandT)})`;
          ctx.lineWidth   = 1.5;
          ctx.setLineDash([8, 12]);
          ctx.lineDashOffset = ts * 0.15;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Outside: brief bright halo vignette on existing page
        if (expandT < 0.8) {
          const vg = ctx.createRadialGradient(OX, OY, r * 0.9, OX, OY, r * 1.6);
          vg.addColorStop(0, 'rgba(255,255,255,0)');
          vg.addColorStop(1, `rgba(255,255,255,${0.12 * (1 - expandT)})`);
          ctx.fillStyle = vg;
          ctx.fillRect(0, 0, W, H);
        }
      }

      ctx.globalAlpha = 1;

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        onComplete();
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [mode, onThemeChange, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99998,
      }}
    />
  );
}

/* ── Theme toggle button ── */
function ThemeToggle({ darkMode, onToggle, activating }) {
  return (
    <button
      className={`theme-toggle${activating ? ' theme-toggle--activating' : ''}`}
      onClick={onToggle}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        /* Sun icon — shown in dark mode to switch to light */
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2"  x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="4.22" y1="4.22"  x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
          <line x1="2"  y1="12" x2="5"  y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Crescent moon icon — shown in light mode to switch to dark */
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
      )}
    </button>
  );
}

/* ── App ── */
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dir, setDir] = useState('right');
  const [commitCount, setCommitCount] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true;
  });
  const [transition, setTransition] = useState(null); // 'to-dark' | 'to-light' | null
  const [toggleActivating, setToggleActivating] = useState(false);

  const toggleTheme = () => {
    if (transition) return;
    const mode = darkMode ? 'to-light' : 'to-dark';
    setToggleActivating(true);
    setTimeout(() => setToggleActivating(false), 600);
    setTransition(mode);
  };

  const handleTransitionThemeChange = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setTransition(null);
  }, []);

  useEffect(() => {
    fetch('/stats.json')
      .then(r => r.json())
      .then(data => setCommitCount(data.commits))
      .catch(() => {});
  }, []);

  // Contact form
  const formRef = useRef(null);
  const [formData, setFormData] = useState({ from_name: '', from_email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    try {
      await emailjs.sendForm(EJS_SERVICE_ID, EJS_TEMPLATE_ID, formRef.current, EJS_PUBLIC_KEY);
      setFormData({ from_name: '', from_email: '', subject: '', message: '' });
      setFormStatus('flying');
      setTimeout(() => {
        setFormStatus('success');
        setTimeout(() => setFormStatus('idle'), 5000);
      }, 1600);
    } catch {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  const handleField = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }));

  useScrollReveal();

  const handleNavClick = () => setMenuOpen(false);

  const next = () => { setDir('right'); setActiveIdx(i => (i + 1) % PROJECTS.length); };
  const prev = () => { setDir('left');  setActiveIdx(i => (i - 1 + PROJECTS.length) % PROJECTS.length); };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') { setDir('right'); setActiveIdx(i => (i + 1) % PROJECTS.length); }
      if (e.key === 'ArrowLeft')  { setDir('left');  setActiveIdx(i => (i - 1 + PROJECTS.length) % PROJECTS.length); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Project card slot calculation
  const getSlot = (i) => {
    const n = PROJECTS.length;
    const diff = ((i - activeIdx) % n + n) % n;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right';
    if (diff === n - 1) return 'left';
    return dir === 'right' ? 'hidden-left' : 'hidden-right';
  };

  // Touch swipe for carousel
  const touchStartX = useRef(null);
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) { delta > 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  const handleTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const rotX = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -8;
    const rotY = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 8;
    card.style.transition = 'transform 0.05s, box-shadow 0.25s';
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.01)`;
  };

  const resetTilt = (e) => {
    e.currentTarget.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s';
    e.currentTarget.style.transform = '';
  };

  return (
    <div className={`portfolio${darkMode ? '' : ' light-mode'}`}>
      <CursorTrail />
      {transition && (
        <SciFiTransition
          mode={transition}
          onThemeChange={handleTransitionThemeChange}
          onComplete={handleTransitionComplete}
        />
      )}
      <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} activating={toggleActivating} />
      <nav className="nav">
        <div className="nav-logo">NR</div>
        <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
          <li><a href="#about" onClick={handleNavClick}>About</a></li>
          <li><a href="#skills" onClick={handleNavClick}>Tech Stack</a></li>
          <li><a href="#projects" onClick={handleNavClick}>Projects</a></li>
          <li><a href="#contact" onClick={handleNavClick}>Contact</a></li>
        </ul>
        <button
          className={`burger${menuOpen ? ' burger--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-greeting">Hi, I'm</p>
          <h1 className="hero-name">Navendra Ramdhan</h1>
          <h2 className="hero-title">
            <TypeWriter words={['Front End Developer', 'React Developer', 'UI Engineer', 'Creative Coder']} />
          </h2>
          <p className="hero-sub">I build clean, performant web experiences.</p>
          <div className="hero-buttons">
            <a href="#projects" className="btn btn-primary">View My Work</a>
            <a href="#contact" className="btn btn-outline">Get In Touch</a>
          </div>
        </div>
        <div className="hero-blob" />
      </section>

      {/* About */}
      <section className="section" id="about">
        <h2 className="section-title reveal">About Me</h2>
        <div className="about-grid reveal" style={{ transitionDelay: '0.12s' }}>
          <div className="about-avatar">
            <img src="/profile.jpeg" alt="Navendra Ramdhan" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
          <div className="about-terminal">
            <div className="terminal-bar">
              <span className="t-dot t-dot--r" />
              <span className="t-dot t-dot--y" />
              <span className="t-dot t-dot--g" />
              <span className="terminal-bar-title">nav@portfolio:~/about</span>
            </div>
            <div className="terminal-body">
              <div className="t-line t-line--1">
                <span className="t-prompt">$</span>
                <span className="t-cmd">whoami</span>
              </div>
              <div className="t-output t-line--2">
                Front-end developer based in Queens, NY — passionate about building cool, interactive web experiences and bringing creative ideas to life through code.
              </div>
              <div className="t-line t-line--3">
                <span className="t-prompt">$</span>
                <span className="t-cmd">cat interests.txt</span>
              </div>
              <div className="t-output t-line--4">
                Musician at heart — I play Dholak and Tassa, instruments rooted in my cultural heritage. That same rhythm and creativity drives everything I build.
              </div>
              <div className="t-line t-line--5">
                <span className="t-prompt">$</span>
                <span className="t-cmd">cat passion.txt</span>
              </div>
              <div className="t-output t-line--6">
                Deeply passionate about crafting seamless web experiences and pushing boundaries with AI integration — whether that's smart interfaces, generative features, or tools that make users feel like they're living in the future.
              </div>
              <div className="t-line t-line--7">
                <span className="t-cursor" />
              </div>
            </div>
            <div className="about-stats">
              <div className="stat">
                <span className="stat-num"><CountUp target={1} /></span>
                <span>Years Exp.</span>
              </div>
              <div className="stat">
                <span className="stat-num"><CountUp target={5} /></span>
                <span>Projects</span>
              </div>
              <div className="stat">
                <span className="stat-num">
                  {commitCount !== null ? <CountUp target={commitCount} /> : '...'}
                </span>
                <span>Commits Pushed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section section-alt" id="skills">
        <h2 className="section-title reveal">Tech Stack</h2>
        <div className="techstack-grid">
          {[
            { label: 'HTML',       icon: <SiHtml5      color="#e34f26" /> },
            { label: 'CSS',        icon: <SiCss        color="#1572b6" /> },
            { label: 'JavaScript', icon: <SiJavascript color="#f7df1e" /> },
            { label: 'TypeScript', icon: <SiTypescript color="#3178c6" /> },
            { label: 'React',      icon: <SiReact      color="#61dafb" /> },
            { label: 'Next.js',    icon: <SiNextdotjs  color="#ffffff" /> },
            { label: 'Redux',      icon: <SiRedux      color="#764abc" /> },
            { label: 'Node.js',    icon: <SiNodedotjs  color="#3c873a" /> },
          ].map(({ label, icon }, i) => (
            <div
              className="techstack-item reveal"
              key={label}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <span className="techstack-icon" style={{ animationDelay: `${i * 0.22}s` }}>{icon}</span>
              <ScrambleLabel text={label} />
            </div>
          ))}
        </div>
      </section>

      {/* Projects — Carousel */}
      <section className="section" id="projects">
        <h2 className="section-title reveal">Projects</h2>

        <div className="carousel-outer reveal" style={{ transitionDelay: '0.1s' }}>
          {/* Prev button */}
          <button className="carousel-btn carousel-btn--prev" onClick={prev} aria-label="Previous project">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Track */}
          <div className="carousel-track" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {PROJECTS.map(({ title, desc, color, label, link, image }, i) => {
              const slot = getSlot(i);
              return (
                <div
                  key={title}
                  className="carousel-card"
                  data-slot={slot}
                  style={{ '--card-color': color }}
                  onClick={
                    slot === 'left'   ? prev :
                    slot === 'right'  ? next :
                    undefined
                  }
                  onMouseMove={slot === 'center' ? handleTilt : undefined}
                  onMouseLeave={slot === 'center' ? resetTilt : undefined}
                >
                  {image ? (
                    <div className="project-thumb project-thumb--img" style={{ borderBottom: `1px solid ${color}44` }}>
                      <img src={image} alt={title} className="project-thumb-img" />
                      <div className="project-thumb-scanline" />
                      <div className="project-thumb-shine" />
                    </div>
                  ) : (
                    <div className="project-thumb" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, borderBottom: `1px solid ${color}44` }}>
                      <div className="project-thumb-icon" style={{ color }}>
                        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <span className="project-thumb-label" style={{ color }}>{label}</span>
                    </div>
                  )}
                  <div className="project-body" style={{ borderTop: `2px solid ${color}55` }}>
                    <h3 style={{ color }}>{title}</h3>
                    <p>{desc}</p>

                    {slot === 'center' && link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="carousel-visit-btn"
                        style={{ color, borderColor: `${color}77` }}
                      >
                        Visit Project ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next button */}
          <button className="carousel-btn carousel-btn--next" onClick={next} aria-label="Next project">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="carousel-dots reveal" style={{ transitionDelay: '0.2s' }}>
          {PROJECTS.map(({ color }, i) => (
            <button
              key={i}
              className={`carousel-dot${i === activeIdx ? ' carousel-dot--active' : ''}`}
              onClick={() => { setDir(i > activeIdx ? 'right' : 'left'); setActiveIdx(i); }}
              style={i === activeIdx ? { background: color, boxShadow: `0 0 12px ${color}99` } : {}}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="section section-alt" id="contact">
        <h2 className="section-title reveal">Get In Touch</h2>
        <div className="contact-wrapper reveal" style={{ transitionDelay: '0.15s' }}>
          <p className="contact-sub">
            I'm currently open to new opportunities. Whether you have a question or just
            want to say hi, my inbox is always open!
          </p>

          {formStatus === 'flying' && <LetterFly />}

          {formStatus === 'success' ? (
            <div className="form-feedback form-feedback--success">
                <div className="success-icon-wrap">
                  <svg className="success-check" width="56" height="56" viewBox="0 0 52 52" fill="none">
                    <circle className="success-circle" cx="26" cy="26" r="24" stroke="#2dc96e" strokeWidth="2.5" />
                    <polyline className="success-tick" points="14,26 22,34 38,18" stroke="#2dc96e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="success-ring" />
                </div>
                <h3 className="success-title">Message sent!</h3>
                <p>Thanks for reaching out — I'll get back to you soon.</p>
              </div>
          ) : (
            <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  name="from_name"
                  placeholder="Your Name"
                  value={formData.from_name}
                  onChange={handleField('from_name')}
                  required
                  disabled={formStatus === 'sending'}
                />
                <input
                  type="email"
                  name="from_email"
                  placeholder="Your Email"
                  value={formData.from_email}
                  onChange={handleField('from_email')}
                  required
                  disabled={formStatus === 'sending'}
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleField('subject')}
                disabled={formStatus === 'sending'}
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={5}
                value={formData.message}
                onChange={handleField('message')}
                required
                disabled={formStatus === 'sending'}
              />

              {formStatus === 'error' && (
                <p className="form-error">Something went wrong — please try again.</p>
              )}

              <button
                type="submit"
                className={`btn btn-primary${formStatus === 'sending' ? ' btn--sending' : ''}`}
                disabled={formStatus === 'sending'}
              >
                {formStatus === 'sending' ? (
                  <><span className="btn-spinner" /> Sending…</>
                ) : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="footer">
        <p>Designed & Built by Navendra Ramdhan &mdash; {new Date().getFullYear()}</p>
        <div className="footer-links">
          <a href="https://github.com/navv-r" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
