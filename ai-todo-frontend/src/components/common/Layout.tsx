import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  theme as antTheme,
} from 'antd'
import {
  DashboardOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import LeafOutlined from '../icons/LeafOutlined'
import { useAuthStore } from '../../store/authStore'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  onThemeChange?: (theme: 'dark' | 'light') => void
}

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/tasks', icon: <UnorderedListOutlined />, label: '任务列表' },
  { key: '/pomodoro', icon: <ClockCircleOutlined />, label: '番茄钟' },
  { key: '/statistics', icon: <BarChartOutlined />, label: '数据统计' },
  { key: '/settings', icon: <SettingOutlined />, label: '设置' },
]

export default function Layout({ onThemeChange }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#5b8a72')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.theme) setIsDark(detail.theme === 'dark')
      if (detail?.accentColor) setAccentColor(detail.accentColor)
    }
    window.addEventListener('themeChange', handler)
    return () => window.removeEventListener('themeChange', handler)
  }, [])

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ]

  const siderBg = isDark ? '#1a1a1a' : '#fdfcfa'
  const headerBg = isDark ? 'rgba(26,26,26,0.85)' : 'rgba(253, 252, 250, 0.85)'
  const contentBg = isDark ? 'rgba(31,31,31,0.6)' : 'rgba(255, 255, 255, 0.6)'
  const borderColor = isDark ? '#2a2a2a' : '#f0ebe3'
  const textMuted = isDark ? '#888888' : '#a09a93'
  const textSecondary = isDark ? '#a0a0a0' : '#7a756f'
  const textPrimary = isDark ? '#e0e0e0' : '#2d2a26'
  const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : '#e4efe9'
  const hoverBorder = isDark ? 'rgba(255,255,255,0.15)' : '#a8c9b6'
  const cardGradient = isDark ? 'linear-gradient(135deg, #2a2a2a, #1f1f1f)' : 'linear-gradient(135deg, #e4efe9, #f0ebe3)'

  return (
    <AntLayout style={{ minHeight: '100vh', background: isDark ? '#141414' : '#f8f5f0' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={isDark ? 'dark' : 'light'}
        style={{
          boxShadow: isDark ? '2px 0 16px rgba(0,0,0,0.3)' : '2px 0 16px rgba(45, 42, 38, 0.04)',
          zIndex: 10,
          borderRight: `1px solid ${borderColor}`,
          background: siderBg,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: collapsed ? 16 : 20,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: '-0.5px',
            fontFamily: "'Noto Serif SC', serif",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <LeafOutlined style={{ fontSize: collapsed ? 18 : 22 }} />
          {!collapsed && 'AI Todo'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          theme={isDark ? 'dark' : 'light'}
          style={{
            borderRight: 0,
            marginTop: 8,
            background: 'transparent',
            fontFamily: "'Noto Sans SC', sans-serif",
          }}
        />
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 16,
              right: 16,
              padding: '16px',
              background: cardGradient,
              borderRadius: 12,
              textAlign: 'center',
            }}
          >
            <LeafOutlined style={{ fontSize: 24, color: accentColor, marginBottom: 6, display: 'block' }} />
            <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>
              自然专注<br />高效生活
            </div>
          </div>
        )}
      </Sider>
      <AntLayout style={{ background: isDark ? '#141414' : '#f8f5f0' }}>
        <Header
          style={{
            padding: '0 28px',
            background: headerBg,
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${borderColor}`,
            zIndex: 9,
            height: 56,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, color: textSecondary }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                fontSize: 13,
                color: textMuted,
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: 10,
                  padding: '4px 14px',
                  borderRadius: 24,
                  transition: 'all 0.3s ease',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = hoverBg
                  e.currentTarget.style.borderColor = hoverBorder
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  style={{ backgroundColor: accentColor, width: 32, height: 32 }}
                />
                <span style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>
                  {user?.username || '用户'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: 20,
            padding: 28,
            background: contentBg,
            borderRadius: 16,
            minHeight: 280,
            overflow: 'auto',
            boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(45, 42, 38, 0.03)',
            border: `1px solid ${borderColor}`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
