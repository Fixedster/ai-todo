import { useState } from 'react'
import { Modal, Input, Button, List, Tag, message, Spin } from 'antd'
import { RobotOutlined, PlusOutlined } from '@ant-design/icons'
import request from '../../utils/request'

interface Suggestion {
  title: string
  description?: string
  priority: number
}

interface AIDecomposeModalProps {
  open: boolean
  onClose: () => void
  onTasksCreated: () => void
}

export default function AIDecomposeModal({ open, onClose, onTasksCreated }: AIDecomposeModalProps) {
  const [taskInput, setTaskInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<number[]>([])

  const handleDecompose = async () => {
    if (!taskInput.trim()) {
      message.warning('请输入任务描述')
      return
    }
    setLoading(true)
    try {
      const response = await request.post('/ai/decompose', { task: taskInput })
      setSuggestions(response.data.data.suggestions || [])
      setSelectedSuggestions([])
    } catch (error) {
      message.error('AI 拆解失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTasks = async () => {
    if (selectedSuggestions.length === 0) {
      message.warning('请选择至少一个子任务')
      return
    }
    setLoading(true)
    try {
      const selectedTasks = selectedSuggestions.map((index) => suggestions[index])
      await request.post('/tasks/batch-create', selectedTasks)
      message.success(`成功创建 ${selectedTasks.length} 个子任务`)
      onTasksCreated()
      onClose()
      setTaskInput('')
      setSuggestions([])
      setSelectedSuggestions([])
    } catch (error) {
      message.error('创建任务失败')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (index: number) => {
    setSelectedSuggestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const priorityColors = ['green', 'orange', 'red']
  const priorityLabels = ['低', '中', '高']

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ color: '#1677ff' }} />
          <span>AI 任务拆解</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={
        suggestions.length > 0
          ? [
              <Button key="cancel" onClick={onClose}>
                取消
              </Button>,
              <Button
                key="create"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateTasks}
                disabled={selectedSuggestions.length === 0}
              >
                创建选中任务 ({selectedSuggestions.length})
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onClose}>
                取消
              </Button>,
              <Button key="submit" type="primary" onClick={handleDecompose} loading={loading}>
                智能拆解
              </Button>,
            ]
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input.TextArea
          placeholder="描述你的复杂任务，例如：准备 Java 面试、策划一场生日派对..."
          rows={3}
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        {suggestions.length === 0 && (
          <div style={{ color: '#666', fontSize: 12 }}>
            AI 将根据你的描述生成 3-5 个子任务建议，你可以选择性采纳
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#666' }}>AI 正在分析任务并生成建议...</p>
        </div>
      )}

      {suggestions.length > 0 && !loading && (
        <div>
          <h4 style={{ marginBottom: 12 }}>AI 建议的子任务（点击选择）：</h4>
          <List
            dataSource={suggestions}
            renderItem={(item, index) => (
              <List.Item
                onClick={() => toggleSelection(index)}
                style={{
                  cursor: 'pointer',
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 12,
                  border: selectedSuggestions.includes(index)
                    ? '2px solid #1677ff'
                    : '1px solid #f0f0f0',
                  background: selectedSuggestions.includes(index) ? '#f0f5ff' : '#fff',
                }}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{item.title}</span>
                      <Tag color={priorityColors[item.priority]}>
                        {priorityLabels[item.priority]}
                      </Tag>
                    </div>
                  }
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </Modal>
  )
}
