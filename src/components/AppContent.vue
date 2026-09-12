<script setup lang="ts">
import type { StatusResponse, Reset } from '../types';
import type { ThemeMode } from '../hooks/useTheme';

const props = defineProps<{
  themeMode: ThemeMode;
  status: StatusResponse | null;
  resets: Reset[];
  loading: boolean;
  selectedDate: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:themeMode', mode: ThemeMode): void;
  (e: 'update:selectedDate', date: string | null): void;
  (e: 'load-data'): Promise<void> | void;
}>();

const { isMobile, manualMode, setDeviceMode } = useDevice();
const { isDark, setTheme } = useTheme();
const { promptRefresh } = useNotifier();

// Global handler for refresh requests
function triggerRefreshPrompt() {
  promptRefresh(async () => {
    await emit('load-data');
  });
}

// 保证 100% 可见与响应的返回顶部 (Back to Top)
const showBackTop = ref(false);

function handleScroll() {
  const top = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  showBackTop.value = top > 100;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <main class="main-content">
    <!-- Header with Token Popover & Theme Switcher -->
    <HeaderMasthead
      :themeMode="themeMode"
      @update:themeMode="emit('update:themeMode', $event)"
      @manual-refresh="triggerRefreshPrompt"
    />

    <!-- Device & Theme Badge with Quick Switchers -->
    <div class="update-notify-bar">
      <div class="update-bar-left">
        <!-- Device Info & Switcher -->

        <!-- Theme Info & Switcher -->
        <div class="notify-badge-item">
          <span>风格: <strong>{{ isDark ? '🌙 暗黑模式' : '☀️ 浅色模式' }}</strong></span>
          <div class="device-switcher-group" title="切换暗黑/浅色模式：根据系统决定或手动强制">
            <button
              class="device-mode-btn"
              :class="{ active: themeMode === 'auto' }"
              @click="setTheme('auto')"
            >
              💻 跟随系统
            </button>
            <button
              class="device-mode-btn"
              :class="{ active: themeMode === 'dark' }"
              @click="setTheme('dark')"
            >
              🌙 暗黑
            </button>
            <button
              class="device-mode-btn"
              :class="{ active: themeMode === 'light' }"
              @click="setTheme('light')"
            >
              ☀️ 浅色
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Card with relative timer & Plea bursts -->
    <HeroSection
      :status="status"
      @manual-refresh="triggerRefreshPrompt"
    />

    <!-- 3 Stat Tiles -->
    <StatTiles
      :stats="status?.data.stats"
    />

    <!-- 52-week Reset Heatmap Calendar -->
    <ResetHeatmap
      :resets="resets"
      :selectedDate="selectedDate"
      @select-date="emit('update:selectedDate', $event)"
    />

    <!-- Historical Reset Timeline with DatePicker -->
    <ResetTimeline
      :resets="resets"
      :selectedDate="selectedDate"
      @update:selectedDate="emit('update:selectedDate', $event)"
    />

    <!-- Developer API & MCP Section -->
    <DevSection />

    <!-- Footer -->
    <SiteFooter />

    <!-- 100% 可见返回顶部悬浮组件 (BackTop) -->
    <button
      v-show="showBackTop"
      class="global-back-top-btn"
      @click="scrollToTop"
      :title="isMobile ? '返回顶部 (Vant 适配)' : '返回顶部 (Naive UI 桌面端)'"
      aria-label="返回顶部"
    >
      <span class="btn-arrow">▲</span>
      <span class="btn-label">{{ isMobile ? 'TOP' : '顶部' }}</span>
    </button>
  </main>
</template>
