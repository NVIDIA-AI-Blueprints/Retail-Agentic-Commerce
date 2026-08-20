import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { CheckoutPage } from "./CheckoutPage";
import type { CartItem, CartState } from "@/types";

const cartItems: CartItem[] = [
  {
    id: "prod_1",
    name: "Classic Tee",
    basePrice: 2500,
    quantity: 1,
  },
];

const calculatingCartState: CartState = {
  cartId: "cart_test",
  items: cartItems,
  itemCount: 1,
  subtotal: 2500,
  shipping: 599,
  tax: 250,
  total: 3349,
  discount: 0,
  isCalculating: true,
};

describe("CheckoutPage", () => {
  it("allows opening the payment form while the ACP session refreshes", () => {
    render(
      <CheckoutPage
        cartItems={cartItems}
        cartState={calculatingCartState}
        sessionData={null}
        recommendations={[]}
        isLoadingRecommendations={false}
        isProcessing={false}
        checkoutResult={null}
        onBack={vi.fn()}
        onUpdateQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
        onCheckout={vi.fn()}
        onProductClick={vi.fn()}
        onQuickAdd={vi.fn()}
        onClearResult={vi.fn()}
        onShippingUpdate={vi.fn().mockResolvedValue(undefined)}
        onApplyCoupon={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(
      screen.getByRole("button", { name: /complete purchase/i })
    ).toBeEnabled();
  });
});
