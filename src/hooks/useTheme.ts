import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useOsTheme, darkTheme } from 'naive-ui';
import { lightThemeOverrides, darkThemeOverrides } from '../theme';

export type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'codex_theme_mode';

// 优先默认跟随系统设置（'auto'）
const themeMode = ref<ThemeMode>(
  (typeof window !== 'undefined' ? (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) : null) || 'auto'
);

// 实时响应操作系统的深色/浅色模式切换
const systemDark = ref(
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
);

export function useTheme() {
  const osTheme = useOsTheme();

  // 严格根据当前系统模式（或手动指定）决定当前是否为暗黑风格
  const isDark = computed(() => {
    if (themeMode.value === 'dark') return true;
    if (themeMode.value === 'light') return false;
    // auto 模式下：同时结合 window.matchMedia 与 Naive UI useOsTheme
    return systemDark.value || osTheme.value === 'dark';
  });

  const naiveTheme = computed(() => (isDark.value ? darkTheme : null));
  const naiveThemeOverrides = computed(() => (isDark.value ? darkThemeOverrides : lightThemeOverrides));

  const updateDocumentTheme = () => {
    if (typeof document !== 'undefined') {
      const themeValue = isDark.value ? 'dark' : 'light';
      document.documentElement.dataset.theme = themeValue;
      document.documentElement.style.colorScheme = themeValue;
      if (isDark.value) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  };

  function onSystemThemeChange(e: MediaQueryListEvent) {
    systemDark.value = e.matches;
    updateDocumentTheme();
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      systemDark.value = mql.matches;
      mql.addEventListener('change', onSystemThemeChange);
    }
    updateDocumentTheme();
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.removeEventListener('change', onSystemThemeChange);
    }
  });

  watch(isDark, () => {
    updateDocumentTheme();
  });

  watch(themeMode, (newMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newMode);
    }
    updateDocumentTheme();
  });

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode;
  }

  function toggleTheme() {
    if (themeMode.value === 'auto') {
      themeMode.value = 'light';
    } else if (themeMode.value === 'light') {
      themeMode.value = 'dark';
    } else {
      themeMode.value = 'auto';
    }
  }

  return {
    themeMode,
    isDark,
    systemDark,
    osTheme,
    naiveTheme,
    naiveThemeOverrides,
    setTheme,
    toggleTheme,
    updateDocumentTheme,
  };
}
