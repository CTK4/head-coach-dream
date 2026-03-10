import { useGame } from "@/context/GameContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function OfferResultModalHost() {
  const { state, dispatch } = useGame();
  const modal = state.ui.offerResultModal;

  return (
    <Dialog open={!!modal?.open}>
      <DialogContent
        className="max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{modal?.title ?? "Offer Result"}</DialogTitle>
          <DialogDescription>{modal?.message ?? ""}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => dispatch({ type: "HIDE_OFFER_RESULT_MODAL" })}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
