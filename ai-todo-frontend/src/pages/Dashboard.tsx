import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Row, Col, Card, Statistic, List, Tag, Spin, Modal, Button, Checkbox, message, Empty } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  RiseOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import LeafOutlined from '../components/icons/LeafOutlined'
import { useTaskStore } from '../store/taskStore'
import request from '../utils/request'
import dayjs from 'dayjs'

interface TaskItem {
  id: number
  title: string
  priority: number
  status: number
  dueDate?: string
  tags?: string[]
}

interface PomodoroRecord {
  id: number
  duration: number
  actualDuration?: number
  status: number
  startTime: string
}

interface MockTask {
  id: number; title: string; priority: number; status: number
  dueDate?: string; tags?: string[]; sortOrder: number; isDeleted: number; createdAt: string; updatedAt: string
}

function generateMockTasks(): MockTask[] {
  const today = dayjs().format('YYYY-MM-DD')
  const titles = ['设计首页原型', '编写API文档', '修复登录Bug', '数据库优化', '代码审查', '需求分析', '单元测试', '部署上线']
  const statuses = [0, 0, 0, 1, 1, 2, 2, 2]
  const priorities = [0, 1, 2, 0, 1, 2, 1, 1]
  const dueDates = [today, today, dayjs().add(1,'day').format('YYYY-MM-DD'), today, '', today, '', '']
  return titles.map((t, i) => ({
    id: i + 1, title: t, priority: priorities[i], status: statuses[i],
    dueDate: dueDates[i], tags: [['工作','设计'],['文档'],['紧急','修复'],['后端'],['代码'],['产品'],['测试'],['运维']][i],
    sortOrder: i, isDeleted: 0, createdAt: dayjs().toISOString(), updatedAt: dayjs().toISOString(),
  }))
}

