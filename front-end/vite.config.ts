import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path/win32'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  /* Khai báo alias để sử dụng đường dẫn tương đối trong dự án,
    * Ví dụ: import Button from '~/components/Button' sẽ trỏ đến src/components/Button
    * ngoài ra nếu dùng typescript thì cần khai báo thêm trong tsconfig.json và tsconfig.app.json để tránh lỗi khi chạy test và app
    * Note: CHỉ cần khai báo alias trong vite.config.ts là đủ, 
    * Nhưng trong giai đoạn lập trình, cần khai báo thêm trong tsconfig.json và tsconfig.app.json
    * để vscode có thể hiểu được alias và hỗ trợ tính năng tự động import, gợi ý khi viết code, và tránh lỗi khi chạy test và app
  */
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
})