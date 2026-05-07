import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'

const router = getRouter()

// Dynamic platform tagging for CSS bifurcation
if (import.meta.env.VITE_SPA) {
  document.body.classList.add('mobile-ui');
} else {
  document.body.classList.remove('mobile-ui');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
