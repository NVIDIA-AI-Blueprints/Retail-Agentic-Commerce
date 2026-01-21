"use client";

import { useReducer, useCallback } from "react";
import type {
  CheckoutFlowState,
  CheckoutFlowContext,
  CheckoutFlowAction,
  Product,
} from "@/types";

const DEFAULT_SHIPPING_ID = "shipping_standard";

const initialContext: CheckoutFlowContext = {
  state: "product_selection",
  selectedProduct: null,
  quantity: 1,
  selectedShippingId: DEFAULT_SHIPPING_ID,
  orderId: null,
};

/**
 * Valid state transitions for the checkout flow
 */
const validTransitions: Record<CheckoutFlowState, CheckoutFlowState[]> = {
  product_selection: ["checkout"],
  checkout: ["processing"],
  processing: ["confirmation"],
  confirmation: ["product_selection"],
};

/**
 * Check if a state transition is valid
 */
function isValidTransition(
  from: CheckoutFlowState,
  to: CheckoutFlowState
): boolean {
  return validTransitions[from].includes(to);
}

/**
 * Reducer for checkout flow state machine
 */
function checkoutFlowReducer(
  context: CheckoutFlowContext,
  action: CheckoutFlowAction
): CheckoutFlowContext {
  switch (action.type) {
    case "SELECT_PRODUCT": {
      if (!isValidTransition(context.state, "checkout")) {
        return context;
      }
      return {
        ...context,
        state: "checkout",
        selectedProduct: action.product,
        quantity: 1,
        selectedShippingId: DEFAULT_SHIPPING_ID,
      };
    }

    case "UPDATE_QUANTITY": {
      if (context.state !== "checkout") {
        return context;
      }
      const quantity = Math.max(1, Math.min(10, action.quantity));
      return {
        ...context,
        quantity,
      };
    }

    case "SELECT_SHIPPING": {
      if (context.state !== "checkout") {
        return context;
      }
      return {
        ...context,
        selectedShippingId: action.shippingId,
      };
    }

    case "SUBMIT_PAYMENT": {
      if (!isValidTransition(context.state, "processing")) {
        return context;
      }
      return {
        ...context,
        state: "processing",
      };
    }

    case "PAYMENT_COMPLETE": {
      if (!isValidTransition(context.state, "confirmation")) {
        return context;
      }
      return {
        ...context,
        state: "confirmation",
        orderId: action.orderId,
      };
    }

    case "RESET": {
      if (!isValidTransition(context.state, "product_selection")) {
        return context;
      }
      return initialContext;
    }

    default:
      return context;
  }
}

/**
 * Hook for managing checkout flow state machine
 */
export function useCheckoutFlow() {
  const [context, dispatch] = useReducer(checkoutFlowReducer, initialContext);

  const selectProduct = useCallback((product: Product) => {
    dispatch({ type: "SELECT_PRODUCT", product });
  }, []);

  const updateQuantity = useCallback((quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", quantity });
  }, []);

  const selectShipping = useCallback((shippingId: string) => {
    dispatch({ type: "SELECT_SHIPPING", shippingId });
  }, []);

  const submitPayment = useCallback(() => {
    dispatch({ type: "SUBMIT_PAYMENT" });
  }, []);

  const completePayment = useCallback((orderId: string) => {
    dispatch({ type: "PAYMENT_COMPLETE", orderId });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    context,
    dispatch,
    selectProduct,
    updateQuantity,
    selectShipping,
    submitPayment,
    completePayment,
    reset,
  };
}
