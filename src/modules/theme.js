import { showToast } from '../utils/dom.js';

export const VALID_THEMES = ['light', 'win95', 'matrix', 'dark'];

let updateHeroMatrixRainState = null;

export function setTheme(theme, notify = false) {
  const validTheme = VALID_THEMES.includes(theme) ? theme : 'light';

  const themeClasses = ['theme-dark', 'theme-matrix', 'theme-win95'];
  document.body.classList.remove(...themeClasses);
  document.documentElement.classList.remove(...themeClasses);

  if (validTheme !== 'light') {
    const targetClass = `theme-${validTheme}`;
    document.body.classList.add(targetClass);
    document.documentElement.classList.add(targetClass);
  }

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const colors = { light: '#F4F4F0', win95: '#008080', matrix: '#0D0208', dark: '#000000' };
    metaThemeColor.setAttribute('content', colors[validTheme] || '#F4F4F0');
  }

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    if (validTheme === 'win95') {
      themeBtn.setAttribute('title', 'Switch to Neo-Brutalist Theme');
      themeBtn.setAttribute('aria-label', 'Switch to Neo-Brutalist Theme');
    } else {
      themeBtn.setAttribute('title', 'Switch to Windows 95 Retro Theme');
      themeBtn.setAttribute('aria-label', 'Switch to Windows 95 Retro Theme');
    }
  }

  const cliHeaderTitle = document.querySelector('.cli-header span');
  if (cliHeaderTitle) {
    if (validTheme === 'win95') {
      cliHeaderTitle.textContent = 'MS-DOS Prompt - DEV_ROOT';
    } else if (validTheme === 'matrix') {
      cliHeaderTitle.textContent = 'CYBER_NODE // 0xROOT';
    } else {
      cliHeaderTitle.textContent = 'TERMINAL_SESSION // ROOT';
    }
  }

  try {
    localStorage.setItem('portfolio_theme', validTheme);
  } catch (e) {}

  if (typeof updateHeroMatrixRainState === 'function') {
    updateHeroMatrixRainState();
  }

  if (notify) {
    const messages = {
      light: 'Neo-Brutalist Light Mode activated',
      win95: 'Dial-Up 90s / Windows 95 Retro Theme activated',
      matrix: 'Cyber Matrix Terminal Mode activated',
      dark: 'Inverted Dark Mode activated'
    };
    showToast(messages[validTheme]);
  }
}

export function getStoredTheme() {
  try {
    const saved = localStorage.getItem('portfolio_theme');
    if (saved && VALID_THEMES.includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return 'light';
}

export function initHeroMatrixRain() {
  const canvas = document.getElementById('heroMatrixCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Matrix character set
  const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789:・."=*+-<>¦｜';
  const charArray = chars.split('');

  const fontSize = 13;
  let columns = 0;
  let drops = [];
  let speeds = [];
  let rafId = null;
  let isVisible = true;
  let lastFrameTime = 0;
  const targetFpsInterval = 1000 / 28;

  function resizeCanvas() {
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();
    const width = Math.floor(rect.width || 380);
    const height = Math.floor(rect.height || 320);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    columns = Math.max(1, Math.floor(width / fontSize));
    drops = [];
    speeds = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -30);
      speeds[i] = 0.75 + Math.random() * 0.75;
    }
  }

  function draw(timestamp) {
    if (!isVisible || document.hidden || !document.body.classList.contains('theme-matrix')) {
      rafId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    rafId = requestAnimationFrame(draw);

    if (timestamp - lastFrameTime < targetFpsInterval) return;
    lastFrameTime = timestamp;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `bold ${fontSize}px 'Space Mono', 'Courier New', monospace`;

    for (let i = 0; i < columns; i++) {
      const char = charArray[Math.floor(Math.random() * charArray.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      if (y > 0) {
        ctx.fillStyle = '#E8FFE8';
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 4;
        ctx.fillText(char, x, y);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00FF66';
        const trailChar = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(trailChar, x, y - fontSize);
      }

      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i] += speeds[i] || 1;
    }
  }

  function start() {
    if (!rafId && isVisible && !document.hidden && document.body.classList.contains('theme-matrix')) {
      lastFrameTime = performance.now();
      rafId = requestAnimationFrame(draw);
    }
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function checkAndRun() {
    if (document.body.classList.contains('theme-matrix')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      start();
    } else {
      stop();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  updateHeroMatrixRainState = checkAndRun;

  resizeCanvas();
  start();

  let resizeDebounceTimer = null;
  window.addEventListener('resize', () => {
    if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      resizeCanvas();
      checkAndRun();
    }, 100);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else stop();
      });
    },
    { threshold: 0.05 }
  );

  const parent = canvas.parentElement;
  if (parent) observer.observe(parent);
}
