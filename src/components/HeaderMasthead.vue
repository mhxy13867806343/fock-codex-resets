<script setup lang="ts">
const props = defineProps<{
  themeMode: 'auto' | 'light' | 'dark';
}>();

const emit = defineEmits<{
  (e: 'update:themeMode', mode: 'auto' | 'light' | 'dark'): void;
  (e: 'manual-refresh'): void;
}>();

const { withToken, currentToken, setCustomToken, resetRandomToken } = useToken();
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

function cycleTheme() {
  if (props.themeMode === 'auto') {
    emit('update:themeMode', 'light');
  } else if (props.themeMode === 'light') {
    emit('update:themeMode', 'dark');
  } else {
    emit('update:themeMode', 'auto');
  }
}

const themeTitle = computed(() => {
  if (props.themeMode === 'auto') return '当前主题：跟随系统 (OS Theme)';
  if (props.themeMode === 'light') return '当前主题：浅色复古 (Light Mode)';
  return '当前主题：深色模式 (Dark Mode)';
});
</script>

<template>
  <header class="masthead">
    <div class="masthead-brand">
      <img class="masthead-avatar" src="/logo.svg" alt="Codex Resets" width="48" height="48" />
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

      <!-- Theme Switcher -->
      <button class="theme-toggle-btn" @click="cycleTheme" :title="themeTitle">
        <span v-if="themeMode === 'light'">☀️</span>
        <span v-else-if="themeMode === 'dark'">🌙</span>
        <span v-else>💻</span>
      </button>
    </div>
  </header>
</template>
