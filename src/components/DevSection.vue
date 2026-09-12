<script setup lang="ts">
import { showToast } from 'vant';

const { isMobile } = useDevice();
const { withToken } = useToken();
const message = useMessage();

const mcpConfigCode = ref(`{
  "mcpServers": {
    "codex-resets": {
      "url": "https://codex-resets.com/mcp",
      "type": "sse"
    }
  }
}`);

function copyMcp() {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(mcpConfigCode.value);
    if (isMobile.value) {
      showToast({ message: 'MCP 配置已复制', icon: 'success' });
    } else {
      message?.success('MCP 配置代码已成功复制到剪贴板！');
    }
  }
}
</script>

<template>
  <section class="dev-section">
    <div class="dev-head">
      <div class="dev-title-box">
        <h2>开发者集成与开放数据 (API & MCP)</h2>
        <p>提供免费公共 REST API 与 Model Context Protocol 协议支持</p>
      </div>
    </div>

    <div class="dev-cards-grid">
      <!-- REST API Card -->
      <div class="dev-card">
        <h3><span>⚡️</span> 开放 REST API (Public API)</h3>
        <p class="dev-card-desc">
          免鉴权只读接口，返回最新的额度重置事件及统计数据（已自动携带当前 Token 参数）。
        </p>

        <div class="code-snippet mono">
          GET {{ withToken('/api/v1/status') }}<br />
          GET {{ withToken('/api/v1/resets?limit=20') }}
        </div>

        <div style="display: flex; gap: 12px; margin-top: 10px;">
          <a
            :href="withToken('https://codex-resets.com/api/docs')"
            target="_blank"
            rel="noopener noreferrer"
            class="dev-link-btn"
          >
            Swagger UI 文档 &rarr;
          </a>
          <a
            :href="withToken('https://codex-resets.com/api/openapi.json')"
            target="_blank"
            rel="noopener noreferrer"
            class="dev-link-btn"
          >
            OpenAPI 规范 &rarr;
          </a>
        </div>
      </div>

      <!-- MCP Protocol Card -->
      <div class="dev-card">
        <h3><span>🤖</span> MCP Server (Model Context Protocol)</h3>
        <p class="dev-card-desc">
          在 Cursor、Claude Desktop 或 Antigravity 中配置，AI 助手即可随时掌握 Codex 额度重置时机。
        </p>

        <pre class="code-snippet mono">{{ mcpConfigCode }}</pre>

        <button class="neobrutal-pill" style="margin-top: 8px; font-size: 12px; padding: 4px 12px;" @click="copyMcp">
          📋 复制配置
        </button>
      </div>
    </div>
  </section>
</template>
