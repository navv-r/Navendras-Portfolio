/* ════════════════════════════════════════════════════════════════
   About — the prose hides under an animated dotted "ocean" cover; the
   visitor swipes to reveal it. Stats sit below, always visible.
   ════════════════════════════════════════════════════════════════ */
import { SectionSide, CountUp } from '../ui/primitives';
import ScratchReveal from '../ui/ScratchReveal';

const INFO = [
  { k: 'role',     v: 'Front-End Engineer' },
  { k: 'location', v: 'Queens, NY' },
  { k: 'focus',    v: 'Interactive UI · AI integration' },
  { k: 'status',   v: 'Open to work', ok: true },
];

export default function About({ commitCount }) {
  return (
    <section className="section section--split" id="about">
      <SectionSide num="01" title="About Me" />
      <div className="section-content">
        <div className="about reveal">
          <div className="scratch-hint">
            <span className="scratch-hint-swipe" aria-hidden="true" />
            swipe to reveal text
          </div>

          <ScratchReveal>
            <p className="about-lead">
              I build <span className="about-hl">clean, interactive</span> web
              experiences — bringing creative ideas to life through code, and
              pushing into <span className="about-hl">AI-driven</span> interfaces
              that make users feel like they're living in the future.
            </p>
            <ul className="about-specs">
              {INFO.map(({ k, v, ok }) => (
                <li className="spec-row" key={k}>
                  <span className="spec-key">{k}</span>
                  <span className="spec-dots" aria-hidden="true" />
                  <span className={`spec-val${ok ? ' spec-val--ok' : ''}`}>
                    {ok && <span className="spec-dot" />}{v}
                  </span>
                </li>
              ))}
            </ul>
          </ScratchReveal>

          <div className="about-stats">
            <div className="stat-tile">
              <span className="stat-num"><CountUp target={1} /></span>
              <span className="stat-label">Years Exp.</span>
            </div>
            <div className="stat-tile">
              <span className="stat-num"><CountUp target={5} /></span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-tile">
              <span className="stat-num">
                {commitCount !== null ? <CountUp target={commitCount} /> : '…'}
              </span>
              <span className="stat-label">Commits</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
