'use client'

import { Card, Button, Table, Tag, Modal, Form, Input, Select, Message, Radio, Grid } from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'

const FormItem = Form.Item
const { Row, Col } = Grid

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [view, setView] = useState('kanban')
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [tasksRes, projectsRes] = await Promise.all([
      fetch('/api/tasks'),
      fetch('/api/projects')
    ])
    const [tasksData, projectsData] = await Promise.all([
      tasksRes.json(),
      projectsRes.json()
    ])
    setTasks(tasksData)
    setProjects(projectsData)
    setLoading(false)
  }

  const handleSubmit = async () => {
    const values = await form.validate()
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })
    if (res.ok) {
      Message.success('任务创建成功')
      setVisible(false)
      form.resetFields()
      loadData()
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    loadData()
  }

  const columns = [
    { title: '任务', dataIndex: 'title' },
    { 
      title: '项目', 
      dataIndex: 'project',
      render: (project: any) => project?.name
    },
    { 
      title: '管线', 
      dataIndex: 'pipeline',
      render: (pipeline: any) => pipeline && (
        <Tag color={pipeline.color}>{pipeline.name}</Tag>
      )
    },
    { 
      title: '负责人', 
      dataIndex: 'assignee',
      render: (assignee: any) => assignee?.name || '-'
    },
    { 
      title: '优先级', 
      dataIndex: 'priority',
      render: (p: string) => <Tag color={getPriorityColor(p)}>{p}</Tag>
    },
    { 
      title: '状态', 
      dataIndex: 'status',
      render: (s: string) => <Tag color={getStatusColor(s)}>{getStatusLabel(s)}</Tag>
    },
    { 
      title: '截止日期', 
      dataIndex: 'plannedEnd',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    }
  ]

  const kanbanColumns = [
    { key: 'todo', title: '待处理', color: 'gray' },
    { key: 'in_progress', title: '进行中', color: 'blue' },
    { key: 'done', title: '已完成', color: 'green' }
  ]

  return (
    <div className="space-y-4">
      <Card
        title="任务管理"
        extra={
          <div className="flex gap-3">
            <Radio.Group value={view} onChange={setView} type="button">
              <Radio value="kanban">看板</Radio>
              <Radio value="list">列表</Radio>
            </Radio.Group>
            <Button type="primary" icon={<IconPlus />} onClick={() => setVisible(true)}>
              新建任务
            </Button>
          </div>
        }
      >
        {view === 'kanban' ? (
          <Row gutter={16}>
            {kanbanColumns.map(col => (
              <Col span={8} key={col.key}>
                <Card
                  title={`${col.title} (${tasks.filter(t => t.status === col.key).length})`}
                  bodyStyle={{ padding: 12, minHeight: 400, backgroundColor: '#f7f8fa' }}
                >
                  <div className="space-y-2">
                    {tasks.filter(t => t.status === col.key).map((task: any) => (
                      <Card
                        key={task.id}
                        size="small"
                        bodyStyle={{ padding: 12 }}
                        hoverable
                      >
                        <div className="font-medium mb-2">{task.title}</div>
                        <div className="flex gap-2 mb-2">
                          {task.pipeline && (
                            <Tag size="small" style={{ backgroundColor: `${task.pipeline.color}20`, color: task.pipeline.color }}>
                              {task.pipeline.name}
                            </Tag>
                          )}
                          <Tag size="small" color={getPriorityColor(task.priority)}>{task.priority}</Tag>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {task.assignee?.name || '未指派'}
                          </span>
                          <div className="flex gap-1">
                            {col.key !== 'todo' && (
                              <Button size="mini" onClick={() => handleStatusChange(task.id, getPrevStatus(col.key))}>
                                ←
                              </Button>
                            )}
                            {col.key !== 'done' && (
                              <Button size="mini" onClick={() => handleStatusChange(task.id, getNextStatus(col.key))}>
                                →
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Table columns={columns} data={tasks} loading={loading} rowKey="id" />
        )}
      </Card>

      <Modal
        title="新建任务"
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}
      >
        <Form form={form} layout="vertical">
          <FormItem label="任务标题" field="title" rules={[{ required: true }]}>
            <Input placeholder="输入任务标题" />
          </FormItem>
          <FormItem label="所属项目" field="projectId" rules={[{ required: true }]}>
            <Select placeholder="选择项目" options={projects.map(p => ({ label: p.name, value: p.id }))} />
          </FormItem>
          <FormItem label="优先级" field="priority" initialValue="P2">
            <Select options={[
              { label: 'P0 - 紧急', value: 'P0' },
              { label: 'P1 - 高', value: 'P1' },
              { label: 'P2 - 中', value: 'P2' },
              { label: 'P3 - 低', value: 'P3' }
            ]} />
          </FormItem>
          <FormItem label="截止日期" field="plannedEnd">
            <Input type="date" />
          </FormItem>
        </Form>
      </Modal>
    </div>
  )
}

function getPriorityColor(p: string) {
  const colors: Record<string, string> = { P0: 'red', P1: 'orange', P2: 'blue', P3: 'gray' }
  return colors[p] || 'blue'
}

function getStatusColor(s: string) {
  const colors: Record<string, string> = { todo: 'gray', in_progress: 'blue', done: 'green' }
  return colors[s] || 'gray'
}

function getStatusLabel(s: string) {
  const labels: Record<string, string> = { todo: '待处理', in_progress: '进行中', done: '已完成' }
  return labels[s] || s
}

function getNextStatus(c: string) {
  const map: Record<string, string> = { todo: 'in_progress', in_progress: 'done' }
  return map[c] || c
}

function getPrevStatus(c: string) {
  const map: Record<string, string> = { done: 'in_progress', in_progress: 'todo' }
  return map[c] || c
}
