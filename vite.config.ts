import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 웹 빌드시 TDS 패키지를 더미로 대체
      // "@toss/tds-mobile": "/src/utils/tds-dummy.tsx",
      // "@toss/tds-mobile-ait": "/src/utils/tds-dummy.tsx",
      // "@toss/tds-colors": "/src/utils/tds-dummy.tsx",
    },
  },
});
