# Patient Experience Platform: Implementation Plan

## 1. Business Vision
Build a modern, public-facing platform that provides seamless access to clinic services, product catalogs, and patient history. The platform empowers patients with a dedicated profile while preserving the friction-free, guest appointment booking workflow. It extends the existing Clinic Operating System and Inventory & Commerce Core, prioritizing usability, aesthetic excellence, and strict modular boundaries.

## 2. Scope
The platform includes:
- Public Website (Global navigation, Home, Services, Products)
- Guest Appointment Booking (No authentication required)
- Patient Authentication (OTP-based login via Mobile Number)
- Patient Portal (Profile dashboard, Appointments, Orders, Receipts, Bills)

## 3. Phase Roadmap & Capability Order

### Phase 1: Website Navigation
- **Capability 1**: Global Navigation
- **Capability 2**: Authentication
- **Capability 3**: Patient Session

### Phase 2: Services
- **Capability 4**: Services Page
- **Capability 5**: Service Detail Page
- **Capability 6**: Booking Integration

### Phase 3: Products
- **Capability 7**: Product Listing
- **Capability 8**: Product Detail Page
- **Capability 9**: Commerce Integration

### Phase 4: Patient Portal
- **Capability 10**: Profile Dashboard
- **Capability 11**: Appointments
- **Capability 12**: Orders
- **Capability 13**: Receipts & Bills

### Phase 5: Website Polish
- **Capability 14**: Responsive Optimization
- **Capability 15**: Search
- **Capability 16**: UI Refinement

## 4. Navigation Architecture
- **Global Navigation Bar**: Consistent across all public pages. Contains links to Home, Services, Products, and Sign In.
- **Post-Login State**: Upon successful authentication, the "Sign In" button is replaced by a "Profile" icon.
- **Pages**:
  - `Home`: Main landing page.
  - `Services`: Displays all clinic services with pricing, timing, and a "Book Appointment" CTA.
  - `Products`: Public-facing product catalog (no auth required to browse).
  - `Profile`: Protected route displaying patient history and profile info.

## 5. Authentication Architecture
- **Method**: Exclusively Mobile Number + OTP verification.
- **Exclusions**: No email, password, Google, or social login.
- **Guest Booking**: Authentication is strictly optional for booking appointments. Guest bookings use a shared, public link.
- **Access**: Authentication is only required to access the Patient Portal (Profile, History, Bills).

## 6. Patient/User Relationship
- **Identity Model**: 
  - `Patient` = The core business entity.
  - `User` = The authentication entity.
- **Mapping**: One User Account links directly to one Patient.
- **History Ownership**: All clinical history, appointments, receipts, bills, and orders belong exclusively to the `Patient` entity, never the `User` entity.
- **Resolution Flow**:
  - If a Patient exists during OTP verification: Link or create the corresponding User Account.
  - If no Patient exists: Create an empty User Account. Subsequent bookings will automatically create/link the associated Patient.

## 7. Integration Points
- **Clinic OS APIs**: Integrates with existing booking and scheduling endpoints for the "Book Appointment" flow.
- **Inventory & Commerce APIs**: Consumes product catalog data and handles commerce integration.
- **Shared Infrastructure**: Relies on existing API gateways and shared models.

## 8. Engineering Constraints
- The public website must remain distinct and separate from the internal Clinic Portal.
- The public website will consume existing backend APIs; no duplicate business logic will be created.
- Module boundaries between the Patient Platform and Core Domains must be strictly preserved.
- Existing booking workflow must be reused.

## 9. Future Extension Strategy
- **Telemedicine Integration**: Easily extensible to support online consultations linked to the Patient profile.
- **Subscription Services**: Ready to integrate commerce subscriptions for regular products.
- **Loyalty Program**: The distinct User authentication entity lays the groundwork for future patient loyalty rewards.
