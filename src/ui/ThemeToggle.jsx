/* ── Theme toggle — simple icon morph, colors cross-fade via CSS ── */
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="toggle-icons">
        <FiSun className="toggle-icon toggle-icon--sun" />
        <FiMoon className="toggle-icon toggle-icon--moon" />
      </span>
    </button>
  );
}
