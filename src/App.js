import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { FiMail, FiGithub, FiLinkedin, FiSun, FiMoon, FiArrowUpRight } from 'react-icons/fi';
import {
  SiHtml5, SiCss, SiJavascript, SiTypescript,
  SiReact, SiNextdotjs, SiRedux, SiNodedotjs,
} from 'react-icons/si';
import './App.css';

/* ── Links ── */
const EMAIL        = 'navendra604@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/navendra-ramdhan/';
const GITHUB_URL   = 'https://github.com/navv-r';
const MAILTO       = `mailto:${EMAIL}?subject=${encodeURIComponent("Hi Navendra — let's connect")}`;

/* ── Contact channels — rgb triples drive each card's accent ── */
const CHANNELS = [
  { label: 'Email',    detail: EMAIL,              href: MAILTO,       external: false, rgb: 'var(--sage-rgb)',   icon: <FiMail /> },
  { label: 'LinkedIn', detail: 'navendra-ramdhan', href: LINKEDIN_URL, external: true,  rgb: 'var(--cobalt-rgb)', icon: <FiLinkedin /> },
  { label: 'GitHub',   detail: 'navv-r',           href: GITHUB_URL,   external: true,  rgb: '140, 150, 160',     icon: <FiGithub /> },
];

/* ── Project data ── */
const PROJECTS = [
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

/* Standard B-DNA-like ball-and-stick double helix: ~10.5 base pairs per turn,
   antiparallel backbones offset across the minor groove. */
const BP        = 80;                    // number of base pairs
const RISE      = 0.34;                  // vertical rise per base pair
const RADIUS    = 2.0;                   // backbone radius
const R_INNER   = 0.7;                   // where the bases meet near the axis
const TWIST     = (2 * Math.PI) / 10.5;  // twist per base pair
const PHASE_B   = 2.4;                   // 2nd strand offset (~137°) → real grooves
const DNA_H     = (BP - 1) * RISE;       // total helix height

const BASE_COLORS = { A: '#46c06a', T: '#e5544b', G: '#4a8cf0', C: '#e8b53e' };
const BASE_PAIRS  = [['A', 'T'], ['G', 'C'], ['T', 'A'], ['C', 'G']];
const BACKBONE    = '#aab6c6';

/* Each tech icon is extruded into a real 3D mesh and spaced along the helix */
const TECH = [
  { label: 'HTML',       color: '#e34f26', icon: <SiHtml5 /> },
  { label: 'CSS',        color: '#2196f3', icon: <SiCss /> },
  { label: 'JavaScript', color: '#f0db4f', icon: <SiJavascript /> },
  { label: 'TypeScript', color: '#3178c6', icon: <SiTypescript /> },
  { label: 'React',      color: '#61dafb', icon: <SiReact /> },
  { label: 'Redux',      color: '#7c5cc4', icon: <SiRedux /> },
  { label: 'Next.js',    color: '#e7edeb', icon: <SiNextdotjs /> },
  { label: 'Node.js',    color: '#5caa4b', icon: <SiNodedotjs /> },
];

/* Render a react-icon's SVG → extruded 3D geometry, centred & Y-flipped,
   normalised to ~1.2 units tall. */
function makeIconGeometry(iconEl) {
  const svg = renderToStaticMarkup(iconEl);
  const parsed = new SVGLoader().parse(svg);
  const shapes = [];
  parsed.paths.forEach((p) => SVGLoader.createShapes(p).forEach((s) => shapes.push(s)));
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 11, bevelEnabled: true, bevelThickness: 1.6, bevelSize: 1.0, bevelSegments: 3,
  });
  geo.computeBoundingBox();
  const box = geo.boundingBox;
  const size = new THREE.Vector3(); box.getSize(size);
  const center = new THREE.Vector3(); box.getCenter(center);
  const s = 1.0 / Math.max(size.x, size.y);     // a touch smaller
  geo.translate(-center.x, -center.y, -center.z);
  geo.scale(s, -s, s);                       // SVG y is down → flip
  geo.computeVertexNormals();
  return geo;
}

