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

function updateNetworkStatus() {
  const els = getTelemetryEls();
  const net = getNetworkStatus();
  els.net.forEach(el => { el.textContent = net; });
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

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
  updateNetworkStatus();
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

const VALID_THEMES = ['light', 'win95', 'matrix', 'dark'];

function setTheme(theme, notify = false) {
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
  } catch (e) { }

  if (notify) {
    const messages = {
      light: 'Neo-Brutalist Light Mode activated',
      win95: 'Dial-Up 90s / Windows 95 Retro Theme activated',
      matrix: 'Cyber Matrix Terminal Mode activated',
      dark: 'Inverted Dark Mode activated',
    };
    showToast(messages[validTheme]);
  }
}

function getStoredTheme() {
  try {
    const saved = localStorage.getItem('portfolio_theme');
    if (saved && VALID_THEMES.includes(saved)) {
      return saved;
    }
  } catch (e) { }
  return 'light';
}

const TRANSLATIONS = {
  en: {
    'nav.about': 'ABOUT',
    'nav.stack': 'STACK',
    'nav.projects': 'PROJECTS',
    'nav.experience': 'EXPERIENCE',
    'nav.cta': '[GET_IN_TOUCH]',
    'hero.status': '[STATUS: OPEN TO WORK / FREELANCE]',
    'hero.headline': 'FULL-STACK<br>DEVELOPER',
    'hero.specStack': '&gt; STACK: LARAVEL / KOTLIN / FASTAPI',
    'hero.specBase': '&gt; BASE: MAKASSAR, ID',
    'hero.verified': '[SYS: VERIFIED]',
    'about.file': 'ABOUT_ME.TXT',
    'about.readOnly': '[READ_ONLY]',
    'about.promptInit': 'System initialized...',
    'about.bio': 'I build production web applications with PHP/Laravel, develop native Android apps with Kotlin, and apply machine learning with Python/TensorFlow. Focused on writing clean, maintainable code, and delivering reliable systems from frontend to backend.',
    'about.location': 'Makassar / Remote',
    'about.class': 'Full Stack Developer',
    'about.focus': 'Frontend &amp; Backend Systems, Performance',
    'about.specLocationKey': 'LOCATION:',
    'about.specClassKey': 'CLASS:',
    'about.specFocusKey': 'FOCUS:',
    'about.metricsApps': 'APPS DEPLOYED',
    'about.metricsExp': 'EXP',
    'about.metricsRepos': 'REPOS',
    'tech.title': 'TECHNICAL_LOG',
    'tech.status': '[SYS.STATUS: OK]',
    'tech.catCore': 'CORE &amp; RUNTIME',
    'tech.catFrameworks': 'FRAMEWORKS &amp; UI',
    'tech.catDatabase': 'DATABASE &amp; STORAGE',
    'tech.catTools': 'ARCHITECTURE &amp; TOOLS',
    'proj.title': 'DEPLOYMENTS',
    'proj.silsilahkuTitle': 'INTERACTIVE FAMILY TREE BUILDER',
    'proj.silsilahkuDesc': 'Interactive web application to construct and visualize family trees featuring a Figma-style draggable infinite canvas, dynamic node relations, and genealogy management.',
    'proj.silsilahkuInterface': '&gt; INTERFACE: Infinite Draggable Canvas',
    'proj.silsilahkuDeploy': '&gt; DEPLOY: Cloudflare Workers',
    'proj.edureflectTitle': 'AI FACIAL EXPRESSION RECOGNITION',
    'proj.edureflectDesc': 'Computer vision system analyzing classroom learning videos to detect 7 facial micro-expressions (happy, sad, surprise, fear, disgust, anger, neutral) and generate automated teaching recommendations.',
    'proj.edureflectDetection': '&gt; DETECTION: 7 Micro-Expressions (YOLO)',
    'proj.edureflectDeploy': '&gt; DEPLOY: Hugging Face Spaces',
    'proj.rangkumTitle': 'LIVE AUDIO TRANSCRIPTION &amp; AI SUMMARIZER',
    'proj.rangkumDesc': 'Native Android application providing real-time multilingual speech-to-text powered by the Vosk engine, converting long-duration foreign audio and video speech into concise AI-generated summaries.',
    'proj.rangkumEngine': '&gt; ENGINE: Vosk Multilingual Offline STT',
    'proj.rangkumIntel': '&gt; INTELLIGENCE: Automated LLM Summarizer',
    'proj.applockerTitle': 'NATIVE WINDOWS PROCESS INTERCEPTOR &amp; APP LOCKER',
    'proj.applockerDesc': 'Native Windows security desktop application built with Rust that intercepts and suspends target processes via low-level NT APIs (NtSuspendProcess) before execution, featuring modern Slint UI authentication and IPC Named Pipes.',
    'proj.applockerEngine': '&gt; ENGINE: Low-Level Process Interception (NtSuspendProcess)',
    'proj.applockerArch': '&gt; ARCHITECTURE: Cargo Workspace (Daemon, UI, Watchdog)',
    'proj.unalzheimerTitle': 'NATIVE ANDROID MEMORY &amp; COGNITIVE TRAINING GAME',
    'proj.unalzheimerDesc': 'Native Android cognitive brain-training game inspired by the Chimp Test challenge, engineered with 100% Kotlin and Jetpack Compose featuring 3D card flips, progressive levels, StateFlow reactive architecture, and Preferences DataStore.',
    'proj.unalzheimerEngine': '&gt; ENGINE: Jetpack Compose 3D Flip &amp; StateFlow',
    'proj.unalzheimerAudio': '&gt; AUDIO &amp; STORAGE: SoundPool &amp; Preferences DataStore',
    'proj.liveDemo': '[LIVE DEMO -&gt;]',
    'proj.viewRepo': '[VIEW REPO -&gt;]',
    'exp.title': 'SYSTEM_HISTORY',
    'exp.thTimeline': 'TIMELINE',
    'exp.thDesignation': 'DESIGNATION',
    'exp.thNode': 'NODE',
    'exp.thStack': 'CORE STACK',
    'exp.row1Time': 'Jan 2026 - Present',
    'exp.row1Desig': 'Full Stack Developer',
    'exp.row2Time': 'Jul 2025 - Nov 2025',
    'exp.row2Desig': 'Machine Learning Bootcamp Student',
    'exp.row3Time': 'Dec 2023 - Jan 2024',
    'exp.row3Desig': 'Mobile Apps Developer',
    'exp.row4Time': 'Feb 2023 - Jul 2023',
    'exp.row4Desig': 'Mobile Development Cohort',
    'footer.rights': '&copy;2026 ACHMAD ICHZAN // ALL RIGHTS RESERVED',
    'preloader.title': 'DEV_BOOT // SESSION_INIT'
  },
  id: {
    'nav.about': 'TENTANG',
    'nav.stack': 'KEAHLIAN',
    'nav.projects': 'PROYEK',
    'nav.experience': 'PENGALAMAN',
    'nav.cta': '[HUBUNGI_SAYA]',
    'hero.status': '[STATUS: TERSEDIA UNTUK KERJA / FREELANCE]',
    'hero.headline': 'FULL-STACK<br>DEVELOPER',
    'hero.specStack': '&gt; STACK: LARAVEL / KOTLIN / FASTAPI',
    'hero.specBase': '&gt; DOMISILI: MAKASSAR, ID',
    'hero.verified': '[SYS: TERVERIFIKASI]',
    'about.file': 'TENTANG_SAYA.TXT',
    'about.readOnly': '[HANYA_BACA]',
    'about.promptInit': 'Sistem diinisialisasi...',
    'about.bio': 'Saya membangun aplikasi web produksi dengan PHP/Laravel, mengembangkan aplikasi native Android dengan Kotlin, dan menerapkan machine learning dengan Python/TensorFlow. Berfokus pada penulisan kode yang bersih dan maintainable, serta menghadirkan sistem andal dari frontend hingga backend.',
    'about.location': 'Makassar / Remote',
    'about.class': 'Full Stack Developer',
    'about.focus': 'Sistem Frontend &amp; Backend, Performa',
    'about.specLocationKey': 'LOKASI:',
    'about.specClassKey': 'PERAN:',
    'about.specFocusKey': 'FOKUS:',
    'about.metricsApps': 'APLIKASI RILIS',
    'about.metricsExp': 'PENGALAMAN',
    'about.metricsRepos': 'REPOSITORI',
    'tech.title': 'LOG_TEKNIKAL',
    'tech.status': '[STATUS.SYS: OK]',
    'tech.catCore': 'CORE &amp; RUNTIME',
    'tech.catFrameworks': 'FRAMEWORK &amp; UI',
    'tech.catDatabase': 'DATABASE &amp; PENYIMPANAN',
    'tech.catTools': 'ARSITEKTUR &amp; TOOLS',
    'proj.title': 'DEPLOYMENT_PROYEK',
    'proj.silsilahkuTitle': 'PEMBUAT SILSILAH KELUARGA INTERAKTIF',
    'proj.silsilahkuDesc': 'Aplikasi web interaktif untuk menyusun dan memvisualisasikan silsilah keluarga dengan infinite canvas interaktif ala Figma, relasi node dinamis, dan manajemen genealogi.',
    'proj.silsilahkuInterface': '&gt; TAMPILAN: Infinite Draggable Canvas',
    'proj.silsilahkuDeploy': '&gt; DEPLOY: Cloudflare Workers',
    'proj.edureflectTitle': 'PENGENALAN EKSPRESI WAJAH AI',
    'proj.edureflectDesc': 'Sistem computer vision yang menganalisis video pembelajaran kelas untuk mendeteksi 7 ekspresi mikro wajah (senang, sedih, terkejut, takut, jijik, marah, netral) serta menghasilkan rekomendasi pengajaran otomatis.',
    'proj.edureflectDetection': '&gt; DETEKSI: 7 Mikro-Ekspresi (YOLO)',
    'proj.edureflectDeploy': '&gt; DEPLOY: Hugging Face Spaces',
    'proj.rangkumTitle': 'TRANSKRIPSI AUDIO &amp; RINGKASAN AI REAL-TIME',
    'proj.rangkumDesc': 'Aplikasi native Android untuk speech-to-text multibahasa real-time bertenaga engine Vosk, merangkum percakapan audio/video berdurasi panjang menjadi ringkasan AI yang ringkas.',
    'proj.rangkumEngine': '&gt; ENGINE: Vosk Multilingual Offline STT',
    'proj.rangkumIntel': '&gt; KECERDASAN: Automated LLM Summarizer',
    'proj.applockerTitle': 'INTERSEPTOR PROSES WINDOWS &amp; PENGUNCI APLIKASI',
    'proj.applockerDesc': 'Aplikasi desktop keamanan Windows native dengan Rust yang mengintersepsi dan menunda eksekusi proses target melalui API low-level NT (NtSuspendProcess), dilengkapi autentikasi Slint UI modern dan IPC Named Pipes.',
    'proj.applockerEngine': '&gt; ENGINE: Intersepsi Proses Low-Level (NtSuspendProcess)',
    'proj.applockerArch': '&gt; ARSITEKTUR: Cargo Workspace (Daemon, UI, Watchdog)',
    'proj.unalzheimerTitle': 'GAME LATIH MEMORI &amp; KOGNITIF ANDROID NATIVE',
    'proj.unalzheimerDesc': 'Game asah otak dan memori Android native yang terinspirasi dari tantangan Chimp Test, dibangun 100% dengan Kotlin dan Jetpack Compose dengan flip kartu 3D, level progresif, arsitektur reaktif StateFlow, dan Preferences DataStore.',
    'proj.unalzheimerEngine': '&gt; ENGINE: Jetpack Compose 3D Flip &amp; StateFlow',
    'proj.unalzheimerAudio': '&gt; AUDIO &amp; PENYIMPANAN: SoundPool &amp; Preferences DataStore',
    'proj.liveDemo': '[DEMO LIVE -&gt;]',
    'proj.viewRepo': '[LIHAT REPO -&gt;]',
    'exp.title': 'RIWAYAT_SISTEM',
    'exp.thTimeline': 'PERIODE',
    'exp.thDesignation': 'POSISI',
    'exp.thNode': 'INSTITUSI',
    'exp.thStack': 'TECH STACK UTAMA',
    'exp.row1Time': 'Jan 2026 - Sekarang',
    'exp.row1Desig': 'Full Stack Developer',
    'exp.row2Time': 'Jul 2025 - Nov 2025',
    'exp.row2Desig': 'Siswa Bootcamp Machine Learning',
    'exp.row3Time': 'Des 2023 - Jan 2024',
    'exp.row3Desig': 'Mobile Apps Developer',
    'exp.row4Time': 'Feb 2023 - Jul 2023',
    'exp.row4Desig': 'Peserta Mobile Development Cohort',
    'footer.rights': '&copy;2026 ACHMAD ICHZAN // HAK CIPTA DILINDUNGI',
    'preloader.title': 'DEV_BOOT // INISIALISASI_SESI'
  }
};

