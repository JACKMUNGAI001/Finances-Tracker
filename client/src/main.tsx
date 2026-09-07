import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import './index.css'
import HomeScreen from './pages/HomeScreen'
import ProfilePage from './pages/ProfilePage'
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

const buildTimestamp = (import.meta as any).env?.BUILD_TIMESTAMP;
if (buildTimestamp && localStorage.getItem('app_build_timestamp') !== buildTimestamp) {
  localStorage.setItem('app_build_timestamp', buildTimestamp);
  window.location.reload();
}

function ProtectedRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuth();
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
    path: '/profile',
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
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
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
)
