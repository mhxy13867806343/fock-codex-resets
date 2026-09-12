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
  (e: 'manual-refresh'): void;
  (e: 'load-data'): Promise<void> | void;
}>();

const { isMobile } = useDevice();
const naiveDialog = useDialog();
const naiveMessage = useMessage();
const naiveNotification = useNotification();

// Listen for PC refresh event dispatched by App
onMounted(() => {
  window.addEventListener('naive-refresh-requested', handlePcRefresh);
});

onUnmounted(() => {
  window.removeEventListener('naive-refresh-requested', handlePcRefresh);
});

function handlePcRefresh() {
  naiveDialog?.info({
    title: 'Naive UI 桌面端刷新确认',
    content: '检测到页面需要同步数据，是否使用 Naive UI 刷新并获取最新 Codex 重置状态？',
    positiveText: '立即刷新',
    negativeText: '取消',
    onPositiveClick: async () => {
      await emit('load-data');
      naiveNotification?.success({
        title: 'Naive UI 刷新成功',
        content: '已成功从官方 API 拉取最新额度重置与热力图记录！',
        duration: 3000,
      });
      naiveMessage?.success('Naive UI 桌面端数据刷新完成');
    },
  });
}
</script>

<template>
  <main class="main-content">
    <!-- Header with Token Popover & Theme Switcher -->
    <HeaderMasthead
      :themeMode="themeMode"
      @update:themeMode="emit('update:themeMode', $event)"
      @manual-refresh="emit('manual-refresh')"
    />

    <!-- Device & Component Library Badge -->
    <div class="update-notify-bar">
      <span>
        当前视口: <strong>{{ isMobile ? '📱 移动端 (Vant UI 驱动)' : '🖥 桌面端 (Naive UI 驱动)' }}</strong>
      </span>
      <button class="update-btn" @click="emit('manual-refresh')">
        {{ isMobile ? '通过 Vant 刷新数据' : '通过 Naive UI 刷新数据' }}
      </button>
    </div>

    <!-- Hero Card with relative timer & Plea bursts -->
    <HeroSection
      :status="status"
      @manual-refresh="emit('manual-refresh')"
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
  </main>
</template>
