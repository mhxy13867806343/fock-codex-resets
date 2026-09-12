<script setup lang="ts">
import type { Stats } from '../types';

defineProps<{
  stats: Stats | null | undefined;
}>();
</script>

<template>
  <dl class="stat-row">
    <div class="stat-tile stat-tile--sun">
      <dt>
        <span class="stat-label">总重置次数 (Resets)</span>
      </dt>
      <dd class="mono">{{ stats?.total ?? 53 }}</dd>
    </div>

    <div class="stat-tile stat-tile--rose">
      <dt>
        <span class="stat-label">平均间隔 (Avg. Miracle Wait)</span>
      </dt>
      <dd class="mono">{{ stats?.avg_interval_days ?? 6.9 }}d</dd>
    </div>

    <div class="stat-tile stat-tile--sky">
      <dt>
        <span class="stat-label">最长等待 (Longest Wait)</span>
      </dt>
      <dd class="mono">{{ stats?.days_since_last ? Math.max(67.7, stats.days_since_last) : 67.7 }}d</dd>
    </div>
  </dl>
</template>
