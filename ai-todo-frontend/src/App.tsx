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

  useEffect(() => {
    setCurrentTheme(themeMode)
  }, [themeMode])

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setCurrentTheme(newTheme)
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#5b8a72',
          borderRadius: 10,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f8f5f0',
          colorBorder: '#e8e2d9',
          colorBorderSecondary: '#f0ebe3',
          colorText: '#2d2a26',
          colorTextSecondary: '#7a756f',
          colorTextTertiary: '#a09a93',
          fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 14,
          colorSuccess: '#6aab73',
          colorWarning: '#d4a24e',
          colorError: '#c75c5c',
          colorInfo: '#6a9fc7',
        },
        components: {
          Menu: {
            itemSelectedColor: '#3d6b54',
            itemSelectedBg: '#e4efe9',
            itemHoverColor: '#5b8a72',
            itemHoverBg: '#f0ebe3',
          },
          Card: {
            borderRadius: 14,
          },
          Button: {
            borderRadius: 10,
            primaryShadow: '0 4px 12px rgba(91, 138, 114, 0.3)',
          },
          Input: {
            borderRadius: 10,
            colorBorder: '#e8e2d9',
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
