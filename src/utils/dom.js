export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let toastTimeout = null;
export function showToast(message, duration = 3000) {
  const toast = document.getElementById('brutalistToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

let telemetryEls = null;
export function getTelemetryEls() {
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
      dpr: document.querySelectorAll('.dpr-val')
    };
  }
  return telemetryEls;
}

export function resetTelemetryElsCache() {
  telemetryEls = null;
}