const ICON_GEOMETRIES = TECH.map((t) => ({ ...t, geo: makeIconGeometry(t.icon) }));

/* Build the whole molecule as two InstancedMeshes (atoms + bonds) so the entire
   ball-and-stick model draws in two calls. */
function buildDNA() {
  const up = new THREE.Vector3(0, 1, 0);
  const dummy = new THREE.Object3D();
  const atoms = [];   // { pos, r, color }
  const bonds = [];   // { a, b, r, color }
  const y0 = -DNA_H / 2;
  const bb = new THREE.Color(BACKBONE);

  const pt = (i, phase, radius) => new THREE.Vector3(
    Math.cos(i * TWIST + phase) * radius,
    y0 + i * RISE,
    Math.sin(i * TWIST + phase) * radius,
  );

  let prevA = null, prevB = null;
  for (let i = 0; i < BP; i++) {
    const bbA = pt(i, 0, RADIUS);
    const bbB = pt(i, PHASE_B, RADIUS);
    atoms.push({ pos: bbA, r: 0.20, color: bb });
    atoms.push({ pos: bbB, r: 0.20, color: bb });
    if (prevA) {
      bonds.push({ a: prevA, b: bbA, r: 0.075, color: bb });
      bonds.push({ a: prevB, b: bbB, r: 0.075, color: bb });
    }
    prevA = bbA; prevB = bbB;

    const [na, nb] = BASE_PAIRS[i % BASE_PAIRS.length];
    const cA = new THREE.Color(BASE_COLORS[na]);
    const cB = new THREE.Color(BASE_COLORS[nb]);
    const baseA = pt(i, 0, R_INNER);
    const baseB = pt(i, PHASE_B, R_INNER);
    atoms.push({ pos: baseA, r: 0.15, color: cA });
    atoms.push({ pos: baseB, r: 0.15, color: cB });
    bonds.push({ a: bbA, b: baseA, r: 0.06, color: cA });   // sugar → base
    bonds.push({ a: bbB, b: baseB, r: 0.06, color: cB });
    const mid = baseA.clone().add(baseB).multiplyScalar(0.5);
    bonds.push({ a: baseA, b: mid, r: 0.05, color: cA });   // H-bond, two halves
    bonds.push({ a: mid, b: baseB, r: 0.05, color: cB });
  }

  const atomGeo = new THREE.SphereGeometry(1, 20, 20);
  const atomMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.28, metalness: 0.0,
    clearcoat: 1, clearcoatRoughness: 0.22, envMapIntensity: 1.15,
  });
  const atomMesh = new THREE.InstancedMesh(atomGeo, atomMat, atoms.length);
  atoms.forEach((a, idx) => {
    dummy.position.copy(a.pos);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(a.r);
    dummy.updateMatrix();
    atomMesh.setMatrixAt(idx, dummy.matrix);
    atomMesh.setColorAt(idx, a.color);
  });
  atomMesh.instanceMatrix.needsUpdate = true;
  atomMesh.instanceColor.needsUpdate = true;

  const bondGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
  const bondMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.38, metalness: 0.0,
    clearcoat: 0.7, clearcoatRoughness: 0.35, envMapIntensity: 1.0,
  });
  const bondMesh = new THREE.InstancedMesh(bondGeo, bondMat, bonds.length);
  bonds.forEach((bd, idx) => {
    const dir = bd.b.clone().sub(bd.a);
    const len = dir.length();
    dummy.position.copy(bd.a).addScaledVector(dir, 0.5);
    dummy.scale.set(bd.r, len, bd.r);
    dummy.quaternion.setFromUnitVectors(up, dir.normalize());
    dummy.updateMatrix();
    bondMesh.setMatrixAt(idx, dummy.matrix);
    bondMesh.setColorAt(idx, bd.color);
  });
  bondMesh.instanceMatrix.needsUpdate = true;
  bondMesh.instanceColor.needsUpdate = true;

  return { atomMesh, bondMesh };
}

