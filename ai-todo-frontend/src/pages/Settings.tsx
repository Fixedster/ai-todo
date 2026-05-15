import { useState, useEffect } from 'react'
import { Card, Form, Switch, Button, message, Select, Tooltip } from 'antd'
import {
  BgColorsOutlined,
  BellOutlined,
  ExportOutlined,
  MoonOutlined,
  SunOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import LeafOutlined from '../components/icons/LeafOutlined'
import request from '../utils/request'

const ACCENT_COLORS = [
  { name: '森林绿', color: '#5b8a72' },
  { name: '苔藓绿', color: '#6aab73' },
  { name: '暖沙', color: '#c4a882' },
  { name: '赤陶', color: '#c67b5c' },
  { name: '天青', color: '#6a9fc7' },
  { name: '琥珀', color: '#d4a24e' },
  { name: '浆果', color: '#c75c5c' },
  { name: '深林', color: '#3d6b54' },
  { name: '薰衣草', color: '#9b8ec4' },
  { name: '橄榄', color: '#8a9a5b' },
]

export default function Settings() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#5b8a72')
  const [notifications, setNotifications] = useState(true)
  const [reminderMinutes, setReminderMinutes] = useState(30)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    setDarkMode(localStorage.getItem('theme') === 'dark')
    setAccentColor(localStorage.getItem('accentColor') || '#5b8a72')
  }, [])

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    localStorage.setItem('theme', newTheme)
    setDarkMode(checked)
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }))
    message.success(checked ? '已切换到暗色模式' : '已切换到亮色模式')
  }

  const handleColorChange = (color: string) => {
    localStorage.setItem('accentColor', color)
    setAccentColor(color)
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { accentColor: color } }))
    message.success('主题色已切换')
  }

  const handleNotificationChange = (checked: boolean) => {
    setNotifications(checked)
    if (checked) {
      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            message.success('已开启通知提醒')
          } else {
            message.warning('请允许浏览器通知权限')
            setNotifications(false)
          }
        })
      }
    } else {
      message.success('已关闭通知提醒')
    }
  }

  const handleExportJSON = async () => {
    setExportLoading(true)
    try {
      const response = await request.get('/tasks?size=1000')
      const tasks = response.data?.data?.records || response.data?.data || []
      if (tasks.length === 0) {
        message.warning('暂无任务数据可导出')
        setExportLoading(false)
        return
      }
      const dataStr = JSON.stringify(tasks, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      message.success(`成功导出 ${tasks.length} 条任务数据`)
    } catch (error: any) {
      message.error(error?.response?.data?.message || '导出失败，请先登录')
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportCSV = async () => {
    setExportLoading(true)
    try {
      const response = await request.get('/tasks?size=1000')
      const tasks = response.data?.data?.records || response.data?.data || []
      if (tasks.length === 0) {
        message.warning('暂无任务数据可导出')
        setExportLoading(false)
        return
      }
      const headers = ['ID', '标题', '描述', '优先级', '状态', '截止日期', '标签', '创建时间']
      const priorityMap: Record<number, string> = { 0: '低', 1: '中', 2: '高' }
      const statusMap: Record<number, string> = { 0: '待办', 1: '进行中', 2: '已完成', 3: '已归档' }
      const rows = tasks.map((task: any) => [
        task.id,
        task.title,
        task.description || '',
        priorityMap[task.priority] || '中',
        statusMap[task.status] || '待办',
        task.dueDate || '',
        (task.tags || []).join(';'),
        task.createdAt,
      ])
      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      message.success(`成功导出 ${tasks.length} 条任务数据`)
    } catch (error: any) {
      message.error(error?.response?.data?.message || '导出失败，请先登录')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>系统设置</h2>
      </div>

      <Card
        title={
          <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
            <BgColorsOutlined style={{ marginRight: 8, color: '#5b8a72' }} />
            外观设置
          </span>
        }
        className="hover-card"
        style={{ marginBottom: 20, borderRadius: 14, borderColor: '#f0ebe3' }}
        styles={{
          header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
          body: { padding: '28px 24px' }
        }}
      >
        <Form layout="vertical">
          <Form.Item label={<span style={{ fontWeight: 500, color: '#2d2a26' }}>主题模式</span>}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Switch
                checked={darkMode}
                onChange={handleThemeChange}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
              <span style={{ color: '#7a756f', fontFamily: "'Noto Sans SC', sans-serif" }}>
                {darkMode ? '暗色模式' : '亮色模式'}
              </span>
            </div>
          </Form.Item>
          <Form.Item label={<span style={{ fontWeight: 500, color: '#2d2a26' }}>主题色</span>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {ACCENT_COLORS.map((item) => (
                <Tooltip key={item.color} title={item.name}>
                  <div
                    onClick={() => handleColorChange(item.color)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: item.color,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: accentColor === item.color ? '3px solid #2d2a26' : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      boxShadow: accentColor === item.color
                        ? `0 0 0 2px #f8f5f0, 0 0 0 4px ${item.color}`
                        : '0 2px 6px rgba(45,42,38,0.1)',
                      transform: accentColor === item.color ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {accentColor === item.color && (
                      <CheckOutlined style={{ color: '#fff', fontSize: 14 }} />
                    )}
                  </div>
                </Tooltip>
              ))}
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={
          <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
            <BellOutlined style={{ marginRight: 8, color: '#d4a24e' }} />
            通知设置
          </span>
        }
        className="hover-card"
        style={{ marginBottom: 20, borderRadius: 14, borderColor: '#f0ebe3' }}
        styles={{
          header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
          body: { padding: '28px 24px' }
        }}
      >
        <Form layout="vertical">
          <Form.Item label={<span style={{ fontWeight: 500, color: '#2d2a26' }}>任务到期提醒</span>}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Switch
                checked={notifications}
                onChange={handleNotificationChange}
                checkedChildren={<BellOutlined />}
              />
              <span style={{ color: '#7a756f', fontFamily: "'Noto Sans SC', sans-serif" }}>
                {notifications ? '已开启' : '已关闭'}
              </span>
            </div>
          </Form.Item>
          {notifications && (
            <Form.Item label={<span style={{ fontWeight: 500, color: '#2d2a26' }}>提前提醒时间</span>}>
              <Select
                value={reminderMinutes}
                onChange={setReminderMinutes}
                style={{ width: 200 }}
              >
                <Select.Option value={15}>15 分钟</Select.Option>
                <Select.Option value={30}>30 分钟</Select.Option>
                <Select.Option value={60}>1 小时</Select.Option>
                <Select.Option value={120}>2 小时</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Card>

      <Card
        title={
          <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
            <ExportOutlined style={{ marginRight: 8, color: '#6a9fc7' }} />
            数据导出
          </span>
        }
        className="hover-card"
        style={{ borderRadius: 14, borderColor: '#f0ebe3' }}
        styles={{
          header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
          body: { padding: '28px 24px' }
        }}
      >
        <p style={{ color: '#7a756f', marginBottom: 20, fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif" }}>
          将您的任务数据导出为 JSON 或 CSV 格式，方便备份或迁移。
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportJSON}
            loading={exportLoading}
            style={{ borderRadius: 10 }}
          >
            导出 JSON
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportCSV}
            loading={exportLoading}
            style={{ borderRadius: 10 }}
          >
            导出 CSV
          </Button>
        </div>
      </Card>
    </div>
  )
}
