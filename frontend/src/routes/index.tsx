import { Routes, Route, Navigate } from "react-router-dom";
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
import ClinicPortalLandingPage from "@/pages/internal/ClinicPortalLandingPage";
import DirectorLoginPage from "@/pages/director/DirectorLoginPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

/**
 * Application route definitions.
 */
const isPublicOnly = import.meta.env.VITE_DEPLOY_TARGET === "public";
const isInternalOnly = import.meta.env.VITE_DEPLOY_TARGET === "internal";

function AppRoutes() {
  if (isInternalOnly) {
    return (
      <Routes>
        <Route path="/" element={<ClinicPortalLandingPage />} />
        
        {/* Reception Routes */}
        <Route path="/reception" element={<ReceptionLoginPage />} />
        <Route path="/reception/login" element={<Navigate to="/reception" replace />} />
        <Route path="/reception/dashboard" element={<ProtectedRoute role="reception"><ReceptionDashboardPage /></ProtectedRoute>} />
        <Route path="/reception/new-appointment" element={<ProtectedRoute role="reception"><NewAppointmentPage /></ProtectedRoute>} />
        <Route path="/reception/queue" element={<ProtectedRoute role="reception"><QueuePage /></ProtectedRoute>} />
        <Route path="/reception/patient/:id" element={<ProtectedRoute role="reception"><PatientWorkspacePage /></ProtectedRoute>} />
        <Route path="/reception/checkout/:appointmentId" element={<ProtectedRoute role="reception"><CheckoutPage /></ProtectedRoute>} />
        
        {/* Director Routes */}
        <Route path="/director" element={<DirectorLoginPage />} />
        <Route path="/director/login" element={<Navigate to="/director" replace />} />
        <Route path="/director/dashboard" element={<ProtectedRoute role="director"><DirectorDashboardPage /></ProtectedRoute>} />
        <Route path="/director/queue" element={<ProtectedRoute role="director"><DirectorQueuePage /></ProtectedRoute>} />
        <Route path="/director/patient/:id" element={<ProtectedRoute role="director"><DirectorPatientWorkspacePage /></ProtectedRoute>} />
        <Route path="/director/services" element={<ProtectedRoute role="director"><ServiceManagementPage /></ProtectedRoute>} />
        <Route path="/director/holidays" element={<ProtectedRoute role="director"><HolidayManagementPage /></ProtectedRoute>} />

        {/* Catch-all route to redirect unknowns to the internal portal landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

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

      {/* Internal Routes - Excluded from public build via tree shaking */}
      {!isPublicOnly && (
        <>
          {/* Reception Routes (No root layout) */}
          <Route path="/reception" element={<ReceptionLoginPage />} />
          <Route path="/reception/login" element={<Navigate to="/reception" replace />} />
          <Route path="/reception/dashboard" element={<ProtectedRoute role="reception"><ReceptionDashboardPage /></ProtectedRoute>} />
          <Route path="/reception/new-appointment" element={<ProtectedRoute role="reception"><NewAppointmentPage /></ProtectedRoute>} />
          <Route path="/reception/queue" element={<ProtectedRoute role="reception"><QueuePage /></ProtectedRoute>} />
          <Route path="/reception/patient/:id" element={<ProtectedRoute role="reception"><PatientWorkspacePage /></ProtectedRoute>} />
          <Route path="/reception/checkout/:appointmentId" element={<CheckoutPage />} />
          
          {/* Director Routes */}
          <Route path="/director" element={<DirectorLoginPage />} />
          <Route path="/director/login" element={<Navigate to="/director" replace />} />
          <Route path="/director/dashboard" element={<ProtectedRoute role="director"><DirectorDashboardPage /></ProtectedRoute>} />
          <Route path="/director/queue" element={<ProtectedRoute role="director"><DirectorQueuePage /></ProtectedRoute>} />
          <Route path="/director/patient/:id" element={<ProtectedRoute role="director"><DirectorPatientWorkspacePage /></ProtectedRoute>} />
          <Route path="/director/services" element={<ProtectedRoute role="director"><ServiceManagementPage /></ProtectedRoute>} />
          <Route path="/director/holidays" element={<ProtectedRoute role="director"><HolidayManagementPage /></ProtectedRoute>} />
        </>
      )}

      {/* Catch-all route to redirect unknowns to the landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
