import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import type { ReactNode } from 'react';
import './App.css';
import { getCurrentPortalUser } from './auth/session';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Projects from './pages/Projects';
import NewProjectRequest from './pages/NewProjectRequest';
import ProjectDetail from './pages/ProjectDetail';
import QuoteDetail from './pages/QuoteDetail';
import InvoiceDetail from './pages/InvoiceDetail';
import Quotes from './pages/Quotes';
import AdminClients from './pages/AdminClients';
import AdminInvoices from './pages/AdminInvoices';
import AdminPayments from './pages/AdminPayments';
import AdminProjects from './pages/AdminProjects';
import AdminProductsServices from './pages/AdminProductsServices';
import AdminQuotes from './pages/AdminQuotes';
import AdminStaff from './pages/AdminStaff';
import AdminWeeklyReports from './pages/AdminWeeklyReports';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';

function RequireAuth({ adminOnly = false }: { adminOnly?: boolean }) {
  const user = getCurrentPortalUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!adminOnly && (user.role === 'admin' || user.role === 'staff')) {
    return <Navigate to="/admin/clients" replace />;
  }

  if (adminOnly && user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/" replace />;
  }

  return <MainLayout />;
}

function RequireAdminPage({ children }: { children: ReactNode }) {
  const user = getCurrentPortalUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/admin/clients" replace />;
  }

  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      { index: true, element: <Home /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <ProjectDetail /> },
      { path: 'new', element: <NewProjectRequest /> },
      { path: 'quotes', element: <Quotes /> },
      { path: 'quotes/:id', element: <QuoteDetail /> },
      { path: 'documents', element: <Documents /> },
      { path: 'invoices', element: <Invoices /> },
      { path: 'invoices/:id', element: <InvoiceDetail /> },
      { path: 'payments', element: <Payments /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: '/admin',
    element: <RequireAuth adminOnly />,
    children: [
      { path: 'clients', element: <AdminClients /> },
      { path: 'projects', element: <AdminProjects /> },
      { path: 'products-services', element: <AdminProductsServices /> },
      { path: 'quotes', element: <AdminQuotes /> },
      { path: 'invoices', element: <AdminInvoices /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'documents', element: <Documents /> },
      { path: 'reports', element: <AdminWeeklyReports /> },
      { path: 'staff', element: <RequireAdminPage><AdminStaff /></RequireAdminPage> },
      { path: '*', element: <Navigate to="/admin/clients" replace /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/reset-password', element: <ResetPassword /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
