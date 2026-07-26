import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import './App.css'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: isAuthenticated ? <DashboardPage /> : <LoginPage />
  },
  {
    path: '/register',
    element: isAuthenticated ? <DashboardPage /> : <RegisterPage />
  },
  {
    path: '/dashboard',
    element: isAuthenticated ? <DashboardPage /> : <LoginPage />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