/* The whole molecule, laid out down its full length. Scroll spins the backbone
   and reveals each tech icon as you reach its place on the strand. */
function DNA({ progressRef }) {
  const { atomMesh, bondMesh } = useMemo(buildDNA, []);
  const backbone = useRef();
  const iconRefs = useRef([]);
  const spin = useRef(0);

  const icons = useMemo(() => {
    const n = ICON_GEOMETRIES.length;
    return ICON_GEOMETRIES.map((tech, k) => {
      const f = n === 1 ? 0 : k / (n - 1);
      return {
        ...tech,
        y: DNA_H / 2 - f * DNA_H,    // first tech at the top, last at the bottom
        threshold: f,                // scroll fraction where it emerges
      };
    });
  }, []);

  useEffect(() => () => {
    [atomMesh, bondMesh].forEach((m) => { m.geometry.dispose(); m.material.dispose(); m.dispose(); });
  }, [atomMesh, bondMesh]);

  useFrame((_, delta) => {
    const p = progressRef.current || 0;
    // ease the spin a touch so it feels smooth, not jittery, while scrolling
    spin.current += (p * Math.PI * 4 - spin.current) * Math.min(1, delta * 6);
    if (backbone.current) backbone.current.rotation.y = spin.current;

    icons.forEach((m, k) => {
      const mesh = iconRefs.current[k];
      if (!mesh) return;
      const raw = (p - m.threshold + 0.06) / 0.1;
      const e = Math.max(0, Math.min(1, raw));
      const es = e * e * (3 - 2 * e);                         // smoothstep
      mesh.visible = es > 0.01;
      mesh.material.opacity = es;
      mesh.scale.setScalar(0.2 + 0.8 * es);                  // grows as it surfaces
      // emerge: rise out of the helix core toward the viewer, flipping to face you
      mesh.position.set(0, m.y, -0.8 + es * (RADIUS + 2.2));
      mesh.rotation.y = (1 - es) * 1.25;                      // edge-on → face-on
    });
  });

  return (
    <group>
      <group ref={backbone}>
        <primitive object={atomMesh} />
        <primitive object={bondMesh} />
      </group>
      {icons.map((m, k) => (
        <mesh
          key={m.label}
          ref={(el) => { iconRefs.current[k] = el; }}
          geometry={m.geo}
          visible={false}
        >
          <meshStandardMaterial
            color={m.color}
            emissive={m.color}
            emissiveIntensity={0.35}
            metalness={0.55}
            roughness={0.25}
            side={THREE.DoubleSide}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
}

/* Orthographic fit: scale the camera so the entire helix height maps onto the
   full (tall) canvas, then scrolling the page reveals it top→bottom. */
function FitHelix() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    camera.zoom = size.height / (DNA_H * 1.06);
    camera.position.set(0, 0, 60);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);
  return null;
}

/* The canvas is as tall as the section, so the full-length helix renders down
   the page and you simply scroll past the entire thing. */
function TechHelix() {
  const stageRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let raf = null;
    const update = () => {
      raf = null;
      const rect = stage.getBoundingClientRect();
      const dist = rect.height - window.innerHeight;
      const p = dist <= 0 ? 0 : -rect.top / dist;
      progressRef.current = Math.max(0, Math.min(1, p));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="helix-stage" ref={stageRef}>
      <div className="space-stars" />
      <div className="space-stars space-stars--far" />
      <div className="space-nebula" />
      <Canvas
        className="helix-canvas"
        orthographic
        dpr={1}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 60], near: 0.1, far: 400, zoom: 80 }}
        onCreated={({ gl }) => { gl.toneMappingExposure = 1.35; }}
      >
        <ambientLight intensity={0.85} />
        <hemisphereLight args={['#cfe0ff', '#1a2233', 0.8]} />
        <directionalLight position={[6, 9, 7]} intensity={3.6} />
        <directionalLight position={[-7, -2, -4]} intensity={1.1} color="#9fbcff" />
        <pointLight position={[0, 0, 20]} intensity={120} color="#eaf2ff" />
        <Environment resolution={256}>
          <Lightformer intensity={3} position={[0, 4, -6]} scale={[14, 7, 1]} color="#bcd2ff" />
          <Lightformer intensity={2} position={[-6, 2, 3]} scale={[7, 7, 1]} color="#ffffff" />
          <Lightformer intensity={1.6} position={[6, -3, 3]} scale={[7, 7, 1]} color="#ffe8cf" />
        </Environment>
        <FitHelix />
        <DNA progressRef={progressRef} />
      </Canvas>
    </div>
  );
}

