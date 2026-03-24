'use client'

import { Card, Button, Table, Tag, Modal, Form, Input, Select, Message } from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const FormItem = Form.Item

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setLoading(false)
      })
  }

  const handleSubmit = async () => {
    const values = await form.validate()
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })
    if (res.ok) {
      Message.success('项目创建成功')
      setVisible(false)
      form.resetFields()
      loadProjects()
    }
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      render: (name: string, record: any) => (
        <Link href={`/projects/${record.id}`} style={{ color: '#165DFF', fontWeight: 500 }}>
          {name}
        </Link>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      )
    },
    {
      title: '阶段',
      dataIndex: 'stage'
    },
    {
      title: '任务数',
      dataIndex: 'tasks',
      render: (_: any, record: any) => record._count?.tasks || 0
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ]

  return (
    <div className="space-y-4">
      <Card
        title="项目管理"
        extra={
          <Button type="primary" icon={<IconPlus />} onClick={() => setVisible(true)}>
            新建项目
          </Button>
        }
      >
        <Table
          columns={columns}
          data={projects}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title="新建项目"
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}
      >
        <Form form={form} layout="vertical">
          <FormItem label="项目名称" field="name" rules={[{ required: true }]}>
            <Input placeholder="输入项目名称" />
          </FormItem>
          <FormItem label="项目描述" field="description">
            <Input.TextArea placeholder="输入项目描述" rows={3} />
          </FormItem>
          <FormItem label="当前阶段" field="stage" initialValue="预研">
            <Select options={[
              { label: '预研', value: '预研' },
              { label: '量产', value: '量产' },
              { label: '运营', value: '运营' }
            ]} />
          </FormItem>
        </Form>
      </Modal>
    </div>
  )
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    planning: 'gray',
    active: 'green',
    paused: 'orange',
    completed: 'blue'
  }
  return colors[status] || 'gray'
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    planning: '规划中',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成'
  }
  return labels[status] || status
}
