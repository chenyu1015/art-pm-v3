'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardData {
  stats: {
    totalProjects: number
    activeProjects: number
    totalTasks: number
    pendingTasks: number
    inProgressTasks: number
    completedTasks: number
    totalPersons: number
    upcomingMilestones: number
  }
  projects: any[]
  upcomingTasks: any[]
  calendarEvents: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-gray-500">加载中...</div>
  if (!data) return <div className="text-red-500">加载失败</div>

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          title="进行中的项目" 
          value={data.stats.activeProjects} 
          total={data.stats.totalProjects}
          color="blue"
        />
        <StatCard 
          title="待处理任务" 
          value={data.stats.pendingTasks} 
          total={data.stats.totalTasks}
          color="yellow"
        />
        <StatCard 
          title="进行中任务" 
          value={data.stats.inProgressTasks} 
          total={data.stats.totalTasks}
          color="green"
        />
        <StatCard 
          title="团队成员" 
          value={data.stats.totalPersons} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 项目卡片 */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">项目概览</h2>
            <Link href="/projects" className="text-sm text-blue-600 hover:underline">
              查看全部 →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {data.projects.map((project: any) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {project.description || '暂无描述'}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>进度</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                {project.milestones.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      即将到期: {project.milestones[0].name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(project.milestones[0].plannedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* 即将到期 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">即将到期</h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {data.upcomingTasks.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">暂无即将到期的任务</div>
            ) : (
              data.upcomingTasks.map((task: any) => (
                <div key={task.id} className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{task.title}</span>
                    {task.pipeline && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${task.pipeline.color}20`, color: task.pipeline.color }}
                      >
                        {task.pipeline.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{task.project?.name}</span>
                    <span>·</span>
                    <span>{new Date(task.plannedEnd).toLocaleDateString()}</span>
                  </div>
                  {task.assignee && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        {task.assignee.name[0]}
                      </div>
                      <span className="text-xs text-gray-500">{task.assignee.name}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 交付日历简版 */}
          <h2 className="text-lg font-semibold text-gray-800 pt-4">交付日历</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-2 max-h-48 overflow-auto">
              {data.calendarEvents.slice(0, 10).map((event: any) => (
                <div key={event.id} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full ${
                    event.type === 'milestone' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-gray-500 w-20">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="text-gray-900 truncate">{event.title}</span>
                </div>
              ))}
            </div>
            <Link href="/calendar" className="mt-4 block text-center text-sm text-blue-600 hover:underline">
              查看完整日历 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, total, color }: { 
  title: string
  value: number
  total?: number
  color: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${colors[color]?.split(' ')[1] || 'text-gray-900'}`}>
          {value}
        </span>
        {total !== undefined && (
          <span className="text-sm text-gray-400">/ {total}</span>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    planning: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-600',
    paused: 'bg-yellow-100 text-yellow-600',
    completed: 'bg-blue-100 text-blue-600',
    archived: 'bg-gray-100 text-gray-400'
  }

  const labels: Record<string, string> = {
    planning: '规划中',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    archived: '已归档'
  }

  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[status] || colors.planning}`}>
      {labels[status] || status}
    </span>
  )
}
