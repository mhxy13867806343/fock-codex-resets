<script setup lang="ts">
import { showToast, showDialog as showVantDialog } from 'vant';

// Custom Hooks (auto-imported from src/hooks)
const { themeMode, isDark, naiveTheme, naiveThemeOverrides } = useTheme();
const { isMobile } = useDevice();
const { status, resets, loading, loadData } = useResetData();

// Date selection for Heatmap <-> Timeline synchronization
const selectedDate = ref<string | null>(null);

// Device aware update notifier
function handleManualRefresh() {
  if (isMobile.value) {
    // H5: Prompt using Vant Dialog / Toast
    showVantDialog({
      title: 'Vant 移动端刷新提示',
      message: '正在使用 Vant 移动端组件库连接官方 API 刷新数据，是否继续？',
      showCancelButton: true,
      confirmButtonColor: '#ff5c2b',
    }).then(async () => {
      showToast({ type: 'loading', message: '刷新中 (Vant)...', duration: 0 });
      await loadData();
      showToast({ type: 'success', message: 'Vant 移动端数据已更新！', icon: 'passed' });
    }).catch(() => {});
  } else {
    // PC: Handled inside Naive UI provider context
    window.dispatchEvent(new CustomEvent('naive-refresh-requested'));
  }
}
</script>

<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="naiveThemeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <van-config-provider :theme="isDark ? 'dark' : 'light'">
            <div class="app-container" :class="{ 'is-mobile': isMobile, 'van-theme-dark': isDark }">
              <!-- Content Wrapper Component Inside Naive Context -->
              <AppContent
                v-model:themeMode="themeMode"
                :status="status"
                :resets="resets"
                :loading="loading"
                v-model:selectedDate="selectedDate"
                @manual-refresh="handleManualRefresh"
                @load-data="loadData"
              />
            </div>
          </van-config-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
