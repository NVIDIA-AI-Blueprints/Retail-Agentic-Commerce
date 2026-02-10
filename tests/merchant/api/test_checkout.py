"""Tests for the checkout session API endpoints."""

import pytest
from fastapi.testclient import TestClient


class TestCreateCheckoutSession:
    """Test suite for POST /checkout_sessions endpoint."""

    def test_create_session_with_valid_items_returns_201(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Creating a session with valid items returns 201."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )

        assert response.status_code == 201

    def test_create_session_returns_session_id(self, auth_client: TestClient) -> None:
        """Happy path: Response contains a checkout session ID."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()

        assert "id" in data
        assert data["id"].startswith("checkout_")

    def test_create_session_has_not_ready_status(self, auth_client: TestClient) -> None:
        """Happy path: New session has not_ready_for_payment status."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()

        assert data["status"] == "not_ready_for_payment"

    def test_create_session_calculates_line_items(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Line items are calculated correctly."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 2}]},
        )
        data = response.json()

        assert len(data["line_items"]) == 1
        line_item = data["line_items"][0]
        assert line_item["item"]["id"] == "prod_1"
        assert line_item["item"]["quantity"] == 2
        # prod_1 base_price is 2500 cents, so 2 * 2500 = 5000
        assert line_item["base_amount"] == 5000
        assert line_item["discount"] == 0
        assert line_item["subtotal"] == 5000
        # 10% tax
        assert line_item["tax"] == 500
        assert line_item["total"] == 5500

    def test_create_session_with_buyer_info(self, auth_client: TestClient) -> None:
        """Happy path: Session includes buyer info when provided."""
        response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "buyer": {"first_name": "John", "email": "john@example.com"},
            },
        )
        data = response.json()

        assert data["buyer"] is not None
        assert data["buyer"]["first_name"] == "John"
        assert data["buyer"]["email"] == "john@example.com"

    def test_create_session_with_fulfillment_address(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Session includes address and fulfillment options when provided."""
        response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "fulfillment_address": {
                    "name": "John Doe",
                    "line_one": "123 Main St",
                    "city": "San Francisco",
                    "state": "CA",
                    "country": "US",
                    "postal_code": "94102",
                },
            },
        )
        data = response.json()

        assert data["fulfillment_address"] is not None
        assert data["fulfillment_address"]["name"] == "John Doe"
        assert len(data["fulfillment_options"]) > 0

    def test_create_session_includes_payment_provider(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Response includes payment provider configuration."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()

        assert "payment_provider" in data
        assert data["payment_provider"]["provider"] == "stripe"
        assert "card" in data["payment_provider"]["supported_payment_methods"]

    def test_create_session_includes_capabilities_and_discounts(
        self, auth_client: TestClient
    ) -> None:
        """Session response includes discount extension capabilities payload."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()

        assert response.status_code == 201
        assert data["capabilities"]["extensions"][0]["name"] == "discount"
        assert data["discounts"]["codes"] == []
        assert isinstance(data["discounts"]["applied"], list)
        assert isinstance(data["discounts"]["rejected"], list)

    def test_create_session_applies_save10_coupon(
        self, auth_client: TestClient
    ) -> None:
        """Submitting SAVE10 applies a stacked coupon discount."""
        response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "discounts": {"codes": ["save10"]},
            },
        )
        data = response.json()

        assert response.status_code == 201
        assert data["discounts"]["codes"] == ["SAVE10"]
        assert any(d.get("code") == "SAVE10" for d in data["discounts"]["applied"])
        assert data["line_items"][0]["discount"] > 0

    def test_create_session_includes_totals(self, auth_client: TestClient) -> None:
        """Happy path: Response includes calculated totals."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()

        assert "totals" in data
        assert len(data["totals"]) > 0
        # Should have at least items_base_amount, subtotal, tax, total
        total_types = [t["type"] for t in data["totals"]]
        assert "items_base_amount" in total_types
        assert "subtotal" in total_types
        assert "tax" in total_types
        assert "total" in total_types

    def test_create_session_includes_messages(self, auth_client: TestClient) -> None:
        """Happy path: Response includes messages array."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()

        assert "messages" in data
        assert isinstance(data["messages"], list)

    def test_create_session_includes_links(self, auth_client: TestClient) -> None:
        """Happy path: Response includes HATEOAS links."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()

        assert "links" in data
        assert len(data["links"]) == 3
        link_types = [link["type"] for link in data["links"]]
        assert "terms_of_use" in link_types
        assert "privacy_policy" in link_types
        assert "seller_shop_policies" in link_types

    def test_create_session_with_invalid_product_returns_400(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Invalid product ID returns 400."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "invalid_product", "quantity": 1}]},
        )

        assert response.status_code == 400
        data = response.json()
        assert "product_not_found" in str(data)

    def test_create_session_with_empty_items_returns_422(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Empty items list returns 422 validation error."""
        response = auth_client.post("/checkout_sessions", json={"items": []})

        assert response.status_code == 422

    def test_create_session_with_zero_quantity_returns_422(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Zero quantity returns 422 validation error."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 0}]},
        )

        assert response.status_code == 422

    def test_create_session_with_multiple_items(self, auth_client: TestClient) -> None:
        """Edge case: Multiple items in a single session."""
        response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [
                    {"id": "prod_1", "quantity": 1},
                    {"id": "prod_2", "quantity": 2},
                ]
            },
        )
        data = response.json()

        assert response.status_code == 201
        assert len(data["line_items"]) == 2

    def test_create_session_with_buyer_last_name(self, auth_client: TestClient) -> None:
        """Happy path: Session includes buyer last_name when provided."""
        response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "buyer": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john.doe@example.com",
                },
            },
        )
        data = response.json()

        assert response.status_code == 201
        assert data["buyer"] is not None
        assert data["buyer"]["first_name"] == "John"
        assert data["buyer"]["last_name"] == "Doe"
        assert data["buyer"]["email"] == "john.doe@example.com"

    def test_create_session_buyer_last_name_optional(
        self, auth_client: TestClient
    ) -> None:
        """Edge case: Buyer last_name is optional and can be omitted."""
        response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "buyer": {"first_name": "Jane", "email": "jane@example.com"},
            },
        )
        data = response.json()

        assert response.status_code == 201
        assert data["buyer"]["first_name"] == "Jane"
        assert data["buyer"].get("last_name") is None


