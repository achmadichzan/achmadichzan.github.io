function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let toastTimeout = null;
function showToast(message, duration = 3000) {
  const toast = document.getElementById('brutalistToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

let detectedGpu = null;
function getGpuRenderer() {
  if (detectedGpu) return detectedGpu;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      detectedGpu = 'STANDARD_GPU';
      return detectedGpu;
    }
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      let renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      if (renderer.includes('ANGLE (')) {
        const match = renderer.match(/ANGLE \((.*?), (.*?) (Direct3D|OpenGL|Vulkan|Metal)/);
        if (match && match[2]) {
          renderer = match[2];
        } else {
          renderer = renderer.replace('ANGLE (', '').split(',')[0];
        }
      }
      detectedGpu = renderer.replace(/\s+/g, ' ').trim() || 'WEBGL_ACCELERATED';
      return detectedGpu;
    }
    detectedGpu = gl.getParameter(gl.RENDERER) || 'WEBGL_ACCELERATED';
    return detectedGpu;
  } catch (e) {
    detectedGpu = 'GPU_ACTIVE';
    return detectedGpu;
  }
}

let currentFps = 60;
let lastFpsTime = performance.now();
let frameCount = 0;
let rafId = null;
let fpsSampleTimer = null;

// Periodic FPS sampling: measure for 2s every 10s to avoid permanent RAF loop
function trackFps(now) {
  if (document.hidden) return;
  frameCount++;
  if (now - lastFpsTime >= 1000) {
    currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    frameCount = 0;
    lastFpsTime = now;
  }
  // Sample for 2 seconds then stop
  if (now - lastFpsTime < 2000) {
    rafId = requestAnimationFrame(trackFps);
  } else {
    rafId = null;
  }
}

function startFpsSampling() {
  if (rafId) return;
  lastFpsTime = performance.now();
  frameCount = 0;
  rafId = requestAnimationFrame(trackFps);
}

function getPageLoadDuration() {
  const nav = performance.getEntriesByType('navigation')[0];
  if (nav) {
    if (nav.duration && nav.duration > 0) {
      return `${Math.round(nav.duration)}MS`;
    }
    if (nav.domContentLoadedEventEnd && nav.domContentLoadedEventEnd > 0) {
      return `${Math.round(nav.domContentLoadedEventEnd)}MS`;
    }
    if (nav.responseEnd && nav.responseEnd > 0) {
      return `${Math.round(nav.responseEnd)}MS`;
    }
  }
  return '<35MS';
}

