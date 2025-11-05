import { ConfirmDialog } from "@toss/tds-mobile";
import { useGameStore } from "../stores/gameStore";
import { isTossApp } from "../utils/platform";

import { ConfirmDialog as ConfirmDialogDummy } from "../utils/tds-dummy";
import { getTossShareLink, share } from "@apps-in-toss/web-framework";

export function GameOverDialog() {
  const isOpen = useGameStore((state) => state.isDialogOpen);
  const onClose = useGameStore((state) => state.onClose);
  const closeDialog = useGameStore((state) => state.closeDialog);

  function handleCancel() {
    closeDialog();
    onClose?.();
  }

  const score = useGameStore((state) => state.score);

  async function handleConfirm() {
    // '/' 경로를 딥링크로 포함한 토스 공유 링크를 생성해요.
    const tossLink = await getTossShareLink("intoss://swipebrick");
    // alert(tossLink);
    // 생성한 링크를 메시지로 공유해요.
    await share({
      message: `스와이프 벽돌게임에서 ${score}점을 달성했어요.\n같이 게임 해요!\n${tossLink}`,
    });
  }

  if (!isTossApp()) {
    return (
      <ConfirmDialogDummy
        open={isOpen}
        title={
          <ConfirmDialogDummy.Title>{"게임오버!"}</ConfirmDialogDummy.Title>
        }
        description={
          <ConfirmDialogDummy.Description>
            {"게임을 재도전하세요!"}
          </ConfirmDialogDummy.Description>
        }
        // cancelButton={
        //   <ConfirmDialogDummy.CancelButton onClick={handleCancel}>
        //     다시하기
        //   </ConfirmDialogDummy.CancelButton>
        // }
        confirmButton={
          <ConfirmDialogDummy.ConfirmButton onClick={handleCancel}>
            다시하기
          </ConfirmDialogDummy.ConfirmButton>
        }
        onClose={handleCancel}
      />
    );
  }

  return (
    <ConfirmDialog
      open={isOpen}
      title={<ConfirmDialog.Title>{"게임오버!"}</ConfirmDialog.Title>}
      description={
        <ConfirmDialog.Description>
          {"게임을 재도전하세요!"}
        </ConfirmDialog.Description>
      }
      cancelButton={
        <ConfirmDialog.CancelButton onClick={handleCancel}>
          다시하기
        </ConfirmDialog.CancelButton>
      }
      confirmButton={
        <ConfirmDialog.ConfirmButton
          onClick={() => {
            handleConfirm();
          }}
        >
          공유하기
        </ConfirmDialog.ConfirmButton>
      }
      onClose={handleCancel}
    />
  );
}
