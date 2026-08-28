import { escapeHtml, showToast } from '../utils/dom.js';
import { setLanguage } from './i18n.js';
import { setTheme, VALID_THEMES } from './theme.js';
import { getClientStaticSpecs } from './telemetry.js';

let matrixInterval = null;

export function toggleCliDrawer(e) {
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

export function triggerHtmxNotification(msg) {
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

export function initDraggableCli() {
  const drawer = document.getElementById('cliDrawer');
  const header = drawer ? drawer.querySelector('.cli-header') : null;
  if (!drawer || !header) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(val, max));
  }

  function onPointerDown(e) {
    if (e.target.closest('#cliCloseBtn')) return;

    isDragging = true;
    drawer.classList.add('dragging');

    const rect = drawer.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;

    drawer.style.left = `${initialLeft}px`;
    drawer.style.top = `${initialTop}px`;
    drawer.style.right = 'auto';
    drawer.style.bottom = 'auto';

    header.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const drawerWidth = drawer.offsetWidth;
    const drawerHeight = drawer.offsetHeight;
    const maxLeft = Math.max(0, window.innerWidth - drawerWidth);
    const maxTop = Math.max(0, window.innerHeight - drawerHeight);

    const newLeft = clamp(initialLeft + deltaX, 0, maxLeft);
    const newTop = clamp(initialTop + deltaY, 0, maxTop);

    drawer.style.left = `${newLeft}px`;
    drawer.style.top = `${newTop}px`;
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    drawer.classList.remove('dragging');
    try {
      header.releasePointerCapture(e.pointerId);
    } catch (err) {}
  }

  header.addEventListener('pointerdown', onPointerDown);
  header.addEventListener('pointermove', onPointerMove);
  header.addEventListener('pointerup', onPointerUp);
  header.addEventListener('pointercancel', onPointerUp);

  window.addEventListener('resize', () => {
    if (drawer.style.left && drawer.style.left !== 'auto') {
      const rect = drawer.getBoundingClientRect();
      const maxLeft = Math.max(0, window.innerWidth - rect.width);
      const maxTop = Math.max(0, window.innerHeight - rect.height);
      drawer.style.left = `${clamp(rect.left, 0, maxLeft)}px`;
      drawer.style.top = `${clamp(rect.top, 0, maxTop)}px`;
    }
  });
}

export function initCliInput() {
  const cliInput = document.getElementById('cliInput');
  const cliScreen = document.getElementById('cliScreen');
  const cliGhostText = document.getElementById('cliGhostText');
  if (!cliInput || !cliScreen) return;

  const cliCommands = [
    'help', 'status', 'stack', 'skills', 'projects', 'experience', 'cv', 'resume',
    'contact', 'email', 'repo', 'theme', 'win95', 'matrix', 'dark', 'lang', 'bahasa', 'english', 'indonesia', 'sudo', 'whoami', 'clear'
  ];
  const MAX_COMMAND_HISTORY = 50;
  const commandHistory = [];
  let historyIndex = -1;
  let activeSuggestion = '';

  function updateGhostSuggestion(val) {
    if (!cliGhostText) return;
    const inputVal = val.toLowerCase();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      cliGhostText.innerHTML = '';
      activeSuggestion = '';
      return;
    }
    const match = cliCommands.find((cmd) => cmd.startsWith(trimmed) && cmd !== trimmed);
    if (match) {
      activeSuggestion = match;
      const prefix = val;
      const suffix = match.slice(trimmed.length);
      cliGhostText.innerHTML = `<span class="ghost-prefix">${escapeHtml(prefix)}</span><span class="ghost-suffix">${escapeHtml(suffix)}</span>`;
    } else {
      activeSuggestion = '';
      cliGhostText.innerHTML = '';
    }
  }

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

  cliInput.addEventListener('input', function () {
    updateGhostSuggestion(this.value);
  });

  cliInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        if (historyIndex === -1) historyIndex = commandHistory.length - 1;
        else if (historyIndex > 0) historyIndex--;
        this.value = commandHistory[historyIndex];
        updateGhostSuggestion(this.value);
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
        updateGhostSuggestion(this.value);
      }
    } else if (e.key === 'Tab' || (e.key === 'ArrowRight' && this.selectionStart === this.value.length)) {
      if (activeSuggestion) {
        e.preventDefault();
        this.value = activeSuggestion;
        updateGhostSuggestion(this.value);
      } else {
        const current = this.value.trim().toLowerCase();
        if (current) {
          const match = cliCommands.find((cmd) => cmd.startsWith(current));
          if (match) {
            e.preventDefault();
            this.value = match;
            updateGhostSuggestion(this.value);
          }
        }
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
        responseRow.innerHTML =
          document.documentElement.lang === 'id'
            ? `STATUS_SYS: Terbuka untuk Pekerjaan &amp; Freelance (Makassar / Remote)`
            : `SYS_STATUS: Open to Work &amp; Freelance (Makassar / Remote)`;
      } else if (mainCmd === 'stack') {
        responseRow.innerHTML = `CORE: PHP, Kotlin, Python, Bun, Node.js, Rust<br>FRAMEWORKS: Laravel, Vue, Svelte, Tailwind CSS, FastAPI<br>DATABASE: MySQL, SQLite<br>TOOLS: Docker, WSL2, Android Studio, VS Code`;
      } else if (mainCmd === 'skills') {
        responseRow.innerHTML = `[CORE COMPETENCY TREE]<br>PHP / LARAVEL       [████████████████░░] 88%<br>KOTLIN / ANDROID    [█████████████████░] 92%<br>PYTHON / YOLO / ML  [███████████████░░░] 82%<br>MYSQL / DOCKER / CI [███████████████░░░] 85%`;
      } else if (mainCmd === 'projects') {
        responseRow.innerHTML = `DEPLOYMENTS:<br>1. <a href="https://silsilahku.achmadichzan9.workers.dev/" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Silsilahku</a> (<a href="https://github.com/achmadichzan/silsilahku" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Repo</a>) - Svelte, SQLite, Canvas Graph<br>2. <a href="https://huggingface.co/spaces/PJK-GU108/EduReflect" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">EduReflect</a> (<a href="https://github.com/PJK-GU108/EduReflect" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Repo</a>) - Python, YOLO, Computer Vision<br>3. <a href="https://github.com/achmadichzan/Rangkum" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Rangkum</a> (Kotlin, Vosk STT, AI Summarizer)<br>4. <a href="https://github.com/achmadichzan/app_locker" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">App Locker</a> (Rust, Slint UI, Windows NTDLL, Named Pipes IPC)<br>5. <a href="https://github.com/achmadichzan/Unalzheimer" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">Unalzheimer</a> (Kotlin, Jetpack Compose, MVVM, DataStore)`;
      } else if (mainCmd === 'experience' || mainCmd === 'cv' || mainCmd === 'resume') {
        responseRow.innerHTML =
          document.documentElement.lang === 'id'
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
          navigator.clipboard
            .writeText('achmadichzan9@gmail.com')
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
        updateGhostSuggestion('');
        return;
      } else {
        responseRow.innerHTML = `<span style="color:#FF4444;">Command not recognized: '${escapeHtml(rawCmd)}'. Type 'help' for options.</span>`;
      }

      cliScreen.appendChild(responseRow);
      this.value = '';
      updateGhostSuggestion('');
      cliScreen.scrollTop = cliScreen.scrollHeight;
    }
  });
}
