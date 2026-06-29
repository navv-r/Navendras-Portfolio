/* ── 1.5s loading screen ── */
import { useEffect, useState } from 'react';

const LOAD_MS = 1500;

export default function Loader({ onDone }) {
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
