import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

function getInitialTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') return saved
  return 'light'
}

function getInitialAccentColor(): string {
  return localStorage.getItem('accentColor') || '#5b8a72'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App themeMode={getInitialTheme()} />
    </BrowserRouter>
  </React.StrictMode>,
)
