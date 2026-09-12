import { useMessage, useDialog, useNotification } from 'naive-ui';
import { showToast, showDialog as showVantDialog } from 'vant';
import { useDevice } from './useDevice';

export function useNotifier() {
  const { isMobile } = useDevice();
  const naiveMessage = useMessage();
  const naiveDialog = useDialog();
  const naiveNotification = useNotification();

  /**
   * 触发页面数据更新/刷新提示（根据当前设备环境严格使用对应组件库）
   * 需求：页面更新的时候，要判断下的，提示使用对应版本的组件库 进行刷新的。
   */
  function promptRefresh(onConfirm: () => Promise<void> | void) {
    if (isMobile.value) {
      // 📱 H5 移动端：使用 Vant 提示与刷新
      showVantDialog({
        title: '刷新提示',
        message: '检测到页面数据有更新',
        showCancelButton: true,
        confirmButtonText: '刷新',
        cancelButtonText: '取消',
        confirmButtonColor: '#ff5c2b',
      }).then(async () => {
        showToast({ type: 'loading', message: '正在刷新数据...', duration: 0 });
        try {
          await onConfirm();
          showToast({ type: 'success', message: '完成刷新', icon: 'passed' });
        } catch {
          showToast({ type: 'fail', message: '刷新失败，请稍后重试' });
        }
      }).catch(() => {
        // 用户取消
      });
    } else {
      // 🖥 桌面 PC 端：使用 Naive UI 提示与刷新
      naiveDialog?.info({
        title: '刷新提示',
        content: '检测到页面数据有更新，',
        positiveText: '刷新',
        negativeText: '取消',
        onPositiveClick: async () => {
          try {
            await onConfirm();
            naiveNotification?.success({
              title: '刷新成功',
              content: '获取最新 Codex 额度重置数据！',
              duration: 3000,
            });
            naiveMessage?.success('完成刷新');
          } catch {
            naiveMessage?.error('请检查网络连接');
          }
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
    promptRefresh,
    showSuccess,
    showError,
  };
}