/* ── 3D name that types itself out like code ── */
function NameGlyphs({ text }) {
  const group = useRef();
  const [count, setCount] = useState(0);
  const [blink, setBlink] = useState(true);
  const reduced = useMemo(
    () => typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches, [],
  );

  useEffect(() => {
    if (reduced) { setCount(text.length); return; }
    if (count >= text.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), 95);
    return () => clearTimeout(t);
  }, [count, text.length, reduced]);

  useEffect(() => {
    const iv = setInterval(() => setBlink((b) => !b), 460);
    return () => clearInterval(iv);
  }, []);

  // gentle 3D float
  useFrame((state) => {
    const g = group.current;
    if (!g || reduced) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.5) * 0.12;
    g.rotation.x = Math.sin(t * 0.4) * 0.05;
  });

  const done = count >= text.length;
  const size = 1.05;
  const caret = done ? (blink ? '_' : '') : '_';     // blinking code cursor
  const shown = text.slice(0, count) + caret;
  const leftX = -text.length * 0.31 * size;           // ≈ centre the final name

  return (
    <group ref={group}>
      <group position={[leftX, -size / 2, 0]}>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={size}
          height={0.35}
          curveSegments={5}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.016}
          bevelSegments={2}
        >
          {shown}
          <meshStandardMaterial
            color="#e6edff"
            metalness={0.55}
            roughness={0.22}
            emissive="#2c4f9e"
            emissiveIntensity={0.35}
          />
        </Text3D>
      </group>
    </group>
  );
}

function HeroName({ text }) {
  return (
    <Canvas
      className="hero-name-canvas"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.4, 9], fov: 30 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 8]} intensity={2.6} />
      <directionalLight position={[-5, -2, 3]} intensity={0.7} color="#8fb0ff" />
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 3, -4]} scale={[10, 4, 1]} color="#bcd2ff" />
        <Lightformer intensity={1.4} position={[-4, 1, 3]} scale={[5, 5, 1]} color="#ffffff" />
      </Environment>
      <Suspense fallback={null}>
        <NameGlyphs text={text} />
      </Suspense>
    </Canvas>
  );
}

/* ── 1.5s Loading screen ── */
const LOAD_MS = 1500;