function getClientStaticSpecs() {
  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} THREADS` : '8 THREADS';
  const ram = navigator.deviceMemory ? `${navigator.deviceMemory}GB RAM` : '>=8GB RAM';
  const gpu = getGpuRenderer();
  const res = `${window.screen.width}x${window.screen.height}`;

  let os = 'LINUX';
  const ua = navigator.userAgent || '';
  if (ua.includes('Win')) os = 'WINDOWS';
  else if (ua.includes('Mac')) os = 'MACOS';
  else if (ua.includes('Android')) os = 'ANDROID';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'IOS';
  else if (ua.includes('Linux')) os = 'LINUX';

  const dpr = `${window.devicePixelRatio || 1}x`;
  const pageLoad = getPageLoadDuration();

  return { cores, ram, gpu, res, os, dpr, pageLoad };
}

let telemetryEls = null;

function getTelemetryEls() {
  if (!telemetryEls) {
    telemetryEls = {
      time: document.querySelectorAll('.time-val'),
      tz: document.querySelectorAll('.tz-val'),
      cpu: document.querySelectorAll('.cpu-cores-val'),
      gpu: document.querySelectorAll('.gpu-val'),
      ram: document.querySelectorAll('.ram-val'),
      net: document.querySelectorAll('.net-val'),
      fps: document.querySelectorAll('.fps-val'),
      load: document.querySelectorAll('.load-val'),
      os: document.querySelectorAll('.os-val'),
      res: document.querySelectorAll('.res-val'),
      heap: document.querySelectorAll('.heap-val'),
      dpr: document.querySelectorAll('.dpr-val'),
    };
  }
  return telemetryEls;
}

function getNetworkStatus() {
  if (!navigator.onLine) return 'OFFLINE';
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    const type = conn.effectiveType ? conn.effectiveType.toUpperCase() : 'ONLINE';
    const rtt = conn.rtt ? `${conn.rtt}MS` : '';
    return rtt ? `${type} (${rtt})` : type;
  }
  return 'ONLINE (FAST)';
}

function initStaticTelemetry() {
  const els = getTelemetryEls();
  const specs = getClientStaticSpecs();
  els.cpu.forEach(el => { el.textContent = specs.cores; });
  els.gpu.forEach(el => { el.textContent = specs.gpu; });
  els.ram.forEach(el => { el.textContent = specs.ram; });
  els.load.forEach(el => { el.textContent = specs.pageLoad; });
  els.os.forEach(el => { el.textContent = specs.os; });
  els.res.forEach(el => { el.textContent = specs.res; });
  els.dpr.forEach(el => { el.textContent = specs.dpr; });
  const net = getNetworkStatus();
  els.net.forEach(el => { el.textContent = net; });
}

function updateDynamicTelemetry() {
  if (document.hidden) return;
  const els = getTelemetryEls();
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const localTimeString = `${hours}:${minutes}:${seconds}`;

  let tzCode = 'LOCAL';
  try {
    const tzMatch = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(now).find(p => p.type === 'timeZoneName');
    tzCode = tzMatch ? tzMatch.value : Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (err) {
    const offset = -now.getTimezoneOffset() / 60;
    tzCode = `GMT${offset >= 0 ? '+' : ''}${offset}`;
  }

  let heap = 'N/A';
  if (performance && performance.memory && performance.memory.usedJSHeapSize) {
    heap = `${Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))}MB`;
  }

  els.time.forEach(el => { el.textContent = localTimeString; });
  els.tz.forEach(el => { el.textContent = tzCode; });
  els.fps.forEach(el => { el.textContent = `${currentFps} FPS`; });
  els.heap.forEach(el => { el.textContent = heap; });
}

let telemetryTimer = null;
function startTelemetryEngine() {
  if (!telemetryTimer) {
    telemetryTimer = setInterval(updateDynamicTelemetry, 1000);
  }
  // Sample FPS every 10 seconds instead of continuous RAF
  startFpsSampling();
  if (!fpsSampleTimer) {
    fpsSampleTimer = setInterval(startFpsSampling, 10000);
  }
  updateDynamicTelemetry();
}

function stopTelemetryEngine() {
  if (telemetryTimer) {
    clearInterval(telemetryTimer);
    telemetryTimer = null;
  }
  if (fpsSampleTimer) {
    clearInterval(fpsSampleTimer);
    fpsSampleTimer = null;
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopTelemetryEngine();
  } else {
    startTelemetryEngine();
  }
});

function toggleMobileNav(e) {
  if (e) e.stopPropagation();
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('navMenuWrapper');
  if (btn && menu) {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  }
}

function setTheme(theme, notify = false) {
  const validTheme = ['dark', 'matrix', 'light'].includes(theme) ? theme : 'light';

  document.body.classList.remove('theme-dark', 'theme-matrix');
  if (validTheme === 'dark') {
    document.body.classList.add('theme-dark');
  } else if (validTheme === 'matrix') {
    document.body.classList.add('theme-matrix');
  }

  try {
    localStorage.setItem('portfolio_theme', validTheme);
  } catch (e) {}

  if (notify) {
    const messages = {
      light: 'Default Brutalist Light Mode restored',
      dark: 'Inverted Dark Mode activated',
      matrix: 'Cyber Matrix Mode activated',
    };
    showToast(messages[validTheme]);
  }
}

function getStoredTheme() {
  try {
    const saved = localStorage.getItem('portfolio_theme');
    if (saved && ['light', 'dark', 'matrix'].includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return 'light';
}

function closeMobileNav() {
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('navMenuWrapper');
  if (btn && menu) {
    btn.classList.remove('active');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
}

function toggleCliDrawer(e) {
  if (e) e.preventDefault();
  const drawer = document.getElementById('cliDrawer');
  const trigger = document.getElementById('cliTriggerBtn');
  if (!drawer) return;
  const isOpen = drawer.classList.toggle('open');
  if (trigger) trigger.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    const input = document.getElementById('cliInput');
    if (input) input.focus();
  } else if (trigger) {
    trigger.focus();
  }
}

function triggerHtmxNotification(msg) {
  const screen = document.getElementById('cliScreen');
  const drawer = document.getElementById('cliDrawer');
  const trigger = document.getElementById('cliTriggerBtn');
  if (drawer && screen) {
    drawer.classList.add('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const entry = document.createElement('div');
    entry.innerHTML = `<span style="color:#00FF66;">&gt; [SYS_EVENT]</span> ${escapeHtml(msg)}`;
    screen.appendChild(entry);
    screen.scrollTop = screen.scrollHeight;
  }
  showToast(msg);
}

document.addEventListener('DOMContentLoaded', () => {
  setTheme(getStoredTheme(), false);
  initStaticTelemetry();
  startTelemetryEngine();

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileNav);
  }

  const navMenuWrapper = document.getElementById('navMenuWrapper');
  if (navMenuWrapper) {
    navMenuWrapper.querySelectorAll('.nav-links a, .nav-cta-btn').forEach(link => {
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

  const cliCloseBtn = document.getElementById('cliCloseBtn');
  if (cliCloseBtn) {
    cliCloseBtn.addEventListener('click', toggleCliDrawer);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const drawer = document.getElementById('cliDrawer');
      const trigger = document.getElementById('cliTriggerBtn');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCliDrawer();
    } else if (e.key === '`' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      toggleCliDrawer();
    }
  });

  document.querySelectorAll('[data-notify]').forEach(link => {
    link.addEventListener('click', function () {
      const msg = this.getAttribute('data-notify');
      if (msg) triggerHtmxNotification(msg);
    });
  });

  const cliInput = document.getElementById('cliInput');
  const cliScreen = document.getElementById('cliScreen');
  const cliCommands = [
    'help', 'status', 'stack', 'skills', 'projects', 'experience', 'cv',
    'contact', 'email', 'repo', 'theme', 'matrix', 'sudo', 'whoami', 'clear'
  ];
  const commandHistory = [];
  let historyIndex = -1;
  let matrixInterval = null;

  function runMatrixEffect() {
    if (matrixInterval) clearInterval(matrixInterval);
    const chars = '0123456789ABCDEF$#@%*+-=';
    let ticks = 0;
    const matrixBlock = document.createElement('div');
    matrixBlock.style.color = '#00FF66';
    matrixBlock.style.fontFamily = 'monospace';
    cliScreen.appendChild(matrixBlock);

    matrixInterval = setInterval(() => {
      let line = '';
      for (let i = 0; i < 36; i++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      matrixBlock.textContent = line;
      cliScreen.scrollTop = cliScreen.scrollHeight;
      ticks++;
      if (ticks > 18) {
        clearInterval(matrixInterval);
        matrixInterval = null;
        matrixBlock.innerHTML = `<span style="color:#00FF66;">[MATRIX STREAM COMPLETED // ACCESS GRANTED]</span>`;
        cliScreen.scrollTop = cliScreen.scrollHeight;
      }
    }, 60);
  }

  if (cliInput && cliScreen) {
    cliInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
          if (historyIndex === -1) historyIndex = commandHistory.length - 1;
          else if (historyIndex > 0) historyIndex--;
          this.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (commandHistory.length > 0 && historyIndex !== -1) {
          if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            this.value = commandHistory[historyIndex];
          } else {
            historyIndex = -1;
            this.value = '';
          }
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = this.value.trim().toLowerCase();
        if (current) {
          const match = cliCommands.find(cmd => cmd.startsWith(current));
          if (match) this.value = match;
        }
      } else if (e.key === 'Enter') {
        const rawCmd = this.value.trim();
        if (!rawCmd) return;

        commandHistory.push(rawCmd);
        historyIndex = -1;

        const logRow = document.createElement('div');
        logRow.innerHTML = `<span style="color:#FFF;">&gt; ${escapeHtml(rawCmd)}</span>`;
        cliScreen.appendChild(logRow);

        const responseRow = document.createElement('div');
        const lower = rawCmd.toLowerCase();
        const parts = lower.split(' ');
        const mainCmd = parts[0];
        const arg = parts[1] || '';

        if (mainCmd === 'help') {
          responseRow.innerHTML = `Available commands: <br>- <strong>status</strong>: View availability &amp; location<br>- <strong>stack</strong>: List core technologies<br>- <strong>skills</strong>: Visual ASCII proficiency breakdown<br>- <strong>projects</strong>: View deployed applications<br>- <strong>experience</strong> / <strong>cv</strong>: Work history breakdown<br>- <strong>matrix</strong>: Run terminal stream easter egg<br>- <strong>theme [dark|light|matrix]</strong>: Switch theme mode<br>- <strong>contact</strong>: View contact channels<br>- <strong>email</strong>: Copy email address to clipboard<br>- <strong>whoami</strong>: Display visitor hardware session<br>- <strong>repo</strong>: Visit GitHub repository<br>- <strong>clear</strong>: Reset terminal screen`;
        } else if (mainCmd === 'status') {
          responseRow.innerHTML = `SYS_STATUS: Open to Work &amp; Freelance (Makassar / Remote)`;
        } else if (mainCmd === 'stack') {
          responseRow.innerHTML = `CORE: PHP, Laravel, Kotlin, Python, TensorFlow, Node.js, Rust, Docker, MySQL`;
        } else if (mainCmd === 'skills') {
          responseRow.innerHTML = `[CORE COMPETENCY TREE]<br>PHP / LARAVEL       [████████████████░░] 88%<br>KOTLIN / ANDROID    [█████████████████░] 92%<br>PYTHON / YOLO / ML  [███████████████░░░] 82%<br>MYSQL / DOCKER / CI [███████████████░░░] 85%`;
        } else if (mainCmd === 'projects') {
          responseRow.innerHTML = `DEPLOYMENTS:<br>1. Silsilahku (Svelte, SQLite, Canvas Graph)<br>2. EduReflect (Python, YOLO, Computer Vision)<br>3. Rangkum (Kotlin, Vosk STT, AI Summarizer)`;
        } else if (mainCmd === 'experience' || mainCmd === 'cv' || mainCmd === 'resume') {
          responseRow.innerHTML = `EXPERIENCE LOG:<br>- Jan 2026 - Present: Full Stack Developer @ PT Global Connection Indonesia<br>- Jul 2025 - Nov 2025: ML Cohort @ Dicoding Indonesia<br>- Dec 2023 - Jan 2024: Mobile Apps Developer @ PT Bank Mandiri (Persero) Tbk.<br>- Feb 2023 - Jul 2023: Mobile Cohort @ Bangkit Academy`;
        } else if (mainCmd === 'matrix') {
          runMatrixEffect();
          this.value = '';
          return;
        } else if (mainCmd === 'theme') {
          if (arg === 'dark' || arg === 'matrix' || arg === 'light') {
            setTheme(arg, false);
            responseRow.innerHTML = `THEME: ${arg.toUpperCase()} Mode activated.`;
            showToast(`${arg.toUpperCase()} Mode Activated`);
          } else if (arg === 'reset') {
            setTheme('light', false);
            responseRow.innerHTML = `THEME: Default Brutalist Light Mode restored.`;
            showToast('Default Theme Restored');
          } else {
            responseRow.innerHTML = `Usage: theme [dark | matrix | light]`;
          }
        } else if (mainCmd === 'whoami') {
          const specs = getClientStaticSpecs();
          responseRow.innerHTML = `SESSION: ${escapeHtml(specs.os)} Client | ${escapeHtml(specs.cores)} | ${escapeHtml(specs.res)}`;
        } else if (mainCmd === 'sudo') {
          responseRow.innerHTML = `<span style="color:#FF4444;">Permission denied: User 'guest' is not in the sudoers file. This incident will be logged.</span>`;
        } else if (mainCmd === 'contact') {
          responseRow.innerHTML = `WhatsApp: 082291871923<br>Instagram: @achmadichzan_<br>Email: achmadichzan9@gmail.com`;
        } else if (mainCmd === 'email') {
          if (navigator.clipboard) {
            navigator.clipboard.writeText('achmadichzan9@gmail.com')
              .then(() => {
                responseRow.innerHTML = `COPIED: achmadichzan9@gmail.com to clipboard.`;
                showToast('Email address copied to clipboard');
              })
              .catch(() => {
                responseRow.innerHTML = `EMAIL: achmadichzan9@gmail.com`;
              });
          } else {
            responseRow.innerHTML = `EMAIL: achmadichzan9@gmail.com`;
          }
        } else if (mainCmd === 'repo') {
          window.open('https://github.com/achmadichzan', '_blank', 'noopener,noreferrer');
          responseRow.innerHTML = `OPENED: https://github.com/achmadichzan`;
        } else if (mainCmd === 'clear') {
          cliScreen.innerHTML = `<div>DEV_ROOT v1.0.0 (x86_64-pc-none-elf)</div><div style="color: #888888;">----------------------------------------</div>`;
          this.value = '';
          return;
        } else {
          responseRow.innerHTML = `<span style="color:#FF4444;">Command not recognized: '${escapeHtml(rawCmd)}'. Type 'help' for options.</span>`;
        }

        cliScreen.appendChild(responseRow);
        this.value = '';
        cliScreen.scrollTop = cliScreen.scrollHeight;
      }
    });
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const typewriterText = document.getElementById('typewriterText');
  const typewriterBio = document.getElementById('typewriterBio');
  const initCursor = document.getElementById('initCursor');
  const bioCursor = document.getElementById('bioCursor');

  if (typewriterText && typewriterBio && !prefersReducedMotion) {
    const promptPhrase = 'System initialized...';
    const bioParagraph = typewriterBio.textContent.trim() || 'I build production web applications with PHP/Laravel, develop native Android apps with Kotlin, and apply machine learning with Python/TensorFlow. Focused on writing clean, maintainable code, and delivering reliable systems from frontend to backend.';

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

    setTimeout(typePrompt, 300);
  }

  // Clone telemetry content for seamless marquee loop
  const telemetryTrack = document.querySelector('.telemetry-track');
  const telemetryOriginal = telemetryTrack && telemetryTrack.querySelector('.telemetry-content');
  if (telemetryTrack && telemetryOriginal) {
    const clone = telemetryOriginal.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    telemetryTrack.appendChild(clone);
    // Re-cache telemetry elements after cloning
    telemetryEls = null;
  }

  // Scroll reveal via IntersectionObserver
  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      revealElements.forEach(el => revealObserver.observe(el));
    }
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // Metric count-up animation on scroll
  if (!prefersReducedMotion) {
    const metricVals = document.querySelectorAll('.metric-val');
    if (metricVals.length > 0) {
      const metricObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
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
      }, { threshold: 0.5 });
      metricVals.forEach(el => metricObserver.observe(el));
    }
  }

  // Scrollspy: active nav link highlight based on scroll position
  const sections = document.querySelectorAll('main > section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  if (sections.length > 0 && navAnchors.length > 0) {
    const scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(sec => scrollSpyObserver.observe(sec));
  }
});
