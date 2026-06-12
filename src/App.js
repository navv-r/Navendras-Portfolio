import { useEffect, useRef, useState } from 'react';
import {
  SiHtml5, SiCss, SiJavascript, SiTypescript,
  SiReact, SiNextdotjs, SiRedux, SiNodedotjs,
} from 'react-icons/si';
import { FiMail, FiGithub, FiLinkedin, FiSun, FiMoon, FiArrowUpRight } from 'react-icons/fi';
import './App.css';

/* ── Links ── */
const EMAIL        = 'navendra604@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/navendra-ramdhan/';
const GITHUB_URL   = 'https://github.com/navv-r';
const MAILTO       = `mailto:${EMAIL}?subject=${encodeURIComponent("Hi Navendra — let's connect")}`;

/* ── Project data ── */
const PROJECTS = [
  {
    title: 'Summarist Internship',
    desc: 'A Next.js audiobook platform with user authentication, book browsing, personal collections, in-app audio playback, and a premium subscription tier.',
    color: '#7da96a',
    label: 'Summarist',
    link: 'https://advanced-tech-internship.vercel.app/',
    image: '/summarist.png',
  },
  {
    title: 'NFT Marketplace Internship',
    desc: 'A React-based NFT auction platform where users can browse trending and personalised listings, place bids, and track live countdown timers showing each NFT\'s remaining availability.',
    color: '#4d82ff',
    label: 'NFT Market',
    link: 'https://navendra-internship.vercel.app/',
    image: '/nft.png',
  },
  {
    title: 'Movie Finder Clone Project',
    desc: 'A vanilla JavaScript movie search app that lets users find any film by title or keyword, with a sorting dropdown for quick and easy browsing.',
    color: '#5fa8a0',
    label: 'Movie Finder',
    link: 'https://react-final-project-ruddy-five.vercel.app/',
    image: '/movie.png',
  },
  {
    title: 'Skinstric Internship',
    desc: 'An AI-powered skincare platform built in React with Tailwind CSS. Users capture or upload a photo and receive demographic, gender, and age analysis via an AI endpoint API.',
    color: '#6c9bd1',
    label: 'Skinstric',
    link: 'https://skinstric-internship-pi.vercel.app',
    image: '/skinstric.png',
  },
  {
    title: 'LIMS But Better',
    desc: 'A redesigned Laboratory Information Management System that streamlines common lab workflows — cutting redundant clicks and eliminating tedious import/export steps so technicians can focus on the work that matters.',
    color: '#00b4d8',
    label: 'LIMS',
    link: 'https://lims-but-better.vercel.app',
    image: '/lims logo.png',
  },
];

/* ── Tech stack data ── */
const STACK = [
  { label: 'HTML',       icon: <SiHtml5      color="#e34f26" /> },
  { label: 'CSS',        icon: <SiCss        color="#1572b6" /> },
  { label: 'JavaScript', icon: <SiJavascript color="#f7df1e" /> },
  { label: 'TypeScript', icon: <SiTypescript color="#3178c6" /> },
  { label: 'React',      icon: <SiReact      color="#61dafb" /> },
  { label: 'Next.js',    icon: <SiNextdotjs  className="icon-nextjs" /> },
  { label: 'Redux',      icon: <SiRedux      color="#764abc" /> },
  { label: 'Node.js',    icon: <SiNodedotjs  color="#3c873a" /> },
];

/* ── 2s Loading screen ── */
const LOAD_MS = 2000;

function Loader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / LOAD_MS, 1);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setExiting(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(onDone, 550);
    return () => clearTimeout(t);
  }, [exiting, onDone]);

  return (
    <div className={`loader${exiting ? ' loader--exit' : ''}`} aria-hidden="true">
      <div className="loader-inner">
        <div className="loader-mark">&lt;NR /&gt;</div>
        <div className="loader-line">initializing portfolio<span className="loader-dots" /></div>
        <div className="loader-bar">
          <div className="loader-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="loader-pct">{pct}%</div>
      </div>
    </div>
  );
}

