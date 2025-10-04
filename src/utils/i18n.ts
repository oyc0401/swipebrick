import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 번역 리소스
const resources = {
  ko: {
    translation: {
      "score.current": "현재점수",
      "score.best": "최고기록",
    },
  },
  en: {
    translation: {
      "score.current": "Current Score",
      "score.best": "Best Score",
    },
  },
  zh: {
    translation: {
      "score.current": "当前分数",
      "score.best": "最高纪录",
    },
  },
  ja: {
    translation: {
      "score.current": "現在のスコア",
      "score.best": "ベストスコア",
    },
  },
  th: {
    translation: {
      "score.current": "คะแนนปัจจุบัน",
      "score.best": "คะแนนสูงสุด",
    },
  },
  vi: {
    translation: {
      "score.current": "Điểm Hiện Tại",
      "score.best": "Điểm Cao Nhất",
    },
  },
  id: {
    translation: {
      "score.current": "Skor Saat Ini",
      "score.best": "Skor Terbaik",
    },
  },
  ru: {
    translation: {
      "score.current": "Текущий Счёт",
      "score.best": "Лучший Счёт",
    },
  },
  fr: {
    translation: {
      "score.current": "Score Actuel",
      "score.best": "Meilleur Score",
    },
  },
  de: {
    translation: {
      "score.current": "Aktuelle Punktzahl",
      "score.best": "Beste Punktzahl",
    },
  },
};

// i18next 초기화
i18n.use(initReactI18next).init({
  resources,
  lng: "ko", // 기본 언어
  fallbackLng: "ko", // fallback 언어
  interpolation: {
    escapeValue: false, // React는 XSS를 자동으로 방지
  },
});

// locale에 따라 언어 설정
export async function initializeI18n(): Promise<void> {
  try {
    const { getLocale } = await import("./locale");
    const locale = await getLocale();
    const language = locale.split("-")[0]; // ko-KR -> ko

    // 지원하는 언어인지 확인
    const supportedLanguages = [
      "ko",
      "en",
      "zh",
      "ja",
      "th",
      "vi",
      "id",
      "ru",
      "fr",
      "de",
    ];
    const targetLanguage = supportedLanguages.includes(language)
      ? language
      : "ko";

    await i18n.changeLanguage(targetLanguage);
    console.log(`i18n initialized with language: ${targetLanguage}`);
  } catch (error) {
    console.warn("Failed to initialize i18n:", error);
    // 기본 언어(ko)로 설정
    await i18n.changeLanguage("ko");
  }
}

export default i18n;
