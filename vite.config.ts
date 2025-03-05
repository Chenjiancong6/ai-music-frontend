import { loadEnv } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import type { UserConfig, ConfigEnv } from 'vite';

const root = process.cwd();
const pathResolve = (dir: string) => resolve(root, '.', dir);

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const isBuild = command === 'build';
  const argMode = process.argv[3] === '--mode' ? process.argv[4] : process.argv[3];
  const configDir = pathResolve('config');
  const env = loadEnv(isBuild ? mode : argMode, configDir);

  return {
    envDir: pathResolve('config'),
    // base: env.VITE_BASE_PATH,
    base: '/app/', // 关键配置！所有资源路径添加 /app/ 前缀
    build: {
      cssCodeSplit: true, // 启用 CSS 分包
      outDir: 'dist', // 输出目录为 dist（无需修改）
      target: 'esnext', //browsers can handle the latest ES features
      rollupOptions: {
        input: {
          index: './index.html'
        },
        output: {
          manualChunks: (id) => {
            // 将 node_modules 中的依赖打包到 vendor.js
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          // // 输出文件名格式（支持哈希）
          // entryFileNames: '[hash].js',
          // chunkFileNames: '[hash].js',
          // assetFileNames: '[hash].[ext]'
        },
      }
    },
    plugins: [
      vue(),
    ],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.less', '.css', 'vue'],
      alias: [
        {
          find: /\@\//,
          replacement: `${pathResolve('src')}/`
        }
      ]
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://113.45.79.44',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  };
};
