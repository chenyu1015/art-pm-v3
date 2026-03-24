'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projects/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setProject(data)
          setLoading(false)
        })
    }
  }, [params.id])

  if (loading) return <div className="text-gray-500">加载中...</div>
  if (!project) return <div className="text-red-500">项目不存在</div>

  return (
    <div className="space-y-4">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/projects" className="hover:text-blue-600">项目</Link>
        <span>/</span>
        <span className="text-gray-900">{project.name}</span>
      </div>

      {/* 项目标题 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500 mt-1">{project.description || '暂无描述'}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Tab 导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'overview', label: '概览' },
            { key: 'pipelines', label: '管线' },
            { key: 'tasks', label: '任务' },
            { key: 'milestones', label: '里程碑' },
            { key: 'team', label: '团队' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 内容 */}
      <div className="pt-4">
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'pipelines' && <PipelinesTab pipelines={project.pipelines} />}
        {activeTab === 'tasks' && <TasksTab projectId={project.id} />}
        {activeTab === 'milestones' && <MilestonesTab milestones={project.milestones} projectId={project.id} />}
        {activeTab === 'team' && <TeamTab assignments={project.assignments} />}
      </div>
    </div>
  )
}

function OverviewTab({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">项目信息</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">状态</span>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">阶段</span>
            <span>{project.stage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">负责人</span>
            <span>{project.owner?.name || '未指派'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">开始日期</span>
            <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">结束日期</span>
            <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">预算</span>
            <span>{project.budget ? `¥${project.budget.toLocaleString()}` : '-'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">统计</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{project.pipelines?.length || 0}</div>
            <div className="text-sm text-gray-500">管线</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-green-600">{project._count?.tasks || 0}</div>
            <div className="text-sm text-gray-500">任务</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-purple-600">{project.milestones?.length || 0}</div>
            <div className="text-sm text-gray-500">里程碑</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-orange-600">{project.assignments?.length || 0}</div>
            <div className="text-sm text-gray-500">成员</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PipelinesTab({ pipelines }: { pipelines: any[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">管线</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">负责人</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">任务数</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pipelines?.map((pipeline: any) => (
            <tr key={pipeline.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: pipeline.color }}
                  />
                  <span className="font-medium">{pipeline.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  pipeline.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {pipeline.isActive ? '启用' : '禁用'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">{pipeline.lead?.name || '-'}</td>
              <td className="px-4 py-3 text-sm">{pipeline._count?.tasks || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TasksTab({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/tasks?projectId=${projectId}`)
      .then(res => res.json())
      .then(setTasks)
  }, [projectId])

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">任务</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">管线</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">负责人</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">截止日期</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tasks.map((task: any) => (
            <tr key={task.id}>
              <td className="px-4 py-3 font-medium">{task.title}</td>
              <td className="px-4 py-3">
                {task.pipeline && (
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: `${task.pipeline.color}20`, color: task.pipeline.color }}
                  >
                    {task.pipeline.name}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm">{task.assignee?.name || '-'}</td>
              <td className="px-4 py-3">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {task.plannedEnd ? new Date(task.plannedEnd).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MilestonesTab({ milestones, projectId }: { milestones: any[], projectId: string }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200">
        {milestones?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无里程碑</div>
        ) : (
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative flex items-start gap-4 p-6">
                <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${
                  milestone.status === 'completed' 
                    ? 'bg-green-500 border-green-500' 
                    : milestone.status === 'active'
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-500">
                      计划日期: {new Date(milestone.plannedDate).toLocaleDateString()}
                    </span>
                    <MilestoneStatusBadge status={milestone.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TeamTab({ assignments }: { assignments: any[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">成员</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">项目角色</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">分配比例</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">时间段</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {assignments?.map((assignment: any) => (
            <tr key={assignment.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                    {assignment.person?.name?.[0] || '?'}
                  </div>
                  <span className="font-medium">{assignment.person?.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">{assignment.role || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${assignment.allocation}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{assignment.allocation}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : '-'} 
                {' ~ '}
                {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    planning: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-600',
    paused: 'bg-yellow-100 text-yellow-600',
    completed: 'bg-blue-100 text-blue-600'
  }
  const labels: Record<string, string> = {
    planning: '规划中',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成'
  }
  return (
    <span className={`text-sm px-3 py-1 rounded ${colors[status] || colors.planning}`}>
      {labels[status] || status}
    </span>
  )
}

function TaskStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-600',
    done: 'bg-green-100 text-green-600',
    blocked: 'bg-red-100 text-red-600'
  }
  const labels: Record<string, string> = {
    todo: '待处理',
    in_progress: '进行中',
    done: '已完成',
    blocked: '已阻塞'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[status] || colors.todo}`}>
      {labels[status] || status}
    </span>
  )
}

function MilestoneStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    upcoming: 'bg-gray-100 text-gray-600',
    active: 'bg-blue-100 text-blue-600',
    completed: 'bg-green-100 text-green-600',
    delayed: 'bg-red-100 text-red-600'
  }
  const labels: Record<string, string> = {
    upcoming: '即将开始',
    active: '进行中',
    completed: '已完成',
    delayed: '已延期'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[status] || colors.upcoming}`}>
      {labels[status] || status}
    </span>
  )
}
