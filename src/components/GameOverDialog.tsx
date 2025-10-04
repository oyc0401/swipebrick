import { ConfirmDialog } from "@toss/tds-mobile";
import { useGameStore } from "../stores/gameStore";
import { isTossApp } from "../utils/platform";

import { ConfirmDialog as ConfirmDialogDummy } from "../utils/tds-dummy";

export function GameOverDialog() {
  const isOpen = useGameStore((state) => state.isDialogOpen);
  const onClose = useGameStore((state) => state.onClose);
  const closeDialog = useGameStore((state) => state.closeDialog);

  function handleCancel() {
    closeDialog();
    onClose?.();
  }

  function handleConfirm() {
    console.log("공유하기!");
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
        cancelButton={
          <ConfirmDialogDummy.CancelButton onClick={handleCancel}>
            다시하기
          </ConfirmDialogDummy.CancelButton>
        }
        confirmButton={
          <ConfirmDialogDummy.ConfirmButton onClick={handleConfirm}>
            공유하기
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
        <ConfirmDialog.ConfirmButton onClick={handleConfirm}>
          공유하기
        </ConfirmDialog.ConfirmButton>
      }
      onClose={handleCancel}
    />
  );
}
