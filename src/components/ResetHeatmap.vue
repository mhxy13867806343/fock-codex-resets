<script setup lang="ts">
import type { Reset } from '../types';

const props = defineProps<{
  resets: Reset[];
  selectedDate?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select-date', date: string | null): void;
}>();

const { isMobile } = useDevice();
const scrollRef = ref<HTMLElement | null>(null);

interface DayCell {
  dateString: string;
  dayOfWeek: number;
  reset?: Reset;
}

interface WeekColumn {
  monthLabel: string;
  isCurrentMonth: boolean;
  days: (DayCell | null)[];
}

const calendarWeeks = computed<WeekColumn[]>(() => {
  const resetMap = new Map<string, Reset>();
  for (const r of props.resets) {
    const dStr = dayjs(r.announced_at).format('YYYY-MM-DD');
    if (!resetMap.has(dStr)) {
      resetMap.set(dStr, r);
    }
  }

  const now = dayjs();
  const currentMonthStr = now.format('MMM');
  const currentMonthKey = now.format('YYYY-MM');

  const end = now.endOf('week');
  const start = end.subtract(51, 'week').startOf('week');

  const weeks: WeekColumn[] = [];
  let current = start;

  for (let w = 0; w < 52; w++) {
    const days: (DayCell | null)[] = [];
    let monthLabel = '';
    let isCurrentMonth = false;

    for (let d = 0; d < 7; d++) {
      const dStr = current.format('YYYY-MM-DD');
      
      // 精确对齐到月份第 1 天所在周列
      if (current.date() === 1 || (w === 0 && d === 0)) {
        monthLabel = current.format('MMM');
      }

      if (current.format('YYYY-MM') === currentMonthKey) {
        // 当前月份列
        if (monthLabel === currentMonthStr) {
          isCurrentMonth = true;
        }
      }

      days.push({
        dateString: dStr,
        dayOfWeek: d,
        reset: resetMap.get(dStr),
      });

      current = current.add(1, 'day');
    }

    if (monthLabel === currentMonthStr) {
      isCurrentMonth = true;
    }

    weeks.push({
      monthLabel,
      isCurrentMonth,
      days,
    });
  }

  // 确保当前月份标签必定高亮展示并精确对齐
  const hasCurrentMonthBadge = weeks.some(wk => wk.isCurrentMonth && wk.monthLabel);
  if (!hasCurrentMonthBadge) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const containsCurrentMonthDay = weeks[i].days.some(
        d => d && d.dateString.startsWith(currentMonthKey)
      );
      if (containsCurrentMonthDay) {
        weeks[i].monthLabel = currentMonthStr;
        weeks[i].isCurrentMonth = true;
        break;
      }
    }
  }

  return weeks;
});

function onCellClick(day: DayCell) {
  if (props.selectedDate === day.dateString) {
    emit('select-date', null);
  } else {
    emit('select-date', day.dateString);
  }
}

// 自动对齐滚动条至当前最新月份（右侧末尾）
function scrollToCurrent() {
  if (scrollRef.value) {
    scrollRef.value.scrollLeft = scrollRef.value.scrollWidth;
  }
}

onMounted(() => {
  nextTick(() => {
    scrollToCurrent();
  });
});

watch(() => props.resets, () => {
  nextTick(() => {
    scrollToCurrent();
  });
});
</script>

<template>
  <section class="graph-section">
    <div class="section-head">
      <div class="section-title-box">
        <h2>Codex 历史重置热力图 (Reset History)</h2>
        <p class="section-sub mono">过去 1 年每日重置记录日历</p>
      </div>

      <div class="graph-legend mono">
        <span class="legend-item">
          <span class="legend-chip legend-chip--regular"></span>
          <span>普调重置 (regular)</span>
        </span>
        <span class="legend-item">
          <span class="legend-chip legend-chip--banked"></span>
          <span>预存额度 (banked)</span>
        </span>
        <span class="legend-item">
          <span class="legend-chip legend-chip--empty"></span>
          <span>无重置 (no reset)</span>
        </span>
      </div>
    </div>

    <div class="graph-card">
      <div class="cg-container">
        <!-- Weekday Labels -->
        <div class="cg-weekdays mono">
          <span class="cg-weekday-header"></span>
          <span class="cg-weekday">周日</span>
          <span class="cg-weekday">周一</span>
          <span class="cg-weekday">周二</span>
          <span class="cg-weekday">周三</span>
          <span class="cg-weekday">周四</span>
          <span class="cg-weekday">周五</span>
          <span class="cg-weekday">周六</span>
        </div>

        <!-- Scrollable Heatmap Grid (自动对齐至当前位置) -->
        <div class="cg-scroll" ref="scrollRef">
          <div class="cg-grid">
            <div
              v-for="(week, wIdx) in calendarWeeks"
              :key="wIdx"
              class="cg-week-col"
            >
              <!-- 月份标签：精确对齐，且当前月高亮显示 -->
              <span
                class="cg-month-label mono"
                :class="{ 'is-current-month': week.isCurrentMonth }"
              >
                <span
                  v-if="week.monthLabel && week.isCurrentMonth"
                  class="current-month-badge"
                  title="当前月份"
                >
                  ⚡️ {{ week.monthLabel }} (本月)
                </span>
                <span v-else-if="week.monthLabel">
                  {{ week.monthLabel }}
                </span>
              </span>

              <div
                v-for="(day, dIdx) in week.days"
                :key="dIdx"
                class="cg-cell-wrapper"
              >
                <!-- PC Tooltip (Naive UI) -->
                <n-tooltip v-if="!isMobile && day" trigger="hover" placement="top">
                  <template #trigger>
                    <button
                      type="button"
                      class="cg-cell"
                      :class="{
                        'has-reset': !!day.reset,
                        'is-banked': day.reset?.reset_type === 'banked',
                        'is-active': selectedDate === day.dateString
                      }"
                      @click="onCellClick(day)"
                    />
                  </template>
                  <div class="cell-tooltip-content">
                    <strong class="mono">{{ day.dateString }}</strong>
                    <div v-if="day.reset">
                      <span class="tooltip-badge">
                        {{ day.reset.reset_type === 'banked' ? '🎁 Banked 额度' : '⚡️ Regular 重置' }}
                      </span>
                      <p class="tooltip-text">{{ day.reset.text }}</p>
                    </div>
                    <div v-else class="tooltip-empty">当日无额度重置记录</div>
                  </div>
                </n-tooltip>

                <!-- H5 Cell -->
                <button
                  v-else-if="day"
                  type="button"
                  class="cg-cell"
                  :class="{
                    'has-reset': !!day.reset,
                    'is-banked': day.reset?.reset_type === 'banked',
                    'is-active': selectedDate === day.dateString
                  }"
                  @click="onCellClick(day)"
                />

                <div v-else class="cg-cell cg-cell--empty-space" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
