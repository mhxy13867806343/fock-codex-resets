<script setup lang="ts">
const { withToken, currentToken } = useToken();
</script>

<template>
  <footer class="site-footer">
    <p class="footer-line">
      数据来源于 <a :href="withToken('https://x.com/thsottiaux')" target="_blank" rel="noopener noreferrer">@thsottiaux</a> 的公开推文，经由 AI 分类研判。非 OpenAI 官方附属项目。
    </p>
    <p class="footer-line">
      参考自 <a :href="withToken('https://codex-resets.com/')" target="_blank" rel="noopener noreferrer">codex-resets.com</a>（原作者 <a :href="withToken('https://x.com/wong2__')" target="_blank" rel="noopener noreferrer">@wong2__</a>）。
    </p>

    <div class="footer-meta mono">
      <span>Codex Resets Tracker &copy; 2026</span>
      <div class="footer-token-tag">
        当前全局 Token: <strong>{{ currentToken }}</strong>
      </div>
    </div>
  </footer>
</template>
