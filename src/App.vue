<script setup lang="ts">
// Custom Hooks (auto-imported from src/hooks)
const { themeMode, isDark, naiveTheme, naiveThemeOverrides } = useTheme();
const { isMobile } = useDevice();
const { status, resets, loading, loadData } = useResetData();

// Date selection for Heatmap <-> Timeline synchronization
const selectedDate = ref<string | null>(null);
</script>

<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="naiveThemeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <van-config-provider :theme="isDark ? 'dark' : 'light'">
            <div class="app-container" :class="{ 'is-mobile': isMobile, 'van-theme-dark': isDark }">
              <!-- Content Wrapper Component Inside Naive & Vant Context -->
              <AppContent
                v-model:themeMode="themeMode"
                :status="status"
                :resets="resets"
                :loading="loading"
                v-model:selectedDate="selectedDate"
                @load-data="loadData"
              />
            </div>
          </van-config-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
