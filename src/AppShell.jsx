/* ════════════════════════════════════════════════════════════════
   AppShell — the rebuilt portfolio. Clean modern UI: a soft animated
   background, a floating 3D hero object, an auto-scrolling tech
   marquee, and a navy / pastel-blue theme with a lime accent.
   ════════════════════════════════════════════════════════════════ */
import { useEffect, useState } from 'react';
import './App.css';

import Loader from './ui/Loader';
import Nav from './ui/Nav';
import SideRail from './ui/SideRail';
import ScrollProgress from './ui/ScrollProgress';
import CursorTrail from './ui/CursorTrail';
import { useScrollReveal } from './ui/primitives';

import Hero from './sections/Hero';
import About from './sections/About';
import TechStack from './sections/TechStack';
import Projects from './sections/Projects';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

export default function AppShell() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <div className={`portfolio${darkMode ? '' : ' light-mode'}`}>
      {loading && <Loader onDone={() => setLoading(false)} />}

      {/* clean animated background */}
      <div className="bg-field" aria-hidden="true" />

      {/* chrome */}
      <CursorTrail />
      <ScrollProgress />
      <SideRail />
      <Nav
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen(o => !o)}
        onNavClick={() => setMenuOpen(false)}
      />

      {/* content */}
      <main className="content">
        <Hero ready={!loading} />
        <About commitCount={commitCount} />
        <TechStack />
        <Projects />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
