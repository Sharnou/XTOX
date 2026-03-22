import React from 'react'
import ReactDOM from 'react-dom/client'
import { aiHealer } from '@/lib/aiSelfHealer'
import App from '@/App.jsx'
import '@/index.css'

// Start AI error detection early
if (typeof window !== "undefined") {
  aiHealer.init?.();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
