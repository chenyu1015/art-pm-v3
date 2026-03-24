'use client'

import { useEffect, useState } from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    pipelineId: '',
    assigneeId: '',
    priority: 'P2',
    plannedEnd: ''
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      setShowModal(false)
      setFormData({ title: '', projectId: '', pipelineId: '', assigneeId: '', priority: 'P2', plannedEnd: '' })
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

  if (loading) return <div className="text-gray-500">加载中...</div>

  const columns = [
    { key: 'todo', label: '待处理', color: 'bg-gray-100' },
    { key: 'in_progress', label: '进行中', color: 'bg-blue-50' },
    { key: 'done', label: '已完成', color: 'bg-green-50' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">任务管理</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 rounded text-sm ${view === 'kanban' ? 'bg-white shadow' : ''}`}
            >
              看板
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm ${view === 'list' ? 'bg-white shadow' : ''}`}
            >
              列表
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + 新建任务
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-3 gap-4">
          {columns.map(col => (
            <div key={col.key} className={`${col.color} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700">{col.label}</h3>
                <span className="text-sm text-gray-500">
                  {tasks.filter(t => t.status === col.key).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.filter(t => t.status === col.key).map((task: any) => (
                  <div 
                    key={task.id} 
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      {task.pipeline && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${task.pipeline.color}20`, color: task.pipeline.color }}
                        >
                          {task.pipeline.name}
                        </span>
                      )}
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      {task.assignee ? (
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {task.assignee.name[0]}
                          </div>
                          <span>{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span>未指派</span>
                      )}
                      {task.plannedEnd && (
                        <span>{new Date(task.plannedEnd).toLocaleDateString()}</span>
                      )}
                    </div>
                    {/* 状态切换 */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                      {col.key !== 'todo' && (
                        <button 
                          onClick={() => handleStatusChange(task.id, getPrevStatus(col.key))}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          ← 上移
                        </button>
                      )}
                      {col.key !== 'done' && (
                        <button 
                          onClick={() => handleStatusChange(task.id, getNextStatus(col.key))}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          下移 →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">任务</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">项目</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">管线</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">负责人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">优先级</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">截止日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task: any) => (
                <tr key={task.id}>
                  <td className="px-4 py-3 font-medium">{task.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{task.project?.name}</td>
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
                  <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {task.plannedEnd ? new Date(task.plannedEnd).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 新建任务弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">新建任务</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">任务标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">所属项目</label>
                <select
                  value={formData.projectId}
                  onChange={e => setFormData({...formData, projectId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">选择项目</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">优先级</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="P0">P0 - 紧急</option>
                  <option value="P1">P1 - 高</option>
                  <option value="P2">P2 - 中</option>
                  <option value="P3">P3 - 低</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">截止日期</label>
                <input
                  type="date"
                  value={formData.plannedEnd}
                  onChange={e => setFormData({...formData, plannedEnd: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    P0: 'bg-red-100 text-red-600',
    P1: 'bg-orange-100 text-orange-600',
    P2: 'bg-blue-100 text-blue-600',
    P3: 'bg-gray-100 text-gray-600'
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[priority] || colors.P2}`}>
      {priority}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-600',
    done: 'bg-green-100 text-green-600'
  }
  const labels: Record<string, string> = {
    todo: '待处理',
    in_progress: '进行中',
    done: '已完成'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[status] || colors.todo}`}>
      {labels[status] || status}
    </span>
  )
}

function getNextStatus(current: string): string {
  const map: Record<string, string> = { todo: 'in_progress', in_progress: 'done' }
  return map[current] || current
}

function getPrevStatus(current: string): string {
  const map: Record<string, string> = { done: 'in_progress', in_progress: 'todo' }
  return map[current] || current
}
