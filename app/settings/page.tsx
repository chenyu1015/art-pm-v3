'use client'

import { Card, Tag, Button } from '@arco-design/web-react'

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <Card title="系统信息">
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">系统名称</span>
            <span>Art PM - 游戏美术项目管理工作台</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">版本</span>
            <span>v1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">技术栈</span>
            <span>Next.js 14 + React 18 + Prisma + PostgreSQL</span>
          </div>
        </div>
      </Card>

      <Card title="功能模块状态">
        <div className="grid grid-cols-2 gap-3">
          <FeatureItem name="Dashboard" status="completed" />
          <FeatureItem name="项目管理" status="completed" />
          <FeatureItem name="管线配置" status="completed" />
          <FeatureItem name="任务管理" status="completed" />
          <FeatureItem name="里程碑管理" status="completed" />
          <FeatureItem name="交付日历" status="completed" />
          <FeatureItem name="资产总表" status="completed" />
          <FeatureItem name="人力资源" status="completed" />
          <FeatureItem name="外包管理" status="completed" />
          <FeatureItem name="风险管理" status="completed" />
          <FeatureItem name="数据报表" status="completed" />
          <FeatureItem name="工作流引擎" status="planned" />
        </div>
      </Card>

      <Card title="数据管理">
        <div className="flex gap-3">
          <Button>导出数据</Button>
          <Button>导入数据</Button>
        </div>
      </Card>
    </div>
  )
}

function FeatureItem({ name, status }: { name: string, status: 'completed' | 'planned' | 'in_progress' }) {
  const colors = {
    completed: 'green',
    in_progress: 'blue',
    planned: 'gray'
  }
  const labels = {
    completed: '已完成',
    in_progress: '进行中',
    planned: '规划中'
  }
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
      <span className="text-gray-700">{name}</span>
      <Tag color={colors[status]}>{labels[status]}</Tag>
    </div>
  )
}
