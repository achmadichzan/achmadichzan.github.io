import { getStoredTheme } from './theme.js';
import { getStoredLanguage, TRANSLATIONS } from './i18n.js';
import { showToast, resetTelemetryElsCache } from '../utils/dom.js';

export function toggleMobileNav(e) {
  if (e) e.stopPropagation();
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('navMenuWrapper');
  if (btn && menu) {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  }
}

export function closeMobileNav() {
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('navMenuWrapper');
  if (btn && menu) {
    btn.classList.remove('active');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
}

export function initTerminalPreloader() {
  const preloader = document.getElementById('terminalPreloader');
  const spinner = document.getElementById('preloaderSpinner');
  const promptEl = preloader ? preloader.querySelector('.preloader-prompt') : null;
  const headerSpan = preloader ? preloader.querySelector('.preloader-header span') : null;
  if (!preloader || !spinner) return;

  const currentTheme = getStoredTheme();
  if (currentTheme === 'win95') {
    if (headerSpan) headerSpan.textContent = 'Microsoft Windows 95 // Starting...';
    if (promptEl) promptEl.textContent = 'C:\\ACHMAD_ICHZAN> ';
  } else if (currentTheme === 'matrix') {
    if (headerSpan) headerSpan.textContent = 'MATRIX_SYS // DECRYPTING_NODE';
    if (promptEl) promptEl.textContent = 'root@matrix:~#';
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    preloader.classList.add('hide');
    document.body.style.overflow = '';
    setTimeout(() => preloader.remove(), 200);
    return;
  }

  document.body.style.overflow = 'hidden';
  const frames = currentTheme === 'win95' ? ['[■░░░░]', '[■■░░░]', '[■■■░░]', '[■■■■░]', '[■■■■■]'] : ['|', '/', '-', '\\'];
  let frameIdx = 0;

  const spinnerInterval = setInterval(() => {
    frameIdx = (frameIdx + 1) % frames.length;
    spinner.textContent = frames[frameIdx];
  }, currentTheme === 'win95' ? 70 : 75);

  const dismissPreloader = () => {
    clearInterval(spinnerInterval);
    preloader.classList.add('hide');
    document.body.style.overflow = '';
    setTimeout(() => preloader.remove(), 350);
  };

  if (document.readyState === 'complete') {
    setTimeout(dismissPreloader, 350);
  } else {
    window.addEventListener('load', () => setTimeout(dismissPreloader, 250));
    setTimeout(dismissPreloader, 800);
  }
}

export function initTypewriterBio() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const typewriterText = document.getElementById('typewriterText');
  const typewriterBio = document.getElementById('typewriterBio');
  const initCursor = document.getElementById('initCursor');
  const bioCursor = document.getElementById('bioCursor');

  if (typewriterText && typewriterBio && !prefersReducedMotion) {
    const dict = TRANSLATIONS[getStoredLanguage()] || TRANSLATIONS.en;
    const promptPhrase = dict['about.promptInit'] || 'System initialized...';
    const bioParagraph =
      dict['about.bio'] ||
      'I build production web applications with PHP/Laravel, develop native Android apps with Kotlin, and apply machine learning with Python/TensorFlow. Focused on writing clean, maintainable code with Clean Architecture, and delivering reliable systems from frontend to backend.';

    let promptIndex = 0;
    let bioIndex = 0;

    typewriterText.textContent = '';
    typewriterBio.textContent = '';

    function typePrompt() {
      if (promptIndex < promptPhrase.length) {
        typewriterText.textContent += promptPhrase.charAt(promptIndex);
        promptIndex++;
        const delay = Math.floor(35 + Math.random() * 30);
        setTimeout(typePrompt, delay);
      } else {
        setTimeout(() => {
          if (initCursor) initCursor.style.display = 'none';
          if (bioCursor) bioCursor.style.display = 'inline-block';
          typeBio();
        }, 250);
      }
    }

    function typeBio() {
      if (bioIndex < bioParagraph.length) {
        typewriterBio.textContent += bioParagraph.charAt(bioIndex);
        bioIndex++;
        const delay = Math.floor(10 + Math.random() * 15);
        setTimeout(typeBio, delay);
      }
    }

    const startDelay = document.getElementById('terminalPreloader') ? 450 : 150;
    setTimeout(typePrompt, startDelay);
  }
}

export function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Marquee clone
  const telemetryTrack = document.querySelector('.telemetry-track');
  const telemetryOriginal = telemetryTrack && telemetryTrack.querySelector('.telemetry-content');
  if (telemetryTrack && telemetryOriginal) {
    const clone = telemetryOriginal.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    telemetryTrack.appendChild(clone);
    resetTelemetryElsCache();
  }

  // Scroll reveal
  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      revealElements.forEach((el) => revealObserver.observe(el));
    }
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  // Metric count-up
  if (!prefersReducedMotion) {
    const metricVals = document.querySelectorAll('.metric-val');
    if (metricVals.length > 0) {
      const metricObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              const raw = el.textContent.trim();
              const match = raw.match(/^(\d+)\+?(.*)/);
              if (match) {
                const target = parseInt(match[1], 10);
                const suffix = raw.replace(match[1], '');
                let current = 0;
                const step = Math.max(1, Math.floor(target / 30));
                const interval = setInterval(() => {
                  current += step;
                  if (current >= target) {
                    current = target;
                    clearInterval(interval);
                  }
                  el.textContent = current + suffix;
                }, 30);
              }
              metricObserver.unobserve(el);
            }
          });
        },
        { threshold: 0.5 }
      );
      metricVals.forEach((el) => metricObserver.observe(el));
    }
  }

  // Scrollspy
  const sections = document.querySelectorAll('main > section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  if (sections.length > 0 && navAnchors.length > 0) {
    const scrollSpyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navAnchors.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach((sec) => scrollSpyObserver.observe(sec));
  }
}

export function initServiceWorker() {
  if (
    'serviceWorker' in navigator &&
    (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      showToast('System updated: new build active');
    });
  }
}
