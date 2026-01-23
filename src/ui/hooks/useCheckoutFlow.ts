"use client";

import { useReducer, useCallback, useRef } from "react";
import type {
  CheckoutFlowState,
  CheckoutFlowContext,
  CheckoutFlowAction,
  Product,
  CheckoutSessionResponse,
  UpdateCheckoutRequest,
  PaymentFormData,
  BillingAddressFormData,
  SupportedLanguage,
} from "@/types";
import {
  createCheckoutSession,
  updateCheckoutSession,
  completeCheckout,
  delegatePayment,
  generatePostPurchaseMessage,
  postWebhookShippingUpdate,
} from "@/lib/api-client";
import { createAPIError } from "@/lib/errors";
import type { ACPEventType, ACPEventStatus } from "@/hooks/useACPLog";
import type {
  AgentType,
  AgentActivityStatus,
  PromotionInputSignals,
  PromotionDecision,
  PostPurchaseInputSignals,
  PostPurchaseDecision,
  LineItem,
  Product as ProductType,
} from "@/types";

const DEFAULT_SHIPPING_ID = "ship_standard";

/**
 * Truncate session ID for display (shows last 8 chars)
 */
function truncateId(id: string): string {
  if (id.length <= 12) return id;
  return `...${id.slice(-8)}`;
}

/**
 * Logger interface for ACP events
 */
export interface ACPLogger {
  logEvent: (
    type: ACPEventType,
    method: "POST" | "GET" | "PUT",
    endpoint: string,
    requestSummary?: string
  ) => string;
  completeEvent: (
    id: string,
    status: ACPEventStatus,
    responseSummary?: string,
    statusCode?: number
  ) => void;
  clear: () => void;
}

/**
 * Logger interface for agent activity events
 */
export interface AgentActivityLogger {
  addAgentEvent: (
    agentType: AgentType,
    inputSignals: PromotionInputSignals,
    decision: PromotionDecision | undefined,
    status: AgentActivityStatus
  ) => void;
  addPostPurchaseEvent: (
    inputSignals: PostPurchaseInputSignals,
    decision: PostPurchaseDecision | undefined,
    status: AgentActivityStatus,
    error?: string
  ) => void;
  clear: () => void;
}

/**
 * Extract promotion data from line items and log agent activity
 */
function logPromotionAgentActivity(
  lineItems: LineItem[],
  product: ProductType | null,
  agentLogger?: AgentActivityLogger
): void {
  if (!agentLogger || !product) return;

  for (const lineItem of lineItems) {
    // Build input signals from product data
    const inputSignals: PromotionInputSignals = {
      productId: product.id,
      productName: lineItem.name ?? product.name,
      stockCount: product.stockCount,
      basePrice: lineItem.base_amount,
      competitorPrice: null, // Not available from frontend
      inventoryPressure: product.stockCount > 50 ? "high" : "low",
      competitionPosition: "unknown",
    };

    // Check if we have promotion metadata
    if (lineItem.promotion) {
      const decision: PromotionDecision = {
        action: lineItem.promotion.action,
        discountAmount: lineItem.discount,
        reasonCodes: lineItem.promotion.reason_codes,
        reasoning: lineItem.promotion.reasoning,
      };

      // Infer competition position from reason codes
      if (lineItem.promotion.reason_codes.includes("ABOVE_MARKET")) {
        inputSignals.competitionPosition = "above_market";
      } else if (lineItem.promotion.reason_codes.includes("BELOW_MARKET")) {
        inputSignals.competitionPosition = "below_market";
      } else if (lineItem.promotion.reason_codes.includes("AT_MARKET")) {
        inputSignals.competitionPosition = "at_market";
      }

      agentLogger.addAgentEvent("promotion", inputSignals, decision, "success");
    } else if (lineItem.discount > 0) {
      // Discount exists but no metadata - agent ran but metadata not exposed
      const decision: PromotionDecision = {
        action: "DISCOUNT",
        discountAmount: lineItem.discount,
        reasonCodes: [],
        reasoning: "Promotion applied (details not available)",
      };
      agentLogger.addAgentEvent("promotion", inputSignals, decision, "success");
    } else {
      // No discount - either no promo or agent skipped
      const decision: PromotionDecision = {
        action: "NO_PROMO",
        discountAmount: 0,
        reasonCodes: [],
        reasoning: "No promotion applied",
      };
      agentLogger.addAgentEvent("promotion", inputSignals, decision, "success");
    }
  }
}

