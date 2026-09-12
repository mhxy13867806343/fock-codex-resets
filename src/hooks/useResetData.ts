import { ref, onMounted } from 'vue';
import type { StatusResponse, Reset } from '../types';
import { fetchStatus, fetchResets } from '../api/codex';

export function useResetData() {
  const status = ref<StatusResponse | null>(null);
  const resets = ref<Reset[]>([]);
  const loading = ref(false);
  const lastUpdated = ref<number>(Date.now());

  async function loadData() {
    loading.value = true;
    try {
      const [statusRes, resetsRes] = await Promise.all([
        fetchStatus(),
        fetchResets(100),
      ]);
      status.value = statusRes;
      resets.value = resetsRes.data || [];
      lastUpdated.value = Date.now();
    } catch (err) {
      console.error('Error loading reset data:', err);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    loadData();
  });

  return {
    status,
    resets,
    loading,
    lastUpdated,
    loadData,
  };
}
