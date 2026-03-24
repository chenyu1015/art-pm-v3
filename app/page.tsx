'use client'

import { Card, Grid, Statistic, Progress, List, Badge, Typography, Tag } from '@arco-design/web-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const { Row, Col } = Grid
const { Title, Text } = Typography

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>加载中...</div>
  if (!data) return <div>加载失败</div>

  return (
    <div className="space-y-5">
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中的项目"
              value={data.stats.activeProjects}
              suffix={`/ ${data.stats.totalProjects}`}
              style={{ color: '#165DFF' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理任务"
              value={data.stats.pendingTasks}
              suffix={`/ ${data.stats.totalTasks}`}
              style={{ color: '#F7BA1E' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中任务"
              value={data.stats.inProgressTasks}
              suffix={`/ ${data.stats.totalTasks}`}
              style={{ color: '#00B42A' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={data.stats.totalPersons}
              style={{ color: '#722ED1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 项目列表 */}
        <Col span={16}>
          <Card 
            title="项目概览" 
            extra={<Link href="/projects" style={{ color: '#165DFF' }}>查看全部 →</Link>}
          >
            <Row gutter={[16, 16]}>
              {data.projects.map((project: any) => (
                <Col span={12} key={project.id}>
                  <Link href={`/projects/${project.id}`}>
                    <Card 
                      hoverable 
                      style={{ cursor: 'pointer' }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Title heading={6} style={{ margin: 0 }}>{project.name}</Title>
                        <Tag color={getStatusColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {project.description || '暂无描述'}
                      </Text>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>进度</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress percent={project.progress} size="small" />
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* 即将到期 */}
        <Col span={8}>
          <Card title="即将到期">
            <List
              dataSource={data.upcomingTasks}
              render={(item: any) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <Text style={{ fontWeight: 500 }}>{item.title}</Text>
                      {item.pipeline && (
                        <Tag size="small" style={{ backgroundColor: `${item.pipeline.color}20`, color: item.pipeline.color }}>
                          {item.pipeline.name}
                        </Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.project?.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>·</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(item.plannedEnd).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          <Card title="交付日历" className="mt-4">
            <List
              dataSource={data.calendarEvents.slice(0, 5)}
              render={(item: any) => (
                <List.Item>
                  <div className="flex items-center gap-3">
                    <Badge 
                      dot 
                      color={item.type === 'milestone' ? '#F53F3F' : '#165DFF'} 
                    />
                    <Text style={{ fontSize: 13 }}>{item.title}</Text>
                  </div>
                </List.Item>
              )}
            />
            <Link href="/calendar" style={{ color: '#165DFF', fontSize: 13 }}>
              查看完整日历 →
            </Link>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    planning: 'gray',
    active: 'green',
    paused: 'orange',
    completed: 'blue',
    archived: 'gray'
  }
  return colors[status] || 'gray'
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    planning: '规划中',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    archived: '已归档'
  }
  return labels[status] || status
}