/* ── Modest cursor trail ── */
function CursorTrail() {
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

/* ── Typewriter (types once, keeps blinking cursor while typing) ── */
function TypeOnce({ text: fullText, speed = 60 }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (displayed.length >= fullText.length) { setDone(true); return; }
    const t = setTimeout(() => setDisplayed(fullText.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(t);
  }, [displayed, done, fullText, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="tw-cursor">|</span>}
    </span>
  );
}

/* ── Scramble label (hover) ── */
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

/* ── Scroll reveal ── */
function useScrollReveal(active) {
  useEffect(() => {
    if (!active) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [active]);
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

/* ── Theme toggle — simple icon morph, colors cross-fade via CSS ── */
function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="toggle-icons">
        <FiSun className="toggle-icon toggle-icon--sun" />
        <FiMoon className="toggle-icon toggle-icon--moon" />
      </span>
    </button>
  );
}

/* ── Staggered letter reveal ── */
function LetterReveal({ text, baseDelay = 0, step = 0.045 }) {
  return (
    <>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="letter"
          style={{ animationDelay: `${baseDelay + i * step}s` }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </>
  );
}

/* ── Scroll progress bar ── */
function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div className="scroll-progress" style={{ transform: `scaleX(${p})` }} />;
}

/* ── Side rail — fixed section tracker ── */
const RAIL_SECTIONS = [
  { id: 'top',      label: 'home' },
  { id: 'about',    label: 'about' },
  { id: 'skills',   label: 'stack' },
  { id: 'projects', label: 'work' },
  { id: 'contact',  label: 'contact' },
];

function SideRail() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    RAIL_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="side-rail" aria-label="Section navigation">
      {RAIL_SECTIONS.map(({ id, label }, i) => (
        <a
          key={id}
          href={`#${id}`}
          className={`rail-item${active === id ? ' rail-item--active' : ''}`}
        >
          <span className="rail-index">0{i + 1}</span>
          <span className="rail-tick" />
          <span className="rail-label">{label}</span>
        </a>
      ))}
    </nav>
  );
}

/* ── Numbered section header ── */
function SectionHeader({ num, title }) {
  return (
    <div className="section-head reveal">
      <span className="section-num">{num}</span>
      <h2 className="section-title">{title}</h2>
      <span className="section-rule" />
    </div>
  );
}

