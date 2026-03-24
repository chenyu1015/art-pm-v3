'use client'

import { Card, Table, Tag, Avatar, Space, Typography, Badge } from '@arco-design/web-react'
import { useEffect, useState } from 'react'

const { Title, Text } = Typography

export default function PersonsPage() {
  const [persons, setPersons] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [personsRes, deptsRes] = await Promise.all([
      fetch('/api/persons'),
      fetch('/api/departments')
    ])
    const [personsData, deptsData] = await Promise.all([
      personsRes.json(),
      deptsRes.json()
    ])
    setPersons(personsData)
    setDepartments(deptsData)
    setLoading(false)
  }

  // 按部门分组统计
  const deptStats = departments.map(dept => ({
    ...dept,
    count: persons.filter(p => p.departmentId === dept.id).length
  }))

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      render: (name: string) => (
        <Space>
          <Avatar size={32} style={{ backgroundColor: '#165DFF' }}>
            {name[0]}
          </Avatar>
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      )
    },
    {
      title: '部门',
      dataIndex: 'department',
      render: (dept: any) => dept?.name || '-'
    },
    {
      title: '技能',
      dataIndex: 'skills',
      render: (skills: string[]) => (
        <Space>
          {skills?.map(skill => (
            <Tag key={skill} size="small" color="blue">{skill}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '职级',
      dataIndex: 'title',
      render: (title: string) => title || '-'
    },
    {
      title: '成本系数',
      dataIndex: 'costFactor',
      render: (factor: number) => `${factor}x`
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'}
          text={status === 'active' ? '在职' : '离职'}
        />
      )
    }
  ]

  return (
    <div className="space-y-4">
      <Card>
        <Title heading={6} style={{ marginBottom: 16 }}>部门概览</Title>
        <Space wrap>
          {deptStats.map(dept => (
            <Card
              key={dept.id}
              style={{ width: 140, textAlign: 'center', cursor: 'pointer' }}
              hoverable
            >
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#165DFF' }}>
                {dept.count}
              </div>
              <div style={{ fontSize: 13, color: '#86909c', marginTop: 4 }}>
                {dept.name}
              </div>
            </Card>
          ))}
        </Space>
      </Card>

      <Card title={`人员列表 (${persons.length}人)`}>
        <Table
          columns={columns}
          data={persons}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}