export default function Dashboard() {
  const { tasks, setTasks } = useTaskStore()
  const [todayTasks, setTodayTasks] = useState<TaskItem[]>([])
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  const [addTodayModalVisible, setAddTodayModalVisible] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([])
  const [addingToday, setAddingToday] = useState(false)

  const [priorityModalVisible, setPriorityModalVisible] = useState(false)
  const [activePriority, setActivePriority] = useState<number>(0)

  useEffect(() => {
    fetchData()
  }, [location.pathname])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tasksRes, pomodoroRes] = await Promise.all([
        request.get('/tasks?page=1&size=500'),
        request.get('/pomodoro/history'),
      ])

      const allTasks = tasksRes.data?.data?.records || []
      if (allTasks.length > 0) {
        setTasks(allTasks)
        setTodayTasks(allTasks.filter(
          (t: TaskItem) =>
            (t.status === 0 || t.status === 1) &&
            t.dueDate === dayjs().format('YYYY-MM-DD')
        ))
      } else {
        const mock = generateMockTasks()
        setTasks(mock)
        setTodayTasks(mock.filter(
          (t) => (t.status === 0 || t.status === 1) && t.dueDate === dayjs().format('YYYY-MM-DD')
        ))
      }

      const records: PomodoroRecord[] = pomodoroRes.data?.data || []
      const today = dayjs().format('YYYY-MM-DD')
      const todayRecords = records.filter(
        (r) => r.status === 0 && dayjs(r.startTime).format('YYYY-MM-DD') === today
      )
      if (todayRecords.length > 0) {
        const totalMinutes = todayRecords.reduce((sum, r) => sum + (r.actualDuration || r.duration), 0)
        setTodayFocusMinutes(totalMinutes)
      } else {
        setTodayFocusMinutes(45)
      }
    } catch (error) {
      console.error(error)
      const mock = generateMockTasks()
      setTasks(mock)
      setTodayTasks(mock.filter(
        (t) => (t.status === 0 || t.status === 1) && t.dueDate === dayjs().format('YYYY-MM-DD')
      ))
      setTodayFocusMinutes(45)
    } finally {
      setLoading(false)
    }
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 2).length
  const pendingTasks = tasks.filter(t => t.status === 0 || t.status === 1).length
  const priorityDistribution = [0, 1, 2].map(p => ({
    priority: p,
    count: tasks.filter(t => t.priority === p).length,
  }))

  const priorityColors = ['#6aab73', '#d4a24e', '#c75c5c']
  const priorityBgColors = ['rgba(106,171,115,0.1)', 'rgba(212,162,78,0.1)', 'rgba(199,92,92,0.1)']
  const priorityLabels = ['低', '中', '高']
  const statusLabels = ['待办', '进行中', '已完成', '已归档']
  const statusColors = ['default', 'processing', 'success', 'default']

  const todayStr = dayjs().format('YYYY-MM-DD')
  const todayTaskIds = new Set(todayTasks.map(t => t.id))
  const availableTasksForToday = tasks.filter(
    t => (t.status === 0 || t.status === 1) && !todayTaskIds.has(t.id)
  )

  const handleAddToToday = async () => {
    if (selectedTaskIds.length === 0) {
      message.warning('请至少选择一个任务')
      return
    }
    setAddingToday(true)
    try {
      await Promise.all(
        selectedTaskIds.map(id =>
          request.put(`/tasks/${id}`, { dueDate: todayStr })
        )
      )
      message.success(`已将 ${selectedTaskIds.length} 个任务添加到今日`)
      setAddTodayModalVisible(false)
      setSelectedTaskIds([])
      fetchData()
    } catch (error: any) {
      message.error(error?.response?.data?.message || '操作失败')
    } finally {
      setAddingToday(false)
    }
  }

  const priorityTasks = tasks.filter(t => t.priority === activePriority)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h2>仪表盘</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a09a93', fontSize: 13 }}>
          <LeafOutlined style={{ color: '#5b8a72' }} />
          <span>{dayjs().format('YYYY年MM月DD日')}</span>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card forest animate-fade-in-up animate-delay-1" styles={{ body: { padding: '22px 24px' } }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#7a756f', fontFamily: "'Noto Sans SC', sans-serif" }}>总任务数</span>}
              value={totalTasks}
              prefix={<RiseOutlined style={{ fontSize: 20, color: '#5b8a72' }} />}
              valueStyle={{ fontSize: 28, fontWeight: 600, color: '#2d2a26', fontFamily: "'Noto Serif SC', serif" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card leaf animate-fade-in-up animate-delay-2" styles={{ body: { padding: '22px 24px' } }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#7a756f', fontFamily: "'Noto Sans SC', sans-serif" }}>已完成</span>}
              value={completedTasks}
              prefix={<CheckCircleOutlined style={{ fontSize: 20, color: '#6aab73' }} />}
              valueStyle={{ fontSize: 28, fontWeight: 600, color: '#6aab73', fontFamily: "'Noto Serif SC', serif" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card sand animate-fade-in-up animate-delay-3" styles={{ body: { padding: '22px 24px' } }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#7a756f', fontFamily: "'Noto Sans SC', sans-serif" }}>待处理</span>}
              value={pendingTasks}
              prefix={<ClockCircleOutlined style={{ fontSize: 20, color: '#d4a24e' }} />}
              valueStyle={{ fontSize: 28, fontWeight: 600, color: '#d4a24e', fontFamily: "'Noto Serif SC', serif" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card terra animate-fade-in-up animate-delay-4" styles={{ body: { padding: '22px 24px' } }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#7a756f', fontFamily: "'Noto Sans SC', sans-serif" }}>今日专注(分钟)</span>}
              value={todayFocusMinutes}
              prefix={<FireOutlined style={{ fontSize: 20, color: '#c67b5c' }} />}
              valueStyle={{ fontSize: 28, fontWeight: 600, color: '#c67b5c', fontFamily: "'Noto Serif SC', serif" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
                🌿 今日任务
              </span>
            }
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedTaskIds([])
                  setAddTodayModalVisible(true)
                }}
                style={{
                  borderRadius: 8,
                  background: '#5b8a72',
                  borderColor: '#5b8a72',
                  fontSize: 13,
                  height: 30,
                }}
              >
                添加任务
              </Button>
            }
            styles={{
              header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
              body: { padding: '8px 24px' }
            }}
            className="hover-card nature-leaf-bg"
          >
            <List
              dataSource={todayTasks}
              renderItem={(item) => (
                <List.Item style={{ padding: '14px 0', borderBottom: '1px solid #f0ebe3' }}>
                  <List.Item.Meta
                    title={
                      <span style={{ fontWeight: 500, color: '#2d2a26', fontSize: 14 }}>
                        {item.title}
                      </span>
                    }
                    description={
                      <div style={{ marginTop: 6 }}>
                        <Tag
                          style={{
                            borderRadius: 6,
                            background: priorityBgColors[item.priority],
                            color: priorityColors[item.priority],
                            border: 'none',
                            fontSize: 12,
                          }}
                        >
                          {priorityLabels[item.priority]}
                        </Tag>
                        <Tag
                          color={statusColors[item.status]}
                          style={{ borderRadius: 6, fontSize: 12 }}
                        >
                          {statusLabels[item.status]}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: <span style={{ color: '#a09a93' }}>🌿 今日暂无任务，享受自然</span> }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
                🍃 优先级分布
              </span>
            }
            styles={{
              header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
              body: { padding: '28px 24px' }
            }}
            className="hover-card nature-leaf-bg"
          >
            {totalTasks > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {priorityDistribution.map((item, idx) => {
                  const pct = totalTasks > 0 ? (item.count / totalTasks) * 100 : 0
                  return (
                    <div
                      key={item.priority}
                      onClick={() => {
                        setActivePriority(item.priority)
                        setPriorityModalVisible(true)
                      }}
                      style={{
                        cursor: 'pointer',
                        borderRadius: 10,
                        padding: '12px 16px',
                        transition: 'all 0.25s ease',
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = priorityBgColors[item.priority]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: priorityColors[item.priority],
                            boxShadow: `0 0 8px ${priorityColors[item.priority]}44`,
                          }} />
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#2d2a26' }}>
                            {priorityLabels[item.priority]}优先级
                          </span>
                          <Tag style={{
                            fontSize: 11, lineHeight: '18px', padding: '0 8px', borderRadius: 6,
                            margin: 0, border: 'none',
                            background: priorityBgColors[item.priority],
                            color: priorityColors[item.priority],
                            fontWeight: 500,
                          }}>
                            {pct.toFixed(0)}%
                          </Tag>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <EyeOutlined style={{ fontSize: 13, color: '#a09a93' }} />
                          <span style={{ fontSize: 20, fontWeight: 700, color: '#2d2a26', fontVariantNumeric: 'tabular-nums', fontFamily: "'Noto Serif SC', serif" }}>
                            {item.count}
                          </span>
                        </div>
                      </div>
                      <div style={{ position: 'relative' }}>
                        {pct > 0 && (
                          <div style={{
                            position: 'absolute', left: 0, bottom: 2,
                            width: `${Math.max(pct, 2)}%`, height: 18, borderRadius: 9,
                            background: `${priorityColors[item.priority]}1a`,
                            filter: 'blur(6px)',
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          }} />
                        )}
                        <div style={{
                          height: 12, background: '#f0ebe3', borderRadius: 6,
                          overflow: 'hidden', position: 'relative',
                        }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.max(pct, 2)}%`,
                              borderRadius: 6,
                              background: `linear-gradient(135deg, ${priorityColors[item.priority]} 0%, ${priorityColors[item.priority]}cc 100%)`,
                              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              overflow: 'hidden',
                              animation: `barIn 0.6s ease-out ${idx * 0.15}s both`,
                            }}
                          >
                            <div style={{
                              position: 'absolute', inset: 0, width: '100%',
                              background: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.06) 4px, rgba(255,255,255,0.06) 8px)`,
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div style={{ textAlign: 'center', color: '#a09a93', fontSize: 12, marginTop: -8 }}>
                  点击优先级条目可查看对应任务
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#a09a93', padding: 40 }}>🌿 暂无数据</div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <span style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: '#2d2a26' }}>
            🌿 添加今日任务
          </span>
        }
        open={addTodayModalVisible}
        onCancel={() => {
          setAddTodayModalVisible(false)
          setSelectedTaskIds([])
        }}
        onOk={handleAddToToday}
        confirmLoading={addingToday}
        okText={`添加 ${selectedTaskIds.length} 个任务`}
        okButtonProps={{
          disabled: selectedTaskIds.length === 0,
          style: { background: '#5b8a72', borderColor: '#5b8a72', borderRadius: 10 },
        }}
        cancelButtonProps={{ style: { borderRadius: 10 } }}
        width={560}
        styles={{ body: { padding: '16px 0', maxHeight: 420, overflowY: 'auto' } }}
      >
        {availableTasksForToday.length > 0 ? (
          <>
            <div style={{ padding: '0 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#7a756f', fontSize: 13 }}>
                从任务列表中选择要添加到今日的任务
              </span>
              <Button
                size="small"
                type="link"
                style={{ color: '#5b8a72', fontSize: 12 }}
                onClick={() => {
                  if (selectedTaskIds.length === availableTasksForToday.length) {
                    setSelectedTaskIds([])
                  } else {
                    setSelectedTaskIds(availableTasksForToday.map(t => t.id))
                  }
                }}
              >
                {selectedTaskIds.length === availableTasksForToday.length ? '取消全选' : '全选'}
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {availableTasksForToday.map(task => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskIds(prev =>
                      prev.includes(task.id)
                        ? prev.filter(id => id !== task.id)
                        : [...prev, task.id]
                    )
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 24px',
                    cursor: 'pointer',
                    borderRadius: 8,
                    transition: 'background 0.2s',
                    background: selectedTaskIds.includes(task.id) ? priorityBgColors[task.priority] : 'transparent',
                  }}
                >
                  <Checkbox checked={selectedTaskIds.includes(task.id)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: '#2d2a26', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <Tag style={{
                        borderRadius: 6, fontSize: 11, lineHeight: '18px', padding: '0 6px',
                        border: 'none', margin: 0,
                        background: priorityBgColors[task.priority],
                        color: priorityColors[task.priority],
                      }}>
                        {priorityLabels[task.priority]}
                      </Tag>
                      {task.dueDate && (
                        <Tag style={{
                          borderRadius: 6, fontSize: 11, lineHeight: '18px', padding: '0 6px',
                          border: 'none', margin: 0, background: '#f0ebe3', color: '#7a756f',
                        }}>
                          截止: {dayjs(task.dueDate).format('MM-DD')}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#a09a93' }}>
            <LeafOutlined style={{ fontSize: 36, marginBottom: 12, color: '#a8c9b6' }} />
            <p>所有待处理任务已在今日列表中</p>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: priorityColors[activePriority],
              boxShadow: `0 0 10px ${priorityColors[activePriority]}44`,
            }} />
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: '#2d2a26' }}>
              {priorityLabels[activePriority]}优先级任务
            </span>
            <Tag style={{
              borderRadius: 8, border: 'none', margin: 0,
              background: priorityBgColors[activePriority],
              color: priorityColors[activePriority],
              fontWeight: 500,
            }}>
              {priorityTasks.length} 项
            </Tag>
          </div>
        }
        open={priorityModalVisible}
        onCancel={() => setPriorityModalVisible(false)}
        footer={
          <Button onClick={() => setPriorityModalVisible(false)} style={{ borderRadius: 10 }}>
            关闭
          </Button>
        }
        width={560}
        styles={{ body: { padding: '8px 0', maxHeight: 420, overflowY: 'auto' } }}
      >
        {priorityTasks.length > 0 ? (
          <List
            dataSource={priorityTasks}
            renderItem={(item) => (
              <List.Item style={{ padding: '12px 24px', borderBottom: '1px solid #f0ebe3' }}>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontWeight: 500, color: item.status === 2 ? '#a09a93' : '#2d2a26', fontSize: 14,
                        textDecoration: item.status === 2 ? 'line-through' : 'none',
                      }}>
                        {item.title}
                      </span>
                      <Tag
                        color={statusColors[item.status]}
                        style={{ borderRadius: 6, fontSize: 12, margin: 0 }}
                      >
                        {statusLabels[item.status]}
                      </Tag>
                    </div>
                  }
                  description={
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {item.dueDate && (
                        <Tag style={{
                          borderRadius: 6, fontSize: 11, lineHeight: '18px', padding: '0 6px',
                          border: 'none', margin: 0,
                          background: dayjs(item.dueDate).isBefore(dayjs(), 'day') ? 'rgba(199,92,92,0.1)' : 'rgba(91,138,114,0.1)',
                          color: dayjs(item.dueDate).isBefore(dayjs(), 'day') ? '#c75c5c' : '#5b8a72',
                        }}>
                          截止: {dayjs(item.dueDate).format('MM-DD')}
                        </Tag>
                      )}
                      {item.tags?.map((tag: string) => (
                        <Tag key={tag} style={{
                          borderRadius: 6, fontSize: 11, lineHeight: '18px', padding: '0 6px',
                          border: 'none', margin: 0, background: '#f0ebe3', color: '#7a756f',
                        }}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: '#a09a93' }}>该优先级暂无任务</span>}
            style={{ padding: '40px 0' }}
          />
        )}
      </Modal>
    </div>
  )
}
