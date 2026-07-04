# Milestone 1 — Public Appointment Booking

> **Status:** FROZEN
>
> **Source of Truth:** [BUSINESS_CONTEXT.md](../BUSINESS_CONTEXT.md)
>
> This document defines the scope and acceptance criteria for Milestone 1.
> It must not be modified during implementation.

---

## 1. Milestone Objective

Enable patients to book appointments at Pain Away through a public booking link — without login — by selecting a service, choosing an available slot, providing personal details, and completing a mandatory advance payment. The appointment is confirmed only after successful payment, and the patient receives a booking receipt and WhatsApp confirmation.

---

## 2. Business Scope

This milestone delivers the complete **patient-facing public booking workflow** as defined in the frozen business context:

1. Patient opens booking link.
2. No login required.
3. Patient enters personal details (Name, Mobile, Address). Identity is checked immediately.
4. If patient already has an active confirmed appointment: Stop flow, display welcome back, show booking summary, allow receipt download, no new booking allowed.
5. If new or no active appointment: Continue booking flow.
6. Patient selects service/package.
7. Patient selects an available slot.
8. Payment Summary is displayed.
9. Mandatory advance payment.
10. Appointment confirmed, slot occupied, and booking receipt generated automatically upon successful payment. No additional confirmation action required.
11. WhatsApp booking confirmation and receipt sent.

---

## 3. Included Modules

| Module | Responsibility in Milestone 1 |
|---|---|
| **catalog** | Expose available services/packages for patient selection. |
| **patient** | Capture and store patient details. Identify returning patients by mobile number. |
| **scheduling** | Manage fixed daily slots, enforce availability rules, create confirmed appointments. |
| **billing** | Record advance payment, generate booking receipt (service amount, advance paid, remaining balance). |
| **notification** | Send booking confirmation and receipt via WhatsApp. |
| **orchestration** | Coordinate the end-to-end public booking workflow across all modules. |

**Infrastructure modules** (`config`, `core`, `db`, `shared`) provide the foundational layer for all business modules.

---

## 4. Business Rules

All rules are derived from the frozen [BUSINESS_CONTEXT.md](../BUSINESS_CONTEXT.md).

### 4.1 Clinic

- Single clinic. No multi-clinic or SaaS.
- Closed every Wednesday. No exceptions.
- All business times use Asia/Kolkata (IST).

### 4.2 Appointment Slots

| Slot | Time |
|------|------|
| 1 | 11:00 – 12:00 |
| 2 | 12:00 – 13:00 |
| 3 | 13:00 – 14:00 |
| — | Break |
| 4 | 15:00 – 16:00 |
| 5 | 16:00 – 17:00 |

- Maximum 5 appointments per working day.
- One slot = one patient. No double-booking. Absolute.

### 4.3 Public Booking Rules

- No login required.
- Booking window: today, tomorrow, day after tomorrow (3-day window).
- Same-day booking closes at exactly 9:00 AM IST.
- Advance payment is mandatory. No confirmation without payment.
- Advance payments are non-refundable.

### 4.4 Patient Rules

- Returning patients identified by mobile number immediately upon entry.
- Patient history must be preserved.
- Basic address is required.
- If a patient (identified by mobile number) already has an active confirmed appointment, the system stops the booking flow, displays a welcome back message, shows the existing booking summary, allows receipt download, and does not allow a new booking.

### 4.5 Billing Rules

- Advance payment creates an Advance Payment Record.
- Booking receipt includes: service amount, advance paid, remaining balance.
- Billing owns all financial records.

### 4.6 Communication Rules

- WhatsApp is the primary communication channel.
- Booking confirmation sent via WhatsApp.
- Receipt sent via WhatsApp.

---

## 5. Success Criteria

Milestone 1 is complete when:

1. A patient can open the booking link and begin booking without login.
2. Available services/packages are displayed for selection.
3. Available slots are displayed for the 3-day booking window.
4. Wednesday dates are never shown as bookable.
5. Same-day slots are hidden after 9:00 AM IST.
6. Already-booked slots are not available for selection.
7. The 5-appointment-per-day limit is enforced.
8. Patient enters mobile number, name, and basic address at the start of the progressive flow.
9. Returning patients are recognized by mobile number. If they have an active booking, flow stops, welcome message and summary are shown, receipt is downloadable, and no new booking is allowed.
10. Advance payment is collected before confirmation.
11. After successful advance payment, appointment is automatically confirmed, slot is occupied, and booking receipt is automatically generated. No additional confirmation action is required.
13. WhatsApp booking confirmation is sent.
14. WhatsApp receipt is sent.
15. No double-booking is possible under any circumstance.

---

## 6. Out of Scope

The following are explicitly **not** part of Milestone 1:

- Reception operations and manual booking.
- Reception override rules (booking beyond 3-day window, past 9 AM cutoff, without advance payment).
- Cancellation and rescheduling.
- Remaining balance collection at the clinic.
- Final bill generation after checkout.
- Product selling.
- WhatsApp reminders, follow-ups, and product recommendations.
- Director dashboard.
- Reports.
- Patient portal (beyond the booking flow).
- AI features.
- Inventory management.

---

## 7. Business Acceptance Tests

Each test validates a frozen business rule. All must pass before Milestone 1 is approved.

### BAT-01: Booking Without Login
- Patient accesses the booking link.
- No login or signup is required.
- Patient proceeds directly to service selection.

### BAT-02: Service Selection
- Patient sees a list of available services/packages.
- Patient selects one service/package.

### BAT-03: Slot Availability — 3-Day Window
- Patient sees available slots for today, tomorrow, and day after tomorrow only.
- No dates beyond this window are shown.

### BAT-04: Slot Availability — Wednesday Block
- If any date in the 3-day window falls on a Wednesday, that date shows zero available slots or is not selectable.

### BAT-05: Slot Availability — Same-Day 9 AM Cutoff
- If the current time is before 9:00 AM IST, today's slots are available.
- If the current time is 9:00 AM IST or later, today's slots are not available.

### BAT-06: Slot Availability — No Double-Booking
- A slot that is already booked by another patient is not available for selection.
- Under no circumstance can two patients book the same slot.

### BAT-07: Slot Availability — 5-Appointment Daily Limit
- If all 5 slots for a given day are booked, no further slots are available for that day.

### BAT-08: Patient Details — New Patient or No Active Booking
- Patient enters mobile number, name, and basic address at the beginning of the progressive flow.
- A new patient record is created if they do not exist, and the flow continues.

### BAT-09: Patient Details — Returning Patient with Active Booking
- Patient enters a mobile number that already has an active confirmed appointment.
- The system stops the booking flow.
- The system displays a welcome back message and the existing booking summary.
- The system allows receipt download.
- The system prevents creating a new booking.

### BAT-10: Advance Payment — Mandatory
- Patient cannot confirm the appointment without completing advance payment.
- No bypass is possible from the public booking flow.

### BAT-11: Advance Payment — Non-Refundable
- The advance payment record is marked as non-refundable.

### BAT-12: Appointment Confirmation
- Appointment is confirmed only after successful advance payment.
- The confirmed appointment is linked to the patient, service, slot, and payment record.

### BAT-13: Booking Receipt
- A booking receipt is generated containing:
  - Service amount
  - Advance paid
  - Remaining balance

### BAT-14: WhatsApp — Booking Confirmation
- A booking confirmation message is sent to the patient's mobile number via WhatsApp.

### BAT-15: WhatsApp — Receipt
- The booking receipt is sent to the patient's mobile number via WhatsApp.