class TestGetCheckoutSession:
    """Test suite for GET /checkout_sessions/{id} endpoint."""

    def test_get_existing_session_returns_200(self, auth_client: TestClient) -> None:
        """Happy path: Getting an existing session returns 200."""
        # Create a session first
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        # Get the session
        response = auth_client.get(f"/checkout_sessions/{session_id}")

        assert response.status_code == 200

    def test_get_session_returns_correct_data(self, auth_client: TestClient) -> None:
        """Happy path: Get returns the same data that was created."""
        # Create a session with specific data
        create_response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 3}],
                "buyer": {"first_name": "Jane", "email": "jane@example.com"},
            },
        )
        created_data = create_response.json()
        session_id = created_data["id"]

        # Get the session
        response = auth_client.get(f"/checkout_sessions/{session_id}")
        data = response.json()

        assert data["id"] == session_id
        assert data["buyer"]["first_name"] == "Jane"
        assert data["line_items"][0]["item"]["quantity"] == 3

    def test_get_nonexistent_session_returns_404(self, auth_client: TestClient) -> None:
        """Failure case: Getting a non-existent session returns 404."""
        response = auth_client.get("/checkout_sessions/nonexistent_id")

        assert response.status_code == 404
        data = response.json()
        assert "session_not_found" in str(data)


