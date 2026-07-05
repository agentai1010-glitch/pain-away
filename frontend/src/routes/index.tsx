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
import ProductListPage from "@/pages/director/inventory/ProductListPage";
import ProductFormPage from "@/pages/director/inventory/ProductFormPage";
import CategoryListPage from "@/pages/director/inventory/CategoryListPage";
import CategoryFormPage from "@/pages/director/inventory/CategoryFormPage";
import BrandListPage from "@/pages/director/inventory/BrandListPage";
import BrandFormPage from "@/pages/director/inventory/BrandFormPage";
import SupplierListPage from "@/pages/director/inventory/SupplierListPage";
import SupplierFormPage from "@/pages/director/inventory/SupplierFormPage";
import WarehouseListPage from "@/pages/director/inventory/WarehouseListPage";
import WarehouseFormPage from "@/pages/director/inventory/WarehouseFormPage";
import InventoryListPage from "@/pages/director/inventory/InventoryListPage";
import StockMovementListPage from "@/pages/director/inventory/StockMovementListPage";
import PurchaseOrderListPage from "@/pages/director/inventory/PurchaseOrderListPage";
import PurchaseOrderFormPage from "@/pages/director/inventory/PurchaseOrderFormPage";
import GoodsReceivingListPage from "@/pages/director/inventory/GoodsReceivingListPage";
import { CustomerOrderListPage } from '@/pages/director/inventory/CustomerOrderListPage';
import { CustomerOrderFormPage } from '@/pages/director/inventory/CustomerOrderFormPage';
import { CustomerOrderDetailPage } from '@/pages/director/inventory/CustomerOrderDetailPage';
import { ReportsPage } from '@/pages/director/inventory/ReportsPage';
import ReceiveGoodsFormPage from "@/pages/director/inventory/ReceiveGoodsFormPage";
import ClinicPortalLandingPage from "@/pages/internal/ClinicPortalLandingPage";
import DirectorLoginPage from "@/pages/director/DirectorLoginPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PublicLayout from "@/components/public/PublicLayout";
import ServicesPage from "@/pages/public/ServicesPage";
import ServiceDetailPage from "@/pages/public/ServiceDetailPage";
import ProductsPage from "@/pages/public/ProductsPage";
import SignInPage from "@/pages/public/SignInPage";
import ProfilePage from "@/pages/public/ProfilePage";

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
        
        {/* Director Inventory & Commerce Routes */}
        <Route path="/director/inventory/reports" element={<ProtectedRoute role="director"><ReportsPage /></ProtectedRoute>} />
        <Route path="/director/inventory/products" element={<ProtectedRoute role="director"><ProductListPage /></ProtectedRoute>} />
        <Route path="/director/inventory/products/new" element={<ProtectedRoute role="director"><ProductFormPage /></ProtectedRoute>} />
        <Route path="/director/inventory/products/:id/edit" element={<ProtectedRoute role="director"><ProductFormPage /></ProtectedRoute>} />
        
        <Route path="/director/inventory/categories" element={<ProtectedRoute role="director"><CategoryListPage /></ProtectedRoute>} />
        <Route path="/director/inventory/categories/new" element={<ProtectedRoute role="director"><CategoryFormPage /></ProtectedRoute>} />
        <Route path="/director/inventory/categories/:id/edit" element={<ProtectedRoute role="director"><CategoryFormPage /></ProtectedRoute>} />
        
        <Route path="/director/inventory/brands" element={<ProtectedRoute role="director"><BrandListPage /></ProtectedRoute>} />
        <Route path="/director/inventory/brands/new" element={<ProtectedRoute role="director"><BrandFormPage /></ProtectedRoute>} />
        <Route path="/director/inventory/brands/:id/edit" element={<ProtectedRoute role="director"><BrandFormPage /></ProtectedRoute>} />
        
        <Route path="/director/inventory/suppliers" element={<ProtectedRoute role="director"><SupplierListPage /></ProtectedRoute>} />
        <Route path="/director/inventory/suppliers/new" element={<ProtectedRoute role="director"><SupplierFormPage /></ProtectedRoute>} />
        <Route path="/director/inventory/suppliers/:id/edit" element={<ProtectedRoute role="director"><SupplierFormPage /></ProtectedRoute>} />
        
        <Route path="/director/inventory/warehouses" element={<ProtectedRoute role="director"><WarehouseListPage /></ProtectedRoute>} />
        <Route path="/director/inventory/warehouses/new" element={<ProtectedRoute role="director"><WarehouseFormPage /></ProtectedRoute>} />
        <Route path="/director/inventory/warehouses/:id/edit" element={<ProtectedRoute role="director"><WarehouseFormPage /></ProtectedRoute>} />

        <Route path="/director/inventory" element={<ProtectedRoute role="director"><InventoryListPage /></ProtectedRoute>} />
        <Route path="/director/inventory/movements" element={<ProtectedRoute role="director"><StockMovementListPage /></ProtectedRoute>} />
        
        <Route path="/director/inventory/purchase-orders" element={<ProtectedRoute role="director"><PurchaseOrderListPage /></ProtectedRoute>} />
        <Route path="/director/inventory/purchase-orders/new" element={<ProtectedRoute role="director"><PurchaseOrderFormPage /></ProtectedRoute>} />
        <Route path="/director/inventory/purchase-orders/:id/edit" element={<ProtectedRoute role="director"><PurchaseOrderFormPage /></ProtectedRoute>} />
        
        <Route path="/director/inventory/goods-receiving" element={<ProtectedRoute role="director"><GoodsReceivingListPage /></ProtectedRoute>} />
        <Route path="/director/inventory/goods-receiving/new/:poId" element={<ProtectedRoute role="director"><ReceiveGoodsFormPage /></ProtectedRoute>} />
        
        <Route path="/director/inventory/customer-orders" element={<ProtectedRoute role="director"><CustomerOrderListPage /></ProtectedRoute>} />
        <Route path="/director/inventory/customer-orders/new" element={<ProtectedRoute role="director"><CustomerOrderFormPage /></ProtectedRoute>} />
        <Route path="/director/inventory/customer-orders/:id" element={<ProtectedRoute role="director"><CustomerOrderDetailPage /></ProtectedRoute>} />

        {/* Catch-all route to redirect unknowns to the internal portal landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Public Pages with Global Navigation */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
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
          
          {/* Director Inventory & Commerce Routes */}
          <Route path="/director/inventory/reports" element={<ProtectedRoute role="director"><ReportsPage /></ProtectedRoute>} />
          <Route path="/director/inventory/products" element={<ProtectedRoute role="director"><ProductListPage /></ProtectedRoute>} />
          <Route path="/director/inventory/products/new" element={<ProtectedRoute role="director"><ProductFormPage /></ProtectedRoute>} />
          <Route path="/director/inventory/products/:id/edit" element={<ProtectedRoute role="director"><ProductFormPage /></ProtectedRoute>} />

          <Route path="/director/inventory/categories" element={<ProtectedRoute role="director"><CategoryListPage /></ProtectedRoute>} />
          <Route path="/director/inventory/categories/new" element={<ProtectedRoute role="director"><CategoryFormPage /></ProtectedRoute>} />
          <Route path="/director/inventory/categories/:id/edit" element={<ProtectedRoute role="director"><CategoryFormPage /></ProtectedRoute>} />
          
          <Route path="/director/inventory/brands" element={<ProtectedRoute role="director"><BrandListPage /></ProtectedRoute>} />
          <Route path="/director/inventory/brands/new" element={<ProtectedRoute role="director"><BrandFormPage /></ProtectedRoute>} />
          <Route path="/director/inventory/brands/:id/edit" element={<ProtectedRoute role="director"><BrandFormPage /></ProtectedRoute>} />
          
          <Route path="/director/inventory/suppliers" element={<ProtectedRoute role="director"><SupplierListPage /></ProtectedRoute>} />
          <Route path="/director/inventory/suppliers/new" element={<ProtectedRoute role="director"><SupplierFormPage /></ProtectedRoute>} />
          <Route path="/director/inventory/suppliers/:id/edit" element={<ProtectedRoute role="director"><SupplierFormPage /></ProtectedRoute>} />
          
          <Route path="/director/inventory/warehouses" element={<ProtectedRoute role="director"><WarehouseListPage /></ProtectedRoute>} />
          <Route path="/director/inventory/warehouses/new" element={<ProtectedRoute role="director"><WarehouseFormPage /></ProtectedRoute>} />
          <Route path="/director/inventory/warehouses/:id/edit" element={<ProtectedRoute role="director"><WarehouseFormPage /></ProtectedRoute>} />

          <Route path="/director/inventory" element={<ProtectedRoute role="director"><InventoryListPage /></ProtectedRoute>} />
          <Route path="/director/inventory/movements" element={<ProtectedRoute role="director"><StockMovementListPage /></ProtectedRoute>} />
          
          <Route path="/director/inventory/purchase-orders" element={<ProtectedRoute role="director"><PurchaseOrderListPage /></ProtectedRoute>} />
          <Route path="/director/inventory/purchase-orders/new" element={<ProtectedRoute role="director"><PurchaseOrderFormPage /></ProtectedRoute>} />
          <Route path="/director/inventory/purchase-orders/:id/edit" element={<ProtectedRoute role="director"><PurchaseOrderFormPage /></ProtectedRoute>} />
          
          <Route path="/director/inventory/goods-receiving" element={<ProtectedRoute role="director"><GoodsReceivingListPage /></ProtectedRoute>} />
          <Route path="/director/inventory/goods-receiving/new/:poId" element={<ProtectedRoute role="director"><ReceiveGoodsFormPage /></ProtectedRoute>} />
        </>
      )}

      {/* Catch-all route to redirect unknowns to the landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
