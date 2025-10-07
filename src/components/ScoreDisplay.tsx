import { css } from "@emotion/react";
import { useGameStore } from "../stores/gameStore";
import { isTossApp } from "../utils/platform";
import { Paragraph } from "@toss/tds-mobile";
import { colors } from "@toss/tds-colors";
import { useTranslation } from "react-i18next";

const scoreStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
`;

const scoreTextStyle = css`
  font-size: 20px;
  font-weight: 700;
  color: #4e5968;
`;

const bestScoreHighlightStyle = css`
  font-size: 20px;
  font-weight: 700;
  color: #3182f6;
`;

export function ScoreDisplay() {
  const { t } = useTranslation();
  const score = useGameStore((state) => state.score);
  const bestScore = useGameStore((state) => state.bestScore);

  if (isTossApp()) {
    return (
      <div>
        <Paragraph
          typography="st7"
          fontWeight="bold"
          style={{ margin: "3px" }}
          color={score === bestScore ? colors.blue500 : colors.grey700}
        >
          <Paragraph.Text style={{ marginBottom: "8px" }}>{`${t(
            "score.best"
          )}: ${bestScore}`}</Paragraph.Text>
        </Paragraph>
        <Paragraph
          typography="st7"
          fontWeight="bold"
          style={{ margin: "3px" }}
          color={colors.grey700}
        >
          <Paragraph.Text typography="st7">{`${t(
            "score.current"
          )}: ${score}`}</Paragraph.Text>
        </Paragraph>
      </div>
    );
  }

  return (
    <div css={scoreStyle}>
      <p css={score >= bestScore ? bestScoreHighlightStyle : scoreTextStyle}>
        {t("score.best")}: {score > bestScore ? score : bestScore}
      </p>
      <p css={scoreTextStyle}>
        {t("score.current")}: {score}
      </p>
    </div>
  );
}