function setLanguage(lang, notify = false) {
  const selectedLang = ['en', 'id'].includes(lang) ? lang : 'en';
  document.documentElement.lang = selectedLang;

  const dict = TRANSLATIONS[selectedLang] || TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) {
    langBtn.textContent = `[LANG: ${selectedLang.toUpperCase()}]`;
    langBtn.setAttribute('title', selectedLang === 'id' ? 'Ganti ke Bahasa Inggris (EN)' : 'Switch to Indonesian (ID)');
  }

  const typewriterBio = document.getElementById('typewriterBio');
  if (typewriterBio && typewriterBio.textContent.length > 0) {
    typewriterBio.textContent = dict['about.bio'];
  }

  try {
    localStorage.setItem('portfolio_lang', selectedLang);
  } catch (e) {}

  if (notify) {
    showToast(selectedLang === 'id' ? 'Bahasa Indonesia diaktifkan' : 'Switched to English');
  }
}

function getStoredLanguage() {
  try {
    const saved = localStorage.getItem('portfolio_lang');
    if (saved && ['en', 'id'].includes(saved)) {
      return saved;
    }
  } catch (e) {}

  const userLangs = navigator.languages || [navigator.language || ''];
  const hasIndonesian = userLangs.some(lang => lang && lang.toLowerCase().startsWith('id'));
  return hasIndonesian ? 'id' : 'en';
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

let matrixInterval = null;

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
  } else {
    if (matrixInterval) {
      clearInterval(matrixInterval);
      matrixInterval = null;
    }
    if (trigger) {
      trigger.focus({ preventScroll: true });
    }
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

function initTerminalPreloader() {
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
  const frames = currentTheme === 'win95'
    ? ['[■░░░░]', '[■■░░░]', '[■■■░░]', '[■■■■░]', '[■■■■■]']
    : ['|', '/', '-', '\\'];
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

document.addEventListener('DOMContentLoaded', () => {
  const currentLang = getStoredLanguage();
  setTheme(getStoredTheme(), false);
  setLanguage(currentLang, false);
  initTerminalPreloader();
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
    if (e.key === 'Escape') {
      const drawer = document.getElementById('cliDrawer');
      const trigger = document.getElementById('cliTriggerBtn');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        if (matrixInterval) {
          clearInterval(matrixInterval);
          matrixInterval = null;
        }
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus({ preventScroll: true });
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
    'contact', 'email', 'repo', 'theme', 'win95', 'matrix', 'dark', 'lang', 'bahasa', 'english', 'sudo', 'whoami', 'clear'
  ];
  const MAX_COMMAND_HISTORY = 50;
  const commandHistory = [];
  let historyIndex = -1;

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
        if (commandHistory.length > MAX_COMMAND_HISTORY) {
          commandHistory.shift();
        }
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
          responseRow.innerHTML = `Available commands: <br>- <strong>status</strong>: View availability &amp; location<br>- <strong>stack</strong>: List core technologies<br>- <strong>skills</strong>: Visual ASCII proficiency breakdown<br>- <strong>projects</strong>: View deployed applications<br>- <strong>experience</strong> / <strong>cv</strong>: Work history breakdown<br>- <strong>matrix</strong>: Run terminal stream easter egg<br>- <strong>lang [en|id]</strong> / <strong>bahasa</strong>: Switch interface language<br>- <strong>theme [light|win95|matrix|dark]</strong>: Switch theme mode<br>- <strong>win95</strong>: Activate Dial-Up 90s / Windows 95 theme<br>- <strong>contact</strong>: View contact channels<br>- <strong>email</strong>: Copy email address to clipboard<br>- <strong>whoami</strong>: Display visitor hardware session<br>- <strong>repo</strong>: Visit GitHub repository<br>- <strong>clear</strong>: Reset terminal screen`;
        } else if (mainCmd === 'status') {
          responseRow.innerHTML = document.documentElement.lang === 'id'
            ? `STATUS_SYS: Terbuka untuk Pekerjaan &amp; Freelance (Makassar / Remote)`
            : `SYS_STATUS: Open to Work &amp; Freelance (Makassar / Remote)`;
        } else if (mainCmd === 'stack') {
          responseRow.innerHTML = `CORE: PHP, Kotlin, Python, Bun, Node.js, Rust<br>FRAMEWORKS: Laravel, Vue, Svelte, Tailwind CSS, FastAPI<br>DATABASE: MySQL, SQLite<br>TOOLS: Docker, WSL2, Android Studio, VS Code`;
        } else if (mainCmd === 'skills') {
          responseRow.innerHTML = `[CORE COMPETENCY TREE]<br>PHP / LARAVEL       [████████████████░░] 88%<br>KOTLIN / ANDROID    [█████████████████░] 92%<br>PYTHON / YOLO / ML  [███████████████░░░] 82%<br>MYSQL / DOCKER / CI [███████████████░░░] 85%`;
        } else if (mainCmd === 'projects') {
          responseRow.innerHTML = `DEPLOYMENTS:<br>1. <a href="https://silsilahku.achmadichzan9.workers.dev/" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Silsilahku</a> (<a href="https://github.com/achmadichzan/silsilahku" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Repo</a>) - Svelte, SQLite, Canvas Graph<br>2. <a href="https://huggingface.co/spaces/PJK-GU108/EduReflect" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">EduReflect</a> (<a href="https://github.com/PJK-GU108/EduReflect" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Repo</a>) - Python, YOLO, Computer Vision<br>3. <a href="https://github.com/achmadichzan/Rangkum" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Rangkum</a> (Kotlin, Vosk STT, AI Summarizer)<br>4. <a href="https://github.com/achmadichzan/app_locker" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">App Locker</a> (Rust, Slint UI, Windows NTDLL, Named Pipes IPC)<br>5. <a href="https://github.com/achmadichzan/Unalzheimer" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Unalzheimer</a> (Kotlin, Jetpack Compose, MVVM, DataStore)`;
        } else if (mainCmd === 'experience' || mainCmd === 'cv' || mainCmd === 'resume') {
          responseRow.innerHTML = document.documentElement.lang === 'id'
            ? `LOG PENGALAMAN:<br>- Jan 2026 - Sekarang: Full Stack Developer @ PT Global Connection Indonesia<br>- Jul 2025 - Nov 2025: Siswa Bootcamp Machine Learning @ Dicoding Indonesia<br>- Des 2023 - Jan 2024: Mobile Apps Developer @ PT Bank Mandiri (Persero) Tbk.<br>- Feb 2023 - Jul 2023: Peserta Mobile Cohort @ Bangkit Academy`
            : `EXPERIENCE LOG:<br>- Jan 2026 - Present: Full Stack Developer @ PT Global Connection Indonesia<br>- Jul 2025 - Nov 2025: ML Cohort @ Dicoding Indonesia<br>- Dec 2023 - Jan 2024: Mobile Apps Developer @ PT Bank Mandiri (Persero) Tbk.<br>- Feb 2023 - Jul 2023: Mobile Cohort @ Bangkit Academy`;
        } else if (mainCmd === 'matrix') {
          runMatrixEffect();
          this.value = '';
          return;
        } else if (mainCmd === 'lang' || mainCmd === 'language' || mainCmd === 'bahasa') {
          if (arg === 'id' || arg === 'indonesia' || mainCmd === 'bahasa') {
            setLanguage('id', true);
            responseRow.innerHTML = `LANGUAGE: Bahasa Indonesia diaktifkan.`;
          } else if (arg === 'en' || arg === 'english') {
            setLanguage('en', true);
            responseRow.innerHTML = `LANGUAGE: English interface activated.`;
          } else {
            responseRow.innerHTML = `Usage: lang [en | id]`;
          }
        } else if (mainCmd === 'english' || mainCmd === 'en') {
          setLanguage('en', true);
          responseRow.innerHTML = `LANGUAGE: English interface activated.`;
        } else if (mainCmd === 'indonesia' || mainCmd === 'id') {
          setLanguage('id', true);
          responseRow.innerHTML = `LANGUAGE: Bahasa Indonesia diaktifkan.`;
        } else if (mainCmd === 'win95' || mainCmd === 'dialup' || mainCmd === 'retro') {
          setTheme('win95', false);
          responseRow.innerHTML = `THEME: Dial-Up 90s / Windows 95 Retro Theme activated.`;
          showToast('Win95 Theme Activated');
        } else if (mainCmd === 'dark') {
          setTheme('dark', false);
          responseRow.innerHTML = `THEME: DARK Mode activated.`;
          showToast('Dark Mode Activated');
        } else if (mainCmd === 'theme') {
          if (VALID_THEMES.includes(arg)) {
            setTheme(arg, false);
            responseRow.innerHTML = `THEME: ${arg.toUpperCase()} Mode activated.`;
            showToast(`${arg.toUpperCase()} Mode Activated`);
          } else if (arg === 'reset' || arg === 'brutalist') {
            setTheme('light', false);
            responseRow.innerHTML = `THEME: Neo-Brutalist Light Mode restored.`;
            showToast('Brutalist Theme Restored');
          } else {
            responseRow.innerHTML = `Usage: theme [light | win95 | matrix | dark]`;
          }
        } else if (mainCmd === 'whoami') {
          const specs = getClientStaticSpecs();
          responseRow.innerHTML = `SESSION: ${escapeHtml(specs.os)} Client | ${escapeHtml(specs.cores)} | ${escapeHtml(specs.res)}`;
        } else if (mainCmd === 'sudo') {
          responseRow.innerHTML = `<span style="color:#FF4444;">Permission denied: User 'guest' is not in the sudoers file. This incident will be logged.</span>`;
        } else if (mainCmd === 'contact') {
          responseRow.innerHTML = `WhatsApp: <a href="https://wa.me/6282291871923?text=Halo%20Achmad%20Ichzan,%20saya%20tertarik%20untuk%20diskusi%20proyek." target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">082291871923 (Chat Direct)</a><br>Instagram: <a href="https://instagram.com/achmadichzan_" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">@achmadichzan_</a><br>Email: <a href="mailto:achmadichzan9@gmail.com" style="color:inherit;text-decoration:underline;">achmadichzan9@gmail.com</a>`;
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
          cliScreen.innerHTML = `<div>DEV_ROOT v1.0.0 (x86_64-pc-none-elf)</div><div>Type 'help', 'status', 'clear', or 'contact' to interact.</div><div style="color: #888888;">----------------------------------------</div>`;
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
    const dict = TRANSLATIONS[getStoredLanguage()] || TRANSLATIONS.en;
    const promptPhrase = dict['about.promptInit'] || 'System initialized...';
    const bioParagraph = dict['about.bio'] || 'I build production web applications with PHP/Laravel, develop native Android apps with Kotlin, and apply machine learning with Python/TensorFlow. Focused on writing clean, maintainable code, and delivering reliable systems from frontend to backend.';

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

  // Clone telemetry content for seamless marquee loop
  const telemetryTrack = document.querySelector('.telemetry-track');
  const telemetryOriginal = telemetryTrack && telemetryTrack.querySelector('.telemetry-content');
  if (telemetryTrack && telemetryOriginal) {
    const clone = telemetryOriginal.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    telemetryTrack.appendChild(clone);
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

  // Service Worker Registration for Offline PWA Support
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
});
