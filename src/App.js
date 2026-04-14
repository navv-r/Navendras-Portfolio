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

/* ── Lightning Name ── */
function zigzag(x1, y1, x2, y2, segs, spread) {
  const pts = [[x1, y1]];
  for (let i = 1; i < segs; i++) {
    pts.push([
      x1 + (x2 - x1) * (i / segs) + (Math.random() - 0.5) * spread,
      y1 + (y2 - y1) * (i / segs),
    ]);
  }
  pts.push([x2, y2]);
  return pts;
}

function strokeBolt(ctx, pts, lw, color, glowColor) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineWidth   = lw;
  ctx.strokeStyle = color;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur  = 22;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.stroke();
  ctx.shadowBlur  = 0;
}

const SMOKE_PUFFS = Array.from({ length: 10 }, (_, i) => ({
  left : `${4 + i * 9.5}%`,
  delay: `${(i * 0.06).toFixed(2)}s`,
  dur  : `${(0.65 + (i % 3) * 0.18).toFixed(2)}s`,
  drift: `${(i % 2 === 0 ? -1 : 1) * (7 + (i % 4) * 6)}px`,
  size : 7 + (i % 3) * 4,
}));

function LightningName() {
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('idle');

  const flash = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const OH = wrap.offsetHeight;
    canvas.width  = wrap.offsetWidth;
    canvas.height = OH + 110;   // 110 px above the text
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d');

    // Impact point — upper half of the text
    const impactX = W * (0.25 + Math.random() * 0.5);
    const impactY = 110 + OH * 0.35;
    const originX = impactX + (Math.random() - 0.5) * 80;

    const drawOnce = () => {
      ctx.clearRect(0, 0, W, H);

      // Outer glow pass
      const p1 = zigzag(originX, 0, impactX, impactY, 14, 32);
      ctx.globalAlpha = 0.25;
      strokeBolt(ctx, p1, 14, 'rgba(80,160,255,0.3)', '#3377ff');

      // Mid pass
      const p2 = zigzag(originX, 0, impactX, impactY, 14, 22);
      ctx.globalAlpha = 0.55;
      strokeBolt(ctx, p2, 6, 'rgba(160,210,255,0.7)', '#66aaff');

      // Core bright pass
      const p3 = zigzag(originX, 0, impactX, impactY, 16, 12);
      ctx.globalAlpha = 1;
      strokeBolt(ctx, p3, 2, 'rgba(220,242,255,1)', '#aaddff');

      // Branch 1
      const bIdx1 = Math.floor(p3.length * 0.35);
      const b1 = p3[bIdx1];
      const bp1 = zigzag(b1[0], b1[1], b1[0] + (Math.random() - 0.5) * 70, b1[1] + 40 + Math.random() * 50, 7, 14);
      ctx.globalAlpha = 0.65;
      strokeBolt(ctx, bp1, 1.5, 'rgba(200,232,255,0.8)', '#88ccff');

      // Branch 2
      const bIdx2 = Math.floor(p3.length * 0.65);
      const b2 = p3[bIdx2];
      const bp2 = zigzag(b2[0], b2[1], b2[0] + (Math.random() - 0.5) * 55, b2[1] + 25 + Math.random() * 35, 6, 10);
      ctx.globalAlpha = 0.50;
      strokeBolt(ctx, bp2, 1, 'rgba(200,232,255,0.7)', '#88ccff');

      // Impact flare
      ctx.globalAlpha = 0.65;
      const flare = ctx.createRadialGradient(impactX, impactY, 0, impactX, impactY, 44);
      flare.addColorStop(0,   'rgba(255,255,255,0.95)');
      flare.addColorStop(0.3, 'rgba(180,220,255,0.55)');
      flare.addColorStop(1,   'rgba(80,160,255,0)');
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(impactX, impactY, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    // Five-pass flicker for realism
    drawOnce();
    setTimeout(drawOnce, 55);
    setTimeout(() => ctx.clearRect(0, 0, W, H), 110);
    setTimeout(drawOnce, 155);
    setTimeout(() => ctx.clearRect(0, 0, W, H), 220);
    setTimeout(drawOnce, 270);
    setTimeout(() => ctx.clearRect(0, 0, W, H), 340);
    setTimeout(drawOnce, 380);
    setTimeout(() => ctx.clearRect(0, 0, W, H), 460);
  }, []);

  useEffect(() => {
    let tid;
    let firstStrike = true;
    const cycle = () => {
      setPhase('idle');
      // First strike fires fast; subsequent idles 2.5–4s
      const idleMs = firstStrike ? 600 + Math.random() * 400 : 2500 + Math.random() * 1500;
      firstStrike = false;
      tid = setTimeout(() => {
        setPhase('prestrike');
        tid = setTimeout(() => {
          flash();
          setPhase('shock');
          tid = setTimeout(() => {
            setPhase('burnt');
            tid = setTimeout(() => {
              setPhase('smoke');
              tid = setTimeout(() => {
                setPhase('recover');
                tid = setTimeout(cycle, 400);
              }, 700);
            }, 350);
          }, 1400);
        }, 160);
      }, idleMs);
    };
    cycle();
    return () => clearTimeout(tid);
  }, [flash]);

  // Keep canvas sized to wrap
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const sync = () => {
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight + 110;
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const showSmoke = phase === 'smoke' || phase === 'burnt';
  const isAnimating = phase !== 'idle' && phase !== 'recover';

  return (
    <div ref={wrapRef} className={`lname-wrap${isAnimating ? ' lname-animating' : ''}`}>
      <canvas ref={canvasRef} className="lname-canvas" aria-hidden="true" />
      <h1 className={`hero-name lname lname--${phase}`}>
        {'Navendra Ramdhan'.split('').map((ch, i) => (
          <span key={i} className="lname-letter" style={{ '--li': i }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </h1>
      {showSmoke && (
        <div className="lname-smoke" aria-hidden="true">
          {SMOKE_PUFFS.map((p, i) => (
            <div
              key={i}
              className="smoke-puff"
              style={{
                left             : p.left,
                animationDelay   : p.delay,
                animationDuration: p.dur,
                '--sdrift'       : p.drift,
                width            : `${p.size}px`,
                height           : `${p.size}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Lightning + Code Theme Transition ── */
const ANIM_DURATION = 1350;
const CODE_CHARS  = '{}()[]<>=!&|/;:.,01#@$%~^*+-'.split('');
const CODE_TOKENS = ['const','let','fn','if','for','while','return','class',
                     '=>','===','!==','&&','||','...','/**','*/','//',
                     '0x1f','null','true','false','⚡','λ','#!','>>','<<'];

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

    // Toggle button center (fixed bottom-right)
    const OX = W - 48;
    const OY = H - 48;
    const MAX_R = Math.hypot(W, H) * 1.08;

    // ── Code rain drops ──
    const CS   = Math.max(11, Math.min(15, W / 65));
    const COLS = Math.ceil(W / CS);
    const drops = Array.from({ length: COLS }, () => -(Math.random() * H * 0.6));

    // ── Burst sparks ──
    const SPARKS = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 80 + Math.random() * 480,
      r    : 1 + Math.random() * 2.5,
    }));

    // ── Circuit traces (rectilinear L-shapes from origin) ──
    const TRACES = Array.from({ length: 22 }, () => {
      const ex = Math.random() * W;
      const ey = Math.random() * H;
      return {
        // L-shape: origin → (ex, OY) → (ex, ey)
        ex, ey,
        len  : Math.abs(ex - OX) + Math.abs(ey - OY),
        speed: 0.28 + Math.random() * 0.45,
        delay: Math.random() * 0.28,
      };
    });

    // ── Lightning bolts — regenerated every ~65ms for flicker ──
    let bolts = [];
    let lastBoltMs = 0;
    const regenBolts = () => {
      const count = mode === 'to-dark' ? 6 : 5;
      bolts = Array.from({ length: count }, () => {
        const side = Math.floor(Math.random() * 4);
        let tx, ty;
        if      (side === 0) { tx = Math.random() * W; ty = 0; }
        else if (side === 1) { tx = W; ty = Math.random() * H; }
        else if (side === 2) { tx = Math.random() * W; ty = H; }
        else                 { tx = 0; ty = Math.random() * H; }
        // Occasionally short inner bolts
        if (Math.random() < 0.35) {
          tx = OX + (Math.random() - 0.5) * W * 0.7;
          ty = OY + (Math.random() - 0.5) * H * 0.7;
        }
        return {
          pts  : zigzag(OX, OY, tx, ty, 10 + Math.floor(Math.random() * 7), 38),
          alpha: 0.45 + Math.random() * 0.55,
        };
      });
    };
    regenBolts();

    // ── Terminal lines (to-light) ──
    const TERM = [
      '> theme.compile("light")',
      '> resolving: #edf2ff palette... ✓',
      '> wiring:    lightning.css...  ⚡',
      '> render()   complete          ✓',
    ];

    let t0 = null;
    let themeFlipped = false;
    let rafId;

    const drawBolt = (pts, lw, color, glow, glowBlur) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.lineWidth   = lw;
      ctx.strokeStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur  = glowBlur;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.stroke();
      ctx.shadowBlur  = 0;
    };

    const frame = (ts) => {
      if (!t0) t0 = ts;
      const t = Math.min((ts - t0) / ANIM_DURATION, 1);

      if (!themeFlipped && t >= 0.42) { themeFlipped = true; onThemeChange(); }

      // Regen bolts every 65ms
      if (ts - lastBoltMs > 65) { lastBoltMs = ts; regenBolts(); }

      ctx.clearRect(0, 0, W, H);

      const expandT  = Math.min(t / 0.62, 1);
      const r        = MAX_R * easeOutCubicFn(expandT);
      const fadeT    = t > 0.72 ? (t - 0.72) / 0.28 : 0;
      const baseAlpha = Math.max(0, 1 - easeInCubicFn(fadeT));
      ctx.globalAlpha = baseAlpha;

      /* ── Burst sparks (both) ── */
      const burstT = Math.min(t / 0.45, 1);
      const sc = mode === 'to-dark' ? '140,128,255' : '100,158,255';
      for (const p of SPARKS) {
        const dist = p.speed * easeOutCubicFn(burstT);
        const px   = OX + Math.cos(p.angle) * dist;
        const py   = OY + Math.sin(p.angle) * dist;
        const a    = (1 - burstT) * 0.88;
        if (a < 0.02) continue;
        ctx.beginPath();
        ctx.arc(px, py, p.r * (1 - burstT * 0.4), 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(${sc},${a})`;
        ctx.shadowColor = `rgb(${sc})`;
        ctx.shadowBlur  = 7;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      if (mode === 'to-dark') {
        /* ══════════ LIGHTNING STORM COLLAPSE ══════════ */

        ctx.save();
        ctx.beginPath();
        ctx.arc(OX, OY, r, 0, Math.PI * 2);
        ctx.clip();

        // Dark void background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, W, H);

        // Circuit-board L-traces growing from origin
        for (const tr of TRACES) {
          if (t < tr.delay) continue;
          const tp  = Math.min((t - tr.delay) / tr.speed, 1);
          if (tp <= 0) continue;
          const drawn = tp * tr.len;
          const seg1  = Math.abs(tr.ex - OX);
          const seg2  = Math.abs(tr.ey - OY);

          ctx.beginPath();
          ctx.moveTo(OX, OY);
          if (drawn <= seg1) {
            ctx.lineTo(OX + (tr.ex - OX) * (drawn / (seg1 || 1)), OY);
          } else {
            ctx.lineTo(tr.ex, OY);
            const rem = drawn - seg1;
            ctx.lineTo(tr.ex, OY + (tr.ey - OY) * Math.min(rem / (seg2 || 1), 1));
          }
          const trA = 0.55 * Math.sin(tp * Math.PI);
          ctx.strokeStyle = `rgba(108,99,255,${trA})`;
          ctx.lineWidth   = 0.85;
          ctx.shadowColor = '#6c63ff';
          ctx.shadowBlur  = 5;
          ctx.stroke();
          ctx.shadowBlur  = 0;

          // Travelling dot at the head
          if (tp < 0.99) {
            let hx, hy;
            if (drawn <= seg1) {
              hx = OX + (tr.ex - OX) * (drawn / (seg1 || 1));
              hy = OY;
            } else {
              hx = tr.ex;
              hy = OY + (tr.ey - OY) * Math.min((drawn - seg1) / (seg2 || 1), 1);
            }
            ctx.beginPath();
            ctx.arc(hx, hy, 2.2, 0, Math.PI * 2);
            ctx.fillStyle   = `rgba(200,195,255,${trA * 1.4})`;
            ctx.shadowColor = '#aaddff';
            ctx.shadowBlur  = 8;
            ctx.fill();
            ctx.shadowBlur  = 0;
          }
        }

        // Syntax code rain
        ctx.font = `${CS}px "JetBrains Mono",monospace`;
        const rainA = Math.min(t * 3, 1) * 0.9;
        for (let i = 0; i < COLS; i++) {
          const cx2 = i * CS;
          if (drops[i] < -CS || drops[i] > H + CS) { drops[i] += CS * 0.5; continue; }
          const useWord = Math.random() < 0.1;
          const ch = useWord
            ? CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)]
            : CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
          if (Math.hypot(cx2 + CS / 2 - OX, drops[i] - OY) <= r) {
            ctx.fillStyle = `rgba(220,210,255,${rainA})`;
            ctx.fillText(ch, cx2, drops[i]);
            for (let j = 1; j <= 6; j++) {
              const ty2 = drops[i] - j * CS;
              if (ty2 < 0 || Math.hypot(cx2 + CS / 2 - OX, ty2 - OY) > r) continue;
              const tc = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
              const ta = (1 - j / 7) * rainA * (j === 1 ? 0.7 : j === 2 ? 0.45 : 0.22);
              ctx.fillStyle = j <= 2
                ? `rgba(162,155,254,${ta})`
                : `rgba(108,99,255,${ta})`;
              ctx.fillText(tc, cx2, ty2);
            }
          }
          drops[i] += CS * 0.52;
          if (drops[i] > H + CS * 5) drops[i] = -(CS * (2 + Math.random() * 5));
        }

        // Lightning bolts radiating from origin
        if (t > 0.04 && t < 0.78) {
          const bA = Math.min((t - 0.04) / 0.18, 1) * (1 - Math.max((t - 0.58) / 0.2, 0));
          ctx.save();
          ctx.globalAlpha = baseAlpha * bA;
          for (const bolt of bolts) {
            const pts = bolt.pts.filter(([bx, by]) => Math.hypot(bx - OX, by - OY) <= r);
            if (pts.length < 2) continue;
            drawBolt(pts, 7,   `rgba(108,99,255,${bolt.alpha * 0.25})`, '#6c63ff', 18);
            drawBolt(pts, 2.5, `rgba(162,155,254,${bolt.alpha * 0.7})`, '#a09bfe', 10);
            drawBolt(pts, 1,   `rgba(220,215,255,${bolt.alpha * 0.95})`, '#c8c4ff', 5);
          }
          ctx.restore();
        }

        // Initial purple flash
        if (t < 0.1) {
          ctx.fillStyle = `rgba(180,170,255,${(1 - t / 0.1) * 0.75})`;
          ctx.fillRect(0, 0, W, H);
        }

        ctx.restore();

        // Purple crackling boundary ring
        if (expandT < 1) {
          const rw = Math.min(55, r * 0.12);
          const gr = ctx.createRadialGradient(OX, OY, r - rw, OX, OY, r + 12);
          const iA = 0.68 * (1 - expandT * 0.7);
          gr.addColorStop(0,    'rgba(108,99,255,0)');
          gr.addColorStop(0.35, `rgba(108,99,255,${iA})`);
          gr.addColorStop(0.72, `rgba(200,195,255,${iA * 1.35})`);
          gr.addColorStop(1,    'rgba(108,99,255,0)');
          ctx.beginPath();
          ctx.arc(OX, OY, r, 0, Math.PI * 2);
          ctx.strokeStyle = gr;
          ctx.lineWidth   = rw + 10;
          ctx.stroke();
          // Dashed lightning arc
          ctx.beginPath();
          ctx.arc(OX, OY, r + 17, 0, Math.PI * 2);
          ctx.strokeStyle    = `rgba(162,155,254,${0.38 * (1 - expandT)})`;
          ctx.lineWidth      = 2;
          ctx.setLineDash([4, 10]);
          ctx.lineDashOffset = -ts * 0.14;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Outside: glitch scanlines
        if (expandT < 0.95) {
          for (let g = 0, ng = Math.floor(5 * t); g < ng; g++) {
            const gy = (H * (g + 1)) / (ng + 1) + Math.sin(ts * 0.02 + g) * 10;
            ctx.fillStyle = `rgba(108,99,255,${0.09 * Math.random()})`;
            ctx.fillRect(Math.sin(ts * 0.01 + g) * 28, gy, W * (0.08 + 0.32 * Math.random()), 1.5);
          }
        }

      } else {
        /* ══════════ COMPILE BURST ══════════ */

        ctx.save();
        ctx.beginPath();
        ctx.arc(OX, OY, r, 0, Math.PI * 2);
        ctx.clip();

        // Light blue background
        ctx.fillStyle = '#edf2ff';
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(70,110,255,0.07)';
        ctx.lineWidth   = 0.6;
        for (let gx = 0; gx < W; gx += 44) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
        for (let gy = 0; gy < H; gy += 44) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

        // Floating code tokens drifting upward
        ctx.font = `${CS}px "JetBrains Mono",monospace`;
        const numTok = Math.floor(40 * Math.min(t * 3, 1));
        for (let i = 0; i < numTok; i++) {
          const seed = i * 97.3;
          const lx   = (Math.sin(seed * 0.5) * 0.5 + 0.5) * W;
          const ly   = (Math.cos(seed * 0.8) * 0.5 + 0.5) * H - t * 95;
          if (Math.hypot(lx - OX, ly - OY) > r * 0.95) continue;
          const tok  = CODE_TOKENS[i % CODE_TOKENS.length];
          const tokA = 0.22 + 0.28 * Math.abs(Math.sin(ts * 0.004 + i));
          ctx.fillStyle   = `rgba(91,114,255,${tokA})`;
          ctx.shadowColor = '#5b72ff';
          ctx.shadowBlur  = 4;
          ctx.fillText(tok, lx, ly);
          ctx.shadowBlur  = 0;
        }

        // Blue-white lightning bolts
        if (t > 0.05 && t < 0.72) {
          const bA = Math.min((t - 0.05) / 0.15, 1) * (1 - Math.max((t - 0.54) / 0.18, 0));
          ctx.save();
          ctx.globalAlpha = baseAlpha * bA;
          for (const bolt of bolts) {
            const pts = bolt.pts.filter(([bx, by]) => Math.hypot(bx - OX, by - OY) <= r);
            if (pts.length < 2) continue;
            drawBolt(pts, 9,   `rgba(80,140,255,${bolt.alpha * 0.22})`,  '#5b72ff', 22);
            drawBolt(pts, 2.8, `rgba(140,190,255,${bolt.alpha * 0.65})`, '#88bbff', 12);
            drawBolt(pts, 1.2, `rgba(220,235,255,${bolt.alpha * 0.95})`, '#c8e0ff', 5);
          }
          ctx.restore();
        }

        // Terminal compile output (typewriter)
        if (t > 0.22 && t < 0.93) {
          const tT  = (t - 0.22) / 0.71;
          const tx2 = 32, ty2 = H * 0.18, lh = 22;
          ctx.font = `13px "JetBrains Mono",monospace`;
          for (let li = 0; li < TERM.length; li++) {
            const ls = li / TERM.length;
            const le = (li + 1) / TERM.length;
            if (tT < ls) break;
            const lt      = Math.min((tT - ls) / (le - ls), 1);
            const visible = TERM[li].slice(0, Math.floor(lt * TERM[li].length));
            const a       = Math.min(tT * 3.5, 0.82);
            ctx.fillStyle   = `rgba(22,16,60,${a})`;
            ctx.shadowColor = '#5b72ff';
            ctx.shadowBlur  = li === TERM.length - 1 ? 7 : 0;
            ctx.fillText(visible, tx2, ty2 + li * lh);
            // Cursor on active line
            const activeLine = Math.min(Math.floor(tT * TERM.length), TERM.length - 1);
            if (li === activeLine && Math.floor(lt * TERM[li].length) < TERM[li].length) {
              if (Math.floor(ts / 220) % 2 === 0) {
                const cw = ctx.measureText(visible).width;
                ctx.fillStyle = `rgba(91,114,255,${a})`;
                ctx.fillRect(tx2 + cw, ty2 + li * lh - 13, 7, 14);
              }
            }
          }
          ctx.shadowBlur = 0;
        }

        // Blue-white compile flash at start
        if (t < 0.13) {
          ctx.fillStyle = `rgba(180,210,255,${(1 - t / 0.13) * 0.7})`;
          ctx.fillRect(0, 0, W, H);
        }

        ctx.restore();

        // Sweeping blue scan lines
        for (const [off, spd] of [[0, 0.85], [0.55, 0.6]]) {
          const sy = ((t * spd + off) % 1) * H;
          const sg = ctx.createLinearGradient(0, sy - 32, 0, sy + 32);
          const sA = 0.18 * (1 - fadeT);
          sg.addColorStop(0,    'rgba(91,114,255,0)');
          sg.addColorStop(0.45, `rgba(91,114,255,${sA})`);
          sg.addColorStop(0.5,  `rgba(180,205,255,${sA * 1.5})`);
          sg.addColorStop(0.55, `rgba(91,114,255,${sA})`);
          sg.addColorStop(1,    'rgba(91,114,255,0)');
          ctx.fillStyle = sg;
          ctx.fillRect(0, sy - 32, W, 64);
        }

        // Blue boundary ring
        if (expandT < 1) {
          const rw = Math.min(60, r * 0.12);
          const gr = ctx.createRadialGradient(OX, OY, r - rw, OX, OY, r + 18);
          const iA = 0.72 * (1 - expandT * 0.65);
          gr.addColorStop(0,    'rgba(91,114,255,0)');
          gr.addColorStop(0.3,  `rgba(91,114,255,${iA})`);
          gr.addColorStop(0.65, `rgba(180,210,255,${iA * 1.3})`);
          gr.addColorStop(1,    'rgba(91,114,255,0)');
          ctx.beginPath();
          ctx.arc(OX, OY, r, 0, Math.PI * 2);
          ctx.strokeStyle = gr;
          ctx.lineWidth   = rw + 8;
          ctx.stroke();
          // Dashed outer arc
          ctx.beginPath();
          ctx.arc(OX, OY, r + 20, 0, Math.PI * 2);
          ctx.strokeStyle    = `rgba(100,160,255,${0.3 * (1 - expandT)})`;
          ctx.lineWidth      = 1.5;
          ctx.setLineDash([6, 14]);
          ctx.lineDashOffset = ts * 0.14;
          ctx.stroke();
          ctx.setLineDash([]);
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
          <LightningName />
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
