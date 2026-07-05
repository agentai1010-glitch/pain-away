# PAIN AWAY - Inventory & Commerce Core Context

## Business Vision
The Inventory & Commerce Core is a standalone, foundational business system for Pain Away. It is designed to track products, manage stock levels across multiple locations, facilitate procurement, and handle customer orders. It serves as the single source of truth for all physical goods and their lifecycle within the organization.

## Scope
The scope of this core includes managing product master data, warehouse and inventory levels, procurement (purchase orders and goods receiving), and customer order fulfillment. It is explicitly bounded to the internal tracking and transaction of physical goods, strictly separated from external integrations like payment gateways or patient portals during its initial implementation.

## Phases & Capabilities
The foundation is structured into five sequential phases:

### Phase 1: Master Data
- **Product:** Centralized definition of all physical items.
- **Category:** Hierarchical classification of products.
- **Brand:** Manufacturer and branding information.
- **Supplier:** Vendor profiles for procurement.

### Phase 2: Inventory Core
- **Warehouse:** Physical or logical storage locations.
- **Inventory:** The current, real-time quantity of products in a specific warehouse.
- **Stock Movement:** Ledger of all additions, deductions, and transfers.

### Phase 3: Procurement
- **Purchase Order:** Intent to purchase goods from a supplier.
- **Goods Receiving:** The operational process of accepting goods, which drives actual stock creation.

### Phase 4: Commerce
- **Customer Order:** Immutable records of goods purchased by a customer.
- **Inventory Reservation Workflow:** Orchestration to hold stock temporarily before order completion.

### Phase 5: Reporting
- **Inventory Reports:** Read-only projections for business intelligence and stock auditing.

## Frozen Business Principles
The following architectural constraints are strictly enforced and immutable:
- **Separation of Concerns:** Master Data is completely independent from Transactions.
- **Warehouse Identity:** Warehouse models own storage identity only, not stock logic.
- **Inventory State:** Inventory owns only the current state/quantity of stock.
- **Immutable History:** Stock Movement owns all inventory history and serves as the definitive ledger.
- **Indirect Stock Updates:** Purchase Orders *never* update inventory directly. 
- **Stock Creation:** Goods Receiving is the *only* procurement process that creates stock.
- **Immutable Snapshots:** Customer Orders preserve immutable product snapshots (capturing pricing and details exactly as they were at the time of purchase).
- **Orchestration:** Inventory Reservation is an orchestration workflow, not a direct model update.
- **CQRS-lite:** Reports are strictly read-only projections of the transactional data.
- **Deferred Integration:** External integrations are intentionally deferred to future iterations.

## Relationship with the Clinic Operating System
The Inventory & Commerce Core operates completely independently from the Clinic Operating System (Milestones 1–4). They are two distinct foundational systems. 

In the future, integrations will connect them via loose coupling without altering the internal business architecture of either core. 

## Deferred Integrations
The following capabilities are explicitly out of scope for the current foundation and are reserved for future work:
- Product recommendations after clinical treatments.
- Point-of-sale product selling after patient checkout.
- Public patient website e-commerce storefront.
- WhatsApp notifications.
- Payment gateway integrations.
- Courier and shipping provider integrations.

## Engineering Constraints
- The architecture must remain pristine; no new business capabilities may be added outside the defined phases.
- The defined workflows must not be altered or shortcut.
- All technical implementation must strictly adhere to the frozen business principles above.

## Future Implementation Strategy
Implementation will proceed sequentially through Phases 1 to 5. Each phase must be fully implemented and verified before proceeding to the next. The system will be designed to allow eventual, seamless integration with the Clinic Operating System without requiring structural refactoring of this core.
