/* ════════════════════════════════════════════════════════════════
   Projects — self-contained showcase: list selector + tilting card,
   color shutter sweep between projects, keyboard + swipe navigation.
   ════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { SectionHeader } from '../ui/primitives';
import { PROJECTS } from '../data/site';

export default function Projects() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [shutter, setShutter] = useState({ key: 0, color: '' });
  const switchingRef = useRef(false);
  const touchStartX = useRef(null);

  // Switch projects behind a color shutter sweep
  const switchTo = (i) => {
    const n = PROJECTS.length;
    const idx = ((i % n) + n) % n;
    if (idx === activeIdx || switchingRef.current) return;
    switchingRef.current = true;
    setShutter(s => ({ key: s.key + 1, color: PROJECTS[idx].color }));
    setTimeout(() => {
      setActiveIdx(idx);
      switchingRef.current = false;
    }, 300);
  };

  // Keyboard navigation for the showcase
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') switchTo(activeIdx + 1);
      if (e.key === 'ArrowLeft')  switchTo(activeIdx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) switchTo(delta > 0 ? activeIdx + 1 : activeIdx - 1);
    touchStartX.current = null;
  };

  const handleTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const rotX = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -4;
    const rotY = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 4;
    card.style.transition = 'transform 0.05s, box-shadow 0.25s';
    card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };

  const resetTilt = (e) => {
    e.currentTarget.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s';
    e.currentTarget.style.transform = '';
  };

  const activeProject = PROJECTS[activeIdx];

  return (
    <section className="section" id="projects" data-ghost="03">
      <SectionHeader num="03" title="Projects" />

      <div className="showcase reveal" style={{ transitionDelay: '0.1s' }}>
        <nav className="showcase-list" aria-label="Project list">
          {PROJECTS.map(({ title, label, color }, i) => (
            <button
              key={title}
              className={`showcase-item${i === activeIdx ? ' showcase-item--active' : ''}`}
              style={{ '--pc': color }}
              onClick={() => switchTo(i)}
            >
              <span className="showcase-item-num">0{i + 1}</span>
              <span className="showcase-item-name">{label}</span>
              <span className="showcase-item-line" />
            </button>
          ))}
          <div className="showcase-count">
            <span>0{activeIdx + 1}</span> / 0{PROJECTS.length}
          </div>
        </nav>

        <div
          className="showcase-stage"
          style={{ '--pc': activeProject.color }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
        >
          {shutter.key > 0 && (
            <span
              key={shutter.key}
              className="showcase-shutter"
              style={{ background: `linear-gradient(120deg, ${shutter.color}, var(--cobalt))` }}
            />
          )}
          <article className="showcase-card" key={activeIdx}>
            <div className="showcase-thumb">
              <img src={activeProject.image} alt={activeProject.title} />
              <span className="showcase-scan" />
              <span className="showcase-ghost">0{activeIdx + 1}</span>
            </div>
            <div className="showcase-body">
              <span className="showcase-tag">{activeProject.label}</span>
              <h3 className="showcase-title">{activeProject.title}</h3>
              <p className="showcase-desc">{activeProject.desc}</p>
              {activeProject.link && (
                <a
                  href={activeProject.link}
                  target="_blank"
                  rel="noreferrer"
                  className="showcase-link"
                >
                  Visit Project <FiArrowUpRight />
                </a>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
