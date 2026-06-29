/* ── Side rail — fixed section tracker ── */
import { useEffect, useState } from 'react';
import { SECTIONS } from '../data/site';

export default function SideRail() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="side-rail" aria-label="Section navigation">
      {SECTIONS.map(({ id, label }, i) => (
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
