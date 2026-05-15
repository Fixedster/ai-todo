import { useState, useEffect } from 'react'
import { Card, Avatar, Form, Input, Button, message, Spin, Tag, Row, Col, Divider } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import LeafOutlined from '../components/icons/LeafOutlined'
import request from '../utils/request'
import dayjs from 'dayjs'
import { useAuthStore } from '../store/authStore'

interface UserProfile {
  id: number
  username: string
  email: string | null
  avatar: string | null
  status: number
  createdAt: string
}

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [form] = Form.useForm()
  const { setUser } = useAuthStore()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await request.get('/user/me')
      const userData = response.data?.data
      if (userData) {
        setProfile(userData)
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
        })
        form.setFieldsValue({
          username: userData.username,
          email: userData.email,
        })
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || '获取用户信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (values: { username?: string; email?: string }) => {
    try {
      await request.put('/user/update', values)
      message.success('更新成功')
      setEditMode(false)
      fetchProfile()
    } catch (error: any) {
      message.error(error?.response?.data?.message || '更新失败')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  const memberDays = profile?.createdAt
    ? dayjs().diff(dayjs(profile.createdAt), 'day')
    : 0

  return (
    <div>
      <div className="page-header">
        <h2>个人中心</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a09a93', fontSize: 13 }}>
          <LeafOutlined style={{ color: '#5b8a72' }} />
          <span>自然生长，静待花开</span>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            className="hover-card nature-leaf-bg"
            style={{
              borderRadius: 14,
              borderColor: '#f0ebe3',
              overflow: 'hidden',
              position: 'relative',
            }}
            styles={{ body: { padding: '36px 28px' } }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 100,
                background: 'linear-gradient(135deg, #5b8a72 0%, #7ca890 50%, #a8c9b6 100%)',
                opacity: 0.12,
              }}
            />
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: 4,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5b8a72, #a8c9b6)',
                  marginBottom: 16,
                }}
              >
                <Avatar
                  size={88}
                  icon={<UserOutlined />}
                  src={profile?.avatar}
                  style={{
                    backgroundColor: '#e4efe9',
                    color: '#5b8a72',
                    border: '3px solid #fdfcfa',
                    boxShadow: '0 4px 16px rgba(91, 138, 114, 0.15)',
                  }}
                />
              </div>
              <h3
                style={{
                  margin: '0 0 8px',
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#2d2a26',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                {profile?.username}
              </h3>
              <Tag
                style={{
                  borderRadius: 12,
                  padding: '3px 14px',
                  border: 'none',
                  background: profile?.status === 1
                    ? 'rgba(106,171,115,0.12)'
                    : 'rgba(199,92,92,0.12)',
                  color: profile?.status === 1 ? '#6aab73' : '#c75c5c',
                  fontSize: 13,
                }}
              >
                {profile?.status === 1 ? '🌿 正常' : '🍂 禁用'}
              </Tag>
            </div>

            <Divider style={{ borderColor: '#f0ebe3', margin: '24px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(228, 239, 233, 0.5)',
                }}
              >
                <CalendarOutlined style={{ color: '#5b8a72', fontSize: 16 }} />
                <div>
                  <div style={{ fontSize: 12, color: '#a09a93', marginBottom: 2 }}>注册时间</div>
                  <div style={{ fontSize: 14, color: '#2d2a26', fontWeight: 500 }}>
                    {profile?.createdAt ? dayjs(profile.createdAt).format('YYYY年MM月DD日') : '-'}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(212, 162, 78, 0.08)',
                }}
              >
                <ClockCircleOutlined style={{ color: '#d4a24e', fontSize: 16 }} />
                <div>
                  <div style={{ fontSize: 12, color: '#a09a93', marginBottom: 2 }}>加入天数</div>
                  <div style={{ fontSize: 14, color: '#2d2a26', fontWeight: 500 }}>
                    {memberDays} 天
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(106, 159, 199, 0.08)',
                }}
              >
                <MailOutlined style={{ color: '#6a9fc7', fontSize: 16 }} />
                <div>
                  <div style={{ fontSize: 12, color: '#a09a93', marginBottom: 2 }}>邮箱</div>
                  <div style={{ fontSize: 14, color: '#2d2a26', fontWeight: 500 }}>
                    {profile?.email || '未设置'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
                <EditOutlined style={{ marginRight: 8, color: '#5b8a72' }} />
                {editMode ? '编辑资料' : '基本信息'}
              </span>
            }
            className="hover-card"
            style={{ borderRadius: 14, borderColor: '#f0ebe3', marginBottom: 24 }}
            styles={{
              header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
              body: { padding: '28px 24px' },
            }}
            extra={
              !editMode && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                  style={{
                    borderRadius: 10,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  编辑资料
                </Button>
              )
            }
          >
            {editMode ? (
              <Form form={form} layout="vertical" onFinish={handleUpdate}>
                <Row gutter={20}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: 500, color: '#2d2a26', fontFamily: "'Noto Sans SC', sans-serif" }}>
                          用户名
                        </span>
                      }
                      name="username"
                    >
                      <Input
                        prefix={<UserOutlined style={{ color: '#a09a93' }} />}
                        style={{ borderRadius: 10, height: 42 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: 500, color: '#2d2a26', fontFamily: "'Noto Sans SC', sans-serif" }}>
                          邮箱
                        </span>
                      }
                      name="email"
                    >
                      <Input
                        type="email"
                        prefix={<MailOutlined style={{ color: '#a09a93' }} />}
                        style={{ borderRadius: 10, height: 42 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => setEditMode(false)}
                    style={{ borderRadius: 10, height: 38 }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    style={{ borderRadius: 10, height: 38 }}
                  >
                    保存修改
                  </Button>
                </div>
              </Form>
            ) : (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 20px',
                      borderRadius: 12,
                      background: 'rgba(228, 239, 233, 0.4)',
                      border: '1px solid #f0ebe3',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(91, 138, 114, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <UserOutlined style={{ color: '#5b8a72', fontSize: 18 }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#a09a93', marginBottom: 2 }}>用户名</div>
                      <div style={{ fontSize: 14, color: '#2d2a26', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile?.username}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 20px',
                      borderRadius: 12,
                      background: 'rgba(106, 159, 199, 0.06)',
                      border: '1px solid #f0ebe3',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(106, 159, 199, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <MailOutlined style={{ color: '#6a9fc7', fontSize: 18 }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#a09a93', marginBottom: 2 }}>邮箱</div>
                      <div style={{ fontSize: 14, color: '#2d2a26', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile?.email || <span style={{ color: '#a09a93' }}>未设置</span>}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 20px',
                      borderRadius: 12,
                      background: 'rgba(212, 162, 78, 0.06)',
                      border: '1px solid #f0ebe3',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(212, 162, 78, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CalendarOutlined style={{ color: '#d4a24e', fontSize: 18 }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#a09a93', marginBottom: 2 }}>注册时间</div>
                      <div style={{ fontSize: 14, color: '#2d2a26', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {profile?.createdAt ? dayjs(profile.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 20px',
                      borderRadius: 12,
                      background: profile?.status === 1 ? 'rgba(106,171,115,0.06)' : 'rgba(199,92,92,0.06)',
                      border: '1px solid #f0ebe3',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: profile?.status === 1 ? 'rgba(106,171,115,0.1)' : 'rgba(199,92,92,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <SafetyCertificateOutlined style={{ color: profile?.status === 1 ? '#6aab73' : '#c75c5c', fontSize: 18 }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#a09a93', marginBottom: 2 }}>账号状态</div>
                      <Tag
                        style={{
                          borderRadius: 8,
                          border: 'none',
                          background: profile?.status === 1 ? 'rgba(106,171,115,0.12)' : 'rgba(199,92,92,0.12)',
                          color: profile?.status === 1 ? '#6aab73' : '#c75c5c',
                          margin: 0,
                        }}
                      >
                        {profile?.status === 1 ? '正常' : '禁用'}
                      </Tag>
                    </div>
                  </div>
                </Col>
              </Row>
            )}
          </Card>

          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
                <SafetyCertificateOutlined style={{ marginRight: 8, color: '#6a9fc7' }} />
                账号安全
              </span>
            }
            className="hover-card"
            style={{ borderRadius: 14, borderColor: '#f0ebe3' }}
            styles={{
              header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
              body: { padding: '24px' },
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: 'rgba(228, 239, 233, 0.4)',
                  border: '1px solid #f0ebe3',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(91, 138, 114, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SafetyCertificateOutlined style={{ color: '#5b8a72', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#2d2a26' }}>登录密码</div>
                    <div style={{ fontSize: 12, color: '#a09a93', marginTop: 2 }}>
                      定期更换密码可以保护账号安全
                    </div>
                  </div>
                </div>
                <Tag
                  style={{
                    borderRadius: 8,
                    border: 'none',
                    background: 'rgba(106,171,115,0.12)',
                    color: '#6aab73',
                    fontSize: 12,
                  }}
                >
                  已设置
                </Tag>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: profile?.email
                    ? 'rgba(228, 239, 233, 0.4)'
                    : 'rgba(212, 162, 78, 0.06)',
                  border: '1px solid #f0ebe3',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: profile?.email
                        ? 'rgba(91, 138, 114, 0.1)'
                        : 'rgba(212, 162, 78, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MailOutlined
                      style={{
                        color: profile?.email ? '#5b8a72' : '#d4a24e',
                        fontSize: 18,
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#2d2a26' }}>绑定邮箱</div>
                    <div style={{ fontSize: 12, color: '#a09a93', marginTop: 2 }}>
                      {profile?.email || '绑定邮箱后可接收通知提醒'}
                    </div>
                  </div>
                </div>
                <Tag
                  style={{
                    borderRadius: 8,
                    border: 'none',
                    background: profile?.email
                      ? 'rgba(106,171,115,0.12)'
                      : 'rgba(212,162,78,0.12)',
                    color: profile?.email ? '#6aab73' : '#d4a24e',
                    fontSize: 12,
                  }}
                >
                  {profile?.email ? '已绑定' : '未绑定'}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
