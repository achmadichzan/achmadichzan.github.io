import { setTheme, getStoredTheme, initHeroMatrixRain } from './modules/theme.js';
import { setLanguage, getStoredLanguage } from './modules/i18n.js';
import { initStaticTelemetry, startTelemetryEngine, stopTelemetryEngine } from './modules/telemetry.js';
import { toggleCliDrawer, triggerHtmxNotification, initDraggableCli, initCliInput } from './modules/cli.js';
import {
  toggleMobileNav,
  closeMobileNav,
  initTerminalPreloader,
  initTypewriterBio,
  initScrollAnimations,
  initServiceWorker
} from './modules/ui.js';

window.addEventListener('error', (e) => {
  console.error('[SYS_ERROR]', e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[UNHANDLED_PROMISE]', e.reason);
});

document.addEventListener('DOMContentLoaded', () => {
  const currentLang = getStoredLanguage();
  setTheme(getStoredTheme(), false);
  setLanguage(currentLang, false);
  initTerminalPreloader();
  initDraggableCli();
  initHeroMatrixRain();
  initStaticTelemetry();
  startTelemetryEngine();
  initTypewriterBio();
  initScrollAnimations();
  initCliInput();
  initServiceWorker();

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileNav);
  }

  const navMenuWrapper = document.getElementById('navMenuWrapper');
  if (navMenuWrapper) {
    navMenuWrapper.querySelectorAll('.nav-links a, .nav-cta-btn').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileNav();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('click', function (e) {
    const nav = document.querySelector('.top-nav');
    if (nav && !nav.contains(e.target)) {
      closeMobileNav();
    }
  });

  const cliTriggerBtn = document.getElementById('cliTriggerBtn');
  if (cliTriggerBtn) {
    cliTriggerBtn.addEventListener('click', toggleCliDrawer);
  }

  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const activeLang = document.documentElement.lang === 'id' ? 'en' : 'id';
      setLanguage(activeLang, true);
    });
  }

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = getStoredTheme();
      const nextTheme = current === 'win95' ? 'light' : 'win95';
      setTheme(nextTheme, true);
    });
  }

  const cliCloseBtn = document.getElementById('cliCloseBtn');
  if (cliCloseBtn) {
    cliCloseBtn.addEventListener('click', toggleCliDrawer);
  }

  document.addEventListener('keydown', function (e) {
    const drawer = document.getElementById('cliDrawer');
    const trigger = document.getElementById('cliTriggerBtn');
    const isDrawerOpen = drawer && drawer.classList.contains('open');

    if (e.key === 'Escape') {
      if (isDrawerOpen) {
        drawer.classList.remove('open');
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus({ preventScroll: true });
        }
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCliDrawer();
    } else if (
      e.key === '`' &&
      document.activeElement.tagName !== 'INPUT' &&
      document.activeElement.tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
      toggleCliDrawer();
    }
  });

  document.querySelectorAll('[data-notify]').forEach((link) => {
    link.addEventListener('click', function () {
      const msg = this.getAttribute('data-notify');
      if (msg) triggerHtmxNotification(msg);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTelemetryEngine();
    } else {
      startTelemetryEngine();
    }
  });
});
