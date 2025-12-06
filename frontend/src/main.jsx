// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css' // Tailwind base imports + app css
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ProviderProvider } from './context/ProviderContext'
import ToastManager from './components/notifications/ToastManager'

// If using Vite, import.meta.env is available. If using CRA use process.env.REACT_APP_API_BASE
if (!import.meta.env?.VITE_API_BASE_URL && !process.env.REACT_APP_API_BASE) {
  // it's okay — the apiClient has a fallback
  // console.warn('VITE_API_BASE_URL not set — apiClient will use default.')
}

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider should wrap the entire app to provide user state */}
      <AuthProvider>
        {/* Notifications require Auth to know user; keep it global */}
        <NotificationProvider>
          <ProviderProvider>
            <App />
            <ToastManager />
          </ProviderProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
