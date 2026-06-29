/* ── Top navigation bar ── */
import ThemeToggle from './ThemeToggle';

export default function Nav({ darkMode, onToggleTheme, menuOpen, onToggleMenu, onNavClick }) {
  return (
    <nav className="nav">
      <a className="nav-logo" href="#top" aria-label="Home">&lt;NR /&gt;</a>
      <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
        <li><a href="#about" onClick={onNavClick}>About</a></li>
        <li><a href="#skills" onClick={onNavClick}>Tech Stack</a></li>
        <li><a href="#projects" onClick={onNavClick}>Projects</a></li>
        <li><a href="#contact" onClick={onNavClick}>Contact</a></li>
      </ul>
      <div className="nav-actions">
        <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
        <button
          className={`burger${menuOpen ? ' burger--open' : ''}`}
          onClick={onToggleMenu}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
