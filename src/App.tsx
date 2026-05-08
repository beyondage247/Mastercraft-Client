import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './App.css';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Projects from './pages/Projects';
import Quotes from './pages/Quotes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'projects', element: <Projects /> },
      { path: 'quotes', element: <Quotes /> },
      { path: 'documents', element: <Documents /> },
      { path: 'invoices', element: <Invoices /> },
      { path: 'payments', element: <Payments /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
