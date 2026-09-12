<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant';
import type { StatusResponse } from '../types';

const props = defineProps<{
  status: StatusResponse | null;
}>();

const emit = defineEmits<{
  (e: 'manual-refresh'): void;
}>();

const { isMobile } = useDevice();
const { withToken } = useToken();
const message = useMessage();
const naiveDialog = useDialog();

const pushEnabled = ref(false);
const showEmailForm = ref(false);
const emailInput = ref('');
const bursts = ref<Array<{ id: number; x: number; y: number; emoji: string }>>([]);
let burstId = 0;

const STORAGE_KEY = 'codex_subscription_emails';
const subscriptionHistory = ref<string[]>([]);

const STORAGE_REACTION_KEY = 'codex_reaction_count';
const reactionCount = ref<number | null>(null);

let pendingReactionClicks = 0;
let activeRequestId: string | null = null;
let postTimeout: any = null;
let reactionPollTimer: any = null;
let ws: WebSocket | null = null;

const now = ref(Date.now());
let timer: any = null;

const latestReset = computed(() => props.status?.data.latest_reset);

const API_BASE = import.meta.env.PROD ? 'https://codex-resets.com' : '';
const avatarUrl = `${import.meta.env.BASE_URL}thsottiaux-avatar.jpg`;

// Dynamic thanks / beg mode matching codex-resets.com (within 24 hours of reset => thanks, else => beg)
const isWithin24Hours = computed(() => {
  if (!latestReset.value?.announced_at) return true;
  const timeDiff = Date.now() - new Date(latestReset.value.announced_at).getTime();
  return timeDiff < 86400000;
});

const reactionMode = computed(() => isWithin24Hours.value ? 'thanks' : 'beg');
const reactionLabel = computed(() => isWithin24Hours.value ? 'thanks' : 'beg');
const reactionTitle = computed(() => isWithin24Hours.value ? '为此次重置点赞感谢！(Say thanks for the reset)' : '祈求 Codex 额度重置！(Beg for a reset)');

async function loadReactionCount() {
  try {
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(withToken(`${API_BASE}/api/reset-requests`), {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(abortTimeout);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.count === 'number') {
        const next = Math.max(reactionCount.value ?? 0, data.count);
        reactionCount.value = next;
        localStorage.setItem(STORAGE_REACTION_KEY, String(next));
      }
    }
  } catch (err) {
    console.warn('Failed to load reaction count from server:', err);
    if (reactionCount.value === null) {
      const savedCount = localStorage.getItem(STORAGE_REACTION_KEY);
      if (savedCount) {
        const parsed = parseInt(savedCount, 10);
        if (!isNaN(parsed)) reactionCount.value = parsed;
      }
    }
  }
}

