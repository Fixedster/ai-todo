import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import LeafOutlined from '../components/icons/LeafOutlined'
import { useAuthStore } from '../store/authStore'
import request from '../utils/request'

interface LoginForm {
  username: string
  password: string
}

interface RegisterForm extends LoginForm {
  email?: string
  confirmPassword: string
}

export default function Login() {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()

  const handleLogin = async (values: LoginForm) => {
    setLoading(true)
    try {
      const response = await request.post('/auth/login', values)
      const { accessToken, refreshToken, user } = response.data.data
      setToken(accessToken, refreshToken)
      setUser({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      })
      message.success('登录成功')
      navigate('/')
    } catch (error: any) {
      message.error(error?.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    setLoading(true)
    try {
      await request.post('/auth/register', {
        username: values.username,
        password: values.password,
        email: values.email,
      })
      message.success('注册成功，请登录')
      setActiveTab('login')
    } catch (error: any) {
      message.error(error?.response?.data?.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  const loginForm = (
    <Form onFinish={handleLogin} autoComplete="off">
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少3个字符' },
          { max: 20, message: '用户名最多20个字符' },
        ]}
      >
        <Input
          prefix={<UserOutlined style={{ color: '#a09a93' }} />}
          placeholder="用户名"
          size="large"
          style={{ borderRadius: 10, height: 46, background: 'rgba(248,245,240,0.6)' }}
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6个字符' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#a09a93' }} />}
          placeholder="密码"
          size="large"
          style={{ borderRadius: 10, height: 46, background: 'rgba(248,245,240,0.6)' }}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          style={{
            borderRadius: 10,
            height: 46,
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: 1,
          }}
        >
          登录
        </Button>
      </Form.Item>
    </Form>
  )

  const registerForm = (
    <Form onFinish={handleRegister} autoComplete="off">
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少3个字符' },
          { max: 20, message: '用户名最多20个字符' },
        ]}
      >
        <Input
          prefix={<UserOutlined style={{ color: '#a09a93' }} />}
          placeholder="用户名"
          size="large"
          style={{ borderRadius: 10, height: 46, background: 'rgba(248,245,240,0.6)' }}
        />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
      >
        <Input
          prefix={<MailOutlined style={{ color: '#a09a93' }} />}
          placeholder="邮箱（可选）"
          size="large"
          style={{ borderRadius: 10, height: 46, background: 'rgba(248,245,240,0.6)' }}
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6个字符' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#a09a93' }} />}
          placeholder="密码"
          size="large"
          style={{ borderRadius: 10, height: 46, background: 'rgba(248,245,240,0.6)' }}
        />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        rules={[
          { required: true, message: '请确认密码' },
          { min: 6, message: '密码至少6个字符' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#a09a93' }} />}
          placeholder="确认密码"
          size="large"
          style={{ borderRadius: 10, height: 46, background: 'rgba(248,245,240,0.6)' }}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          style={{
            borderRadius: 10,
            height: 46,
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: 1,
          }}
        >
          注册
        </Button>
      </Form.Item>
    </Form>
  )

  return (
    <div style={styles.container}>
      <div style={styles.bgGradient} />
      <div style={styles.leaf1} />
      <div style={styles.leaf2} />
      <div style={styles.leaf3} />
      <div style={styles.moss1} />
      <div style={styles.moss2} />

      <Card
        style={styles.card}
        styles={{ body: { padding: '40px 36px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={styles.logoWrap}>
            <LeafOutlined style={{ fontSize: 32, color: '#5b8a72' }} />
          </div>
          <h2
            style={{
              margin: '16px 0 6px',
              fontSize: 26,
              fontWeight: 700,
              color: '#2d2a26',
              fontFamily: "'Noto Serif SC', serif",
              letterSpacing: '-0.5px',
            }}
          >
            AI Todo
          </h2>
          <p
            style={{
              margin: 0,
              color: '#a09a93',
              fontSize: 14,
              fontFamily: "'Noto Sans SC', sans-serif",
              letterSpacing: 0.5,
            }}
          >
            自然专注，高效生活
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          style={{ marginBottom: 8 }}
          items={[
            {
              key: 'login',
              label: (
                <span style={{ fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif", padding: '0 8px' }}>
                  登录
                </span>
              ),
              children: loginForm,
            },
            {
              key: 'register',
              label: (
                <span style={{ fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif", padding: '0 8px' }}>
                  注册
                </span>
              ),
              children: registerForm,
            },
          ]}
        />

        <div
          style={{
            textAlign: 'center',
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid #f0ebe3',
          }}
        >
          <span style={{ fontSize: 12, color: '#a09a93', fontFamily: "'Noto Sans SC', sans-serif" }}>
            🌿 每一次专注，都是成长的开始
          </span>
        </div>
      </Card>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: '#f8f5f0',
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 80% 60% at 20% 80%, rgba(91,138,114,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 20%, rgba(168,201,182,0.12) 0%, transparent 50%),
      radial-gradient(ellipse 50% 40% at 50% 50%, rgba(196,168,130,0.06) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
  leaf1: {
    position: 'absolute',
    top: '8%',
    right: '12%',
    width: 180,
    height: 180,
    borderRadius: '60% 40% 50% 50% / 50% 60% 40% 50%',
    background: 'radial-gradient(ellipse at 30% 30%, rgba(91,138,114,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'leafFloat 8s ease-in-out infinite',
  },
  leaf2: {
    position: 'absolute',
    bottom: '15%',
    left: '8%',
    width: 140,
    height: 140,
    borderRadius: '50% 60% 40% 60% / 40% 50% 60% 50%',
    background: 'radial-gradient(ellipse at 60% 40%, rgba(168,201,182,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'leafFloat 10s ease-in-out infinite 2s',
  },
  leaf3: {
    position: 'absolute',
    top: '45%',
    left: '5%',
    width: 100,
    height: 100,
    borderRadius: '40% 60% 50% 50% / 60% 40% 60% 40%',
    background: 'radial-gradient(ellipse at 50% 50%, rgba(196,168,130,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'leafFloat 12s ease-in-out infinite 4s',
  },
  moss1: {
    position: 'absolute',
    top: '-5%',
    left: '30%',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(91,138,114,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  moss2: {
    position: 'absolute',
    bottom: '-8%',
    right: '25%',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(196,168,130,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: 440,
    borderRadius: 20,
    boxShadow: '0 8px 40px rgba(45,42,38,0.06), 0 2px 12px rgba(45,42,38,0.04)',
    position: 'relative',
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(240,235,227,0.8)',
    zIndex: 1,
  },
  logoWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 18,
    background: 'linear-gradient(135deg, #e4efe9 0%, #f0ebe3 100%)',
    boxShadow: '0 4px 16px rgba(91,138,114,0.1)',
  },
}
