import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentShippingForm } from "./PaymentShippingForm";
import type { PaymentFormData, BillingAddressFormData } from "@/types";

describe("PaymentShippingForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the form header", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      expect(screen.getByText("Add payment method")).toBeInTheDocument();
    });

    it("renders the card section label", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      expect(screen.getByText("Card")).toBeInTheDocument();
    });

    it("renders the billing address section label", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      expect(screen.getByText("Billing address")).toBeInTheDocument();
    });

    it("renders the pay now button", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
    });

    it("renders back button when onBack is provided", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
    });

    it("does not render back button when onBack is not provided", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      expect(screen.queryByRole("button", { name: /go back/i })).not.toBeInTheDocument();
    });
  });

  describe("default values", () => {
    it("renders with default card number", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const cardInput = screen.getByLabelText(/card number/i);
      expect(cardInput).toHaveValue("4242 4242 4242 4242");
    });

    it("renders with default expiration date", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const expirationInput = screen.getByLabelText(/expiration date/i);
      expect(expirationInput).toHaveValue("12/28");
    });

    it("renders with default security code", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const securityInput = screen.getByLabelText(/security code/i);
      expect(securityInput).toHaveValue("123");
    });

    it("renders with default full name", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveValue("John Doe");
    });

    it("renders with default address", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const addressInput = screen.getByLabelText(/^address$/i);
      expect(addressInput).toHaveValue("123 Main St, San Francisco, CA 94102");
    });
  });

  describe("initial values", () => {
    const initialPaymentInfo: PaymentFormData = {
      cardNumber: "5555555555554444",
      expirationDate: "06/30",
      securityCode: "456",
    };

    const initialBillingAddress: BillingAddressFormData = {
      fullName: "Jane Smith",
      address: "456 Oak Ave, Los Angeles, CA 90001",
      preferredLanguage: "es",
    };

    it("uses initial payment info when provided", () => {
      render(
        <PaymentShippingForm onSubmit={mockOnSubmit} initialPaymentInfo={initialPaymentInfo} />
      );
      const cardInput = screen.getByLabelText(/card number/i);
      expect(cardInput).toHaveValue("5555 5555 5555 4444");
    });

    it("uses initial billing address when provided", () => {
      render(
        <PaymentShippingForm
          onSubmit={mockOnSubmit}
          initialBillingAddress={initialBillingAddress}
        />
      );
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveValue("Jane Smith");
    });
  });

  describe("card number formatting", () => {
    it("formats card number with spaces every 4 digits", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const cardInput = screen.getByLabelText(/card number/i);

      fireEvent.change(cardInput, { target: { value: "1234567890123456" } });
      expect(cardInput).toHaveValue("1234 5678 9012 3456");
    });

    it("limits card number to 16 digits", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const cardInput = screen.getByLabelText(/card number/i);

      fireEvent.change(cardInput, { target: { value: "12345678901234567890" } });
      expect(cardInput).toHaveValue("1234 5678 9012 3456");
    });

    it("removes non-numeric characters from card number", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const cardInput = screen.getByLabelText(/card number/i);

      fireEvent.change(cardInput, { target: { value: "1234-5678-9012-3456" } });
      expect(cardInput).toHaveValue("1234 5678 9012 3456");
    });
  });

  describe("expiration date formatting", () => {
    it("formats expiration date as MM/YY", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const expirationInput = screen.getByLabelText(/expiration date/i);

      fireEvent.change(expirationInput, { target: { value: "1230" } });
      expect(expirationInput).toHaveValue("12/30");
    });

    it("limits expiration date to 4 digits", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const expirationInput = screen.getByLabelText(/expiration date/i);

      fireEvent.change(expirationInput, { target: { value: "123456" } });
      expect(expirationInput).toHaveValue("12/34");
    });
  });

  describe("security code", () => {
    it("limits security code to 4 digits", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const securityInput = screen.getByLabelText(/security code/i);

      fireEvent.change(securityInput, { target: { value: "12345" } });
      expect(securityInput).toHaveValue("1234");
    });

    it("removes non-numeric characters from security code", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const securityInput = screen.getByLabelText(/security code/i);

      fireEvent.change(securityInput, { target: { value: "abc123" } });
      expect(securityInput).toHaveValue("123");
    });
  });

  describe("form validation", () => {
    it("enables pay now button with valid form data", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const payButton = screen.getByRole("button", { name: /pay now/i });
      expect(payButton).not.toBeDisabled();
    });

    it("disables pay now button when card number is incomplete", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const cardInput = screen.getByLabelText(/card number/i);
      const payButton = screen.getByRole("button", { name: /pay now/i });

      fireEvent.change(cardInput, { target: { value: "1234" } });
      expect(payButton).toBeDisabled();
    });

    it("disables pay now button when expiration date is incomplete", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const expirationInput = screen.getByLabelText(/expiration date/i);
      const payButton = screen.getByRole("button", { name: /pay now/i });

      fireEvent.change(expirationInput, { target: { value: "12" } });
      expect(payButton).toBeDisabled();
    });

    it("disables pay now button when security code is too short", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const securityInput = screen.getByLabelText(/security code/i);
      const payButton = screen.getByRole("button", { name: /pay now/i });

      fireEvent.change(securityInput, { target: { value: "12" } });
      expect(payButton).toBeDisabled();
    });

    it("disables pay now button when full name is empty", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const nameInput = screen.getByLabelText(/full name/i);
      const payButton = screen.getByRole("button", { name: /pay now/i });

      fireEvent.change(nameInput, { target: { value: "" } });
      expect(payButton).toBeDisabled();
    });

    it("disables pay now button when address is empty", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const addressInput = screen.getByLabelText(/^address$/i);
      const payButton = screen.getByRole("button", { name: /pay now/i });

      fireEvent.change(addressInput, { target: { value: "" } });
      expect(payButton).toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("calls onSubmit with payment info and billing address when clicking pay now", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const payButton = screen.getByRole("button", { name: /pay now/i });

      fireEvent.click(payButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          cardNumber: "4242424242424242",
          expirationDate: "12/28",
          securityCode: "123",
        },
        {
          fullName: "John Doe",
          address: "123 Main St, San Francisco, CA 94102",
          preferredLanguage: "en",
        }
      );
    });

    it("does not call onSubmit when form is invalid", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const cardInput = screen.getByLabelText(/card number/i);
      const payButton = screen.getByRole("button", { name: /pay now/i });

      fireEvent.change(cardInput, { target: { value: "1234" } });
      fireEvent.click(payButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("calls onBack when back button is clicked", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} onBack={mockOnBack} />);
      const backButton = screen.getByRole("button", { name: /go back/i });

      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe("processing state", () => {
    it("shows processing text when isProcessing is true", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} isProcessing={true} />);
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("disables pay button when processing", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} isProcessing={true} />);
      const payButton = screen.getByRole("button", { name: /processing/i });
      expect(payButton).toBeDisabled();
    });

    it("disables all inputs when processing", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} isProcessing={true} />);

      expect(screen.getByLabelText(/card number/i)).toBeDisabled();
      expect(screen.getByLabelText(/expiration date/i)).toBeDisabled();
      expect(screen.getByLabelText(/security code/i)).toBeDisabled();
      expect(screen.getByLabelText(/full name/i)).toBeDisabled();
      expect(screen.getByLabelText(/^address$/i)).toBeDisabled();
      // KUI Select uses data-testid="nv-select"
      expect(screen.getByTestId("nv-select")).toBeDisabled();
    });
  });

  describe("card number input", () => {
    it("accepts Visa card numbers", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const cardInput = screen.getByLabelText(/card number/i);

      // Default is Visa (4242...)
      expect(cardInput).toHaveValue("4242 4242 4242 4242");
    });

    it("accepts Mastercard numbers", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const cardInput = screen.getByLabelText(/card number/i);

      fireEvent.change(cardInput, { target: { value: "5555555555554444" } });
      expect(cardInput).toHaveValue("5555 5555 5555 4444");
    });

    it("accepts Amex numbers", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const cardInput = screen.getByLabelText(/card number/i);

      fireEvent.change(cardInput, { target: { value: "3782822463100005" } });
      expect(cardInput).toHaveValue("3782 8224 6310 0005");
    });
  });

  describe("language preference", () => {
    // Helper to get the language select - KUI Select uses data-testid="nv-select"
    const getLanguageSelect = () => screen.getByTestId("nv-select");

    it("renders the language preference section label", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      expect(screen.getByText("Language preference")).toBeInTheDocument();
    });

    it("renders the language selector with default English selected", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const languageSelect = getLanguageSelect();
      expect(languageSelect).toHaveValue("en");
    });

    it("renders all three language options", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const languageSelect = getLanguageSelect();

      expect(languageSelect).toContainHTML("English (English)");
      expect(languageSelect).toContainHTML("Spanish (Espanol)");
      expect(languageSelect).toContainHTML("French (Francais)");
    });

    it("allows changing the language to Spanish", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const languageSelect = getLanguageSelect();

      fireEvent.change(languageSelect, { target: { value: "es" } });
      expect(languageSelect).toHaveValue("es");
    });

    it("allows changing the language to French", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const languageSelect = getLanguageSelect();

      fireEvent.change(languageSelect, { target: { value: "fr" } });
      expect(languageSelect).toHaveValue("fr");
    });

    it("includes selected language in form submission", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} />);
      const languageSelect = getLanguageSelect();
      const payButton = screen.getByRole("button", { name: /pay now/i });

      // Change to Spanish
      fireEvent.change(languageSelect, { target: { value: "es" } });
      fireEvent.click(payButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          preferredLanguage: "es",
        })
      );
    });

    it("uses initial language preference when provided", () => {
      const initialBillingAddress: BillingAddressFormData = {
        fullName: "Jane Smith",
        address: "456 Oak Ave, Los Angeles, CA 90001",
        preferredLanguage: "fr",
      };
      render(
        <PaymentShippingForm
          onSubmit={mockOnSubmit}
          initialBillingAddress={initialBillingAddress}
        />
      );
      const languageSelect = getLanguageSelect();
      expect(languageSelect).toHaveValue("fr");
    });

    it("disables language selector when processing", () => {
      render(<PaymentShippingForm onSubmit={mockOnSubmit} isProcessing={true} />);
      const languageSelect = getLanguageSelect();
      expect(languageSelect).toBeDisabled();
    });
  });
});
