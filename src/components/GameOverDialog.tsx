import { ConfirmDialog } from "@toss/tds-mobile";
import { useGameStore } from "../stores/gameStore";
import { useEffect } from "react";

export function GameOverDialog() {
  const isOpen = useGameStore((state) => state.isDialogOpen);
  const closeDialog = useGameStore((state) => state.closeDialog);

  const handleRestart = () => {
    closeDialog();
    // 게임 재시작 로직은 이미 Game.ts에서 처리됨
  };

  const handleCancel = () => {
    closeDialog();
  };

  useEffect(() => {
    if (isOpen) {
      try {
        // Toss ConfirmDialog가 사용 가능한지 확인
        ConfirmDialog;
      } catch (e) {
        // Web 환경에서 브라우저 confirm 사용
        const result = confirm("게임오버!\n다시 시작하시겠습니까?");
        if (result) {
          handleRestart();
        } else {
          handleCancel();
        }
      }
    }
  }, [isOpen]);

  return (
    <ConfirmDialog
      open={isOpen}
      title={<ConfirmDialog.Title>{"게임오버!"}</ConfirmDialog.Title>}
      description={
        <ConfirmDialog.Description>
          {"다시 시작하시겠습니까?"}
        </ConfirmDialog.Description>
      }
      cancelButton={
        <ConfirmDialog.CancelButton onClick={handleCancel}>
          아니오
        </ConfirmDialog.CancelButton>
      }
      confirmButton={
        <ConfirmDialog.ConfirmButton onClick={handleRestart}>
          예
        </ConfirmDialog.ConfirmButton>
      }
      onClose={closeDialog}
    />
  );
}
