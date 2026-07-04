# Pain Away — Business Context (Frozen)

> **Status:** FROZEN
>
> **Last Updated:** 2026-07-04
>
> **Authority:** This document is the permanent source of truth for all implementation.
>
> Business rules documented here must never be redesigned during implementation.
> Changes require explicit approval from the project owner.

---

## 1. Product Vision

A production-grade Clinic Operating System purpose-built for **Pain Away**, a single physical therapy clinic located in Pune.

The platform replaces the clinic's entirely manual appointment booking and billing process with a modern, production-ready web platform.

This is **not** a generic appointment booking application. Every business workflow exactly matches the clinic's real-world operations.

The primary objective is to simplify appointment booking for patients while giving receptionists and directors complete operational control.

---

## 2. Clinic

- Single clinic only.
- Never design for multi-clinic or SaaS.
- One appointment slot serves exactly one patient.
- The clinic is closed every Wednesday.
- All business times use **Asia/Kolkata (IST)**.

---

## 3. Primary Users

| User | Role |
|---|---|
| Patient | Books appointments, interacts with the clinic via a patient portal |
| Receptionist | Manages day-to-day operations — scheduling, billing, patient check-in/flow |
| Director | Oversight of the entire clinic — dashboards, reports, operational control |

---

## 4. Appointment Scheduling

### 4.1 Fixed Slots Per Day

| Slot | Time |
|------|------|
| 1 | 11:00 – 12:00 |
| 2 | 12:00 – 13:00 |
| 3 | 13:00 – 14:00 |
| — | Break |
| 4 | 15:00 – 16:00 |
| 5 | 16:00 – 17:00 |

### 4.2 Capacity

- Maximum **5 appointments** per working day.

### 4.3 Public Booking Rules

- Booking window: **today**, **tomorrow**, **day after tomorrow** (3-day window).
- Same-day booking closes at exactly **9:00 AM IST**.
- No login required.
- Advance payment is **mandatory** for public bookings.

### 4.4 Reception Override Rules

- Reception can manually override most public booking restrictions (e.g., booking beyond the 3-day window, past the 9:00 AM cutoff).
- Reception may create manual appointments **without** collecting an advance payment.
- **Cannot override:**
  - No double-booking a slot. One slot = one patient. Absolute.
  - No booking on Wednesday. The clinic is closed. No exceptions.

---

## 5. Booking Workflow (Patient-Facing)

1. Patient opens booking link.
2. No login required.
3. Patient selects service/package.
4. Patient selects an available slot.
5. Patient enters personal details.
6. Mandatory advance payment.
7. Appointment confirmed.
8. Booking receipt generated.

---

## 6. Billing Workflow

- Billing owns all financial records.
- Advance payment during booking creates an **Advance Payment Record**.
- Advance payments are **non-refundable**.
- Booking receipt includes:
  - Service amount
  - Advance paid
  - Remaining amount
- Reception later collects only the **remaining balance**.
- Final bill is generated after checkout.

---

## 7. Patient Management

- Returning patients are identified by **mobile number**.
- Patient history must be preserved.
- Basic address is required.

---

## 8. Cancellation and Rescheduling

- Advance payments are **non-refundable**.
- If a patient cannot attend, **reception manually manages rescheduling** according to clinic policy.

---

## 9. Communication

- **WhatsApp** is the primary communication channel.
- Messages include:
  - Booking confirmation
  - Receipt
  - Reminder
  - Follow-up
  - Product recommendations

---

## 10. Products

- Clinic products are sold after treatment.
- Delivery will be handled by external partners in the future.
- Inventory management is **outside current scope**.

---

## 11. AI

- AI acts only as an assistant.
- AI **never** writes directly to business data.
- AI **never** bypasses business rules.

---

## 12. Project Development Rules

- Architecture is frozen before implementation begins.
- Business rules are never redesigned during coding.
- One milestone is implemented at a time.
- Every milestone must pass **Business Acceptance Tests** before moving to the next.

---

## 13. Constraints That Must Never Be Violated

1. No double-booking. One slot = one patient. Absolute.
2. No Wednesday bookings. The clinic is closed. No override.
3. Single clinic only. No multi-tenant, no multi-location, no SaaS.
4. Business rules are frozen during implementation.
5. Architecture is frozen before coding begins.
6. One milestone at a time. Each must pass Business Acceptance Tests.
7. AI never writes to business data and never bypasses business rules.
8. Public bookings require mandatory advance payment.
9. Advance payments are non-refundable.
10. Same-day public booking closes at exactly 9:00 AM IST.
11. Maximum 5 appointments per working day.
12. Billing owns financial records.
13. All business times use Asia/Kolkata (IST).

---

## 14. Future Modules

1. Appointment Booking
2. Reception Operations
3. Billing
4. Patient Management
5. Service & Package Management
6. Product Selling
7. WhatsApp Communication
8. Reports
9. Director Dashboard
10. Patient Portal