// Default buyer info for demo purposes
const DEFAULT_BUYER = {
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone_number: "+15551234567",
};

// Default fulfillment address for demo purposes
const DEFAULT_FULFILLMENT_ADDRESS = {
  name: "John Doe",
  line_one: "123 Main St",
  city: "San Francisco",
  state: "CA",
  country: "US",
  postal_code: "94102",
};

const initialContext: CheckoutFlowContext = {
  state: "product_selection",
  selectedProduct: null,
  quantity: 1,
  selectedShippingId: DEFAULT_SHIPPING_ID,
  orderId: null,
  sessionId: null,
  session: null,
  vaultToken: null,
  isLoading: false,
  error: null,
  checkoutStep: "summary",
  paymentInfo: null,
  billingAddress: null,
};

/**
 * Valid state transitions for the checkout flow
 */
const validTransitions: Record<CheckoutFlowState, CheckoutFlowState[]> = {
  product_selection: ["checkout", "error"],
  checkout: ["processing", "error", "product_selection"],
  processing: ["confirmation", "error", "checkout"],
  confirmation: ["product_selection"],
  error: ["product_selection", "checkout"],
};

/**
 * Check if a state transition is valid
 */
function isValidTransition(from: CheckoutFlowState, to: CheckoutFlowState): boolean {
  return validTransitions[from].includes(to);
}

/**
 * Get total amount from session totals
 */
function getTotalFromSession(session: CheckoutSessionResponse): number {
  const totalItem = session.totals.find((t) => t.type === "total");
  return totalItem?.amount ?? 0;
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
      return {
        ...context,
        selectedProduct: action.product,
        quantity: 1,
        selectedShippingId: DEFAULT_SHIPPING_ID,
        isLoading: true,
        error: null,
      };
    }

    case "SESSION_CREATED": {
      if (!isValidTransition(context.state, "checkout")) {
        return context;
      }
      // Find first shipping option ID
      const firstShippingId =
        action.session.fulfillment_options.find((o) => o.type === "shipping")?.id ??
        DEFAULT_SHIPPING_ID;
      return {
        ...context,
        state: "checkout",
        sessionId: action.session.id,
        session: action.session,
        selectedShippingId: firstShippingId,
        isLoading: false,
        error: null,
      };
    }

    case "SESSION_UPDATED": {
      return {
        ...context,
        session: action.session,
        isLoading: false,
        error: null,
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
        isLoading: true,
        error: null,
      };
    }

    case "PAYMENT_DELEGATED": {
      return {
        ...context,
        vaultToken: action.vaultToken,
      };
    }

    case "PAYMENT_COMPLETE": {
      if (!isValidTransition(context.state, "confirmation")) {
        return context;
      }
      return {
        ...context,
        state: "confirmation",
        session: action.session,
        orderId: action.session.order?.id ?? null,
        isLoading: false,
        error: null,
      };
    }

    case "AUTHENTICATION_REQUIRED": {
      // Handle 3DS authentication required
      return {
        ...context,
        session: action.session,
        isLoading: false,
        // Keep in processing state, UI will handle 3DS
      };
    }

    case "SET_LOADING": {
      return {
        ...context,
        isLoading: action.isLoading,
      };
    }

    case "SET_ERROR": {
      return {
        ...context,
        state: "error",
        isLoading: false,
        error: action.error,
      };
    }

    case "CLEAR_ERROR": {
      return {
        ...context,
        error: null,
        state: context.session ? "checkout" : "product_selection",
      };
    }

    case "RESET": {
      return initialContext;
    }

    case "SET_PAYMENT_INFO": {
      return {
        ...context,
        paymentInfo: action.paymentInfo,
      };
    }

    case "SET_BILLING_ADDRESS": {
      return {
        ...context,
        billingAddress: action.billingAddress,
      };
    }

    case "PROCEED_TO_PAYMENT": {
      if (context.state !== "checkout") {
        return context;
      }
      return {
        ...context,
        checkoutStep: "payment",
      };
    }

    case "BACK_TO_SUMMARY": {
      if (context.state !== "checkout") {
        return context;
      }
      return {
        ...context,
        checkoutStep: "summary",
      };
    }

    default:
      return context;
  }
}

