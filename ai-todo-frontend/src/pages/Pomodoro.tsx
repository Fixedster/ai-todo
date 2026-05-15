import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, Button, Select, Typography, message, List, Tag, Space } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import LeafOutlined from '../components/icons/LeafOutlined'
import request from '../utils/request'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

interface PomodoroRecord {
  id: number
  taskId?: number
  duration: number
  actualDuration?: number
  status: number
  startTime: string
  endTime?: string
}

const WORK_DURATIONS = [15, 25, 45, 60]
const BREAK_DURATIONS = [5, 10, 15]

export default function Pomodoro() {
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [currentRecordId, setCurrentRecordId] = useState<number | null>(null)
  const [records, setRecords] = useState<PomodoroRecord[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined)
  const [tasks, setTasks] = useState<Array<{ id: number; title: string }>>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeLeftRef = useRef(timeLeft)
  const isCompletingRef = useRef(false)

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    fetchRecords()
    fetchTasks()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isRunning && !isCompletingRef.current) {
      setTimeLeft(workDuration * 60)
    }
  }, [workDuration])

  const fetchTasks = async () => {
    try {
      const response = await request.get('/tasks?status=0&status=1&size=100')
      setTasks(response.data?.data?.records || [])
    } catch (error) {
      console.error(error)
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await request.get('/pomodoro/history')
      setRecords(response.data?.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const startTimer = async () => {
    if (isRunning) return
    try {
      if (!isBreak && !currentRecordId) {
        const response = await request.post('/pomodoro/start', {
          taskId: selectedTaskId,
          duration: workDuration,
        })
        if (response.data?.data?.id) {
          setCurrentRecordId(response.data.data.id)
        }
      }
      setIsRunning(true)
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1
          if (next <= 0) {
            return 0
          }
          return next
        })
      }, 1000)
    } catch (error: any) {
      message.error(error?.response?.data?.message || '开始专注失败')
    }
  }

  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      handleCompleteAction()
    }
  }, [timeLeft, isRunning])

  const handleCompleteAction = useCallback(async () => {
    isCompletingRef.current = true
    setIsRunning(false)

    if (!isBreak && currentRecordId) {
      try {
        await request.post(`/pomodoro/${currentRecordId}/end`, { interrupted: false })
        message.success('专注完成！休息一下吧 🌿')
        fetchRecords()
      } catch (error) {
        console.error(error)
      }
      setCurrentRecordId(null)
      setTimeLeft(breakDuration * 60)
      setIsBreak(true)
    } else if (isBreak) {
      message.success('休息结束，准备开始新的专注 🍃')
      setIsBreak(false)
      setTimeLeft(workDuration * 60)
    }
    isCompletingRef.current = false
  }, [isBreak, currentRecordId, breakDuration, workDuration])

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRunning(false)
  }

  const handleInterrupt = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRunning(false)

    if (currentRecordId) {
      try {
        await request.post(`/pomodoro/${currentRecordId}/end`, { interrupted: true })
        message.warning('专注被打断')
        fetchRecords()
      } catch (error) {
        console.error(error)
      }
      setCurrentRecordId(null)
    }
    setTimeLeft(workDuration * 60)
    setIsBreak(false)
  }

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(workDuration * 60)
    setCurrentRecordId(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = isBreak
    ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
    : ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100

  const circleColor = isBreak ? '#6aab73' : '#5b8a72'
  const circleBgColor = isBreak ? 'rgba(106,171,115,0.1)' : 'rgba(91,138,114,0.08)'

  return (
    <div>
      <div className="page-header">
        <h2>番茄钟</h2>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Card
          className="hover-card"
          style={{
            textAlign: 'center',
            marginBottom: 24,
            borderRadius: 20,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #fdfcfa 0%, #f8f5f0 100%)',
            border: '1px solid #f0ebe3',
          }}
          styles={{ body: { padding: '48px 32px' } }}
        >
          <div style={{ marginBottom: 28 }}>
            <Tag
              style={{
                fontSize: 13,
                padding: '6px 20px',
                borderRadius: 20,
                fontWeight: 500,
                background: isBreak ? 'rgba(106,171,115,0.12)' : 'rgba(91,138,114,0.12)',
                color: isBreak ? '#6aab73' : '#5b8a72',
                border: `1px solid ${isBreak ? 'rgba(106,171,115,0.2)' : 'rgba(91,138,114,0.2)'}`,
              }}
            >
              {isBreak ? '🌿 休息时间' : '🍃 专注时间'}
            </Tag>
          </div>

          <div style={{
            position: 'relative',
            width: 280,
            height: 280,
            margin: '0 auto 40px',
            borderRadius: '50%',
            background: circleBgColor,
            boxShadow: `0 0 60px ${isBreak ? 'rgba(106,171,115,0.08)' : 'rgba(91,138,114,0.08)'}, inset 0 0 30px rgba(255,255,255,0.5)`,
          }}>
            <svg width="280" height="280" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
              <circle
                cx="140" cy="140" r="120"
                fill="none"
                stroke="#e8e2d9"
                strokeWidth="8"
              />
              <circle
                cx="140" cy="140" r="120"
                fill="none"
                stroke={circleColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                style={{
                  transition: 'stroke-dashoffset 1s linear',
                  filter: `drop-shadow(0 0 6px ${circleColor}66)`,
                }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <Title level={1} style={{
                margin: 0,
                fontSize: 56,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
                letterSpacing: 2,
                color: '#2d2a26',
                fontFamily: "'Noto Serif SC', serif",
              }}>
                {formatTime(timeLeft)}
              </Title>
              <Text style={{
                fontSize: 14,
                marginTop: 6,
                display: 'block',
                color: '#a09a93',
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                {isBreak ? '休息中' : '专注中'}
              </Text>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            {!isBreak && (
              <Select
                placeholder="关联任务（可选）"
                style={{ width: 240, marginBottom: 20 }}
                value={selectedTaskId}
                onChange={setSelectedTaskId}
                allowClear
                disabled={isRunning}
              >
                {tasks.map((task) => (
                  <Option key={task.id} value={task.id}>
                    {task.title}
                  </Option>
                ))}
              </Select>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 28 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 11,
                  color: '#a09a93',
                  marginBottom: 8,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  fontFamily: "'Noto Sans SC', sans-serif",
                }}>
                  专注时长
                </div>
                <Select
                  value={workDuration}
                  onChange={setWorkDuration}
                  disabled={isRunning}
                  style={{ width: 100 }}
                >
                  {WORK_DURATIONS.map((d) => (
                    <Option key={d} value={d}>{d}分钟</Option>
                  ))}
                </Select>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 11,
                  color: '#a09a93',
                  marginBottom: 8,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  fontFamily: "'Noto Sans SC', sans-serif",
                }}>
                  休息时长
                </div>
                <Select
                  value={breakDuration}
                  onChange={setBreakDuration}
                  disabled={isRunning}
                  style={{ width: 100 }}
                >
                  {BREAK_DURATIONS.map((d) => (
                    <Option key={d} value={d}>{d}分钟</Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <Space size="middle">
            {!isRunning && timeLeft === workDuration * 60 && !currentRecordId && !isBreak ? (
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={startTimer}
                style={{
                  height: 48,
                  paddingInline: 32,
                  borderRadius: 24,
                  fontSize: 16,
                  fontFamily: "'Noto Sans SC', sans-serif",
                }}
              >
                开始专注
              </Button>
            ) : !isRunning ? (
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={startTimer}
                style={{
                  height: 48,
                  paddingInline: 32,
                  borderRadius: 24,
                  fontSize: 16,
                  fontFamily: "'Noto Sans SC', sans-serif",
                }}
              >
                继续
              </Button>
            ) : (
              <Button
                size="large"
                icon={<PauseCircleOutlined />}
                onClick={pauseTimer}
                style={{
                  height: 48,
                  paddingInline: 32,
                  borderRadius: 24,
                  fontSize: 16,
                  borderColor: '#c4a882',
                  color: '#c4a882',
                  fontFamily: "'Noto Sans SC', sans-serif",
                }}
              >
                暂停
              </Button>
            )}
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={resetTimer}
              style={{
                height: 48,
                paddingInline: 28,
                borderRadius: 24,
                fontSize: 16,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            >
              重置
            </Button>
            {isRunning && !isBreak && (
              <Button
                danger
                size="large"
                onClick={handleInterrupt}
                style={{
                  height: 48,
                  paddingInline: 28,
                  borderRadius: 24,
                  fontSize: 16,
                  fontFamily: "'Noto Sans SC', sans-serif",
                }}
              >
                打断
              </Button>
            )}
          </Space>
        </Card>

        <Card
          title={
            <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
              🌱 专注记录
            </span>
          }
          className="hover-card"
          style={{ borderRadius: 16, borderColor: '#f0ebe3' }}
          styles={{
            header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
            body: { padding: '8px 24px' }
          }}
        >
          <List
            dataSource={records.slice(0, 10)}
            renderItem={(record) => (
              <List.Item style={{ padding: '14px 0', borderBottom: '1px solid #f0ebe3' }}>
                <List.Item.Meta
                  avatar={
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: record.status === 0 ? 'rgba(106,171,115,0.12)' : 'rgba(199,92,92,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <LeafOutlined style={{ fontSize: 16, color: record.status === 0 ? '#6aab73' : '#c75c5c' }} />
                    </div>
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 500, color: '#2d2a26' }}>{record.duration}分钟专注</span>
                      {record.status === 0 ? (
                        <Tag
                          style={{
                            borderRadius: 6,
                            background: 'rgba(106,171,115,0.1)',
                            color: '#6aab73',
                            border: 'none',
                            fontSize: 12,
                          }}
                        >
                          完成
                        </Tag>
                      ) : (
                        <Tag
                          style={{
                            borderRadius: 6,
                            background: 'rgba(199,92,92,0.1)',
                            color: '#c75c5c',
                            border: 'none',
                            fontSize: 12,
                          }}
                        >
                          打断
                        </Tag>
                      )}
                    </div>
                  }
                  description={
                    <Text style={{ fontSize: 13, color: '#a09a93' }}>
                      {dayjs(record.startTime).format('MM-DD HH:mm')}
                      {record.actualDuration && ` · 实际专注 ${record.actualDuration} 分钟`}
                    </Text>
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: <span style={{ color: '#a09a93' }}>🌱 暂无专注记录</span> }}
          />
        </Card>
      </div>
    </div>
  )
}
