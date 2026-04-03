import { useEffect, useRef } from 'react';
import './App.css';
import {
  SiHtml5, SiCss, SiJavascript, SiTypescript,
  SiReact, SiNextdotjs, SiRedux, SiNodedotjs,
} from 'react-icons/si';

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

      // Spawn 2-3 particles per move
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
          size,
          color,
          type,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.12,
        });
      }
    };
    window.addEventListener('mousemove', onMove);

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

      // Draw cursor glow ring
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 18);
      grad.addColorStop(0, 'rgba(108,99,255,0.35)');
      grad.addColorStop(1, 'rgba(108,99,255,0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner cursor dot
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

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gentle gravity
        p.life -= p.decay;
        p.rotation += p.rotSpeed;
        p.size *= 0.97;
      }

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

function App() {
  return (
    <div className="portfolio">
      <CursorTrail />
      <nav className="nav">
        <div className="nav-logo">NR</div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Tech Stack</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-greeting">Hi, I'm</p>
          <h1 className="hero-name">Navendra Ramdhan</h1>
          <h2 className="hero-title">Front End Developer</h2>
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
        <h2 className="section-title">About Me</h2>
        <div className="about-grid">
          <div className="about-avatar">NR</div>
          <div className="about-text">
            <p>
              Hi, I'm Nav, a junior front-end developer based in Queens, NY, passionate about
              building cool, interactive web experiences. I love bringing creative ideas to life
              through code, crafting websites that are as engaging as they are functional.
            </p>
            <p>
              When I'm not at my keyboard, you'll find me making music. I play the Dholak and
              Tassa, two instruments deeply rooted in my cultural and religious heritage and I
              bring that same rhythm and creativity to everything I build.
            </p>
            <div className="about-stats">
              <div className="stat"><span className="stat-num">1+</span><span>Years Exp.</span></div>
              <div className="stat"><span className="stat-num">5+</span><span>Projects</span></div>
              <div className="stat"><span className="stat-num">220+</span><span>Commits Pushed</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section section-alt" id="skills">
        <h2 className="section-title">Tech Stack</h2>
        <div className="techstack-grid">
          {[
            { label: 'HTML', icon: <SiHtml5 color="#e34f26" /> },
            { label: 'CSS', icon: <SiCss color="#1572b6" /> },
            { label: 'JavaScript', icon: <SiJavascript color="#f7df1e" /> },
            { label: 'TypeScript', icon: <SiTypescript color="#3178c6" /> },
            { label: 'React', icon: <SiReact color="#61dafb" /> },
            { label: 'Next.js', icon: <SiNextdotjs color="#ffffff" /> },
            { label: 'Redux', icon: <SiRedux color="#764abc" /> },
            { label: 'Node.js', icon: <SiNodedotjs color="#3c873a" /> },
          ].map(({ label, icon }) => (
            <div className="techstack-item" key={label}>
              <span className="techstack-icon">{icon}</span>
              <span className="techstack-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="section" id="projects">
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid">
          {[
            {
              title: 'Summarist Internship',
              desc: 'Description coming soon.',
              tags: ['React', 'Next.js', 'TypeScript'],
              color: '#6c63ff',
              label: 'Summarist',
              link: 'https://advanced-tech-internship.vercel.app/',
              image: '/summarist.png',
            },
            {
              title: 'NFT Marketplace Internship',
              desc: 'Description coming soon.',
              tags: ['React', 'Solidity', 'Web3'],
              color: '#00b894',
              label: 'NFT Market',
              link: 'https://navendra-internship.vercel.app/',
              image: '/nft.png',
            },
            {
              title: 'Movie Finder Clone Project',
              desc: 'Description coming soon.',
              tags: ['React', 'REST API', 'CSS'],
              color: '#fd79a8',
              label: 'Movie Finder',
              link: 'https://react-final-project-ruddy-five.vercel.app/',
              image: '/movie.png',
            },
          ].map(({ title, desc, tags, color, label, link, image }) => (
            <div
              className={`project-card${link ? ' project-card--link' : ''}`}
              key={title}
              onClick={link ? () => window.open(link, '_blank', 'noreferrer') : undefined}
            >
              {image ? (
                <div className="project-thumb project-thumb--img" style={{ borderBottom: `1px solid ${color}44` }}>
                  <img src={image} alt={title} className="project-thumb-img" />
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
              <div className="project-body">
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="project-tags">
                  {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="section section-alt" id="contact">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-wrapper">
          <p className="contact-sub">
            I'm currently open to new opportunities. Whether you have a question or just
            want to say hi, my inbox is always open!
          </p>
          <form className="contact-form" onSubmit={e => e.preventDefault()}>
            <div className="form-row">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
            </div>
            <input type="text" placeholder="Subject" />
            <textarea placeholder="Your Message" rows={5} required />
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
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
