import type { Product, ChatMessage, ACPRequest } from "@/types";

/**
 * Mock product data - aligned with database seed data in src/merchant/db/database.py
 */
export const mockProducts: Product[] = [
  {
    id: "prod_1",
    sku: "TS-001",
    name: "Classic Tee",
    description: "Premium quality cotton t-shirt with a comfortable fit",
    basePrice: 2500,
    stockCount: 100,
    minMargin: 0.15,
    imageUrl: "https://placehold.co/400x400/png?text=Classic+Tee",
    variant: "Black",
    size: "Large",
  },
  {
    id: "prod_2",
    sku: "TS-002",
    name: "V-Neck Tee",
    description: "Stylish v-neck design for a modern look",
    basePrice: 2800,
    stockCount: 50,
    minMargin: 0.12,
    imageUrl: "https://placehold.co/400x400/png?text=V-Neck+Tee",
    variant: "Natural",
    size: "Large",
  },
  {
    id: "prod_3",
    sku: "TS-003",
    name: "Graphic Tee",
    description: "Eye-catching graphic design with premium print",
    basePrice: 3200,
    stockCount: 200,
    minMargin: 0.18,
    imageUrl: "https://placehold.co/400x400/png?text=Graphic+Tee",
    variant: "Grey",
    size: "Large",
  },
];

/**
 * Mock checkout session (legacy format for UI compatibility)
 * Aligned with database seed data in src/merchant/db/database.py
 */
export const mockCheckoutSession = {
  id: "checkout_kt6dhmz0",
  status: "ready_for_payment" as const,
  currency: "usd",
  lineItems: [
    {
      id: "li_prod_1",
      item: {
        id: "prod_1",
        name: "Classic Tee",
        imageUrl: "https://placehold.co/400x400/png?text=Classic+Tee",
      },
      quantity: 1,
      baseAmount: 2500,
      discount: 0,
      subtotal: 2500,
      tax: 0,
      total: 2500,
    },
  ],
  subtotal: 2500,
  discount: 0,
  tax: 0,
  shipping: 500,
  total: 3000,
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
      items: [{ sku: "TS-001", quantity: 1 }],
    },
    response: mockCheckoutSession,
  },
];
