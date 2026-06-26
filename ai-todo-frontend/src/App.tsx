import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { ConfigProvider, theme } from 'antd'
import Login from './pages/Login'
import Layout from './components/common/Layout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Pomodoro from './pages/Pomodoro'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

interface AppProps {
  themeMode: 'dark' | 'light'
}

function App({ themeMode }: AppProps) {
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>(themeMode)
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#5b8a72')

  useEffect(() => {
    setCurrentTheme(themeMode)
  }, [themeMode])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.theme) {
        setCurrentTheme(detail.theme)
        document.documentElement.setAttribute('data-theme', detail.theme)
      }
      if (detail?.accentColor) {
        setAccentColor(detail.accentColor)
        document.documentElement.style.setProperty('--nature-primary', detail.accentColor)
      }
    }
    window.addEventListener('themeChange', handler)
    return () => window.removeEventListener('themeChange', handler)
  }, [])

  // apply initial CSS vars
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
    document.documentElement.style.setProperty('--nature-primary', accentColor)
  }, [])

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setCurrentTheme(newTheme)
  }

  const isDark = currentTheme === 'dark'

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: accentColor,
          borderRadius: 10,
          colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
          colorBgLayout: isDark ? '#141414' : '#f8f5f0',
          colorBorder: isDark ? '#333333' : '#e8e2d9',
          colorBorderSecondary: isDark ? '#2a2a2a' : '#f0ebe3',
          colorText: isDark ? '#e0e0e0' : '#2d2a26',
          colorTextSecondary: isDark ? '#a0a0a0' : '#7a756f',
          colorTextTertiary: isDark ? '#888888' : '#a09a93',
          fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 14,
          colorSuccess: '#6aab73',
          colorWarning: '#d4a24e',
          colorError: '#c75c5c',
          colorInfo: '#6a9fc7',
        },
        components: {
          Menu: {
            itemSelectedColor: accentColor,
            itemSelectedBg: isDark ? 'rgba(255,255,255,0.08)' : '#e4efe9',
            itemHoverColor: accentColor,
            itemHoverBg: isDark ? 'rgba(255,255,255,0.05)' : '#f0ebe3',
          },
          Card: {
            borderRadius: 14,
          },
          Button: {
            borderRadius: 10,
            primaryShadow: `0 4px 12px ${accentColor}4d`,
          },
          Input: {
            borderRadius: 10,
            colorBorder: isDark ? '#333333' : '#e8e2d9',
          },
          Select: {
            borderRadius: 10,
          },
          Tag: {
            borderRadiusSM: 6,
          },
        },
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout onThemeChange={handleThemeChange} />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="pomodoro" element={<Pomodoro />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </ConfigProvider>
  )
}

export default App
