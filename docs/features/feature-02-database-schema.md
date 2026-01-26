# Feature 2: Database Schema & Seed Data

**Goal**: Create SQLite database with SQLModel ORM and pre-populate with demo data.

## Tasks

- [x] Define SQLModel models:
  - `Product`: `id`, `sku`, `name`, `base_price`, `stock_count`, `min_margin`, `image_url`
  - `CompetitorPrice`: `id`, `product_id` (FK), `retailer_name`, `price`, `updated_at`
  - `CheckoutSession`: Full ACP state including status, line_items, totals, etc.
- [x] Create database initialization script
- [x] Seed 4 products (t-shirts as per PRD):
  ```python
  # Example seed data
  products = [
      Product(id="prod_1", sku="TS-001", name="Classic Tee", base_price=2500, stock_count=100, min_margin=0.15, image_url="https://placehold.co/400x400/png?text=Classic+Tee"),
      Product(id="prod_2", sku="TS-002", name="V-Neck Tee", base_price=2800, stock_count=50, min_margin=0.12, image_url="https://placehold.co/400x400/png?text=V-Neck+Tee"),
      Product(id="prod_3", sku="TS-003", name="Graphic Tee", base_price=3200, stock_count=200, min_margin=0.18, image_url="https://placehold.co/400x400/png?text=Graphic+Tee"),
      Product(id="prod_4", sku="TS-004", name="Premium Tee", base_price=4500, stock_count=25, min_margin=0.20, image_url="https://placehold.co/400x400/png?text=Premium+Tee"),
  ]
  ```
- [x] Seed competitor prices for dynamic pricing logic
- [x] Create database utility functions (get_db session)

## Acceptance Criteria

- Database file is created on startup
- 4 products are seeded with images and pricing
- Competitor prices exist for promotion agent logic
- All tables can be queried via SQLModel

---

[← Back to Feature Overview](./index.md)
