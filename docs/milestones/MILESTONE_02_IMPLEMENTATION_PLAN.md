# Milestone 2: Reception Operations Implementation Plan

## Objective
Digitize the complete operational workflow performed by the clinic receptionist after patients begin using the booking system.

## Important Architectural Decisions
- Reuse the existing Shared Booking Orchestrator created in Milestone 1.
- Reception must never implement a separate booking engine.
- All booking business rules remain centralized inside the existing booking workflow.
- Reception provides operational capabilities, not duplicate business logic.

## Implementation Order

### Capability 1: Reception Login & Dashboard
- Implement Reception Login
- Dashboard with three primary entry points:
  - New Appointment
  - Search Patient
  - Today's Queue

### Capability 2: Today's Reception Queue
- Read-only operational projection generated from confirmed appointments.
- Displays only today's confirmed appointments ordered by slot time.
- Excludes cancelled and completed appointments.

### Capability 3: Global Patient Search & Patient Workspace
- **Global Patient Search**:
  - Primary search: Mobile Number
  - Secondary search: Patient Name
- **Patient Workspace**:
  - Operational hub for the selected patient.
  - Provides access to: Patient Details, Active Appointment, Appointment History, Financial Summary, New Appointment, Checkout.

### Capability 4: Manual Reception Booking
- Uses the existing Shared Booking Orchestrator.
- Reception does not own booking logic.
- Reception may choose the payment collection method (Cash, Clinic QR / UPI, Online).
- The booking workflow remains identical to the public booking workflow.

### Capability 5: Financial Summary
- Read-only summary exposing: Total Amount, Advance Paid, Remaining Balance, Payment Status.
- Never recalculates amounts, edits values, or generates bills.

### Capability 6: Reception Checkout
- Collects the remaining balance.
- Creates the Final Payment Record.
- Generates the Final Bill.
- Marks the appointment as COMPLETED.
- Removes it from Today's Queue.
- Updates Patient History.
- The originally booked service, package and pricing can never be modified during checkout.

### Capability 7: Milestone 2 Regression & Business Acceptance Tests
- Independently test and verify all capabilities.

## Definition of Done
Milestone 2 is complete only when:
- [ ] Reception Login works
- [ ] Dashboard works
- [ ] Queue works
- [ ] Patient Search works
- [ ] Patient Workspace works
- [ ] Manual Reception Booking works
- [ ] Financial Summary works
- [ ] Reception Checkout works
- [ ] All Business Acceptance Tests pass
