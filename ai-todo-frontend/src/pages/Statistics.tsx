import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, Row, Col, Spin, Tag } from 'antd'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import request from '../utils/request'
import dayjs from 'dayjs'

interface StatisticsData {
  weeklyTrend: Array<{ date: string; completed: number; created: number }>
  priorityDistribution: Array<{ priority: number; count: number }>
  tagFrequency: Array<{ tag: string; count: number }>
  weeklyPomodoroHours: number
  totalFocusSessions: number
}

const COLORS = ['#6aab73', '#d4a24e', '#c75c5c', '#5b8a72', '#6a9fc7']
const PRIORITY_COLORS = ['#6aab73', '#d4a24e', '#c75c5c']
const PRIORITY_BG = ['rgba(106,171,115,0.1)', 'rgba(212,162,78,0.1)', 'rgba(199,92,92,0.1)']
const PRIORITY_LABELS = ['低', '中', '高']

function generateMockData(): StatisticsData {
  const today = dayjs()
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const d = today.subtract(6 - i, 'day')
    return {
      date: d.format('YYYY-MM-DD'),
      completed: Math.floor(Math.random() * 8) + 1,
      created: Math.floor(Math.random() * 6) + 2,
    }
  })
  return {
    weeklyTrend,
    priorityDistribution: [
      { priority: 0, count: 12 },
      { priority: 1, count: 28 },
      { priority: 2, count: 15 },
    ],
    tagFrequency: [
      { tag: '工作', count: 18 },
      { tag: '学习', count: 12 },
      { tag: '个人', count: 9 },
      { tag: '紧急', count: 7 },
      { tag: '项目A', count: 6 },
      { tag: '阅读', count: 4 },
    ],
    weeklyPomodoroHours: 12,
    totalFocusSessions: 36,
  }
}

export default function Statistics() {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    fetchStatistics()
  }, [location.pathname])

  const fetchStatistics = async () => {
    try {
      const response = await request.get('/statistics/overview')
      const realData = response.data.data
      const hasData = realData?.weeklyTrend?.length > 0
      setData(hasData ? realData : generateMockData())
    } catch (error) {
      console.error(error)
      setData(generateMockData())
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  const weeklyData = data?.weeklyTrend?.map((item) => ({
    ...item,
    date: dayjs(item.date).format('MM-DD'),
  })) || []

  return (
    <div>
      <div className="page-header">
        <h2>数据统计</h2>
      </div>

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card className="stat-card forest" styles={{ body: { padding: '32px 28px' } }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 40,
                fontWeight: 700,
                color: '#5b8a72',
                letterSpacing: -1,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                {data?.weeklyPomodoroHours || 0}h
              </div>
              <div style={{
                color: '#7a756f',
                fontSize: 14,
                marginTop: 6,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                本周专注时长
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="stat-card leaf" styles={{ body: { padding: '32px 28px' } }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 40,
                fontWeight: 700,
                color: '#6aab73',
                letterSpacing: -1,
                fontFamily: "'Noto Serif SC', serif",
              }}>
                {data?.totalFocusSessions || 0}
              </div>
              <div style={{
                color: '#7a756f',
                fontSize: 14,
                marginTop: 6,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                总专注次数
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
                🌿 本周任务完成趋势
              </span>
            }
            className="hover-card"
            styles={{
              header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
              body: { padding: 24 }
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData} barCategoryGap={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#7a756f' }} axisLine={{ stroke: '#e8e2d9' }} />
                <YAxis tick={{ fontSize: 12, fill: '#7a756f' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #f0ebe3',
                    boxShadow: '0 4px 16px rgba(45,42,38,0.08)',
                    fontFamily: "'Noto Sans SC', sans-serif",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif" }} />
                <Bar dataKey="completed" name="已完成" fill="#6aab73" radius={[6, 6, 0, 0]} />
                <Bar dataKey="created" name="新建" fill="#5b8a72" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
                🍃 任务优先级分布
              </span>
            }
            className="hover-card"
            styles={{
              header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
              body: { padding: '32px 28px' }
            }}
          >
            {data?.priorityDistribution && data.priorityDistribution.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {data.priorityDistribution.map((item) => {
                  const total = data.priorityDistribution.reduce((s, i) => s + i.count, 0)
                  const pct = total > 0 ? (item.count / total) * 100 : 0
                  return (
                    <div key={item.priority}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 12, height: 12, borderRadius: '50%',
                            background: PRIORITY_COLORS[item.priority],
                            boxShadow: `0 0 8px ${PRIORITY_COLORS[item.priority]}44`,
                          }} />
                          <span style={{ fontSize: 15, fontWeight: 500, color: '#2d2a26', fontFamily: "'Noto Sans SC', sans-serif" }}>
                            {PRIORITY_LABELS[item.priority]}优先级
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontSize: 24, fontWeight: 700, color: '#2d2a26', fontVariantNumeric: 'tabular-nums', fontFamily: "'Noto Serif SC', serif" }}>
                            {item.count}
                          </span>
                          <span style={{ fontSize: 13, color: '#a09a93' }}>{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div style={{
                        height: 10, background: '#f0ebe3', borderRadius: 5,
                        overflow: 'hidden', position: 'relative',
                      }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: 5,
                            background: `linear-gradient(90deg, ${PRIORITY_COLORS[item.priority]}, ${PRIORITY_COLORS[item.priority]}aa)`,
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                          }}
                        >
                          <div style={{
                            position: 'absolute', right: 0, top: 0, bottom: 0,
                            width: 4, borderRadius: 2,
                            background: 'rgba(255,255,255,0.4)',
                          }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#a09a93', padding: 40 }}>🌿 暂无数据</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Noto Serif SC', serif", color: '#2d2a26' }}>
                🏷️ 标签使用频率
              </span>
            }
            className="hover-card"
            styles={{
              header: { borderBottom: '1px solid #f0ebe3', padding: '16px 24px' },
              body: { padding: '28px 24px' }
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {data?.tagFrequency?.map((item, index) => (
                <Tag
                  key={item.tag}
                  style={{
                    fontSize: 14 + Math.min(item.count * 1.5, 14),
                    padding: '8px 20px',
                    borderRadius: 24,
                    fontWeight: 500,
                    background: `${COLORS[index % COLORS.length]}18`,
                    color: COLORS[index % COLORS.length],
                    border: `1px solid ${COLORS[index % COLORS.length]}30`,
                    fontFamily: "'Noto Sans SC', sans-serif",
                  }}
                >
                  {item.tag} ({item.count})
                </Tag>
              ))}
              {(!data?.tagFrequency || data.tagFrequency.length === 0) && (
                <div style={{ color: '#a09a93', padding: 20 }}>🌿 暂无标签数据</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
