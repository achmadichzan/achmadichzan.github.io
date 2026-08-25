# DEV_ROOT_V1.0 // Neo-Brutalist Personal Architecture

Single-file production-ready personal portfolio landing page with high-fidelity Neo-Brutalist design, zero build steps, vanilla HTML5, pure CSS, and vanilla JavaScript.

---

## ⚡ Technical Specifications

- **Design Philosophy**: Neo-Brutalism (Solid thick 3px/4px borders, hard zero-blur offset drop shadows, strict 90-degree corners, Impact headlines, monospace body, neon green `#00FF66`, pure blue `#0000FF`, dark terminal cards `#0A0A0A`).
- **Core Stack**: Semantic Vanilla HTML5, Pure Vanilla Modern CSS (CSS Grid, Flexbox, CSS Variables), Pure Vanilla JavaScript.
- **Zero External Dependencies**: 100% self-hosted local WOFF2 fonts, local AVIF/WebP graphics, zero CDN dependencies, zero framework lock-in.
- **Micro-Interactions**:
  - Live Client Hardware & System Telemetry Ticker (CPU Threads, GPU Model, RAM, FPS Refresh Rate, Page Load, Timezone).
  - Interactive slide-up `>_CLI` Terminal with built-in commands (`help`, `status`, `stack`, `skills`, `projects`, `experience`, `theme`, `matrix`, `contact`, `email`, `clear`).
  - Direct mailto transmission and social integrations.
  - Scroll-triggered reveal animations & metric count-up observer.
  - Fully responsive with fluid typography (`clamp()`) and GPU-accelerated marquee scrolling telemetry.

---

## 📂 File Architecture

```text
achmadichzan/
├── index.html        # Main semantic HTML structure & structured JSON-LD data
├── style.css         # Self-hosted @font-face rules & complete Neo-Brutalist design system
├── script.js         # Telemetry engine, scroll reveal, Scrollspy & interactive CLI terminal
├── robots.txt        # Web crawler configuration
├── sitemap.xml       # XML sitemap with canonical domain
├── assets/
│   ├── avatar.avif   # Ultra-lightweight primary avatar image (9.5 KB)
│   ├── avatar.webp   # WebP fallback avatar image (12 KB)
│   ├── og-image.webp # Social media share preview banner (28 KB)
│   ├── favicon.svg   # Neo-brutalist terminal green prompt icon
│   └── fonts/        # Self-hosted Latin WOFF2 fonts (Space Mono & JetBrains Mono)
└── README.md         # Technical architecture documentation
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