function initLiveWebSocket() {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return;
  try {
    const wsUrl = import.meta.env.PROD
      ? 'wss://codex-resets.com/api/reset-requests/live'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/reset-requests/live`;
    ws = new WebSocket(wsUrl);
    ws.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.type === 'reset-request-count' && typeof data.count === 'number') {
          const next = Math.max(reactionCount.value ?? 0, data.count);
          reactionCount.value = next;
          localStorage.setItem(STORAGE_REACTION_KEY, String(next));
        }
      } catch {}
    });
    ws.addEventListener('close', () => {
      ws = null;
    });
  } catch {}
}

const handleVisibility = () => {
  if (!document.hidden) {
    loadReactionCount();
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      initLiveWebSocket();
    }
  }
};

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 10000);

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    pushEnabled.value = true;
  }

  // Fetch real-time count from https://codex-resets.com/api/reset-requests (starts at null to show [🙏 —] only upon opening page)
  loadReactionCount();
  reactionPollTimer = setInterval(loadReactionCount, 12000);
  initLiveWebSocket();
  document.addEventListener('visibilitychange', handleVisibility);

  // Fallback to reveal cached floor if network delays, so it never stays stuck on [🙏 —]
  setTimeout(() => {
    if (reactionCount.value === null) {
      const savedCount = localStorage.getItem(STORAGE_REACTION_KEY);
      if (savedCount) {
        const parsed = parseInt(savedCount, 10);
        if (!isNaN(parsed)) reactionCount.value = parsed;
      }
    }
  }, 1200);

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        subscriptionHistory.value = parsed.slice(0, 15);
      }
    }
  } catch (e) {
    console.error('Failed to load subscription history:', e);
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (reactionPollTimer) clearInterval(reactionPollTimer);
  if (postTimeout) clearTimeout(postTimeout);
  if (ws) ws.close();
  document.removeEventListener('visibilitychange', handleVisibility);
});

const relativeTime = computed(() => {
  if (!latestReset.value?.announced_at) return '计算中...';
  now.value;
  return dayjs(latestReset.value.announced_at).fromNow();
});

const absoluteTime = computed(() => {
  if (!latestReset.value?.announced_at) return '';
  return dayjs.utc(latestReset.value.announced_at).format('MMM D, YYYY, h:mm A UTC');
});

async function togglePush() {
  if (typeof Notification === 'undefined') {
    message?.warning('当前环境不支持浏览器通知');
    return;
  }
  if (Notification.permission === 'granted') {
    pushEnabled.value = true;
    message?.info('浏览器通知已启用');
  } else {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      pushEnabled.value = true;
      new Notification('Codex Resets', {
        body: '成功开启 Codex 额度重置实时提醒！',
        icon: avatarUrl
      });
      message?.success('已开启重置通知！');
    } else {
      message?.error('通知权限已被拒绝');
    }
  }
}

function handleSubscribeEmail() {
  const trimmed = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed || !emailRegex.test(trimmed)) {
    if (isMobile.value) {
      showToast('请输入有效的邮箱地址');
    } else {
      message?.error('请输入有效的邮箱地址');
    }
    return;
  }

  // Prepend to history, deduplicate, limit to 15
  const updated = [trimmed, ...subscriptionHistory.value.filter(item => item !== trimmed)].slice(0, 15);
  subscriptionHistory.value = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save subscription history:', e);
  }

  if (isMobile.value) {
    showToast('订阅成功！已保存到历史记录');
  } else {
    message?.success(`订阅成功！已保存到历史记录: ${trimmed}`);
  }
  emailInput.value = '';
}

function handlePickHistoryEmail(email: string) {
  emailInput.value = email;
  if (isMobile.value) {
    showToast('已填入该邮箱');
  } else {
    message?.info(`已填入邮箱: ${email}`);
  }
}

function confirmDeleteSingle(email: string) {
  if (isMobile.value) {
    showConfirmDialog({
      title: '确认清除',
      message: `确定要清除该历史订阅邮箱吗？\n${email}`,
      confirmButtonText: '确认清除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ff5c2b',
    })
      .then(() => {
        executeDeleteSingle(email);
      })
      .catch(() => {
        // user cancelled
      });
  } else {
    naiveDialog?.warning({
      title: '确认清除',
      content: `确定要清除历史订阅邮箱「${email}」吗？`,
      positiveText: '确认清除',
      negativeText: '取消',
      onPositiveClick: () => {
        executeDeleteSingle(email);
      },
    });
  }
}

function executeDeleteSingle(email: string) {
  subscriptionHistory.value = subscriptionHistory.value.filter(item => item !== email);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptionHistory.value));
  } catch (e) {
    console.error('Failed to update subscription history:', e);
  }
  if (isMobile.value) {
    showToast('已清除该历史邮箱');
  } else {
    message?.success('已清除该历史邮箱');
  }
}

function confirmClearAll() {
  if (isMobile.value) {
    showConfirmDialog({
      title: '确认全部清空',
      message: '确定要清除所有历史订阅邮箱记录吗？\n清除后不可恢复。',
      confirmButtonText: '全部清除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ff5c2b',
    })
      .then(() => {
        executeClearAll();
      })
      .catch(() => {
        // user cancelled
      });
  } else {
    naiveDialog?.warning({
      title: '确认全部清空',
      content: '确定要清除所有历史订阅邮箱记录吗？清除后不可恢复。',
      positiveText: '全部清除',
      negativeText: '取消',
      onPositiveClick: () => {
        executeClearAll();
      },
    });
  }
}

function executeClearAll() {
  subscriptionHistory.value = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear subscription history:', e);
  }
  if (isMobile.value) {
    showToast('已清空全部历史邮箱');
  } else {
    message?.success('已清空全部历史邮箱');
  }
}

function handleReaction() {
  // Optimistic increment
  if (reactionCount.value === null) {
    reactionCount.value = 1;
  } else {
    reactionCount.value += 1;
  }
  localStorage.setItem(STORAGE_REACTION_KEY, reactionCount.value.toString());

  // Particles matching codex-resets.com
  const particles = reactionMode.value === 'thanks'
    ? ['+1', '🙏', 'thx', '🧡', 'avatar', 'avatar']
    : ['+1', '🙏', 'pls', '🔄', 'avatar', 'avatar'];
  const rand = particles[Math.floor(Math.random() * particles.length)];
  const bId = ++burstId;
  const x = (Math.random() - 0.5) * 70;
  const y = -20 - Math.random() * 40;

  bursts.value.push({ id: bId, x, y, emoji: rand });

  setTimeout(() => {
    bursts.value = bursts.value.filter(b => b.id !== bId);
  }, 900);

  // Batch clicks & send POST /api/reset-requests
  pendingReactionClicks += 1;
  if (!activeRequestId) {
    activeRequestId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  if (pendingReactionClicks >= 10) {
    if (postTimeout) {
      clearTimeout(postTimeout);
      postTimeout = null;
    }
    sendReactionPost();
  } else {
    if (!postTimeout) {
      postTimeout = setTimeout(sendReactionPost, 120);
    }
  }
}

async function sendReactionPost() {
  postTimeout = null;
  const n = pendingReactionClicks;
  const reqId = activeRequestId;
  pendingReactionClicks = 0;
  activeRequestId = null;

  if (n < 1 || !reqId) return;

  try {
    const res = await fetch(withToken(`${API_BASE}/api/reset-requests`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ request_id: reqId, n }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.count === 'number') {
        const next = Math.max(reactionCount.value ?? 0, data.count);
        reactionCount.value = next;
        localStorage.setItem(STORAGE_REACTION_KEY, String(next));
      }
    }
  } catch (err) {
    console.warn('Failed to send reaction post:', err);
  }
}
</script>

<template>
  <section class="hero">
    <p class="hero-explainer">
      实时监控 <a :href="withToken('https://x.com/thsottiaux')" target="_blank" rel="noopener noreferrer">@thsottiaux</a> 官方发布的 OpenAI Codex 额度重置公告。
    </p>

    <!-- Subscriptions Toolbar -->
    <div class="subscription-actions">
      <!-- Manual Refresh Pill -->
      <button
        class="action-pill refresh-pill"
        @click="emit('manual-refresh')"
        title="刷新数据"
      >
        <span class="pill-icon">🔄</span>
        <span class="pill-label">刷新状态</span>
      </button>

      <!-- Browser Notification Toggle -->
      <button
        class="action-pill push-pill"
        :class="{ active: pushEnabled }"
        @click="togglePush"
        :title="pushEnabled ? '已开启浏览器推送提醒' : '开启浏览器重置推送提醒'"
      >
        <span class="pill-icon">🔔</span>
        <span class="pill-label">{{ pushEnabled ? '推送已开启' : '浏览器提醒' }}</span>
      </button>

      <!-- Telegram Link with Token -->
      <a
        class="action-pill telegram-pill"
        :href="withToken('https://t.me/codex_resets')"
        target="_blank"
        rel="noopener noreferrer"
        title="Telegram 频道订阅"
      >
        <span class="pill-icon">✈️</span>
        <span class="pill-label">Telegram</span>
      </a>

      <!-- Email Toggle -->
      <button
        class="action-pill email-pill"
        :class="{ active: showEmailForm }"
        @click="showEmailForm = !showEmailForm"
        title="邮件提醒订阅"
      >
        <span class="pill-icon">✉️</span>
        <span class="pill-label">邮件订阅</span>
      </button>
    </div>

    <!-- Email Form (Responsive: Naive UI on PC, Vant on H5) -->
    <div v-if="showEmailForm" class="email-form-wrapper">
      <!-- PC: Naive UI Form -->
      <div v-if="!isMobile" class="email-form-pc">
        <n-input
          v-model:value="emailInput"
          placeholder="your.email@example.com"
          round
          clearable
          style="max-width: 320px;"
          @keydown.enter="handleSubscribeEmail"
        />
        <n-button type="primary" round @click="handleSubscribeEmail">
          立即订阅
        </n-button>
      </div>

      <!-- H5: Vant Form -->
      <div v-else class="email-form-h5">
        <van-cell-group inset>
          <van-field
            v-model="emailInput"
            center
            clearable
            placeholder="输入邮箱地址"
            @keydown.enter="handleSubscribeEmail"
          >
            <template #button>
              <van-button size="small" type="primary" round @click="handleSubscribeEmail">
                订阅
              </van-button>
            </template>
          </van-field>
        </van-cell-group>
      </div>

      <!-- Subscription Email History List (Max 15, Cached) -->
      <div v-if="subscriptionHistory.length > 0" class="email-history-container">
        <div class="email-history-header">
          <div class="history-title">
            <span class="history-icon">🕒</span>
            <span>历史订阅邮箱</span>
            <span class="history-badge">{{ subscriptionHistory.length }}/15</span>
          </div>
          <button
            type="button"
            class="history-clear-all-btn"
            @click="confirmClearAll"
            title="清空全部历史邮箱"
          >
            <span class="clear-icon">🗑️</span>
            <span>清空全部</span>
          </button>
        </div>

        <div class="email-history-list">
          <div
            v-for="email in subscriptionHistory"
            :key="email"
            class="email-history-chip"
          >
            <span
              class="chip-email-text"
              @click="handlePickHistoryEmail(email)"
              :title="`点击填入: ${email}`"
            >
              <span class="chip-mail-icon">✉️</span>
              <span class="chip-text">{{ email }}</span>
            </span>
            <button
              type="button"
              class="chip-delete-btn"
              @click.stop="confirmDeleteSingle(email)"
              :title="`删除 ${email}`"
              aria-label="删除此邮箱"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scheduled Reset / Active Watch Alert -->
    <div v-if="status?.data.active_watch" class="watch-alert">
      <span class="watch-badge">⚠️ 研判观察期 (Active Watch)</span>
      <p class="watch-text">{{ status.data.active_watch.text }}</p>
    </div>

    <!-- Main Hero Card -->
    <div class="hero-card">
      <div class="hero-card-top">
        <span class="hero-label">最新一次 Codex 额度重置 (Latest Codex limit reset)</span>
        <span v-if="latestReset?.reset_type" class="reset-type-chip" :class="latestReset.reset_type">
          {{ latestReset.reset_type === 'banked' ? '🎁 Banked 累积额度' : '⚡️ Regular 普调重置' }}
        </span>
      </div>

      <div class="hero-figure-row">
        <div class="hero-figure" :title="absoluteTime">
          {{ relativeTime }}
        </div>

        <!-- Thanks / Beg Reaction Button (Live synced with codex-resets.com) -->
        <div class="reaction-box">
          <button
            class="reaction-btn"
            :class="{ 'is-loading': reactionCount === null }"
            @click="handleReaction"
            :title="reactionTitle"
          >
            <span class="reaction-emoji">🙏</span>
            <span v-if="reactionCount !== null" class="reaction-text">{{ reactionLabel }}</span>
            <span class="reaction-count mono">{{ reactionCount !== null ? reactionCount.toLocaleString() : '—' }}</span>
          </button>

          <!-- Floating Emoji & Avatar Bursts -->
          <div class="burst-container">
            <span
              v-for="burst in bursts"
              :key="burst.id"
              class="burst-particle"
              :style="{ left: burst.x + 'px', top: burst.y + 'px' }"
            >
              <img
                v-if="burst.emoji === 'avatar'"
                :src="avatarUrl"
                alt=""
                class="burst-avatar"
              />
              <span v-else>{{ burst.emoji }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="hero-footer">
        <div class="hero-time-info mono">
          <span class="dot">●</span>
          <span>{{ absoluteTime }}</span>
        </div>

        <div v-if="latestReset?.source?.url" class="tweet-link-box">
          <a
            :href="withToken(latestReset.source.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="tweet-origin-link"
          >
            查看推文公告原文 &rarr;
          </a>
        </div>
      </div>

      <p v-if="latestReset?.text" class="hero-tweet-preview">
        "{{ latestReset.text }}"
      </p>
    </div>
  </section>
</template>
