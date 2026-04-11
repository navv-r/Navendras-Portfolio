import { useEffect, useRef, useState } from 'react';
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

/* ── App ── */
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dir, setDir] = useState('right');
  const [commitCount, setCommitCount] = useState(null);

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
    <div className="portfolio">
      <CursorTrail />
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
