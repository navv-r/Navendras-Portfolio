/* ════════════════════════════════════════════════════════════════
   Small shared UI primitives: section headers, scroll reveal hook,
   count-up, the run-once typewriter, and the decode/scramble effect.
   ════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from 'react';

/* ── Numbered section header ── */
export function SectionHeader({ num, title }) {
  return (
    <div className="section-head reveal">
      <span className="section-num">{num}</span>
      <h2 className="section-title">{title}</h2>
      <span className="section-rule" />
    </div>
  );
}

/* ── Vertical side header for split sections ── */
export function SectionSide({ num, title }) {
  return (
    <div className="section-side reveal">
      <span className="section-num">{num}</span>
      <h2 className="section-title section-title--v">{title}</h2>
      <span className="section-rule-v" />
    </div>
  );
}

/* ── Scroll reveal — adds .visible to .reveal elements on enter ── */
export function useScrollReveal(active) {
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
export function CountUp({ target, duration }) {
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

/* ── Typewriter (types once, keeps blinking cursor while typing) ── */
export function TypeOnce({ text: fullText, speed = 60 }) {
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

/* ── useScramble — the "decode" coding animation as a hook: each glyph
   spins through random characters before locking into place, left to
   right. Returns the current display string. Shared by the DOM text and
   the 3D hero name so their timing stays identical. ── */
const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#§$%&абвΩΣ01';

export function useScramble(text, { startDelay = 0, framesPerChar = 24, flickerEvery = 5 } = {}) {
  const [out, setOut] = useState('');

  useEffect(() => {
    const reduced = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setOut(text); return; }

    let raf, timer;
    let frame = 0;
    const total = text.length;
    let scrambled = '';

    const tick = () => {
      const revealed = Math.floor(frame / framesPerChar);
      // only re-roll the random glyphs every few frames so it doesn't
      // strobe — gives a calmer, more readable "decode" feel
      if (frame % flickerEvery === 0 || scrambled.length !== total) {
        let s = '';
        for (let i = 0; i < total; i++) {
          if (text[i] === ' ') { s += ' '; continue; }
          if (i < revealed) s += text[i];
          else s += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        scrambled = s;
        setOut(s);
      } else if (revealed > 0) {
        // still lock in newly-revealed chars on in-between frames
        setOut(text.slice(0, revealed) + scrambled.slice(revealed));
      }
      frame += 1;
      if (revealed <= total) raf = requestAnimationFrame(tick);
      else setOut(text);
    };

    timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, startDelay);
    return () => { clearTimeout(timer); if (raf) cancelAnimationFrame(raf); };
  }, [text, startDelay, framesPerChar, flickerEvery]);

  return out;
}

export function ScrambleText({ text, className, startDelay = 0, framesPerChar = 24, flickerEvery = 5 }) {
  const out = useScramble(text, { startDelay, framesPerChar, flickerEvery });
  return <span className={className}>{out || text.replace(/[^ ]/g, ' ')}</span>;
}
