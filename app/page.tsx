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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-white/50">加载中...</div>
    </div>
  )
  
  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-red-400">加载失败</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-gradient mb-2">欢迎回来，小宇</h2>
        <p className="text-white/50">这里是你的项目管理工作台，今天有 {data.upcomingTasks.length} 个任务即将到期</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          title="进行中的项目" 
          value={data.stats.activeProjects} 
          total={data.stats.totalProjects}
          color="from-emerald-500 to-teal-500"
          icon="◈"
        />
        <StatCard 
          title="待处理任务" 
          value={data.stats.pendingTasks} 
          total={data.stats.totalTasks}
          color="from-amber-500 to-orange-500"
          icon="◉"
        />
        <StatCard 
          title="进行中任务" 
          value={data.stats.inProgressTasks} 
          total={data.stats.totalTasks}
          color="from-blue-500 to-cyan-500"
          icon="◎"
        />
        <StatCard 
          title="团队成员" 
          value={data.stats.totalPersons} 
          color="from-violet-500 to-fuchsia-500"
          icon="○"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 项目卡片 */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">项目概览</h2>
            <Link href="/projects" className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
              查看全部 →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {data.projects.map((project: any) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className="glass-card p-5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-white/40 mb-4 line-clamp-2">
                  {project.description || '暂无描述'}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/50">
                    <span>进度</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                {project.milestones.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40">
                      即将到期: <span className="text-white/60">{project.milestones[0].name}</span>
                    </p>
                    <p className="text-xs text-white/30 mt-1">
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
          <h2 className="text-lg font-semibold text-white/90">即将到期</h2>
          <div className="glass-card divide-y divide-white/5">
            {data.upcomingTasks.length === 0 ? (
              <div className="p-6 text-sm text-white/30 text-center">暂无即将到期的任务</div>
            ) : (
              data.upcomingTasks.map((task: any) => (
                <div key={task.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-white/80">{task.title}</span>
                    {task.pipeline && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full border"
                        style={{ 
                          borderColor: `${task.pipeline.color}40`,
                          color: task.pipeline.color,
                          backgroundColor: `${task.pipeline.color}10`
                        }}
                      >
                        {task.pipeline.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>{task.project?.name}</span>
                    <span>·</span>
                    <span>{new Date(task.plannedEnd).toLocaleDateString()}</span>
                  </div>
                  {task.assignee && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs text-white">
                        {task.assignee.name[0]}
                      </div>
                      <span className="text-xs text-white/50">{task.assignee.name}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 交付日历简版 */}
          <h2 className="text-lg font-semibold text-white/90 pt-4">交付日历</h2>
          <div className="glass-card p-4">
            <div className="space-y-2 max-h-48 overflow-auto">
              {data.calendarEvents.slice(0, 10).map((event: any) => (
                <div key={event.id} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <span className={`w-2 h-2 rounded-full ${
                    event.type === 'milestone' ? 'bg-fuchsia-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                  }`} />
                  <span className="text-white/40 w-20">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="text-white/70 truncate">{event.title}</span>
                </div>
              ))}
            </div>
            <Link href="/calendar" className="mt-4 block text-center text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
              查看完整日历 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, total, color, icon }: { 
  title: string
  value: number
  total?: number
  color: string
  icon: string
}) {
  return (
    <div className="glass-card p-5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl bg-gradient-to-br {color} bg-clip-text text-transparent" style={{ WebkitTextFillColor: 'transparent', backgroundImage: `linear-gradient(to bottom right, ${color.split(' ')[0].replace('from-', '')}, ${color.split(' ')[1].replace('to-', '')})` }}>
          {icon}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${color} bg-clip-text text-transparent border border-white/10`} style={{ WebkitTextFillColor: 'transparent', backgroundImage: `linear-gradient(to right, ${color.split(' ')[0].replace('from-', '')}, ${color.split(' ')[1].replace('to-', '')})`, borderColor: `${color.split(' ')[0].replace('from-', '').replace('500', '500/30')}` }}>
          {value}
        </span>
      </div>
      <p className="text-sm text-white/50">{title}</p>
      {total !== undefined && (
        <p className="text-xs text-white/30 mt-1">共 {total} 个</p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    planning: 'bg-white/10 text-white/60 border-white/10',
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    archived: 'bg-white/5 text-white/40 border-white/10'
  }

  const labels: Record<string, string> = {
    planning: '规划中',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    archived: '已归档'
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${styles[status] || styles.planning}`}>
      {labels[status] || status}
    </span>
  )
}
