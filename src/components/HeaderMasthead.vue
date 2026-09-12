<script setup lang="ts">
import { showToast } from 'vant';

const props = defineProps<{
  themeMode: 'auto' | 'light' | 'dark';
}>();

const emit = defineEmits<{
  (e: 'update:themeMode', mode: 'auto' | 'light' | 'dark'): void;
  (e: 'manual-refresh'): void;
}>();

const { withToken, currentToken, setCustomToken, resetRandomToken } = useToken();
const { isDark, setTheme } = useTheme();
const { isMobile } = useDevice();
const editingToken = ref(currentToken.value);
const message = useMessage();

function saveToken() {
  if (editingToken.value.trim()) {
    setCustomToken(editingToken.value);
    message?.success('Token 参数已更新');
  }
}

function randomize() {
  const rand = resetRandomToken();
  editingToken.value = rand;
  message?.info(`已生成随机 Token: ${rand}`);
}

// PC 端：Naive UI 下拉菜单 (n-dropdown) 选项
const pcThemeOptions = computed(() => [
  {
    label: `💻 跟随系统外观 ${props.themeMode === 'auto' ? '✓' : ''}`,
    key: 'auto',
  },
  {
    label: `☀️ 浅色复古模式 ${props.themeMode === 'light' ? '✓' : ''}`,
    key: 'light',
  },
  {
    label: `🌙 暗黑极客风格 ${props.themeMode === 'dark' ? '✓' : ''}`,
    key: 'dark',
  },
]);

function handlePcThemeSelect(key: 'auto' | 'light' | 'dark') {
  setTheme(key);
  emit('update:themeMode', key);
  const labels: Record<string, string> = {
    auto: '跟随系统外观 (根据当前系统实时决定)',
    light: '浅色复古模式',
    dark: '暗黑极客风格',
  };
  message?.success(`已切换为：${labels[key]}`);
}

// H5 移动端：Vant 动作面板 (van-action-sheet)
const showH5ThemeSheet = ref(false);
const h5ThemeActions = computed(() => [
  {
    name: '💻 跟随系统外观',
    subname: '根据当前操作系统模式自动决定',
    value: 'auto' as const,
    color: props.themeMode === 'auto' ? '#ff5c2b' : undefined,
  },
  {
    name: '☀️ 浅色复古模式',
    subname: '暖白纸质高亮复古视觉',
    value: 'light' as const,
    color: props.themeMode === 'light' ? '#ff5c2b' : undefined,
  },
  {
    name: '🌙 暗黑极客风格',
    subname: '深黑高对比度暗黑视觉',
    value: 'dark' as const,
    color: props.themeMode === 'dark' ? '#ff5c2b' : undefined,
  },
]);

function handleH5ThemeSelect(action: { name: string; value: 'auto' | 'light' | 'dark' }) {
  setTheme(action.value);
  emit('update:themeMode', action.value);
  showToast({ message: `已切换为：${action.name}`, icon: 'passed' });
}

const currentModeText = computed(() => {
  if (props.themeMode === 'auto') return '系统';
  if (props.themeMode === 'dark') return '深色';
  return '浅色';
});

// 点击标题刷新当前页面
function reloadCurrentPage() {
  window.location.reload();
}
</script>

<template>
  <header class="masthead">
    <div
      class="masthead-brand"
      @click="reloadCurrentPage"
      title="点击刷新当前页面"
      role="button"
      tabindex="0"
      @keydown.enter="reloadCurrentPage"
    >
      <img class="masthead-avatar" src="/thsottiaux-avatar.jpg" alt="@thsottiaux" width="48" height="48" />
      <div class="masthead-copy">
        <div class="masthead-title-row">
          <h1 class="masthead-title">Codex Resets</h1>
          <span class="version-tag">Vue 3.5+TS</span>
        </div>
      </div>
    </div>

    <div class="masthead-side">
      <!-- Manual Refresh Button -->
      <button
        class="refresh-trigger-btn"
        @click="emit('manual-refresh')"
        title="刷新数据 (自动检测设备并触发对应组件库提示)"
      >
        <span>🔄</span>
      </button>

      <!-- Token Config Button -->
      <n-popover trigger="click" placement="bottom-end">
        <template #trigger>
          <button class="token-btn" title="自定义访问 Token 参数" aria-label="自定义 Token">
            <span class="token-icon">🔑</span>
            <span class="token-text mono">{{ currentToken }}</span>
          </button>
        </template>
        <div class="token-popover-content">
          <div class="token-popover-header">
            <strong>自定义 URL Token 参数</strong>
            <small class="mono">所有请求与外链将附带 ?token=...</small>
          </div>
          <div class="token-input-row">
            <n-input
              v-model:value="editingToken"
              size="small"
              placeholder="输入自定义 Token"
            />
            <n-button size="small" type="primary" @click="saveToken">保存</n-button>
          </div>
          <div class="token-actions-row">
            <n-button size="tiny" secondary @click="randomize">随机生成</n-button>
            <span class="token-preview mono">示例: /api/v1/status?token={{ currentToken }}</span>
          </div>
        </div>
      </n-popover>

      <!-- External Links -->
      <a
        class="icon-link"
        :href="withToken('https://x.com/codex_resets')"
        target="_blank"
        rel="noopener noreferrer"
        title="Follow on X"
      >
        <svg class="icon-svg" viewBox="0 0 24 24">
          <path fill="currentColor" d="M14.23 10.16 22.1 1h-1.87l-6.84 7.96L8.04 1H1.5l8.26 12.03L1.5 23h1.87l7.22-8.4L15.96 23H22.5l-8.27-12.84Zm-2.56 2.97-.83-1.19L4.04 2.43h2.86l5.34 7.64.84 1.19 6.94 9.93h-2.86l-5.49-7.06Z" />
        </svg>
      </a>

      <a
        class="icon-link"
        :href="withToken('https://github.com/mhxy13867806343/fock-codex-resets')"
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub Repository"
      >
        <svg class="icon-svg" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
        </svg>
      </a>

      <!-- 🖥 PC 端：Naive UI 下拉菜单 (n-dropdown) -->
      <div v-if="!isMobile" class="theme-dropdown-wrapper">
        <n-dropdown
          trigger="click"
          :options="pcThemeOptions"
          @select="handlePcThemeSelect"
        >
          <n-button size="small" round secondary class="pc-dropdown-btn">
            <template #icon>
              <span>{{ isDark ? '🌙' : '☀️' }}</span>
            </template>
            <span class="btn-text">{{ isDark ? '暗黑模式' : '浅色模式' }}</span>
            <span class="btn-badge">{{ currentModeText }}</span>
            <span class="btn-caret">▼</span>
          </n-button>
        </n-dropdown>
      </div>

      <!-- 📱 H5 移动端：Vant 动作面板 (van-action-sheet) -->
      <div v-else class="theme-dropdown-wrapper">
        <button class="h5-action-btn" @click="showH5ThemeSheet = true">
          <span class="btn-icon">{{ isDark ? '🌙' : '☀️' }}</span>
          <span class="btn-text">{{ isDark ? '暗黑模式' : '浅色模式' }}</span>
          <span class="btn-badge">{{ currentModeText }}</span>
          <span class="btn-caret">▼</span>
        </button>

        <van-action-sheet
          v-model:show="showH5ThemeSheet"
          title="选择主题风格 (Vant 动作面板)"
          :actions="h5ThemeActions"
          cancel-text="取消"
          close-on-click-action
          @select="handleH5ThemeSelect"
        />
      </div>
    </div>
  </header>
</template>
