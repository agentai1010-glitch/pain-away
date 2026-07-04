import { Routes, Route } from "react-router-dom";
import RootLayout from "@/components/layout/RootLayout";
import LandingPage from "@/pages/landing/LandingPage";
import CatalogPage from "@/pages/catalog/CatalogPage";
import BookingFlowPage from "@/pages/orchestration/BookingFlowPage";
import RebookPage from "@/pages/orchestration/RebookPage";
import ReceptionLoginPage from "@/pages/reception/ReceptionLoginPage";
import ReceptionDashboardPage from "@/pages/reception/ReceptionDashboardPage";
import QueuePage from "@/pages/reception/QueuePage";
import PatientWorkspacePage from "@/pages/reception/PatientWorkspacePage";
import NewAppointmentPage from "@/pages/reception/NewAppointmentPage";
import CheckoutPage from "@/pages/reception/CheckoutPage";
import DirectorDashboardPage from "@/pages/director/DirectorDashboardPage";
import ServiceManagementPage from "@/pages/director/ServiceManagementPage";
import HolidayManagementPage from "@/pages/director/HolidayManagementPage";
import DirectorPatientWorkspacePage from "@/pages/director/DirectorPatientWorkspacePage";
import DirectorQueuePage from "@/pages/director/DirectorQueuePage";

/**
 * Application route definitions.
 * Landing page is the public homepage.
 * Business routes are added per milestone.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />
      {/* Patient Booking Flow */}
      <Route path="/catalog" element={<RootLayout />}>
        <Route index element={<CatalogPage />} />
      </Route>
      <Route path="/book" element={<RootLayout />}>
        <Route index element={<BookingFlowPage />} />
      </Route>
      <Route path="/rebook/:eligibilityId" element={<RootLayout />}>
        <Route index element={<RebookPage />} />
      </Route>
      {/* Reception Routes (No root layout) */}
      <Route path="/reception/login" element={<ReceptionLoginPage />} />
      <Route path="/reception/dashboard" element={<ReceptionDashboardPage />} />
      <Route path="/reception/new-appointment" element={<NewAppointmentPage />} />
      <Route path="/reception/queue" element={<QueuePage />} />
      <Route path="/reception/patient/:id" element={<PatientWorkspacePage />} />
      <Route path="/reception/checkout/:appointmentId" element={<CheckoutPage />} />
      <Route path="/reception" element={<ReceptionDashboardPage />} />
      {/* Director Routes */}
      <Route path="/director" element={<DirectorDashboardPage />} />
      <Route path="/director/queue" element={<DirectorQueuePage />} />
      <Route path="/director/patient/:id" element={<DirectorPatientWorkspacePage />} />
      <Route path="/director/services" element={<ServiceManagementPage />} />
      <Route path="/director/holidays" element={<HolidayManagementPage />} />
    </Routes>
  );
}

export default AppRoutes;
