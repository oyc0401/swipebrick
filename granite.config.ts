import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "swipebrick",
  brand: {
    displayName: "스와이프 벽돌깨기", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#3182F6", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://private-user-images.githubusercontent.com/73932179/495775139-aa5b4f0e-f49c-4a84-a7a2-9d497e7600a5.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTkyNDY5MTUsIm5iZiI6MTc1OTI0NjYxNSwicGF0aCI6Ii83MzkzMjE3OS80OTU3NzUxMzktYWE1YjRmMGUtZjQ5Yy00YTg0LWE3YTItOWQ0OTdlNzYwMGE1LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA5MzAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwOTMwVDE1MzY1NVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTJjNjc4YTc5ZjNhOGRjZmVjZGFkNTU1NjRhOWJjYzNkYjE1NTJjZTVmMjBjZjIwMzg3MDFjNmU4MDhmYTE2YjYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.25iz3DdoCVKpAzSEFehsbQPZH-CgOEerOwyU2rW8hE4", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
    bridgeColorMode: "inverted",
  },
  web: {
    host: "192.169.200.105",
    port: 5173,
    commands: {
      dev: "vite --host",
      build: "tsc -b && vite build",
    },
  },
  permissions: [],
  outdir: "dist",
  webViewProps: {
    type: "game",
  },
});
