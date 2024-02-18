import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import copy from 'rollup-plugin-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    copy({
      targets: [
        { src: 'public/models/*', dest: 'dist/models' }
      ],
      hook: 'writeBundle' // 빌드 과정의 특정 시점에 복사 작업을 수행
    }),
    react(),
    {
      name: 'ignore-lottie-eval-warning',
      buildStart(options) {
        this.onwarn = (warning, warn) => {
          // "eval" 경고가 포함된 lottie.js 파일의 경고 무시
          if (warning.code === 'EVAL' && warning.id.includes('lottie.js')) {
            return;
          }
          // 기타 모든 경고는 기본 경고 함수로 전달
          warn(warning);
        };
      }
    }],
  build: {
    // 청크 크기 경고 한계를 5MB로 설정
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        // 수동 청크 설정
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // node_modules 내의 모든 모듈을 'vendor'라는 별도의 청크로 분리
            return 'vendor';
          }
        },   
      }
    }
  }
})

