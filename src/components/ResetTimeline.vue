<script setup lang="ts">
import type { Reset, ResetType } from '../types';

const props = defineProps<{
  resets: Reset[];
  selectedDate?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:selectedDate', date: string | null): void;
}>();

const { isMobile } = useDevice();
const { withToken } = useToken();

// Filter states
const typeFilter = ref<'all' | ResetType>('all');
const visibleCount = ref(15);

// Expanded tweet text IDs
const expandedIds = ref<Set<string>>(new Set());

function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id);
  } else {
    expandedIds.value.add(id);
  }
}

// H5 Vant Date Picker State (https://vant-ui.github.io/vant/#/zh-CN/date-picker)
const showH5DatePicker = ref(false);
const h5SelectedDate = ref<string[]>([
  dayjs().format('YYYY'),
  dayjs().format('MM'),
  dayjs().format('DD')
]);

// Dynamically compute minDate and maxDate based on actual reset records and current time
const minDate = computed(() => {
  if (props.resets && props.resets.length > 0) {
    const timestamps = props.resets
      .map(r => new Date(r.announced_at).getTime())
      .filter(t => !isNaN(t));
    if (timestamps.length > 0) {
      const earliest = Math.min(...timestamps);
      return dayjs(earliest).startOf('month').toDate();
    }
  }
  return dayjs().subtract(1, 'year').startOf('month').toDate();
});

const maxDate = computed(() => {
  // 只能到当前时间，后面的未来时间不要出来
  return new Date();
});

function isDateDisabled(ts: number) {
  // 禁止选择大于当前时间的未来日期
  return ts > Date.now();
}

// PC Naive Date Picker Timestamp
const pcDateTimestamp = ref<number | null>(null);

function onPcDateChange(ts: number | null) {
  if (ts) {
    const formatted = dayjs(ts).format('YYYY-MM-DD');
    emit('update:selectedDate', formatted);
  } else {
    emit('update:selectedDate', null);
  }
}

