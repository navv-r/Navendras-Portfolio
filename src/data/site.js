/* ════════════════════════════════════════════════════════════════
   Shared site data — links, projects, tech stack, contact channels.
   Pulled out of the monolithic App so both the DOM sections and the
   3D world can read from a single source of truth.
   ════════════════════════════════════════════════════════════════ */
import { FiMail, FiGithub, FiLinkedin } from 'react-icons/fi';
import {
  SiHtml5, SiCss, SiJavascript, SiTypescript,
  SiReact, SiNextdotjs, SiRedux, SiNodedotjs,
} from 'react-icons/si';

/* ── Links ── */
export const EMAIL = 'navendra604@gmail.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/navendra-ramdhan/';
export const GITHUB_URL = 'https://github.com/navv-r';
export const MAILTO =
  `mailto:${EMAIL}?subject=${encodeURIComponent("Hi Navendra — let's connect")}`;

/* ── Contact channels — rgb triples drive each card's accent ── */
export const CHANNELS = [
  { label: 'Email',    detail: EMAIL,              href: MAILTO,       external: false, rgb: 'var(--sage-rgb)',   icon: FiMail },
  { label: 'LinkedIn', detail: 'navendra-ramdhan', href: LINKEDIN_URL, external: true,  rgb: 'var(--cobalt-rgb)', icon: FiLinkedin },
  { label: 'GitHub',   detail: 'navv-r',           href: GITHUB_URL,   external: true,  rgb: '140, 150, 160',     icon: FiGithub },
];

/* ── Project data ── */
export const PROJECTS = [
  {
    title: 'Summarist Internship',
    desc: 'A Next.js audiobook platform with user authentication, book browsing, personal collections, in-app audio playback, and a premium subscription tier.',
    color: '#7da96a',
    label: 'Summarist',
    link: 'https://advanced-tech-internship.vercel.app/',
    image: '/summarist.png',
  },
  {
    title: 'NFT Marketplace Internship',
    desc: 'A React-based NFT auction platform where users can browse trending and personalised listings, place bids, and track live countdown timers showing each NFT\'s remaining availability.',
    color: '#4d82ff',
    label: 'NFT Market',
    link: 'https://navendra-internship.vercel.app/',
    image: '/nft.png',
  },
  {
    title: 'Movie Finder Clone Project',
    desc: 'A vanilla JavaScript movie search app that lets users find any film by title or keyword, with a sorting dropdown for quick and easy browsing.',
    color: '#5fa8a0',
    label: 'Movie Finder',
    link: 'https://react-final-project-ruddy-five.vercel.app/',
    image: '/movie.png',
  },
  {
    title: 'Skinstric Internship',
    desc: 'An AI-powered skincare platform built in React with Tailwind CSS. Users capture or upload a photo and receive demographic, gender, and age analysis via an AI endpoint API.',
    color: '#6c9bd1',
    label: 'Skinstric',
    link: 'https://skinstric-internship-pi.vercel.app',
    image: '/skinstric.png',
  },
  {
    title: 'LIMS But Better',
    desc: 'A redesigned Laboratory Information Management System that streamlines common lab workflows — cutting redundant clicks and eliminating tedious import/export steps so technicians can focus on the work that matters.',
    color: '#00b4d8',
    label: 'LIMS',
    link: 'https://lims-but-better.vercel.app',
    image: '/lims logo.png',
  },
];

/* ── Tech stack — icon elements feed the extruded 3D helix glyphs ── */
export const TECH = [
  { label: 'HTML',       color: '#e34f26', icon: SiHtml5 },
  { label: 'CSS',        color: '#2196f3', icon: SiCss },
  { label: 'JavaScript', color: '#f0db4f', icon: SiJavascript },
  { label: 'TypeScript', color: '#3178c6', icon: SiTypescript },
  { label: 'React',      color: '#61dafb', icon: SiReact },
  { label: 'Redux',      color: '#7c5cc4', icon: SiRedux },
  { label: 'Next.js',    color: '#74b9ff', icon: SiNextdotjs },
  { label: 'Node.js',    color: '#5caa4b', icon: SiNodedotjs },
];

/* ── Side-rail / section map ── */
export const SECTIONS = [
  { id: 'top',      label: 'home' },
  { id: 'about',    label: 'about' },
  { id: 'skills',   label: 'stack' },
  { id: 'projects', label: 'work' },
  { id: 'contact',  label: 'contact' },
];
