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

interface DayCell {
  dateString: string;
  dayOfWeek: number;
  reset?: Reset;
}

interface WeekColumn {
  monthLabel: string;
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

  const end = dayjs().endOf('week');
  const start = end.subtract(51, 'week').startOf('week');

  const weeks: WeekColumn[] = [];
  let current = start;
  let lastMonth = -1;

  for (let w = 0; w < 52; w++) {
    const days: (DayCell | null)[] = [];
    let monthLabel = '';

    for (let d = 0; d < 7; d++) {
      const dStr = current.format('YYYY-MM-DD');
      const m = current.month();
      if (m !== lastMonth && d === 0) {
        monthLabel = current.format('MMM');
        lastMonth = m;
      }

      days.push({
        dateString: dStr,
        dayOfWeek: d,
        reset: resetMap.get(dStr),
      });

      current = current.add(1, 'day');
    }

    weeks.push({
      monthLabel,
      days,
    });
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

        <!-- Scrollable Heatmap Grid -->
        <div class="cg-scroll">
          <div class="cg-grid">
            <div
              v-for="(week, wIdx) in calendarWeeks"
              :key="wIdx"
              class="cg-week-col"
            >
              <span class="cg-month-label mono">
                {{ week.monthLabel }}
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
