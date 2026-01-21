import type { Product, ChatMessage, ACPRequest } from "@/types";

/**
 * Mock product data - 3 casual t-shirts
 */
export const mockProducts: Product[] = [
  {
    id: "prod_1",
    sku: "TS-001",
    name: "Deluxe Shirt",
    description: "Premium quality cotton t-shirt with a comfortable fit",
    basePrice: 2600,
    stockCount: 100,
    minMargin: 0.15,
    imageUrl: "",
    variant: "Black",
    size: "Large",
  },
  {
    id: "prod_2",
    sku: "TS-002",
    name: "Heavyweight",
    description: "Durable heavyweight cotton for everyday comfort",
    basePrice: 2600,
    stockCount: 50,
    minMargin: 0.12,
    imageUrl: "",
    variant: "Natural",
    size: "Large",
  },
  {
    id: "prod_3",
    sku: "TS-003",
    name: "Vintage Tee",
    description: "Classic vintage style with modern comfort",
    basePrice: 2600,
    stockCount: 200,
    minMargin: 0.18,
    imageUrl: "",
    variant: "Grey",
    size: "Large",
  },
];

/**
 * Mock checkout session (legacy format for UI compatibility)
 */
export const mockCheckoutSession = {
  id: "checkout_kt6dhmz0",
  status: "ready_for_payment" as const,
  currency: "usd",
  lineItems: [
    {
      id: "li_sku_deluxe_shirt",
      item: {
        id: "sku_deluxe_shirt",
        name: "Deluxe Shirt",
        imageUrl: "https://placehold.co/400x400/1a1a1a/76b900?text=Deluxe+Shirt",
      },
      quantity: 1,
      baseAmount: 2600,
      discount: 0,
      subtotal: 2600,
      tax: 0,
      total: 2600,
    },
  ],
  subtotal: 2600,
  discount: 0,
  tax: 0,
  shipping: 500,
  total: 3100,
  fulfillmentOptions: [
    {
      id: "shipping_standard",
      name: "Standard",
      description: "5-7 business days",
      price: 500,
      estimatedDelivery: "5-7 business days",
    },
    {
      id: "shipping_express",
      name: "Express",
      description: "2-3 business days",
      price: 1200,
      estimatedDelivery: "2-3 business days",
    },
  ],
  selectedFulfillmentOptionId: "shipping_standard",
  paymentProvider: {
    provider: "psp",
    supportedPaymentMethods: ["card"],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock chat messages for demo
 */
export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg_1",
    role: "user",
    content: "Find some casual t shirts",
    timestamp: new Date().toISOString(),
  },
];

/**
 * Mock ACP requests for the business panel
 */
export const mockACPRequests: ACPRequest[] = [
  {
    id: "req_1",
    method: "POST",
    endpoint: "/checkout_sessions",
    timestamp: new Date().toISOString(),
    status: 201,
    payload: {
      items: [{ sku: "sku_deluxe_shirt", quantity: 1 }],
    },
    response: mockCheckoutSession,
  },
];
