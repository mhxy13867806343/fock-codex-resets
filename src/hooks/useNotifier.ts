import { useMessage, useDialog, useNotification } from 'naive-ui';
import { showToast, showDialog as showVantDialog, showNotify as showVantNotify } from 'vant';
import { useDevice } from './useDevice';

export function useNotifier() {
  const { isMobile } = useDevice();
  const naiveMessage = useMessage();
  const naiveDialog = useDialog();
  const naiveNotification = useNotification();

  /**
   * Prompts user about page/data update using the corresponding UI component library:
   * PC -> Naive UI
   * H5 -> Vant
   */
  function notifyPageUpdate(options?: {
    title?: string;
    message?: string;
    onConfirm?: () => void;
  }) {
    const title = options?.title || '数据已更新';
    const content = options?.message || (isMobile.value 
      ? '【移动端 Vant】已检测到最新的 Codex 重置数据并刷新展示！' 
      : '【桌面端 Naive UI】已检测到最新的 Codex 重置数据并刷新展示！');

    if (isMobile.value) {
      // H5 uses Vant
      showToast({
        message: content,
        icon: 'success',
        duration: 2500,
      });
      options?.onConfirm?.();
    } else {
      // PC uses Naive UI
      naiveNotification?.success({
        title,
        content,
        duration: 3000,
        keepAliveOnHover: true,
      });
      naiveMessage?.success(content);
      options?.onConfirm?.();
    }
  }

  /**
   * Confirmation dialog for manual refresh action
   */
  function confirmRefresh(onRefresh: () => Promise<void> | void) {
    if (isMobile.value) {
      // H5 uses Vant Dialog
      showVantDialog({
        title: 'Vant 移动端刷新提示',
        message: '确认拉取最新的 OpenAI Codex 额度重置数据？',
        showCancelButton: true,
        confirmButtonColor: '#ff5c2b',
      }).then(() => {
        onRefresh();
        showToast({ message: '数据刷新完成 (Vant)', icon: 'passed' });
      }).catch(() => {});
    } else {
      // PC uses Naive UI Dialog
      naiveDialog?.info({
        title: 'Naive UI 桌面端刷新确认',
        content: '是否立即连接官方 API 刷新获取最新重置状态与热力图记录？',
        positiveText: '确认刷新',
        negativeText: '取消',
        onPositiveClick: async () => {
          await onRefresh();
          naiveMessage?.success('已使用 Naive UI 刷新并载入最新数据！');
        },
      });
    }
  }

  function showSuccess(msg: string) {
    if (isMobile.value) {
      showToast(msg);
    } else {
      naiveMessage?.success(msg);
    }
  }

  function showError(msg: string) {
    if (isMobile.value) {
      showToast({ message: msg, icon: 'cross' });
    } else {
      naiveMessage?.error(msg);
    }
  }

  return {
    isMobile,
    notifyPageUpdate,
    confirmRefresh,
    showSuccess,
    showError,
  };
}
