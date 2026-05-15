import { useEffect, useState } from 'react'
import {
  Card,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  DatePicker,
  message,
  Popconfirm,
  Badge,
  Dropdown,
  Pagination,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  MoreOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import LeafOutlined from '../components/icons/LeafOutlined'
import { useTaskStore } from '../store/taskStore'
import request from '../utils/request'
import dayjs from 'dayjs'
import AIDecomposeModal from '../components/ai/AIDecomposeModal'

const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

export default function Tasks() {
  const { tasks, loading, filters, setTasks, setLoading, setFilters, updateTask, deleteTask } = useTaskStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [aiModalVisible, setAiModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== undefined) params.append('status', String(filters.status))
      if (filters.priority !== undefined) params.append('priority', String(filters.priority))
      if (filters.keyword) params.append('keyword', filters.keyword)
      if (filters.tag) params.append('tag', filters.tag)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      params.append('page', '1')
      params.append('size', '500')

      const response = await request.get(`/tasks?${params.toString()}`)
      setTasks(response.data.data.records || [])
      setCurrentPage(1)
    } catch (error: any) {
      message.error(error?.response?.data?.message || '获取任务列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: any) => {
    try {
      const data = {
        title: values.title,
        description: values.description || '',
        priority: values.priority ?? 1,
        status: values.status ?? 0,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        tags: values.tags || [],
        parentId: values.parentId || null,
        sortOrder: values.sortOrder || 0,
      }
      if (editingTask) {
        await request.put(`/tasks/${editingTask.id}`, data)
        message.success('更新成功')
      } else {
        await request.post('/tasks', data)
        message.success('创建成功')
      }
      setModalVisible(false)
      setEditingTask(null)
      form.resetFields()
      fetchTasks()
    } catch (error: any) {
      message.error(error?.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/tasks/${id}`)
      deleteTask(id)
      message.success('删除成功')
    } catch (error: any) {
      message.error(error?.response?.data?.message || '删除失败')
    }
  }

  const handleBatchComplete = async () => {
    try {
      await request.post('/tasks/batch', {
        ids: selectedRowKeys,
        action: 'complete',
      })
      message.success('批量完成成功')
      setSelectedRowKeys([])
      fetchTasks()
    } catch (error: any) {
      message.error(error?.response?.data?.message || '批量操作失败')
    }
  }

  const handleBatchDelete = async () => {
    try {
      await request.post('/tasks/batch', {
        ids: selectedRowKeys,
        action: 'delete',
      })
      message.success('批量删除成功')
      setSelectedRowKeys([])
      fetchTasks()
    } catch (error: any) {
      message.error(error?.response?.data?.message || '批量操作失败')
    }
  }

  const openEditModal = (task: any) => {
    setEditingTask(task)
    form.setFieldsValue({
      ...task,
      dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
    })
    setModalVisible(true)
  }

  const openCreateModal = () => {
    setEditingTask(null)
    form.resetFields()
    setModalVisible(true)
  }

  const priorityColors = ['#6aab73', '#d4a24e', '#c75c5c']
  const priorityBgColors = ['rgba(106,171,115,0.1)', 'rgba(212,162,78,0.1)', 'rgba(199,92,92,0.1)']
  const priorityLabels = ['低', '中', '高']
  const statusLabels = ['待办', '进行中', '已完成', '已归档']
  const statusColors = ['default', 'processing', 'success', 'default']

  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || [])))

  const totalPages = Math.ceil(tasks.length / pageSize)
  const paginatedTasks = tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page)
    setPageSize(size)
    setSelectedRowKeys([])
  }

  return (
    <div>
      <div className="page-header">
        <h2>任务管理</h2>
        <Space>
          <Button
            icon={<RobotOutlined />}
            onClick={() => setAiModalVisible(true)}
            style={{ borderColor: '#a8c9b6', color: '#5b8a72' }}
          >
            AI 拆解
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            新建任务
          </Button>
        </Space>
      </div>

      <Card
        style={{ marginBottom: 20, borderRadius: 14, borderColor: '#f0ebe3' }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Space wrap size={[12, 12]}>
          <Input
            placeholder="搜索任务..."
            prefix={<SearchOutlined style={{ color: '#a09a93' }} />}
            value={filters.keyword}
            onChange={(e) => setFilters({ keyword: e.target.value })}
            onPressEnter={fetchTasks}
            style={{ width: 200, borderColor: '#e8e2d9' }}
            allowClear
          />
          <Select
            placeholder="状态"
            value={filters.status}
            onChange={(value) => setFilters({ status: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Option value={0}>待办</Option>
            <Option value={1}>进行中</Option>
            <Option value={2}>已完成</Option>
            <Option value={3}>已归档</Option>
          </Select>
          <Select
            placeholder="优先级"
            value={filters.priority}
            onChange={(value) => setFilters({ priority: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Option value={0}>低</Option>
            <Option value={1}>中</Option>
            <Option value={2}>高</Option>
          </Select>
          <Select
            placeholder="标签"
            value={filters.tag}
            onChange={(value) => setFilters({ tag: value })}
            style={{ width: 120 }}
            allowClear
          >
            {allTags.map((tag) => (
              <Option key={tag} value={tag}>
                {tag}
              </Option>
            ))}
          </Select>
          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setFilters({
                  startDate: dates[0]?.format('YYYY-MM-DD'),
                  endDate: dates[1]?.format('YYYY-MM-DD'),
                })
              } else {
                setFilters({ startDate: undefined, endDate: undefined })
              }
            }}
          />
          <Button onClick={fetchTasks}>搜索</Button>
          <Button onClick={() => { setFilters({}); fetchTasks() }}>重置</Button>
        </Space>
      </Card>

      {selectedRowKeys.length > 0 && (
        <Card
          size="small"
          style={{
            marginBottom: 16,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #e4efe9, #f0ebe3)',
            border: '1px solid #a8c9b6',
          }}
          styles={{ body: { padding: '12px 24px' } }}
        >
          <Space>
            <span style={{ color: '#5b8a72', fontWeight: 500 }}>
              <LeafOutlined style={{ marginRight: 4 }} />
              已选择 {selectedRowKeys.length} 项
            </span>
            <Button icon={<CheckOutlined />} onClick={handleBatchComplete}>
              批量完成
            </Button>
            <Popconfirm title="确定批量删除吗？" onConfirm={handleBatchDelete}>
              <Button danger icon={<DeleteOutlined />}>
                批量删除
              </Button>
            </Popconfirm>
          </Space>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {paginatedTasks.map((task, index) => (
          <Card
            key={task.id}
            size="small"
            className="hover-card"
            style={{
              borderLeft: `4px solid ${priorityColors[task.priority]}`,
              opacity: task.status === 3 ? 0.6 : 1,
              borderRadius: 14,
              animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
            }}
            styles={{ body: { padding: '16px 24px' } }}
            actions={[
              task.status !== 2 ? (
                <Button
                  key="complete"
                  type="link"
                  icon={<CheckOutlined />}
                  style={{ color: '#6aab73' }}
                  onClick={async () => {
                    await request.put(`/tasks/${task.id}`, { status: 2 })
                    updateTask(task.id, { status: 2 })
                    message.success('已标记完成')
                  }}
                >
                  完成
                </Button>
              ) : (
                <Button
                  key="reopen"
                  type="link"
                  icon={<EditOutlined />}
                  style={{ color: '#5b8a72' }}
                  onClick={async () => {
                    await request.put(`/tasks/${task.id}`, { status: 0 })
                    updateTask(task.id, { status: 0 })
                    message.success('已重新打开')
                  }}
                >
                  重新打开
                </Button>
              ),
              <EditOutlined key="edit" onClick={() => openEditModal(task)} style={{ fontSize: 16, color: '#7a756f' }} />,
              <Popconfirm
                key="delete"
                title="确定删除吗？"
                onConfirm={() => handleDelete(task.id)}
              >
                <DeleteOutlined style={{ fontSize: 16, color: '#c75c5c' }} />
              </Popconfirm>,
              <Dropdown
                key="more"
                menu={{
                  items: [
                    {
                      key: 'archive',
                      label: '归档',
                      onClick: async () => {
                        await request.put(`/tasks/${task.id}`, { status: 3 })
                        updateTask(task.id, { status: 3 })
                        message.success('已归档')
                      },
                    },
                  ],
                }}
              >
                <MoreOutlined style={{ fontSize: 16, color: '#7a756f' }} />
              </Dropdown>,
            ]}
          >
            <Card.Meta
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    textDecoration: task.status === 2 ? 'line-through' : 'none',
                    fontSize: 15,
                    fontWeight: 500,
                    color: task.status === 2 ? '#a09a93' : '#2d2a26',
                  }}>
                    {task.title}
                  </span>
                  <Tag
                    style={{
                      borderRadius: 6,
                      background: priorityBgColors[task.priority],
                      color: priorityColors[task.priority],
                      border: 'none',
                      margin: 0,
                    }}
                  >
                    {priorityLabels[task.priority]}
                  </Tag>
                  <Badge status={statusColors[task.status] as any} text={
                    <span style={{ color: '#7a756f', fontSize: 13 }}>{statusLabels[task.status]}</span>
                  } />
                </div>
              }
              description={
                <div>
                  {task.description && (
                    <p style={{ margin: '6px 0 4px', color: '#a09a93', fontSize: 13 }}>{task.description}</p>
                  )}
                  <Space wrap size={[4, 4]} style={{ marginTop: 4 }}>
                    {task.tags?.map((tag: string) => (
                      <Tag key={tag} style={{
                        borderRadius: 6,
                        fontSize: 12,
                        background: '#f0ebe3',
                        border: 'none',
                        color: '#7a756f',
                      }}>
                        {tag}
                      </Tag>
                    ))}
                    {task.dueDate && (
                      <Tag
                        style={{
                          borderRadius: 6,
                          fontSize: 12,
                          background: dayjs(task.dueDate).isBefore(dayjs()) ? 'rgba(199,92,92,0.1)' : 'rgba(91,138,114,0.1)',
                          border: 'none',
                          color: dayjs(task.dueDate).isBefore(dayjs()) ? '#c75c5c' : '#5b8a72',
                        }}
                      >
                        截止: {dayjs(task.dueDate).format('MM-DD')}
                      </Tag>
                    )}
                  </Space>
                </div>
              }
            />
          </Card>
        ))}
      </div>

      {tasks.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#a09a93' }}>
          <LeafOutlined style={{ fontSize: 48, marginBottom: 16, color: '#a8c9b6' }} />
          <p style={{ fontFamily: "'Noto Serif SC', serif" }}>暂无任务，点击"新建任务"开始吧</p>
        </div>
      )}

      {tasks.length > pageSize && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 28,
          paddingTop: 20,
          borderTop: '1px solid #f0ebe3',
        }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={tasks.length}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={['5', '10', '20', '50']}
            showTotal={(total, range) => (
              <span style={{ color: '#7a756f', fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif" }}>
                第 {range[0]}-{range[1]} 条，共 {total} 条
              </span>
            )}
          />
        </div>
      )}

      <Modal
        title={
          <span style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 600 }}>
            {editingTask ? '编辑任务' : '新建任务'}
          </span>
        }
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false)
          setEditingTask(null)
          form.resetFields()
        }}
        width={600}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="title"
            label={<span style={{ color: '#2d2a26', fontWeight: 500 }}>任务标题</span>}
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          <Form.Item name="description" label={<span style={{ color: '#2d2a26', fontWeight: 500 }}>任务描述</span>}>
            <TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
          <Form.Item name="priority" label={<span style={{ color: '#2d2a26', fontWeight: 500 }}>优先级</span>} initialValue={1}>
            <Select>
              <Option value={0}>低</Option>
              <Option value={1}>中</Option>
              <Option value={2}>高</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label={<span style={{ color: '#2d2a26', fontWeight: 500 }}>状态</span>} initialValue={0}>
            <Select>
              <Option value={0}>待办</Option>
              <Option value={1}>进行中</Option>
              <Option value={2}>已完成</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label={<span style={{ color: '#2d2a26', fontWeight: 500 }}>截止日期</span>}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tags" label={<span style={{ color: '#2d2a26', fontWeight: 500 }}>标签</span>}>
            <Select mode="tags" placeholder="输入标签后按回车" allowClear>
              {allTags.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <AIDecomposeModal
        open={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        onTasksCreated={fetchTasks}
      />
    </div>
  )
}
