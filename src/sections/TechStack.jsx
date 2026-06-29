/* ════════════════════════════════════════════════════════════════
   Tech Stack — a faux terminal that "installs" the stack. Nothing runs
   until the section scrolls into view; then the command types itself
   out and each technology's name types in one-by-one (spinner → ✔),
   finishing with an "added N packages" summary.
   ════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from 'react';
import { SectionHeader } from '../ui/primitives';
import { TECH } from '../data/site';

const CMD = 'npm install @nav/stack';
const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/* a believable-ish version/status tag per package */
const META = {
  HTML: 'living-std', CSS: 'living-std', JavaScript: 'ES2024', TypeScript: '5.5.4',
  React: '18.3.1', Redux: '5.0.1', 'Next.js': '14.2.5', 'Node.js': '20.11.0',
};

const pkgName = (label) => label.toLowerCase().replace(/[.\s]/g, '');

export default function TechStack() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [typed, setTyped] = useState(0);        // chars of CMD typed
  const [pkgIndex, setPkgIndex] = useState(0);  // current package being typed
  const [pkgChars, setPkgChars] = useState(0);  // chars typed of that name
  const [spin, setSpin] = useState(0);

  // kick off only when the section is scrolled into view
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      if (reduced) { setTyped(CMD.length); setPkgIndex(TECH.length); }
      else setStarted(true);
      obs.disconnect();
    }, { threshold: 0.25, rootMargin: '0px 0px -12% 0px' });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // 1) type the command
  useEffect(() => {
    if (!started || typed >= CMD.length) return;
    const t = setTimeout(() => setTyped((c) => c + 1), 48);
    return () => clearTimeout(t);
  }, [started, typed]);

  const cmdDone = typed >= CMD.length;

  // 2) once the command is in, type each package name in turn
  useEffect(() => {
    if (!cmdDone || pkgIndex >= TECH.length) return;
    const name = pkgName(TECH[pkgIndex].label);
    if (pkgChars < name.length) {
      const t = setTimeout(() => setPkgChars((c) => c + 1), 42);
      return () => clearTimeout(t);
    }
    // name fully typed → resolve it, brief pause, advance to next package
    const t = setTimeout(() => { setPkgIndex((i) => i + 1); setPkgChars(0); }, 260);
    return () => clearTimeout(t);
  }, [cmdDone, pkgIndex, pkgChars]);

  // spinner frames
  useEffect(() => {
    const id = setInterval(() => setSpin((s) => (s + 1) % SPIN.length), 80);
    return () => clearInterval(id);
  }, []);

  const done = pkgIndex >= TECH.length;

  return (
    <section className="section section--stack" id="skills" ref={ref}>
      <SectionHeader num="02" title="Tech Stack" />
      <p className="stack-caption">{'// everything this site is built with'}</p>

      <div className="terminal">
        <div className="terminal-bar">
          <span className="term-dot term-dot--r" />
          <span className="term-dot term-dot--y" />
          <span className="term-dot term-dot--g" />
          <span className="terminal-bar-title">nav@portfolio: ~/stack</span>
        </div>

        <div className="terminal-body">
          <div className="term-line">
            <span className="term-prompt">$</span>
            <span className="term-cmd">{CMD.slice(0, typed)}</span>
            {!cmdDone && <span className="term-caret" />}
          </div>

          {cmdDone && <div className="term-line term-muted">resolving dependencies…</div>}

          {cmdDone && TECH.map((t, i) => {
            if (i > pkgIndex) return null;            // not reached yet
            const resolved = i < pkgIndex || done;
            const name = pkgName(t.label);
            const shown = resolved ? name : name.slice(0, pkgChars);
            const typing = i === pkgIndex && !done;
            const Icon = t.icon;
            return (
              <div className="term-line term-pkg" key={t.label}>
                <span className={`term-status ${resolved ? 'term-status--ok' : 'term-status--spin'}`}>
                  {resolved ? '✔' : SPIN[spin]}
                </span>
                <Icon className="term-icon" style={{ color: t.color }} />
                <span className="term-pkg-name">
                  {shown}{typing && <span className="term-caret term-caret--sm" />}
                </span>
                {resolved && <span className="term-pkg-ver">{META[t.label]}</span>}
                {resolved && <span className="term-pkg-info term-pkg-info--ok">added</span>}
              </div>
            );
          })}

          {done && (
            <div className="term-summary">
              <span className="term-status term-status--ok">✔</span>{' '}
              added <b>{TECH.length} packages</b> in <b>0.42s</b> — ready.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