/* ── App ── */
function App() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dir, setDir] = useState('right');
  const [commitCount, setCommitCount] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true;
  });

  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Lock scroll while loading
  useEffect(() => {
    if (!loading) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [loading]);

  useEffect(() => {
    fetch('/stats.json')
      .then(r => r.json())
      .then(data => setCommitCount(data.commits))
      .catch(() => {});
  }, []);

  useScrollReveal(!loading);

  const handleNavClick = () => setMenuOpen(false);

  const next = () => { setDir('right'); setActiveIdx(i => (i + 1) % PROJECTS.length); };
  const prev = () => { setDir('left');  setActiveIdx(i => (i - 1 + PROJECTS.length) % PROJECTS.length); };

  // Keyboard navigation for the carousel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') { setDir('right'); setActiveIdx(i => (i + 1) % PROJECTS.length); }
      if (e.key === 'ArrowLeft')  { setDir('left');  setActiveIdx(i => (i - 1 + PROJECTS.length) % PROJECTS.length); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
      {loading && <Loader onDone={() => setLoading(false)} />}
      <CursorTrail />
      <ScrollProgress />
      <SideRail />

      <nav className="nav">
        <a className="nav-logo" href="#top" aria-label="Home">&lt;NR /&gt;</a>
        <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
          <li><a href="#about" onClick={handleNavClick}>About</a></li>
          <li><a href="#skills" onClick={handleNavClick}>Tech Stack</a></li>
          <li><a href="#projects" onClick={handleNavClick}>Projects</a></li>
          <li><a href="#contact" onClick={handleNavClick}>Contact</a></li>
        </ul>
        <div className="nav-actions">
          <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
          <button
            className={`burger${menuOpen ? ' burger--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="top">
        <span className="hero-ghost" aria-hidden="true">&lt;NR/&gt;</span>
        <div className="hero-content">
          <p className="hero-greeting">{"// hello world, I'm"}</p>
          <h1 className="hero-name">
            {!loading && <LetterReveal text="Navendra Ramdhan" baseDelay={0.1} />}
          </h1>
          <h2 className="hero-title">
            {!loading && <TypeOnce text="Front End Software Engineer" speed={55} />}
          </h2>
          <p className="hero-sub">I build clean, performant web experiences.</p>
          <div className="hero-buttons">
            <a href="#projects" className="btn btn-primary">View My Work</a>
            <a href="#contact" className="btn btn-outline">Get In Touch</a>
          </div>
          <div className="hero-socials">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
              <FiGithub />
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <FiLinkedin />
            </a>
            <a href={MAILTO} aria-label="Email" title="Email me">
              <FiMail />
            </a>
          </div>
        </div>
        <a href="#about" className="scroll-cue" aria-label="Scroll to About section">
          <span className="scroll-cue-text">scroll</span>
          <span className="scroll-cue-line" />
        </a>
      </section>

      {/* About */}
      <section className="section" id="about" data-ghost="01">
        <SectionHeader num="01" title="About Me" />
        <div className="about-grid reveal" style={{ transitionDelay: '0.12s' }}>
          <div className="about-avatar">
            <img src="/profile.jpeg" alt="Navendra Ramdhan" />
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
      <section className="section section-alt" id="skills" data-ghost="02">
        <SectionHeader num="02" title="Tech Stack" />
        <div className="marquee reveal" style={{ transitionDelay: '0.1s' }}>
          {[false, true].map((reverse) => (
            <div className={`marquee-row${reverse ? ' marquee-row--reverse' : ''}`} key={reverse ? 'rev' : 'fwd'}>
              <div className="marquee-inner">
                {[...STACK, ...STACK].map(({ label, icon }, i) => (
                  <div className="marquee-item" key={`${label}-${i}`}>
                    <span className="techstack-icon">{icon}</span>
                    <ScrambleLabel text={label} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects — Carousel */}
      <section className="section" id="projects" data-ghost="03">
        <SectionHeader num="03" title="Projects" />

        <div className="carousel-outer reveal" style={{ transitionDelay: '0.1s' }}>
          <button className="carousel-btn carousel-btn--prev" onClick={prev} aria-label="Previous project">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

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
                    </div>
                  ) : (
                    <div className="project-thumb" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, borderBottom: `1px solid ${color}44` }}>
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
                        Visit Project <FiArrowUpRight />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="carousel-btn carousel-btn--next" onClick={next} aria-label="Next project">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

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
      <section className="section section-alt" id="contact" data-ghost="04">
        <SectionHeader num="04" title="Get In Touch" />
        <div className="contact-wrapper reveal" style={{ transitionDelay: '0.15s' }}>
          <p className="contact-sub">
            I'm currently open to new opportunities. Whether you have a question or just
            want to say hi, my inbox is always open!
          </p>

          <div className="contact-actions">
            <a href={MAILTO} className="contact-card contact-card--email">
              <span className="contact-card-icon"><FiMail /></span>
              <span className="contact-card-label">Email Me</span>
              <span className="contact-card-detail">{EMAIL}</span>
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="contact-card contact-card--linkedin">
              <span className="contact-card-icon"><FiLinkedin /></span>
              <span className="contact-card-label">LinkedIn</span>
              <span className="contact-card-detail">navendra-ramdhan</span>
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="contact-card contact-card--github">
              <span className="contact-card-icon"><FiGithub /></span>
              <span className="contact-card-label">GitHub</span>
              <span className="contact-card-detail">navv-r</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>Designed &amp; Built by Navendra Ramdhan &mdash; {new Date().getFullYear()}</p>
        <div className="footer-links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={MAILTO}>Email</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
