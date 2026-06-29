/* ════════════════════════════════════════════════════════════════
   Contact — clean prose + a primary email CTA + functional channel
   links (Email / LinkedIn / GitHub).
   ════════════════════════════════════════════════════════════════ */
import { FiArrowUpRight } from 'react-icons/fi';
import { SectionSide } from '../ui/primitives';
import { CHANNELS, MAILTO } from '../data/site';

export default function Contact() {
  return (
    <section className="section section-alt section--split section--flip" id="contact">
      <SectionSide num="04" title="Get In Touch" />
      <div className="section-content">
        <div className="contact reveal">
          <p className="contact-lead">
            I'm currently <b>open to new opportunities</b>. Whether you have a
            question or just want to say hi, my inbox is always open.
          </p>
          <a
            href={MAILTO}
            className="btn btn-primary contact-cta"
          >
            Send me an email
          </a>
          <div className="channels">
            {CHANNELS.map(({ label, detail, href, external, rgb, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="channel"
                style={{ '--cc': rgb }}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <span className="channel-icon"><Icon /></span>
                <span className="channel-info">
                  <span className="channel-label">{label}</span>
                  <span className="channel-detail">{detail}</span>
                </span>
                <FiArrowUpRight className="channel-arrow" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
