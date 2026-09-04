import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import HomeScreen from './pages/HomeScreen'
import ReportsScreen from './pages/ReportsScreen'
import PlanScreen from './pages/PlanScreen'
import SettingsScreen from './pages/SettingsScreen'
import TransactionsPage from './pages/TransactionsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Apply the saved appearance before the first screen paints.
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

function ProtectedRoute({ children }: { children: React.JSX.Element }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <LoginPage />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><HomeScreen /></ProtectedRoute>
  },
  {
    path: '/home',
    element: <ProtectedRoute><HomeScreen /></ProtectedRoute>
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><HomeScreen /></ProtectedRoute>
  },
  {
    path: '/reports',
    element: <ProtectedRoute><ReportsScreen /></ProtectedRoute>
  },
  {
    path: '/plan',
    element: <ProtectedRoute><PlanScreen /></ProtectedRoute>
  },
  {
    path: '/transactions',
    element: <ProtectedRoute><TransactionsPage /></ProtectedRoute>
  },
  {
    path: '/settings',
    element: <ProtectedRoute><SettingsScreen /></ProtectedRoute>
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
