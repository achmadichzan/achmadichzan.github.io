# DEV_ROOT_V1.0 // Neo-Brutalist Personal Architecture

Single-file production-ready personal portfolio landing page with high-fidelity Neo-Brutalist design, zero build steps, vanilla HTML5, pure CSS, and vanilla JavaScript.

---

## ⚡ Technical Specifications

- **Design Philosophy**: Dual visual architectures (Neo-Brutalism + Dial-Up 90s / Windows 95 Retro OS, Cyber Matrix, Dark Mode) switchable in 0ms via floating action button (FAB) or interactive CLI.
- **Core Stack**: Semantic Vanilla HTML5, Pure Vanilla Modern CSS (CSS Grid, Flexbox, CSS Variables), Pure Vanilla JavaScript.
- **Zero External Dependencies**: 100% self-hosted local WOFF2 fonts, local AVIF/WebP graphics, zero CDN dependencies, zero framework lock-in.
- **Micro-Interactions**:
  - Live Client Hardware & System Telemetry Ticker (CPU Threads, GPU Model, RAM, FPS Refresh Rate, Page Load, Timezone).
  - Interactive slide-up `>_CLI` Terminal / MS-DOS Prompt with built-in commands (`help`, `status`, `stack`, `skills`, `projects`, `experience`, `theme`, `win95`, `matrix`, `contact`, `email`, `clear`).
  - WhatsApp Direct Inquiry integration with prefilled template.
  - Floating Theme Switcher FAB with dynamic SVG iconography.
  - Scroll-triggered reveal animations & metric count-up observer.
  - PWA support with `manifest.webmanifest` and Content-Security-Policy (CSP).

---

## 📂 File Architecture

```text
achmadichzan/
├── index.html            # Main semantic HTML structure & structured JSON-LD data
├── style.css             # Self-hosted @font-face rules & complete multi-theme design system
├── script.js             # Telemetry engine, scroll reveal, Scrollspy & interactive CLI terminal
├── manifest.webmanifest  # PWA configuration
├── robots.txt            # Web crawler configuration
├── sitemap.xml           # XML sitemap with canonical domain
├── assets/
│   ├── avatar.avif       # Ultra-lightweight primary avatar image (9.5 KB)
│   ├── avatar.webp       # WebP fallback avatar image (12 KB)
│   ├── og-image.webp     # Social media share preview banner (28 KB)
│   ├── favicon.svg       # Neo-brutalist terminal green prompt icon
│   └── fonts/            # Self-hosted Latin WOFF2 fonts (Space Mono Regular & Bold)
└── README.md             # Technical architecture documentation
```

---

## 🚀 How to Run Locally

Run any static server or Python HTTP server:

```bash
cd /home/achmadichzan/achmadichzan
python3 -m http.server 3000
or
npx -y vite --port 3000
```
Open your browser at: `http://localhost:3000`