/**
 * Hook for managing checkout flow state machine with real API calls
 */
export function useCheckoutFlow(logger?: ACPLogger, agentLogger?: AgentActivityLogger) {
  const [context, dispatch] = useReducer(checkoutFlowReducer, initialContext);

  // Use refs for loggers to avoid recreating callbacks when context changes
  const loggerRef = useRef(logger);
  const agentLoggerRef = useRef(agentLogger);
  loggerRef.current = logger;
  agentLoggerRef.current = agentLogger;

  /**
   * Select a product and create a checkout session
   */
  const selectProduct = useCallback(async (product: Product) => {
    dispatch({ type: "SELECT_PRODUCT", product });

    const eventId = loggerRef.current?.logEvent(
      "session_create",
      "POST",
      "/checkout_sessions",
      `Create session for ${product.name}`
    );

    try {
      const session = await createCheckoutSession({
        items: [{ id: product.id, quantity: 1 }],
        buyer: DEFAULT_BUYER,
        fulfillment_address: DEFAULT_FULFILLMENT_ADDRESS,
      });

      if (eventId) {
        loggerRef.current?.completeEvent(
          eventId,
          "success",
          `Session ${session.id.slice(0, 8)}... created`,
          201
        );
      }

      // Log promotion agent activity from line items
      logPromotionAgentActivity(session.line_items, product, agentLoggerRef.current);

      dispatch({ type: "SESSION_CREATED", session });

      // Auto-select first shipping option if available
      const firstOption = session.fulfillment_options[0];
      if (firstOption) {
        const updateEventId = loggerRef.current?.logEvent(
          "session_update",
          "POST",
          `/checkout_sessions/${truncateId(session.id)}`,
          `Select shipping: ${firstOption.title}`
        );

        try {
          const updatedSession = await updateCheckoutSession(session.id, {
            fulfillment_option_id: firstOption.id,
          });

          if (updateEventId) {
            loggerRef.current?.completeEvent(
              updateEventId,
              "success",
              `Status: ${updatedSession.status}`,
              200
            );
          }

          dispatch({ type: "SESSION_UPDATED", session: updatedSession });
        } catch (error) {
          if (updateEventId) {
            loggerRef.current?.completeEvent(updateEventId, "error", "Update failed", 400);
          }
          dispatch({ type: "SET_ERROR", error: createAPIError(error) });
        }
      }
    } catch (error) {
      if (eventId) {
        loggerRef.current?.completeEvent(eventId, "error", "Session creation failed", 400);
      }
      dispatch({ type: "SET_ERROR", error: createAPIError(error) });
    }
  }, []);

  /**
   * Update quantity and refresh session
   */
  const updateQuantity = useCallback(
    async (quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", quantity });

      if (!context.sessionId || !context.selectedProduct) {
        return;
      }

      dispatch({ type: "SET_LOADING", isLoading: true });

      const eventId = loggerRef.current?.logEvent(
        "session_update",
        "POST",
        `/checkout_sessions/${truncateId(context.sessionId)}`,
        `Update quantity: ${quantity}`
      );

      try {
        const request: UpdateCheckoutRequest = {
          items: [{ id: context.selectedProduct.id, quantity }],
        };

        const session = await updateCheckoutSession(context.sessionId, request);

        if (eventId) {
          const total = session.totals.find((t) => t.type === "total")?.amount ?? 0;
          loggerRef.current?.completeEvent(
            eventId,
            "success",
            `Total: $${(total / 100).toFixed(2)}`,
            200
          );
        }

        dispatch({ type: "SESSION_UPDATED", session });
      } catch (error) {
        if (eventId) {
          loggerRef.current?.completeEvent(eventId, "error", "Update failed", 400);
        }
        dispatch({ type: "SET_ERROR", error: createAPIError(error) });
      }
    },
    [context.sessionId, context.selectedProduct]
  );

  /**
   * Select shipping option and update session
   */
  const selectShipping = useCallback(
    async (shippingId: string) => {
      dispatch({ type: "SELECT_SHIPPING", shippingId });

      if (!context.sessionId || !context.selectedProduct) {
        return;
      }

      dispatch({ type: "SET_LOADING", isLoading: true });

      // Find shipping option name for logging
      const shippingName =
        context.session?.fulfillment_options.find((o) => o.id === shippingId)?.title ?? shippingId;

      const eventId = loggerRef.current?.logEvent(
        "session_update",
        "POST",
        `/checkout_sessions/${truncateId(context.sessionId)}`,
        `Select: ${shippingName}`
      );

      try {
        const session = await updateCheckoutSession(context.sessionId, {
          fulfillment_option_id: shippingId,
        });

        if (eventId) {
          const total = session.totals.find((t) => t.type === "total")?.amount ?? 0;
          loggerRef.current?.completeEvent(
            eventId,
            "success",
            `Total: $${(total / 100).toFixed(2)}`,
            200
          );
        }

        dispatch({ type: "SESSION_UPDATED", session });
      } catch (error) {
        if (eventId) {
          loggerRef.current?.completeEvent(eventId, "error", "Update failed", 400);
        }
        dispatch({ type: "SET_ERROR", error: createAPIError(error) });
      }
    },
    [context.sessionId, context.selectedProduct, context.session]
  );

  /**
   * Trigger Post-Purchase Agent to generate shipping confirmation message
   * Then POST the message to the client's webhook endpoint
   *
   * @param orderId - The order ID
   * @param productName - The product name for the message
   * @param sessionId - The checkout session ID
   * @param customerName - Customer's first name for personalization
   * @param language - Preferred language for the message (en, es, fr)
   */
  const triggerPostPurchaseAgent = useCallback(
    async (
      orderId: string,
      productName: string,
      sessionId: string,
      customerName: string = DEFAULT_BUYER.first_name,
      language: SupportedLanguage = "en"
    ) => {
      const inputSignals: PostPurchaseInputSignals = {
        orderId,
        customerName,
        productName,
        status: "order_confirmed",
        tone: "friendly",
        language,
      };

      try {
        // Step 1: Generate the message using the Post-Purchase Agent (LLM)
        const response = await generatePostPurchaseMessage({
          brand_persona: {
            company_name: "NVShop",
            tone: "friendly",
            preferred_language: language,
          },
          order: {
            order_id: orderId,
            customer_name: customerName,
            product_name: productName,
            tracking_url: null,
            estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          status: "order_confirmed",
        });

        const decision: PostPurchaseDecision = {
          subject: response.subject,
          message: response.message,
          status: response.status,
          language: response.language,
        };

        // Log the agent decision
        agentLoggerRef.current?.addPostPurchaseEvent(inputSignals, decision, "success");

        // Step 2: POST the generated message to the client's webhook
        const webhookEventId = loggerRef.current?.logEvent(
          "webhook_post",
          "POST",
          "/api/webhooks/acp",
          `Shipping update: ${response.status}`
        );

        try {
          const webhookResponse = await postWebhookShippingUpdate({
            type: "shipping_update",
            data: {
              type: "shipping_update",
              checkout_session_id: sessionId,
              order_id: orderId,
              status: "order_confirmed",
              language: response.language,
              subject: response.subject,
              message: response.message,
            },
          });

          if (webhookEventId) {
            loggerRef.current?.completeEvent(
              webhookEventId,
              "success",
              `Event: ${webhookResponse.event_id.slice(0, 12)}...`,
              200
            );
          }
        } catch (webhookError) {
          console.error("[PostPurchase] Webhook error:", webhookError);
          if (webhookEventId) {
            loggerRef.current?.completeEvent(
              webhookEventId,
              "error",
              "Webhook delivery failed",
              500
            );
          }
        }
      } catch (error) {
        console.error("[PostPurchase] Agent error:", error);
        // Log error but don't fail the checkout
        agentLoggerRef.current?.addPostPurchaseEvent(
          inputSignals,
          undefined,
          "error",
          "Failed to generate confirmation message"
        );
      }
    },
    []
  );

  /**
   * Submit payment - delegates to PSP and completes checkout
   * Accepts optional payment info and billing address to support immediate submission
   * without waiting for context state to update
   */
  const submitPayment = useCallback(
    async (paymentInfoParam?: PaymentFormData, billingAddressParam?: BillingAddressFormData) => {
      // Use provided params or fall back to context
      const paymentInfo = paymentInfoParam ?? context.paymentInfo;
      const billingAddress = billingAddressParam ?? context.billingAddress;

      if (!context.sessionId || !context.session || !paymentInfo || !billingAddress) {
        return;
      }

      dispatch({ type: "SUBMIT_PAYMENT" });

      // Step 1: Get vault token from PSP
      const totalAmount = getTotalFromSession(context.session);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      // Parse payment info from form
      const cardNumber = paymentInfo.cardNumber;
      const expirationParts = paymentInfo.expirationDate.split("/");
      const expMonth = expirationParts[0] ?? "12";
      const expYear = expirationParts[1] ?? "28";
      const fullExpYear = expYear.length === 2 ? `20${expYear}` : expYear;
      const last4 = cardNumber.slice(-4);

      // Build billing address from form
      // Parse the address string to extract components
      const addressParts = billingAddress.address.split(",").map((s) => s.trim());
      const billingAddressData = {
        name: billingAddress.fullName,
        line_one: addressParts[0] || "123 Main St",
        city: addressParts[1] || "San Francisco",
        state: addressParts[2]?.split(" ")[0] || "CA",
        country: "US",
        postal_code: addressParts[2]?.split(" ")[1] || "94102",
      };

      const delegateEventId = loggerRef.current?.logEvent(
        "delegate_payment",
        "POST",
        "/agentic_commerce/delegate_payment",
        `Delegate $${(totalAmount / 100).toFixed(2)}`
      );

      try {
        const delegateResponse = await delegatePayment({
          payment_method: {
            type: "card",
            card_number_type: "fpan",
            virtual: false,
            number: cardNumber,
            exp_month: expMonth,
            exp_year: fullExpYear,
            display_card_funding_type: "credit",
            display_last4: last4,
          },
          allowance: {
            reason: "one_time",
            max_amount: totalAmount,
            currency: context.session.currency,
            checkout_session_id: context.sessionId,
            merchant_id: "merchant_nvshop",
            expires_at: expiresAt,
          },
          risk_signals: [
            {
              type: "card_testing",
              action: "authorized",
            },
          ],
          billing_address: billingAddressData,
        });

        if (delegateEventId) {
          loggerRef.current?.completeEvent(
            delegateEventId,
            "success",
            `Vault token: ${delegateResponse.id.slice(0, 10)}...`,
            201
          );
        }

        dispatch({ type: "PAYMENT_DELEGATED", vaultToken: delegateResponse.id });

        // Step 2: Complete checkout with vault token
        const completeEventId = loggerRef.current?.logEvent(
          "session_complete",
          "POST",
          `/checkout_sessions/${truncateId(context.sessionId)}/complete`,
          "Process payment"
        );

        const completedSession = await completeCheckout(context.sessionId, {
          payment_data: {
            token: delegateResponse.id,
            provider: "stripe",
            billing_address: billingAddressData,
          },
        });

        // Check if 3DS is required
        if (completedSession.status === "authentication_required") {
          if (completeEventId) {
            loggerRef.current?.completeEvent(completeEventId, "success", "3DS required", 200);
          }
          dispatch({ type: "AUTHENTICATION_REQUIRED", session: completedSession });
          // For now, we'll simulate 3DS completion after a delay
          // In production, this would redirect to the 3DS URL
          setTimeout(async () => {
            const authEventId = loggerRef.current?.logEvent(
              "session_complete",
              "POST",
              `/checkout_sessions/${truncateId(context.sessionId!)}/complete`,
              "3DS authentication"
            );
            try {
              const finalSession = await completeCheckout(context.sessionId!, {
                payment_data: {
                  token: delegateResponse.id,
                  provider: "stripe",
                },
                authentication_result: {
                  outcome: "authenticated",
                  outcome_details: {
                    three_ds_cryptogram: "AAIBBYNoEQAAAAAAg4PyBhdAEQs=",
                    electronic_commerce_indicator: "05",
                    transaction_id: crypto.randomUUID(),
                    version: "2.2.0",
                  },
                },
              });
              if (authEventId) {
                loggerRef.current?.completeEvent(
                  authEventId,
                  "success",
                  `Order: ${finalSession.order?.id.slice(0, 10)}...`,
                  200
                );
              }
              dispatch({ type: "PAYMENT_COMPLETE", session: finalSession });

              // Trigger Post-Purchase Agent after successful payment
              // Extract first name from billing address (use full name if no space)
              const customerFirstName =
                billingAddress?.fullName?.split(" ")[0] ?? DEFAULT_BUYER.first_name;
              if (finalSession.order?.id && context.selectedProduct && context.sessionId) {
                triggerPostPurchaseAgent(
                  finalSession.order.id,
                  context.selectedProduct.name,
                  context.sessionId,
                  customerFirstName,
                  billingAddress?.preferredLanguage ?? "en"
                );
              }
            } catch (error) {
              if (authEventId) {
                loggerRef.current?.completeEvent(authEventId, "error", "Payment failed", 400);
              }
              dispatch({ type: "SET_ERROR", error: createAPIError(error) });
            }
          }, 2000);
        } else if (completedSession.status === "completed") {
          if (completeEventId) {
            loggerRef.current?.completeEvent(
              completeEventId,
              "success",
              `Order: ${completedSession.order?.id.slice(0, 10)}...`,
              200
            );
          }
          dispatch({ type: "PAYMENT_COMPLETE", session: completedSession });

          // Trigger Post-Purchase Agent after successful payment
          // Extract first name from billing address (use full name if no space)
          const customerName = billingAddress?.fullName?.split(" ")[0] ?? DEFAULT_BUYER.first_name;
          if (completedSession.order?.id && context.selectedProduct && context.sessionId) {
            triggerPostPurchaseAgent(
              completedSession.order.id,
              context.selectedProduct.name,
              context.sessionId,
              customerName,
              billingAddress?.preferredLanguage ?? "en"
            );
          }
        } else {
          if (completeEventId) {
            loggerRef.current?.completeEvent(
              completeEventId,
              "success",
              `Status: ${completedSession.status}`,
              200
            );
          }
          // Handle other statuses
          dispatch({ type: "SESSION_UPDATED", session: completedSession });
        }
      } catch (error) {
        if (delegateEventId) {
          loggerRef.current?.completeEvent(delegateEventId, "error", "Payment failed", 400);
        }
        dispatch({ type: "SET_ERROR", error: createAPIError(error) });
      }
    },
    [
      context.sessionId,
      context.session,
      context.selectedProduct,
      context.paymentInfo,
      context.billingAddress,
      triggerPostPurchaseAgent,
    ]
  );

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    loggerRef.current?.clear();
    agentLoggerRef.current?.clear();
    dispatch({ type: "RESET" });
  }, []);

  /**
   * Clear error and return to appropriate state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  /**
   * Set payment info from form
   */
  const setPaymentInfo = useCallback((paymentInfo: PaymentFormData) => {
    dispatch({ type: "SET_PAYMENT_INFO", paymentInfo });
  }, []);

  /**
   * Set billing address from form
   */
  const setBillingAddress = useCallback((billingAddress: BillingAddressFormData) => {
    dispatch({ type: "SET_BILLING_ADDRESS", billingAddress });
  }, []);

  /**
   * Proceed from summary to payment form
   */
  const proceedToPayment = useCallback(() => {
    dispatch({ type: "PROCEED_TO_PAYMENT" });
  }, []);

  /**
   * Go back from payment form to summary
   */
  const backToSummary = useCallback(() => {
    dispatch({ type: "BACK_TO_SUMMARY" });
  }, []);

  return {
    context,
    dispatch,
    selectProduct,
    updateQuantity,
    selectShipping,
    submitPayment,
    reset,
    clearError,
    setPaymentInfo,
    setBillingAddress,
    proceedToPayment,
    backToSummary,
  };
}
