import { ConfirmDialog } from "@toss/tds-mobile";
import { useGameStore } from "../stores/gameStore";
import { isTossApp } from "../utils/platform";
import { useEffect } from "react";

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

  useEffect(() => {
    if (isOpen && !isTossApp()) {
      const result = confirm("게임오버!\n게임을 재도전하세요!");
      if (result) {
        handleCancel(); // 재도전
      } else {
        handleCancel(); // 어떤 선택을 해도 다시하기
      }
    }
  }, [isOpen]);

  if (!isTossApp()) {
    return null;
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
