import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { AppLockProvider } from './contexts/AppLockContext'
import { NotificationProvider } from './contexts/NotificationContext'
import './index.css'
import HomePage from './pages/HomePage'
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
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <StartupScreen />;
  return isAuthenticated ? children : <LoginPage />;
}

function PublicRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <StartupScreen />;
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
}

function StartupScreen() {
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
      <p className="text-sm font-medium text-text-secondary">Opening Finances Tracker…</p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicRoute><HomePage /></PublicRoute>
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
    element: <PublicRoute><LoginPage /></PublicRoute>
  },
  {
    path: '/register',
    element: <PublicRoute><RegisterPage /></PublicRoute>
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <AppLockProvider>
            <RouterProvider router={router} />
          </AppLockProvider>
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
)
