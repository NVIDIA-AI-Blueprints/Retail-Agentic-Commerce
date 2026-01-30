import { useState, useCallback, useEffect } from "react";
import { X, CreditCard, MapPin, Lock } from "lucide-react";
import { formatPrice } from "@/types";

interface PaymentSheetProps {
  isOpen: boolean;
  isProcessing: boolean;
  total: number;
  onClose: () => void;
  onPay: () => void;
}

/**
 * PaymentSheet Component
 *
 * A slide-up sheet for collecting payment and shipping information.
 * Uses placeholder fields for demo purposes.
 * The actual payment is processed via ACP when "Pay Now" is clicked.
 */
export function PaymentSheet({
  isOpen,
  isProcessing,
  total,
  onClose,
  onPay,
}: PaymentSheetProps) {
  // Form state (pre-filled with demo data)
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    address: "123 AI Boulevard",
    city: "San Francisco",
    zipCode: "94102",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/28",
    cvc: "123",
  });

  // Animation state for smooth transitions
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle input changes
  const handleChange = useCallback(
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Format card number with spaces
      if (field === "cardNumber") {
        value = value
          .replace(/\D/g, "")
          .slice(0, 16)
          .replace(/(\d{4})/g, "$1 ")
          .trim();
      }

      // Format expiry as MM/YY
      if (field === "expiry") {
        value = value
          .replace(/\D/g, "")
          .slice(0, 4)
          .replace(/(\d{2})(\d{0,2})/, "$1/$2")
          .replace(/\/$/, "");
      }

      // Format CVC
      if (field === "cvc") {
        value = value.replace(/\D/g, "").slice(0, 4);
      }

      // Format zip code
      if (field === "zipCode") {
        value = value.replace(/\D/g, "").slice(0, 5);
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onPay();
    },
    [onPay]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isProcessing) {
        onClose();
      }
    },
    [onClose, isProcessing]
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, isProcessing, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300 ${
        isAnimating ? "bg-black/50" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-sheet-title"
    >
      <div
        className={`w-full max-w-lg transform rounded-t-3xl bg-surface shadow-2xl transition-transform duration-300 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default px-5 py-4">
          <h2 id="payment-sheet-title" className="text-lg font-semibold text-text">
            Payment
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text disabled:opacity-50"
            aria-label="Close payment sheet"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {/* Shipping Address Section */}
          <section className="mb-5">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-text-tertiary" strokeWidth={2} />
              <h3 className="text-sm font-medium text-text">Shipping Address</h3>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange("fullName")}
                className="w-full rounded-xl border border-default bg-surface-elevated px-4 py-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
                disabled={isProcessing}
              />
              <input
                type="text"
                placeholder="Street Address"
                value={formData.address}
                onChange={handleChange("address")}
                className="w-full rounded-xl border border-default bg-surface-elevated px-4 py-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
                disabled={isProcessing}
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange("city")}
                  className="flex-1 rounded-xl border border-default bg-surface-elevated px-4 py-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isProcessing}
                />
                <input
                  type="text"
                  placeholder="ZIP"
                  value={formData.zipCode}
                  onChange={handleChange("zipCode")}
                  className="w-24 rounded-xl border border-default bg-surface-elevated px-4 py-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>
          </section>

          {/* Card Information Section */}
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-text-tertiary" strokeWidth={2} />
              <h3 className="text-sm font-medium text-text">Card Information</h3>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={handleChange("cardNumber")}
                  className="w-full rounded-xl border border-default bg-surface-elevated px-4 py-3 pr-12 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isProcessing}
                  inputMode="numeric"
                  autoComplete="cc-number"
                />
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={formData.expiry}
                  onChange={handleChange("expiry")}
                  className="flex-1 rounded-xl border border-default bg-surface-elevated px-4 py-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isProcessing}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  value={formData.cvc}
                  onChange={handleChange("cvc")}
                  className="w-24 rounded-xl border border-default bg-surface-elevated px-4 py-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isProcessing}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </div>
            </div>
          </section>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 text-base font-semibold transition-all ${
              isProcessing
                ? "cursor-not-allowed bg-surface-secondary text-text-disabled"
                : "bg-accent text-white shadow-lg hover:bg-accent-hover active:scale-[0.98]"
            }`}
          >
            {isProcessing ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" strokeWidth={2} />
                <span>Pay {formatPrice(total)}</span>
              </>
            )}
          </button>

          {/* Security note */}
          <p className="mt-3 text-center text-xs text-text-tertiary">
            Secured by Agentic Commerce Protocol
          </p>
        </form>
      </div>
    </div>
  );
}