class TestUpdateCheckoutSession:
    """Test suite for POST /checkout_sessions/{id} endpoint."""

    def test_update_session_returns_200(self, auth_client: TestClient) -> None:
        """Happy path: Updating an existing session returns 200."""
        # Create a session
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        # Update the session
        response = auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"buyer": {"first_name": "Updated", "email": "updated@example.com"}},
        )

        assert response.status_code == 200

    def test_update_session_with_buyer(self, auth_client: TestClient) -> None:
        """Happy path: Update adds buyer information."""
        # Create a session without buyer
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        # Update with buyer
        response = auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"buyer": {"first_name": "Alice", "email": "alice@example.com"}},
        )
        data = response.json()

        assert data["buyer"]["first_name"] == "Alice"

    def test_update_session_with_address_generates_fulfillment_options(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Adding address generates fulfillment options."""
        # Create a session without address
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]
        assert len(create_response.json()["fulfillment_options"]) == 0

        # Update with address
        response = auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={
                "fulfillment_address": {
                    "name": "Bob Smith",
                    "line_one": "456 Oak Ave",
                    "city": "Austin",
                    "state": "TX",
                    "country": "US",
                    "postal_code": "78701",
                }
            },
        )
        data = response.json()

        assert len(data["fulfillment_options"]) > 0

    def test_update_session_with_fulfillment_option_selection(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Can select a fulfillment option."""
        # Create a session with address
        create_response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "fulfillment_address": {
                    "name": "Bob Smith",
                    "line_one": "456 Oak Ave",
                    "city": "Austin",
                    "state": "TX",
                    "country": "US",
                    "postal_code": "78701",
                },
            },
        )
        session_id = create_response.json()["id"]
        fulfillment_option_id = create_response.json()["fulfillment_options"][0]["id"]

        # Select fulfillment option
        response = auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"fulfillment_option_id": fulfillment_option_id},
        )
        data = response.json()

        assert data["fulfillment_option_id"] == fulfillment_option_id

    def test_update_session_transitions_to_ready_for_payment(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Session transitions to ready_for_payment with all fields."""
        # Create a session with address
        create_response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "fulfillment_address": {
                    "name": "Complete User",
                    "line_one": "789 Pine St",
                    "city": "Seattle",
                    "state": "WA",
                    "country": "US",
                    "postal_code": "98101",
                },
            },
        )
        session_id = create_response.json()["id"]
        fulfillment_option_id = create_response.json()["fulfillment_options"][0]["id"]

        # Add buyer and select fulfillment option
        response = auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={
                "buyer": {"first_name": "Complete", "email": "complete@example.com"},
                "fulfillment_option_id": fulfillment_option_id,
            },
        )
        data = response.json()

        assert data["status"] == "ready_for_payment"

    def test_update_session_recalculates_totals(self, auth_client: TestClient) -> None:
        """Edge case: Updating items recalculates totals."""
        # Create a session with 1 item
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]
        original_total = next(
            t["amount"]
            for t in create_response.json()["totals"]
            if t["type"] == "total"
        )

        # Update to 2 items
        response = auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"items": [{"id": "prod_1", "quantity": 2}]},
        )
        data = response.json()
        new_total = next(t["amount"] for t in data["totals"] if t["type"] == "total")

        assert new_total == original_total * 2

    def test_update_session_rejects_invalid_coupon(
        self, auth_client: TestClient
    ) -> None:
        """Invalid coupon codes are rejected and surfaced in warning messages."""
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        response = auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"discounts": {"codes": ["NOTREAL"]}},
        )
        data = response.json()

        assert response.status_code == 200
        assert data["discounts"]["codes"] == ["NOTREAL"]
        assert data["discounts"]["rejected"][0]["reason"] == "discount_code_invalid"
        assert any(msg["type"] == "warning" for msg in data["messages"])

    def test_update_nonexistent_session_returns_404(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Updating non-existent session returns 404."""
        response = auth_client.post(
            "/checkout_sessions/nonexistent_id",
            json={"buyer": {"first_name": "Test", "email": "test@example.com"}},
        )

        assert response.status_code == 404

    def test_update_completed_session_returns_405(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Updating a completed session returns 405."""
        # Create and complete a session
        create_response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "buyer": {"first_name": "Test", "email": "test@example.com"},
                "fulfillment_address": {
                    "name": "Test User",
                    "line_one": "123 Test St",
                    "city": "Test City",
                    "state": "TS",
                    "country": "US",
                    "postal_code": "12345",
                },
            },
        )
        session_id = create_response.json()["id"]
        fulfillment_option_id = create_response.json()["fulfillment_options"][0]["id"]

        # Select fulfillment option to make it ready
        auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"fulfillment_option_id": fulfillment_option_id},
        )

        # Complete the session
        auth_client.post(
            f"/checkout_sessions/{session_id}/complete",
            json={
                "payment_data": {
                    "token": "tok_test",
                    "provider": "stripe",
                }
            },
        )

        # Try to update completed session
        response = auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"buyer": {"first_name": "Updated", "email": "updated@example.com"}},
        )

        assert response.status_code == 405


class TestCompleteCheckoutSession:
    """Test suite for POST /checkout_sessions/{id}/complete endpoint."""

    def _create_ready_session(self, auth_client: TestClient) -> str:
        """Helper to create a session ready for payment."""
        create_response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "buyer": {"first_name": "Ready", "email": "ready@example.com"},
                "fulfillment_address": {
                    "name": "Ready User",
                    "line_one": "100 Ready St",
                    "city": "Ready City",
                    "state": "RD",
                    "country": "US",
                    "postal_code": "00000",
                },
            },
        )
        session_id = create_response.json()["id"]
        fulfillment_option_id = create_response.json()["fulfillment_options"][0]["id"]

        # Select fulfillment option to make it ready
        auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"fulfillment_option_id": fulfillment_option_id},
        )

        return session_id

    def test_complete_ready_session_returns_200(self, auth_client: TestClient) -> None:
        """Happy path: Completing a ready session returns 200."""
        session_id = self._create_ready_session(auth_client)

        response = auth_client.post(
            f"/checkout_sessions/{session_id}/complete",
            json={"payment_data": {"token": "tok_test", "provider": "stripe"}},
        )

        assert response.status_code == 200

    def test_complete_session_sets_completed_status(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Completed session has status 'completed'."""
        session_id = self._create_ready_session(auth_client)

        response = auth_client.post(
            f"/checkout_sessions/{session_id}/complete",
            json={"payment_data": {"token": "tok_test", "provider": "stripe"}},
        )
        data = response.json()

        assert data["status"] == "completed"

    def test_complete_session_creates_order(self, auth_client: TestClient) -> None:
        """Happy path: Completed session includes order object."""
        session_id = self._create_ready_session(auth_client)

        response = auth_client.post(
            f"/checkout_sessions/{session_id}/complete",
            json={"payment_data": {"token": "tok_test", "provider": "stripe"}},
        )
        data = response.json()

        assert data["order"] is not None
        assert data["order"]["id"].startswith("order_")
        assert data["order"]["checkout_session_id"] == session_id
        assert "permalink_url" in data["order"]

    def test_complete_session_with_buyer_last_name(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Complete checkout can update buyer with last_name."""
        session_id = self._create_ready_session(auth_client)

        response = auth_client.post(
            f"/checkout_sessions/{session_id}/complete",
            json={
                "buyer": {
                    "first_name": "Complete",
                    "last_name": "User",
                    "email": "complete.user@example.com",
                },
                "payment_data": {"token": "tok_test", "provider": "stripe"},
            },
        )
        data = response.json()

        assert response.status_code == 200
        assert data["buyer"]["first_name"] == "Complete"
        assert data["buyer"]["last_name"] == "User"
        assert data["buyer"]["email"] == "complete.user@example.com"

    def test_complete_nonexistent_session_returns_404(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Completing non-existent session returns 404."""
        response = auth_client.post(
            "/checkout_sessions/nonexistent_id/complete",
            json={"payment_data": {"token": "tok_test", "provider": "stripe"}},
        )

        assert response.status_code == 404

    def test_complete_not_ready_session_returns_405(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Completing a not-ready session returns 405."""
        # Create a session without all required fields
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        response = auth_client.post(
            f"/checkout_sessions/{session_id}/complete",
            json={"payment_data": {"token": "tok_test", "provider": "stripe"}},
        )

        assert response.status_code == 405

    def test_complete_already_completed_session_returns_405(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Completing an already completed session returns 405."""
        session_id = self._create_ready_session(auth_client)

        # Complete once
        auth_client.post(
            f"/checkout_sessions/{session_id}/complete",
            json={"payment_data": {"token": "tok_test", "provider": "stripe"}},
        )

        # Try to complete again
        response = auth_client.post(
            f"/checkout_sessions/{session_id}/complete",
            json={"payment_data": {"token": "tok_test2", "provider": "stripe"}},
        )

        assert response.status_code == 405


class TestCancelCheckoutSession:
    """Test suite for POST /checkout_sessions/{id}/cancel endpoint."""

    def test_cancel_session_returns_200(self, auth_client: TestClient) -> None:
        """Happy path: Canceling a session returns 200."""
        # Create a session
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        response = auth_client.post(f"/checkout_sessions/{session_id}/cancel")

        assert response.status_code == 200

    def test_cancel_session_sets_canceled_status(self, auth_client: TestClient) -> None:
        """Happy path: Canceled session has status 'canceled'."""
        # Create a session
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        response = auth_client.post(f"/checkout_sessions/{session_id}/cancel")
        data = response.json()

        assert data["status"] == "canceled"

    def test_cancel_ready_session_returns_200(self, auth_client: TestClient) -> None:
        """Happy path: Can cancel a ready_for_payment session."""
        # Create a ready session
        create_response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "buyer": {"first_name": "Test", "email": "test@example.com"},
                "fulfillment_address": {
                    "name": "Test User",
                    "line_one": "123 Test St",
                    "city": "Test City",
                    "state": "TS",
                    "country": "US",
                    "postal_code": "12345",
                },
            },
        )
        session_id = create_response.json()["id"]
        fulfillment_option_id = create_response.json()["fulfillment_options"][0]["id"]

        # Make it ready
        auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"fulfillment_option_id": fulfillment_option_id},
        )

        response = auth_client.post(f"/checkout_sessions/{session_id}/cancel")

        assert response.status_code == 200
        assert response.json()["status"] == "canceled"

    def test_cancel_nonexistent_session_returns_404(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Canceling non-existent session returns 404."""
        response = auth_client.post("/checkout_sessions/nonexistent_id/cancel")

        assert response.status_code == 404

    def test_cancel_completed_session_returns_405(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Canceling a completed session returns 405."""
        # Create and complete a session
        create_response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "buyer": {"first_name": "Test", "email": "test@example.com"},
                "fulfillment_address": {
                    "name": "Test User",
                    "line_one": "123 Test St",
                    "city": "Test City",
                    "state": "TS",
                    "country": "US",
                    "postal_code": "12345",
                },
            },
        )
        session_id = create_response.json()["id"]
        fulfillment_option_id = create_response.json()["fulfillment_options"][0]["id"]

        # Make it ready and complete
        auth_client.post(
            f"/checkout_sessions/{session_id}",
            json={"fulfillment_option_id": fulfillment_option_id},
        )
        auth_client.post(
            f"/checkout_sessions/{session_id}/complete",
            json={"payment_data": {"token": "tok_test", "provider": "stripe"}},
        )

        response = auth_client.post(f"/checkout_sessions/{session_id}/cancel")

        assert response.status_code == 405

    def test_cancel_already_canceled_session_returns_405(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Canceling an already canceled session returns 405."""
        # Create and cancel a session
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        auth_client.post(f"/checkout_sessions/{session_id}/cancel")

        # Try to cancel again
        response = auth_client.post(f"/checkout_sessions/{session_id}/cancel")

        assert response.status_code == 405


class TestCheckoutSessionResponseFormat:
    """Test suite for verifying ACP-compliant response format."""

    def test_response_has_all_required_fields(self, auth_client: TestClient) -> None:
        """Edge case: Response contains all ACP-required fields."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()

        required_fields = {
            "id",
            "payment_provider",
            "status",
            "currency",
            "line_items",
            "fulfillment_options",
            "totals",
            "messages",
            "links",
        }
        assert required_fields <= set(data.keys())

    def test_currency_is_lowercase(self, auth_client: TestClient) -> None:
        """Edge case: Currency is lowercase ISO 4217."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()

        assert data["currency"] == "usd"

    def test_line_item_has_all_required_fields(self, auth_client: TestClient) -> None:
        """Edge case: Line items contain all required fields."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        data = response.json()
        line_item = data["line_items"][0]

        required_fields = {
            "id",
            "item",
            "base_amount",
            "discount",
            "subtotal",
            "tax",
            "total",
        }
        assert required_fields <= set(line_item.keys())
        assert "id" in line_item["item"]
        assert "quantity" in line_item["item"]

    def test_fulfillment_option_has_required_fields(
        self, auth_client: TestClient
    ) -> None:
        """Edge case: Fulfillment options contain all required fields."""
        response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "fulfillment_address": {
                    "name": "Test User",
                    "line_one": "123 Test St",
                    "city": "Test City",
                    "state": "TS",
                    "country": "US",
                    "postal_code": "12345",
                },
            },
        )
        data = response.json()
        option = data["fulfillment_options"][0]

        required_fields = {
            "type",
            "id",
            "title",
            "subtitle",
            "subtotal",
            "tax",
            "total",
        }
        assert required_fields <= set(option.keys())

    def test_response_json_content_type(self, auth_client: TestClient) -> None:
        """Edge case: Response has correct content type."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )

        assert "application/json" in response.headers["content-type"]

    @pytest.mark.parametrize("method", ["PUT", "DELETE", "PATCH"])
    def test_create_rejects_non_post_methods(
        self, auth_client: TestClient, method: str
    ) -> None:
        """Failure case: Create endpoint rejects non-POST methods."""
        response = auth_client.request(
            method,
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )

        assert response.status_code == 405
