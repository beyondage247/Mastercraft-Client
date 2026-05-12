import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './App.css';
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
