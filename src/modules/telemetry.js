import { getTelemetryEls } from '../utils/dom.js';

let detectedGpu = null;
export function getGpuRenderer() {
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
let fpsRafId = null;
let fpsSampleTimer = null;

function trackFps(now) {
  if (document.hidden) return;
  frameCount++;
  if (now - lastFpsTime >= 1000) {
    currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    frameCount = 0;
    lastFpsTime = now;
  }
  if (now - lastFpsTime < 2000) {
    fpsRafId = requestAnimationFrame(trackFps);
  } else {
    fpsRafId = null;
  }
}

function startFpsSampling() {
  if (fpsRafId) return;
  lastFpsTime = performance.now();
  frameCount = 0;
  fpsRafId = requestAnimationFrame(trackFps);
}

export function getPageLoadDuration() {
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

export function getClientStaticSpecs() {
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

export function getNetworkStatus() {
  if (!navigator.onLine) return 'OFFLINE';
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    const type = conn.effectiveType ? conn.effectiveType.toUpperCase() : 'ONLINE';
    const rtt = conn.rtt ? `${conn.rtt}MS` : '';
    return rtt ? `${type} (${rtt})` : type;
  }
  return 'ONLINE (FAST)';
}

export function updateNetworkStatus() {
  const els = getTelemetryEls();
  const net = getNetworkStatus();
  els.net.forEach((el) => {
    el.textContent = net;
  });
}

export function initStaticTelemetry() {
  const els = getTelemetryEls();
  const specs = getClientStaticSpecs();
  els.cpu.forEach((el) => {
    el.textContent = specs.cores;
  });
  els.gpu.forEach((el) => {
    el.textContent = specs.gpu;
  });
  els.ram.forEach((el) => {
    el.textContent = specs.ram;
  });
  els.load.forEach((el) => {
    el.textContent = specs.pageLoad;
  });
  els.os.forEach((el) => {
    el.textContent = specs.os;
  });
  els.res.forEach((el) => {
    el.textContent = specs.res;
  });
  els.dpr.forEach((el) => {
    el.textContent = specs.dpr;
  });
  updateNetworkStatus();

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
}

export function updateDynamicTelemetry() {
  if (document.hidden) return;
  const els = getTelemetryEls();
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const localTimeString = `${hours}:${minutes}:${seconds}`;

  let tzCode = 'LOCAL';
  try {
    const tzMatch = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(now)
      .find((p) => p.type === 'timeZoneName');
    tzCode = tzMatch ? tzMatch.value : Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (err) {
    const offset = -now.getTimezoneOffset() / 60;
    tzCode = `GMT${offset >= 0 ? '+' : ''}${offset}`;
  }

  let heap = 'N/A';
  if (performance && performance.memory && performance.memory.usedJSHeapSize) {
    heap = `${Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))}MB`;
  }

  els.time.forEach((el) => {
    el.textContent = localTimeString;
  });
  els.tz.forEach((el) => {
    el.textContent = tzCode;
  });
  els.fps.forEach((el) => {
    el.textContent = `${currentFps} FPS`;
  });
  els.heap.forEach((el) => {
    el.textContent = heap;
  });
}

let telemetryTimer = null;
export function startTelemetryEngine() {
  if (!telemetryTimer) {
    telemetryTimer = setInterval(updateDynamicTelemetry, 1000);
  }
  startFpsSampling();
  if (!fpsSampleTimer) {
    fpsSampleTimer = setInterval(startFpsSampling, 10000);
  }
  updateDynamicTelemetry();
}

export function stopTelemetryEngine() {
  if (telemetryTimer) {
    clearInterval(telemetryTimer);
    telemetryTimer = null;
  }
  if (fpsSampleTimer) {
    clearInterval(fpsSampleTimer);
    fpsSampleTimer = null;
  }
  if (fpsRafId) {
    cancelAnimationFrame(fpsRafId);
    fpsRafId = null;
  }
}
