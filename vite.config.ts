import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isVercel = process.env.VERCEL === '1';

  // Vercel 배포시에만 TDS 더미 사용
  const aliases = (isProduction && isVercel) ? {
    "@toss/tds-mobile": "/src/utils/tds-dummy.tsx",
    "@toss/tds-mobile-ait": "/src/utils/tds-dummy.tsx",
    "@toss/tds-colors": "/src/utils/tds-dummy.tsx",
  } : undefined;

  return {
    plugins: [react()],
    resolve: {
      ...(aliases && { alias: aliases }),
    },
  };
});
