import { ExplainerDrawer } from "@/components/explainability/ExplainerDrawer";
import { MODEL_CARDS } from "@/components/explainability/modelCards";
import { Button } from "@/components/ui/button";

type ContractMarketInfoTriggerProps = {
  className?: string;
};

export function ContractMarketInfoTrigger({ className }: ContractMarketInfoTriggerProps) {
  const card = MODEL_CARDS["contract-market"];

  return (
    <ExplainerDrawer
      title={card.title}
      description={card.description}
      factors={card.factors}
      example={card.example}
      triggerAriaLabel="Open contract market model details"
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={className ?? "h-6 w-6 text-muted-foreground"}
        >
          ⓘ
        </Button>
      }
    />
  );
}

