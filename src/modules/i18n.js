import { showToast } from '../utils/dom.js';

export const TRANSLATIONS = {
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
    'about.bio': 'I build production web applications with PHP/Laravel, develop native Android apps with Kotlin, and apply machine learning with Python/TensorFlow. Focused on writing clean, maintainable code with Clean Architecture, and delivering reliable systems from frontend to backend.',
    'about.location': 'Makassar / Remote',
    'about.class': 'Full Stack Developer',
    'about.focus': 'Frontend &amp; Backend Systems, Performance, Clean Architecture',
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
    'about.readOnly': '[READ_ONLY]',
    'about.promptInit': 'System initialized...',
    'about.bio': 'Saya membangun aplikasi web produksi dengan PHP/Laravel, mengembangkan aplikasi native Android dengan Kotlin, dan menerapkan machine learning dengan Python/TensorFlow. Berfokus pada penulisan kode yang bersih dan maintainable dengan Clean Architecture, serta menghadirkan sistem andal dari frontend hingga backend.',
    'about.location': 'Makassar / Remote',
    'about.class': 'Full Stack Developer',
    'about.focus': 'Sistem Frontend &amp; Backend, Performa, Clean Architecture',
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
    'exp.row4Desig': 'Peserta Mobile Development',
    'footer.rights': '&copy;2026 ACHMAD ICHZAN // HAK CIPTA DILINDUNGI',
    'preloader.title': 'DEV_BOOT // INISIALISASI_SESI'
  }
};

export function setLanguage(lang, notify = false) {
  const selectedLang = ['en', 'id'].includes(lang) ? lang : 'en';
  document.documentElement.lang = selectedLang;

  const dict = TRANSLATIONS[selectedLang] || TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
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

export function getStoredLanguage() {
  try {
    const saved = localStorage.getItem('portfolio_lang');
    if (saved && ['en', 'id'].includes(saved)) {
      return saved;
    }
  } catch (e) {}

  const userLangs = navigator.languages || [navigator.language || ''];
  const hasIndonesian = userLangs.some((lang) => lang && lang.toLowerCase().startsWith('id'));
  return hasIndonesian ? 'id' : 'en';
}