function onH5DateConfirm({ selectedValues }: { selectedValues: string[] }) {
  const formatted = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`;
  emit('update:selectedDate', formatted);
  showH5DatePicker.value = false;
}

function clearDateFilter() {
  emit('update:selectedDate', null);
  pcDateTimestamp.value = null;
}

const filteredResets = computed(() => {
  return props.resets.filter(item => {
    if (typeFilter.value !== 'all' && item.reset_type !== typeFilter.value) {
      return false;
    }
    if (props.selectedDate) {
      const itemDate = dayjs(item.announced_at).format('YYYY-MM-DD');
      if (itemDate !== props.selectedDate) {
        return false;
      }
    }
    return true;
  });
});

const displayedResets = computed(() => {
  return filteredResets.value.slice(0, visibleCount.value);
});

function loadMore() {
  visibleCount.value += 15;
}

function formatRelative(dateStr: string) {
  return dayjs(dateStr).fromNow();
}

function formatAbsolute(dateStr: string) {
  return dayjs.utc(dateStr).format('MMM D, YYYY, h:mm A UTC');
}
</script>

<template>
  <section class="timeline-section">
    <div class="timeline-header">
      <div class="timeline-title-group">
        <h2>额度重置动态时间线 (Reset Announcements)</h2>
      </div>
    </div>

    <!-- Sticky Filter Bar pinned to top of viewport -->
    <div class="timeline-sticky-container">
      <div class="timeline-filter-bar">
        <!-- Type Filter Chips -->
        <button
          class="filter-chip"
          :class="{ active: typeFilter === 'all' }"
          @click="typeFilter = 'all'"
        >
          全部 ({{ resets.length }})
        </button>
        <button
          class="filter-chip"
          :class="{ active: typeFilter === 'regular' }"
          @click="typeFilter = 'regular'"
        >
          普调 Regular
        </button>
        <button
          class="filter-chip"
          :class="{ active: typeFilter === 'banked' }"
          @click="typeFilter = 'banked'"
        >
          预存 Banked
        </button>

        <!-- Date Filter Button & Components -->
        <!-- PC: Naive UI Date Picker -->
        <div v-if="!isMobile" class="pc-datepicker-wrapper">
          <n-date-picker
            v-model:value="pcDateTimestamp"
            type="date"
            placeholder="按日期筛选"
            clearable
            size="small"
            :is-date-disabled="isDateDisabled"
            @update:value="onPcDateChange"
            style="width: 140px;"
          />
        </div>

        <!-- H5: Vant Date Picker (https://vant-ui.github.io/vant/#/zh-CN/date-picker) -->
        <div v-else class="h5-datepicker-wrapper">
          <button class="date-picker-btn" @click="showH5DatePicker = true">
            📅 {{ selectedDate || '日期筛选' }}
          </button>
          <button v-if="selectedDate" class="filter-chip" @click="clearDateFilter">
            ✕ 清除
          </button>

          <!-- Vant Popup with van-date-picker -->
          <van-popup v-model:show="showH5DatePicker" position="bottom" round>
            <van-date-picker
              v-model="h5SelectedDate"
              title="选择重置日期"
              :min-date="minDate"
              :max-date="maxDate"
              @confirm="onH5DateConfirm"
              @cancel="showH5DatePicker = false"
            />
          </van-popup>
        </div>
      </div>
    </div>

    <!-- Active Filter Badge -->
    <div v-if="selectedDate" class="update-notify-bar">
      <span>已筛选日期：{{ selectedDate }} (共 {{ filteredResets.length }} 条记录)</span>
      <button class="update-btn" @click="clearDateFilter">查看所有日期</button>
    </div>

    <!-- Timeline List -->
    <ul v-if="displayedResets.length > 0" class="timeline-list">
      <li v-for="item in displayedResets" :key="item.id" class="timeline-item">
        <!-- Avatar with hover effect and link to X -->
        <a
          :href="withToken('https://x.com/thsottiaux')"
          target="_blank"
          rel="noopener noreferrer"
          class="item-avatar-link"
          title="访问 @thsottiaux 主页"
        >
          <img
            src="/thsottiaux-avatar.jpg"
            alt="@thsottiaux"
            class="item-avatar"
            width="44"
            height="44"
            loading="lazy"
          />
        </a>

        <!-- Tweet Bubble -->
        <div class="item-bubble">
          <div class="item-meta">
            <span class="item-time-pill">{{ formatRelative(item.announced_at) }}</span>
            <span class="item-abs-time mono">{{ formatAbsolute(item.announced_at) }}</span>
            <span class="reset-type-chip" :class="item.reset_type">
              {{ item.reset_type === 'banked' ? 'Banked' : 'Regular' }}
            </span>
          </div>

          <!-- 2-line clamp with expand toggle -->
          <div class="item-text-wrapper">
            <p
              class="item-text"
              :class="{ 'clamp-2': !expandedIds.has(item.id) }"
            >
              {{ item.text }}
            </p>
            <button
              v-if="item.text.length > 75 || item.text.includes('\n')"
              class="toggle-more-btn"
              @click="toggleExpand(item.id)"
            >
              {{ expandedIds.has(item.id) ? '收起全文 ▲' : '展开更多 ▼' }}
            </button>
          </div>

          <a
            v-if="item.source?.url"
            :href="withToken(item.source.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="item-link"
          >
            在 X 上查看原推文 &rarr;
          </a>
        </div>
      </li>
    </ul>

    <div v-else class="timeline-empty">
      暂无符合条件的 Codex 重置记录
    </div>

    <!-- Load More Button -->
    <div v-if="visibleCount < filteredResets.length" class="load-more-box">
      <button class="neobrutal-pill" @click="loadMore">
        加载更多记录 (剩余 {{ filteredResets.length - visibleCount }} 条) ↓
      </button>
    </div>

    <!-- No More Data / Bottom Line ("已加载完数据了，我是有底线的。") -->
    <div v-else-if="filteredResets.length > 0" class="timeline-bottom-line">
      <!-- PC: Naive UI Divider -->
      <n-divider v-if="!isMobile" dashed>
        <span class="bottom-line-content">
          <span class="bottom-line-icon">⚡️</span> 已加载完数据了，我是有底线的。
        </span>
      </n-divider>

      <!-- H5: Vant Divider -->
      <van-divider v-else dashed>
        <span class="bottom-line-content">
          <span class="bottom-line-icon">⚡️</span> 已加载完数据了，我是有底线的。
        </span>
      </van-divider>
    </div>
  </section>
</template>
