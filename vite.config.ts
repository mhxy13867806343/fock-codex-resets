import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/fock-codex-resets/' : '/',
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar',
            'useOsTheme',
          ],
          'dayjs': [
            ['default', 'dayjs'],
          ],
        },
      ],
      resolvers: [VantResolver()],
      dirs: ['src/hooks'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [VantResolver(), NaiveUiResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5188,
    host: true,
    proxy: {
      '/api': {
        target: 'https://codex-resets.com',
        changeOrigin: true,
        secure: true,
        ws: true,
        headers: {
          Referer: 'https://codex-resets.com',
          Origin: 'https://codex-resets.com',
        },
      },
    },
  },
});
