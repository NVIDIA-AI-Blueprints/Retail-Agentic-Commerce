import type { ACPSessionResponse, CartItem } from "@/types";

export const DEFAULT_FULFILLMENT_OPTION_ID = "shipping_standard";
export const DEFAULT_FULFILLMENT_ADDRESS = {
  name: "John Doe",
  line_one: "123 AI Boulevard",
  city: "San Francisco",
  state: "CA",
  postal_code: "94102",
  country: "US",
} as const;

type CallToolFn = <T = Record<string, unknown>>(
  name: string,
  args: Record<string, unknown>
) => Promise<T>;

interface SyncCheckoutSessionParams {
  items: CartItem[];
  currentSessionId: string | null;
  callTool: CallToolFn;
}

function getPreferredFulfillmentOptionId(
  sessionData: ACPSessionResponse
): string | null {
  if (sessionData.fulfillment_option_id) {
    return sessionData.fulfillment_option_id;
  }

  const availableOptionIds =
    sessionData.fulfillment_options?.map((option) => option.id) ?? [];

  if (availableOptionIds.includes(DEFAULT_FULFILLMENT_OPTION_ID)) {
    return DEFAULT_FULFILLMENT_OPTION_ID;
  }

  return availableOptionIds[0] ?? null;
}

async function ensureFulfillmentSelection(
  callTool: CallToolFn,
  sessionData: ACPSessionResponse,
  fallbackSessionId: string
): Promise<ACPSessionResponse> {
  const preferredFulfillmentOptionId =
    getPreferredFulfillmentOptionId(sessionData);
  const sessionId = sessionData.id || fallbackSessionId;

  if (
    !sessionId ||
    !preferredFulfillmentOptionId ||
    sessionData.fulfillment_option_id === preferredFulfillmentOptionId
  ) {
    return sessionData;
  }

  return callTool<ACPSessionResponse>("update-checkout-session", {
    sessionId,
    fulfillmentOptionId: preferredFulfillmentOptionId,
    fulfillmentAddress: DEFAULT_FULFILLMENT_ADDRESS,
  });
}

export async function syncCheckoutSessionWithDefaultShipping({
  items,
  currentSessionId,
  callTool,
}: SyncCheckoutSessionParams): Promise<{
  sessionId: string | null;
  sessionData: ACPSessionResponse | null;
}> {
  if (items.length === 0) {
    return { sessionId: null, sessionData: null };
  }

  const acpItems = items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  try {
    if (currentSessionId) {
      try {
        const updatedSession = await callTool<ACPSessionResponse>(
          "update-checkout-session",
          {
            sessionId: currentSessionId,
            items: acpItems,
            fulfillmentAddress: DEFAULT_FULFILLMENT_ADDRESS,
          }
        );
        const selectedSession = await ensureFulfillmentSelection(
          callTool,
          updatedSession,
          currentSessionId
        );
        return {
          sessionId: selectedSession.id || currentSessionId,
          sessionData: selectedSession,
        };
      } catch {
        // Fall through to create a fresh session.
      }
    }

    const createdSession = await callTool<ACPSessionResponse>(
      "create-checkout-session",
      {
        items: acpItems,
        buyer: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
        },
        fulfillmentAddress: DEFAULT_FULFILLMENT_ADDRESS,
      }
    );
    const sessionId = createdSession.id ?? currentSessionId;
    const selectedSession = await ensureFulfillmentSelection(
      callTool,
      createdSession,
      sessionId ?? ""
    );

    return {
      sessionId: selectedSession.id ?? sessionId ?? null,
      sessionData: selectedSession,
    };
  } catch (error) {
    console.warn("[Widget] Failed to sync ACP session:", error);
    return { sessionId: currentSessionId, sessionData: null };
  }
}
