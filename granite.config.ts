import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "swipebrick",
  brand: {
    displayName: "스와이프 벽돌깨기", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#3182F6", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://swipebrick.vercel.app/logo.png", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
    bridgeColorMode: "inverted",
  },
  web: {
    host: "192.168.219.108", // 본인 컴퓨터 IP 적기
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
    overScrollMode: "never",
    bounces: false,
    pullToRefreshEnabled: false,
    allowsBackForwardNavigationGestures: false,
  },
});
