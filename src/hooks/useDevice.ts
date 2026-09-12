import { ref, onMounted, onUnmounted } from 'vue';

export type DeviceMode = 'auto' | 'pc' | 'h5';

const DEVICE_STORAGE_KEY = 'codex_device_mode';

// Singleton state across all components
const manualMode = ref<DeviceMode>(
  (typeof window !== 'undefined' ? (localStorage.getItem(DEVICE_STORAGE_KEY) as DeviceMode) : null) || 'auto'
);

const isMobile = ref(false);

function detectIsMobile(): boolean {
  if (typeof window === 'undefined') return false;

  if (manualMode.value === 'pc') return false;
  if (manualMode.value === 'h5') return true;

  const userAgent = navigator.userAgent || '';
  // Accurate mobile UA check (phones)
  const isMobileUA = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTabletUA = /iPad|Tablet/i.test(userAgent);
  const hasTouch = navigator.maxTouchPoints > 1;
  const isSmallWindow = window.innerWidth < 768;

  // Desktop OS detection (Macintosh, Windows NT, Linux x86_64)
  const isDesktopOS = /Macintosh|MacIntel|Windows NT|Linux x86_64/i.test(userAgent) && !isMobileUA;

  // If on Mac/Windows desktop, default to PC even if window is narrow, unless touch + tablet
  if (isDesktopOS && !isTabletUA) {
    return false;
  }

  if (isMobileUA) {
    return true;
  }

  return hasTouch && isSmallWindow;
}

function updateDeviceState() {
  isMobile.value = detectIsMobile();
}

export function useDevice() {
  function setDeviceMode(mode: DeviceMode) {
    manualMode.value = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEVICE_STORAGE_KEY, mode);
    }
    updateDeviceState();
  }

  onMounted(() => {
    updateDeviceState();
    window.addEventListener('resize', updateDeviceState);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateDeviceState);
  });

  return {
    isMobile,
    manualMode,
    setDeviceMode,
    checkDevice: updateDeviceState,
  };
}
