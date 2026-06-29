/* ════════════════════════════════════════════════════════════════
   Hero — centered, with a "decode" scramble animation on the name.
   ════════════════════════════════════════════════════════════════ */
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { TypeOnce } from '../ui/primitives';
import HeroName3D from '../three/HeroName3D';
import { GITHUB_URL, LINKEDIN_URL, MAILTO } from '../data/site';

export default function Hero({ ready }) {
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <p className="hero-eyebrow">{'// hello, world — I\'m'}</p>
        <h1 className="hero-name" aria-label="Navendra Ramdhan">
          {ready && <HeroName3D />}
        </h1>
        <p className="hero-role">
          {ready && <TypeOnce text="Front-End Software Engineer" speed={55} />}
        </p>
        <p className="hero-sub">I build clean, performant, interactive web experiences.</p>
        <div className="hero-cta">
          <a href="#projects" className="btn btn-primary">View My Work</a>
          <a href="#contact" className="btn btn-outline">Get In Touch</a>
        </div>
        <div className="hero-socials">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub"><FiGithub /></a>
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><FiLinkedin /></a>
          <a href={MAILTO} aria-label="Email" title="Email me"><FiMail /></a>
        </div>
      </div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to About section">
        <span>scroll</span>
        <span className="scroll-cue-line" />
      </a>
    </section>
  );
}
