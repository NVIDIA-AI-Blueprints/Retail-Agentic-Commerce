"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, Text, Button, Stack, Flex, Divider } from "@kui/foundations-react-external";
import { CreditCard, ChevronLeft } from "@/components/icons";
import type { PaymentFormData, BillingAddressFormData } from "@/types";
import {
  DEFAULT_PAYMENT_FORM,
  DEFAULT_BILLING_ADDRESS,
} from "@/types";

/**
 * Styled input component using NVIDIA KUI native classes
 * Uses nv-input and nv-text-input classes for proper styling
 */
type StyledInputProps = React.InputHTMLAttributes<HTMLInputElement>;

function StyledInput({ style, ...props }: StyledInputProps) {
  return (
    <div 
      data-testid="nv-text-input-root" 
      className="nv-input nv-text-input-root"
      style={style}
    >
      <input
        {...props}
        data-testid="nv-text-input-element"
        className="nv-text-input-element"
      />
    </div>
  );
}

interface PaymentShippingFormProps {
  onSubmit: (paymentInfo: PaymentFormData, billingAddress: BillingAddressFormData) => void;
  onBack?: () => void;
  isProcessing?: boolean;
  initialPaymentInfo?: PaymentFormData | null;
  initialBillingAddress?: BillingAddressFormData | null;
}

/**
 * Format card number with spaces every 4 digits
 */
function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleaned;
}

/**
 * Format expiration date as MM/YY
 */
function formatExpirationDate(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
}

/**
 * CVV security icon using KUI theme colors
 */
function SecurityIcon() {
  return (
    <div className="w-6 h-4 border border-base rounded text-[8px] flex items-center justify-center text-subtle">
      123
    </div>
  );
}

/**
 * Payment and Shipping Information Form
 * Collects card details and billing address before checkout
 */
export function PaymentShippingForm({
  onSubmit,
  onBack,
  isProcessing = false,
  initialPaymentInfo,
  initialBillingAddress,
}: PaymentShippingFormProps) {
  // Form state with defaults
  const [cardNumber, setCardNumber] = useState(
    initialPaymentInfo?.cardNumber
      ? formatCardNumber(initialPaymentInfo.cardNumber)
      : formatCardNumber(DEFAULT_PAYMENT_FORM.cardNumber)
  );
  const [expirationDate, setExpirationDate] = useState(
    initialPaymentInfo?.expirationDate ?? DEFAULT_PAYMENT_FORM.expirationDate
  );
  const [securityCode, setSecurityCode] = useState(
    initialPaymentInfo?.securityCode ?? DEFAULT_PAYMENT_FORM.securityCode
  );
  const [fullName, setFullName] = useState(
    initialBillingAddress?.fullName ?? DEFAULT_BILLING_ADDRESS.fullName
  );
  const [address, setAddress] = useState(
    initialBillingAddress?.address ?? DEFAULT_BILLING_ADDRESS.address
  );

  // Form validation
  const isValid = useMemo(() => {
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    const cleanExpiration = expirationDate.replace(/\//g, "");
    return (
      cleanCardNumber.length === 16 &&
      cleanExpiration.length === 4 &&
      securityCode.length >= 3 &&
      fullName.trim().length > 0 &&
      address.trim().length > 0
    );
  }, [cardNumber, expirationDate, securityCode, fullName, address]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!isValid) return;

    const paymentInfo: PaymentFormData = {
      cardNumber: cardNumber.replace(/\s/g, ""),
      expirationDate,
      securityCode,
    };

    const billingAddress: BillingAddressFormData = {
      fullName,
      address,
    };

    onSubmit(paymentInfo, billingAddress);
  }, [isValid, cardNumber, expirationDate, securityCode, fullName, address, onSubmit]);

  return (
    <Card className="w-full max-w-md fade-in">
      <Stack gap="4">
        {/* Header */}
        <Flex align="center" gap="2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-surface-sunken rounded transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-secondary" />
            </button>
          )}
          <Text kind="label/bold/md">
            Add payment method
          </Text>
        </Flex>

        {/* Card Section */}
        <Stack gap="2">
          <Flex align="center" gap="2">
            <CreditCard className="w-4 h-4 text-secondary" />
            <Text kind="label/semibold/sm">
              Card
            </Text>
          </Flex>

          {/* Card Number */}
          <StyledInput
            type="text"
            value={cardNumber}
            onChange={(e) => {
              const formatted = formatCardNumber(e.target.value);
              setCardNumber(formatted);
            }}
            placeholder="Card number"
            disabled={isProcessing}
            aria-label="Card number"
            inputMode="numeric"
          />

          {/* Expiration and CVV */}
          <Flex gap="3">
            <StyledInput
              type="text"
              value={expirationDate}
              onChange={(e) => {
                const formatted = formatExpirationDate(e.target.value);
                setExpirationDate(formatted);
              }}
              placeholder="MM/YY"
              disabled={isProcessing}
              aria-label="Expiration date"
              inputMode="numeric"
              style={{ flex: 1 }}
            />
            <Flex align="center" gap="2" className="flex-1">
              <StyledInput
                type="text"
                value={securityCode}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setSecurityCode(cleaned);
                }}
                placeholder="CVV"
                disabled={isProcessing}
                aria-label="Security code"
                inputMode="numeric"
                style={{ flex: 1 }}
              />
              <SecurityIcon />
            </Flex>
          </Flex>
        </Stack>

        {/* Billing Address Section */}
        <Stack gap="2">
          <Text kind="label/semibold/sm">
            Billing address
          </Text>
          {/* Full Name */}
          <StyledInput
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            disabled={isProcessing}
            aria-label="Full name"
          />
          {/* Address */}
          <StyledInput
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            disabled={isProcessing}
            aria-label="Address"
          />
        </Stack>



        <Divider />

        {/* Pay Now Button */}
        <Button
          kind="primary"
          color="neutral"
          className="w-full"
          onClick={handleSubmit}
          disabled={!isValid || isProcessing}
          aria-label={isProcessing ? "Processing payment" : "Pay now"}
        >
          {isProcessing ? (
            <Flex align="center" justify="center" gap="2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </Flex>
          ) : (
            "Pay Now"
          )}
        </Button>
      </Stack>
    </Card>
  );
}
