# Milestone 1 — Implementation Plan

> **Status:** FROZEN
>
> **Prerequisite:** [MILESTONE_01_OVERVIEW.md](MILESTONE_01_OVERVIEW.md)
>
> This document defines the implementation order and engineering constraints for Milestone 1.
> It must not be modified during implementation.

---

## 1. Module Implementation Order

Modules are implemented in strict dependency order. Each module must be complete and independently testable before the next begins.

| Phase | Module | Rationale |
|-------|--------|-----------|
| **Phase 0** | `config`, `db`, `core`, `shared` | Infrastructure foundation. All business modules depend on these. |
| **Phase 1** | `catalog` | Services/packages must exist before a patient can book. No dependencies on other business modules. |
| **Phase 2** | `patient` | Patient records must exist before an appointment can be linked. Depends only on infrastructure. |
| **Phase 3** | `scheduling` | Slot management, availability rules, and appointment creation. Depends on `catalog` (service reference) and `patient` (patient reference). |
| **Phase 4** | `billing` | Advance payment record and booking receipt. Depends on `scheduling` (appointment reference) and `catalog` (service pricing). |
| **Phase 5** | `notification` | WhatsApp confirmation and receipt. Depends on `billing` (receipt data) and `patient` (contact details). |
| **Phase 6** | `orchestration` | Coordinates the complete public booking workflow. Depends on all business modules. |

---

## 2. Integration Order

After individual modules are implemented, they are integrated in this order:

| Step | Integration | Validates |
|------|-------------|-----------|
| 1 | `catalog` → `scheduling` | Service selection feeds into slot booking. An appointment references a valid service. |
| 2 | `patient` → `scheduling` | Patient details are attached to the appointment. Returning patient lookup works. |
| 3 | `scheduling` → `billing` | Confirmed appointment triggers advance payment record and booking receipt generation. |
| 4 | `billing` → `notification` | Successful payment triggers WhatsApp confirmation and receipt delivery. |
| 5 | `orchestration` → all modules | End-to-end public booking workflow executes correctly across all modules. |

---

## 3. Dependency Order

```
config ─────┐
db ──────────┤
core ────────┼──▶ ALL BUSINESS MODULES
shared ──────┘

catalog ─────────────┐
                     ├──▶ scheduling
patient ─────────────┘
                              │
                              ▼
catalog ──────────┐
                  ├──▶ billing
scheduling ───────┘
                        │
                        ▼
patient ──────────┐
                  ├──▶ notification
billing ──────────┘
                        │
                        ▼
catalog ──────────┐
patient ──────────┤
scheduling ───────┼──▶ orchestration
billing ──────────┤
notification ─────┘
```

### Dependency Rules

- No circular dependencies between business modules.
- Business modules depend on infrastructure modules only via `shared`, `config`, `db`, and `core`.
- `orchestration` is the only module permitted to depend on all other business modules.
- Individual business modules must not depend on `orchestration`.

---

## 4. Engineering Constraints

### 4.1 Time and Timezone

- All server-side time operations use `Asia/Kolkata` (IST).
- The 9:00 AM same-day cutoff is evaluated in IST.
- Wednesday determination is evaluated in IST.
- Slot times (11:00–17:00) are in IST.

### 4.2 Data Integrity

- No double-booking must be enforced at both the domain layer (service/domain rules) and the database layer (unique constraints).
- Wednesday blocking must be enforced at the domain layer.
- The 5-appointment-per-day limit must be enforced at both the domain and database layers.
- Advance payment records must be immutable once created (non-refundable).

### 4.3 Domain Rule Enforcement

- All business rules are enforced in the `service.py` and `domain.py` layers.
- API routes (`api.py`) are thin — they validate input and delegate to services.
- Repositories (`repository.py`) handle data access only — no business logic.

### 4.4 Module Boundaries

- Modules communicate through well-defined service interfaces.
- No module directly accesses another module's repository or models.
- Cross-module coordination goes through `orchestration` only.

### 4.5 Testing Strategy

- **Unit tests** cover domain rules and service logic within each module.
- **Integration tests** cover cross-module workflows and database interactions.
- **Business Acceptance Tests (BATs)** validate every rule defined in [MILESTONE_01_OVERVIEW.md](MILESTONE_01_OVERVIEW.md).

---

## 5. Definition of Done

Milestone 1 is complete when **all** of the following are satisfied:

### 5.1 Functional Completeness

- [ ] Patient can access the booking link without login.
- [ ] UI is a single mobile-first page with progressively revealed sections (Patient Details, Service, Slot, Payment Summary, Payment, Success).
- [ ] Patient details (mobile, name, address) are captured and identity is checked immediately.
- [ ] Returning patients with an active confirmed appointment are blocked from new bookings, shown a welcome back message, booking summary, and receipt download.
- [ ] Available services/packages are displayed.
- [ ] Available slots are displayed within the 3-day window.
- [ ] Wednesday dates are blocked.
- [ ] Same-day slots are blocked after 9:00 AM IST.
- [ ] Booked slots are not available.
- [ ] 5-appointment daily limit is enforced.
- [ ] Advance payment is mandatory and collected.
- [ ] After successful payment, appointment is automatically confirmed, slot occupied, and receipt generated. No extra action required.
- [ ] WhatsApp booking confirmation is sent.
- [ ] WhatsApp receipt is sent.

### 5.2 Data Integrity

- [ ] No double-booking is possible under any circumstance.
- [ ] No Wednesday booking is possible under any circumstance.
- [ ] Advance payment records are non-refundable and immutable.
- [ ] Patient history is preserved across bookings.

### 5.3 Testing

- [ ] Unit tests pass for all domain rules in every module.
- [ ] Integration tests pass for cross-module workflows.
- [ ] All 15 Business Acceptance Tests (BAT-01 through BAT-15) pass.

### 5.4 Code Quality

- [ ] Ruff linting passes with zero errors.
- [ ] Type checking passes.
- [ ] No circular dependencies between modules.
- [ ] All modules follow the standard internal structure (api, service, repository, schemas, models, domain, exceptions).
