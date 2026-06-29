/* ── Footer ── */
import { GITHUB_URL, LINKEDIN_URL, MAILTO } from '../data/site';

export default function Footer() {
  return (
    <footer className="footer">
      <p>Designed &amp; Built by Navendra Ramdhan &mdash; {new Date().getFullYear()}</p>
      <div className="footer-links">
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn</a>
        <a href={MAILTO}>Email</a>
      </div>
    </footer>
  );
}
