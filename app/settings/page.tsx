'use client'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">系统设置</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-4">系统信息</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">系统名称</span>
            <span>Art PM - 游戏美术项目管理工作台</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">版本</span>
            <span>v1.0.0 (Phase 1 MVP)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">技术栈</span>
            <span>Next.js 14 + React 18 + Prisma + PostgreSQL</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-4">功能模块状态</h2>
        <div className="space-y-2">
          <FeatureItem name="Dashboard" status="completed" />
          <FeatureItem name="项目管理" status="completed" />
          <FeatureItem name="管线配置" status="completed" />
          <FeatureItem name="任务管理" status="completed" />
          <FeatureItem name="里程碑管理" status="completed" />
          <FeatureItem name="交付日历" status="completed" />
          <FeatureItem name="人力资源" status="completed" />
          <FeatureItem name="工作包管理" status="planned" />
          <FeatureItem name="成本管理" status="planned" />
          <FeatureItem name="风险管理" status="planned" />
          <FeatureItem name="数据报表" status="planned" />
          <FeatureItem name="工作流引擎" status="planned" />
          <FeatureItem name="外包管理" status="planned" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-4">数据管理</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            导出数据
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            导入数据
          </button>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ name, status }: { name: string, status: 'completed' | 'planned' | 'in_progress' }) {
  const colors = {
    completed: 'bg-green-100 text-green-600',
    in_progress: 'bg-blue-100 text-blue-600',
    planned: 'bg-gray-100 text-gray-500'
  }
  const labels = {
    completed: '已完成',
    in_progress: '进行中',
    planned: '规划中'
  }
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{name}</span>
      <span className={`text-xs px-2 py-1 rounded ${colors[status]}`}>
        {labels[status]}
      </span>
    </div>
  )
}
