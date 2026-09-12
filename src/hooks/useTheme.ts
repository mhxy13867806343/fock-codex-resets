import { ref, computed, watch, onMounted } from 'vue';
import { useOsTheme, darkTheme } from 'naive-ui';
import { lightThemeOverrides, darkThemeOverrides } from '../theme';

export type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'codex_theme_mode';

export function useTheme() {
  const osTheme = useOsTheme();
  const savedMode = typeof window !== 'undefined'
    ? (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode || 'auto')
    : 'auto';

  const themeMode = ref<ThemeMode>(savedMode);

  const isDark = computed(() => {
    if (themeMode.value === 'dark') return true;
    if (themeMode.value === 'light') return false;
    return osTheme.value === 'dark';
  });

  const naiveTheme = computed(() => (isDark.value ? darkTheme : null));
  const naiveThemeOverrides = computed(() => (isDark.value ? darkThemeOverrides : lightThemeOverrides));

  const updateDocumentTheme = () => {
    if (typeof document !== 'undefined') {
      const themeValue = isDark.value ? 'dark' : 'light';
      document.documentElement.dataset.theme = themeValue;
      document.documentElement.style.colorScheme = themeValue;
    }
  };

  watch(themeMode, (newMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newMode);
    }
    updateDocumentTheme();
  });

  watch(isDark, () => {
    updateDocumentTheme();
  });

  onMounted(() => {
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
    osTheme,
    naiveTheme,
    naiveThemeOverrides,
    setTheme,
    toggleTheme,
  };
}