function Loader({ onDone }) {
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

/* ── Modest cursor trail ── */
function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#4d82ff', '#9cb88a'];
    let tickCount = 0;

    const onMove = (e) => {
      tickCount++;
      if (tickCount % 2 !== 0) return; // thin it out — modest, not a comet
      particles.push({
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 2 + 1.2,
        life: 1,
        decay: Math.random() * 0.02 + 0.03,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      if (particles.length > 60) particles.splice(0, particles.length - 60);
    };
    window.addEventListener('mousemove', onMove);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);
      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life * 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.life -= p.decay;
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-canvas" />;
}

/* ── Typewriter (types once, keeps blinking cursor while typing) ── */
function TypeOnce({ text: fullText, speed = 60 }) {
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

/* ── Scroll reveal ── */
function useScrollReveal(active) {
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
function CountUp({ target, duration }) {
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

/* ── Theme toggle — simple icon morph, colors cross-fade via CSS ── */
function ThemeToggle({ darkMode, onToggle }) {
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

/* ── Scroll progress bar ── */
function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div className="scroll-progress" style={{ transform: `scaleX(${p})` }} />;
}

/* ── Side rail — fixed section tracker ── */
const RAIL_SECTIONS = [
  { id: 'top',      label: 'home' },
  { id: 'about',    label: 'about' },
  { id: 'skills',   label: 'stack' },
  { id: 'projects', label: 'work' },
  { id: 'contact',  label: 'contact' },
];

function SideRail() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    RAIL_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="side-rail" aria-label="Section navigation">
      {RAIL_SECTIONS.map(({ id, label }, i) => (
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

/* ── Numbered section header ── */
function SectionHeader({ num, title }) {
  return (
    <div className="section-head reveal">
      <span className="section-num">{num}</span>
      <h2 className="section-title">{title}</h2>
      <span className="section-rule" />
    </div>
  );
}

/* ── Vertical side header for split sections ── */
function SectionSide({ num, title }) {
  return (
    <div className="section-side reveal">
      <span className="section-num">{num}</span>
      <h2 className="section-title section-title--v">{title}</h2>
      <span className="section-rule-v" />
    </div>
  );
}

/* ── App ── */
function App() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [shutter, setShutter] = useState({ key: 0, color: '' });
  const switchingRef = useRef(false);
  const [commitCount, setCommitCount] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true;
  });

  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Lock scroll while loading
  useEffect(() => {
    if (!loading) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [loading]);

  useEffect(() => {
    fetch('/stats.json')
      .then(r => r.json())
      .then(data => setCommitCount(data.commits))
      .catch(() => {});
  }, []);

  useScrollReveal(!loading);

  const handleNavClick = () => setMenuOpen(false);

  // Switch projects behind a color shutter sweep
  const switchTo = (i) => {
    const n = PROJECTS.length;
    const idx = ((i % n) + n) % n;
    if (idx === activeIdx || switchingRef.current) return;
    switchingRef.current = true;
    setShutter(s => ({ key: s.key + 1, color: PROJECTS[idx].color }));
    setTimeout(() => {
      setActiveIdx(idx);
      switchingRef.current = false;
    }, 300);
  };

  // Keyboard navigation for the showcase
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') switchTo(activeIdx + 1);
      if (e.key === 'ArrowLeft')  switchTo(activeIdx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Touch swipe on the showcase stage
  const touchStartX = useRef(null);
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) switchTo(delta > 0 ? activeIdx + 1 : activeIdx - 1);
    touchStartX.current = null;
  };

  const handleTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const rotX = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -4;
    const rotY = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 4;
    card.style.transition = 'transform 0.05s, box-shadow 0.25s';
    card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };

  const resetTilt = (e) => {
    e.currentTarget.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s';
    e.currentTarget.style.transform = '';
  };

  const activeProject = PROJECTS[activeIdx];

  // Magnetic pull on the contact CTA
  const magnetMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.35;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  };

  const magnetReset = (e) => { e.currentTarget.style.transform = ''; };

  return (
    <div className={`portfolio${darkMode ? '' : ' light-mode'}`}>
      {loading && <Loader onDone={() => setLoading(false)} />}
      <CursorTrail />
      <ScrollProgress />
      <SideRail />

      <nav className="nav">
        <a className="nav-logo" href="#top" aria-label="Home">&lt;NR /&gt;</a>
        <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
          <li><a href="#about" onClick={handleNavClick}>About</a></li>
          <li><a href="#skills" onClick={handleNavClick}>Tech Stack</a></li>
          <li><a href="#projects" onClick={handleNavClick}>Projects</a></li>
          <li><a href="#contact" onClick={handleNavClick}>Contact</a></li>
        </ul>
        <div className="nav-actions">
          <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
          <button
            className={`burger${menuOpen ? ' burger--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="top">
        <span className="hero-ghost" aria-hidden="true">&lt;NR/&gt;</span>
        <div className="hero-content">
          <p className="hero-greeting">{"// hello world, I'm"}</p>
          <h1 className="hero-name hero-name--3d">
            {!loading && <HeroName text="Navendra Ramdhan" />}
          </h1>
          <h2 className="hero-title">
            {!loading && <TypeOnce text="Front End Software Engineer" speed={55} />}
          </h2>
          <p className="hero-sub">I build clean, performant web experiences.</p>
          <div className="hero-buttons">
            <a href="#projects" className="btn btn-primary">View My Work</a>
            <a href="#contact" className="btn btn-outline">Get In Touch</a>
          </div>
          <div className="hero-socials">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
              <FiGithub />
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <FiLinkedin />
            </a>
            <a href={MAILTO} aria-label="Email" title="Email me">
              <FiMail />
            </a>
          </div>
        </div>
        <a href="#about" className="scroll-cue" aria-label="Scroll to About section">
          <span className="scroll-cue-text">scroll</span>
          <span className="scroll-cue-line" />
        </a>
      </section>

      {/* About */}
      <section className="section section--split" id="about" data-ghost="01">
        <SectionSide num="01" title="About Me" />
        <div className="section-content">
          <div className="bento reveal" style={{ transitionDelay: '0.12s' }}>
            <div className="bento-col">
              <div className="bento-tile bento-tile--avatar">
                <img src="/profile.jpeg" alt="Navendra Ramdhan" />
              </div>
              <div className="bento-tile bento-tile--status">
                <div className="status-row">
                  <span className="status-dot" />
                  <span>open_to_work</span>
                </div>
                <div className="status-loc">{'// based in Queens, NY'}</div>
              </div>
            </div>
            <div className="about-terminal">
              <div className="terminal-bar">
                <span className="t-dot t-dot--r" />
                <span className="t-dot t-dot--y" />
                <span className="t-dot t-dot--g" />
                <span className="terminal-bar-title">nav@portfolio:~/about</span>
              </div>
              <div className="terminal-body">
                <div className="t-line t-line--1">
                  <span className="t-prompt">$</span>
                  <span className="t-cmd">whoami</span>
                </div>
                <div className="t-output t-line--2">
                  Front-end developer based in Queens, NY — passionate about building cool, interactive web experiences and bringing creative ideas to life through code.
                </div>
                <div className="t-line t-line--3">
                  <span className="t-prompt">$</span>
                  <span className="t-cmd">cat passion.txt</span>
                </div>
                <div className="t-output t-line--4">
                  Deeply passionate about crafting seamless web experiences and pushing boundaries with AI integration — whether that's smart interfaces, generative features, or tools that make users feel like they're living in the future.
                </div>
                <div className="t-line t-line--5">
                  <span className="t-cursor" />
                </div>
              </div>
            </div>
            <div className="bento-stats">
              <div className="bento-tile stat-tile">
                <span className="stat-num"><CountUp target={1} /></span>
                <span className="stat-label">Years Exp.</span>
              </div>
              <div className="bento-tile stat-tile">
                <span className="stat-num"><CountUp target={5} /></span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="bento-tile stat-tile">
                <span className="stat-num">
                  {commitCount !== null ? <CountUp target={commitCount} /> : '...'}
                </span>
                <span className="stat-label">Commits Pushed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack — DNA double-helix the icons descend as you scroll */}
      <section className="section section--space section--helix" id="skills">
        <SectionHeader num="02" title="Tech Stack" />
        <TechHelix />
      </section>

      {/* Projects — Showcase */}
      <section className="section" id="projects" data-ghost="03">
        <SectionHeader num="03" title="Projects" />

        <div className="showcase reveal" style={{ transitionDelay: '0.1s' }}>
          <nav className="showcase-list" aria-label="Project list">
            {PROJECTS.map(({ title, label, color }, i) => (
              <button
                key={title}
                className={`showcase-item${i === activeIdx ? ' showcase-item--active' : ''}`}
                style={{ '--pc': color }}
                onClick={() => switchTo(i)}
              >
                <span className="showcase-item-num">0{i + 1}</span>
                <span className="showcase-item-name">{label}</span>
                <span className="showcase-item-line" />
              </button>
            ))}
            <div className="showcase-count">
              <span>0{activeIdx + 1}</span> / 0{PROJECTS.length}
            </div>
          </nav>

          <div
            className="showcase-stage"
            style={{ '--pc': activeProject.color }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            {shutter.key > 0 && (
              <span
                key={shutter.key}
                className="showcase-shutter"
                style={{ background: `linear-gradient(120deg, ${shutter.color}, var(--cobalt))` }}
              />
            )}
            <article className="showcase-card" key={activeIdx}>
              <div className="showcase-thumb">
                <img src={activeProject.image} alt={activeProject.title} />
                <span className="showcase-scan" />
                <span className="showcase-ghost">0{activeIdx + 1}</span>
              </div>
              <div className="showcase-body">
                <span className="showcase-tag">{activeProject.label}</span>
                <h3 className="showcase-title">{activeProject.title}</h3>
                <p className="showcase-desc">{activeProject.desc}</p>
                {activeProject.link && (
                  <a
                    href={activeProject.link}
                    target="_blank"
                    rel="noreferrer"
                    className="showcase-link"
                  >
                    Visit Project <FiArrowUpRight />
                  </a>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section section-alt section--split section--flip" id="contact" data-ghost="04">
        <SectionSide num="04" title="Get In Touch" />
        <div className="section-content">
          <div className="contact-grid reveal" style={{ transitionDelay: '0.15s' }}>

            {/* Uplink terminal */}
            <div className="uplink">
              <div className="terminal-bar">
                <span className="t-dot t-dot--r" />
                <span className="t-dot t-dot--y" />
                <span className="t-dot t-dot--g" />
                <span className="terminal-bar-title">nav@portfolio:~/contact</span>
              </div>
              <div className="uplink-body">
                <div className="uplink-line">
                  <span className="t-prompt">$</span>{' '}
                  <span className="uplink-cmd">./initiate_contact.sh</span>
                  <span className="uplink-caret" />
                </div>
                <div className="uplink-status">
                  <span className="uplink-scan"><span className="uplink-blip" /></span>
                  <div className="uplink-readout">
                    <span>signal_strength: <b>STRONG</b></span>
                    <span>status: <b className="ok">OPEN_TO_WORK</b></span>
                    <span>avg_response_time: <b>&lt; 24h</b></span>
                  </div>
                </div>
                <p className="uplink-note">
                  I'm currently open to new opportunities. Whether you have a question or just
                  want to say hi, my inbox is always open!
                </p>
                <a
                  href={MAILTO}
                  className="btn btn-primary uplink-cta"
                  onMouseMove={magnetMove}
                  onMouseLeave={magnetReset}
                >
                  Send Transmission
                </a>
              </div>
            </div>

            {/* Channels */}
            <div className="channels">
              {CHANNELS.map(({ label, detail, href, external, rgb, icon }) => (
                <a
                  key={label}
                  href={href}
                  className="channel"
                  style={{ '--cc': rgb }}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <span className="channel-border" aria-hidden="true" />
                  <span className="channel-icon">
                    {icon}
                    <span className="channel-ping" />
                  </span>
                  <span className="channel-info">
                    <span className="channel-label">{label}</span>
                    <span className="channel-detail">{detail}</span>
                  </span>
                  <span className="channel-status">
                    <span className="channel-dot" />
                    ONLINE
                  </span>
                  <FiArrowUpRight className="channel-arrow" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>Designed &amp; Built by Navendra Ramdhan &mdash; {new Date().getFullYear()}</p>
        <div className="footer-links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={MAILTO}>Email</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
