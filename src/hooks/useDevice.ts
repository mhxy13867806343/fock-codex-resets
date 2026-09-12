import { ref, onMounted, onUnmounted } from 'vue';

export function useDevice() {
  const isMobile = ref(false);

  const checkDevice = () => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    isMobile.value = isMobileUA || isSmallScreen;
  };

  onMounted(() => {
    checkDevice();
    window.addEventListener('resize', checkDevice);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkDevice);
  });

  return {
    isMobile,
    checkDevice,
  };
}
