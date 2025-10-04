import { css } from "@emotion/react";
import { useGameStore } from "../stores/gameStore";
import { isTossApp } from "../utils/platform";
import { Paragraph, Post } from "@toss/tds-mobile";
import { colors } from "@toss/tds-colors";

const scoreStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
`;

const scoreTextStyle = css`
  font-size: 18px;
  font-weight: 600;
  color: #4e5968;
`;

const bestScoreHighlightStyle = css`
  font-size: 18px;
  font-weight: 600;
  color: #3182f6;
`;

export function ScoreDisplay() {
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
          <Paragraph.Text
            style={{ marginBottom: "8px" }}
          >{`최고기록: ${bestScore}`}</Paragraph.Text>
        </Paragraph>
        <Paragraph
          typography="st7"
          fontWeight="bold"
          style={{ margin: "3px" }}
          color={colors.grey700}
        >
          <Paragraph.Text typography="st7">{`현재점수: ${score}`}</Paragraph.Text>
        </Paragraph>
      </div>
    );
  }

  return (
    <div css={scoreStyle}>
      <p css={score === bestScore ? bestScoreHighlightStyle : scoreTextStyle}>
        최고기록: {bestScore}
      </p>
      <p css={scoreTextStyle}>현재점수: {score}</p>
    </div>
  );
}
