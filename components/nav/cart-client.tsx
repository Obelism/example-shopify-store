"use client";

import { useCartDrawer } from "@/components/cart/context";
import { Icon } from "@/components/ui/icon";
import { useCart } from "@/lib/cart/client";

interface CartIconClientProps {
  cartLabel: string;
  initialCart: { totalQuantity: number } | null;
}

export function CartIconClient({ cartLabel, initialCart }: CartIconClientProps) {
  const quantity = useCart((state) =>
    state.loading
      ? (initialCart?.totalQuantity ?? state.data.totalQuantity)
      : state.data.totalQuantity,
  );
  const { openOverlay } = useCartDrawer();

  return (
    <button
      onClick={openOverlay}
      className="flex cursor-pointer items-center justify-center gap-1.5 text-foreground hover:text-foreground/80 transition-colors"
      type="button"
    >
      <span className="relative">
        <Icon name="handbag" className="size-5" />
        {quantity > 0 && (
          <span className="absolute -top-2 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-xxs leading-none text-background">
            {quantity}
          </span>
        )}
      </span>
      <span className="sr-only">{cartLabel}</span>
    </button>
  );
}
