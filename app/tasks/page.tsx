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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-white/50">加载中...</div>
    </div>
  )

  const columns = [
    { key: 'todo', label: '待处理', color: 'from-white/10 to-white/5', borderColor: 'border-white/10' },
    { key: 'in_progress', label: '进行中', color: 'from-blue-500/20 to-cyan-500/10', borderColor: 'border-blue-500/30' },
    { key: 'done', label: '已完成', color: 'from-emerald-500/20 to-teal-500/10', borderColor: 'border-emerald-500/30' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">任务管理</h1>
          <p className="text-white/50 mt-1">共 {tasks.length} 个任务</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'kanban' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
            >
              看板
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
            >
              列表
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-gradient px-6 py-3 rounded-xl font-medium"
          >
            + 新建任务
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-3 gap-5">
          {columns.map(col => (
            <div key={col.key} className={`glass-card border ${col.borderColor} bg-gradient-to-b ${col.color}`}>
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-medium text-white/80">{col.label}</h3>
                <span className="text-sm text-white/40 bg-white/10 px-2 py-1 rounded-full">
                  {tasks.filter(t => t.status === col.key).length}
                </span>
              </div>
              <div className="p-3 space-y-3 min-h-[300px]">
                {tasks.filter(t => t.status === col.key).map((task: any) => (
                  <div 
                    key={task.id} 
                    className="glass-card p-4 hover:border-white/20 transition-all duration-300 group cursor-pointer"
                  >
                    <h4 className="font-medium text-white/80 mb-3 group-hover:text-white transition-colors">{task.title}</h4>
                    <div className="flex items-center gap-2 mb-3">
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
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs text-white">
                            {task.assignee.name[0]}
                          </div>
                          <span className="text-white/40 text-xs">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-white/30 text-xs">未指派</span>
                      )}
                      {task.plannedEnd && (
                        <span className="text-xs text-white/30">{new Date(task.plannedEnd).toLocaleDateString()}</span>
                      )}
                    </div>
                    {/* 状态切换 */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
                      {col.key !== 'todo' && (
                        <button 
                          onClick={() => handleStatusChange(task.id, getPrevStatus(col.key))}
                          className="text-xs text-white/30 hover:text-white/60 transition-colors"
                        >
                          ← 上移
                        </button>
                      )}
                      {col.key !== 'done' && (
                        <button 
                          onClick={() => handleStatusChange(task.id, getNextStatus(col.key))}
                          className="text-xs text-white/30 hover:text-white/60 transition-colors"
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
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-medium text-white/50">任务</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-white/50">项目</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-white/50">管线</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-white/50">负责人</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-white/50">优先级</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-white/50">状态</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-white/50">截止日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tasks.map((task: any) => (
                <tr key={task.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-medium text-white/80">{task.title}</td>
                  <td className="px-5 py-4 text-sm text-white/40">{task.project?.name}</td>
                  <td className="px-5 py-4">
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
                  </td>
                  <td className="px-5 py-4 text-sm text-white/50">{task.assignee?.name || '-'}</td>
                  <td className="px-5 py-4"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-5 py-4"><StatusBadge status={task.status} /></td>
                  <td className="px-5 py-4 text-sm text-white/40">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-96 max-w-[90%]">
            <h2 className="text-xl font-bold text-gradient mb-6">新建任务</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">任务标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                  placeholder="输入任务标题"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">所属项目</label>
                <select
                  value={formData.projectId}
                  onChange={e => setFormData({...formData, projectId: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-[#1a1a2e]">选择项目</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id} className="bg-[#1a1a2e]">{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">优先级</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="P0" className="bg-[#1a1a2e]">P0 - 紧急</option>
                  <option value="P1" className="bg-[#1a1a2e]">P1 - 高</option>
                  <option value="P2" className="bg-[#1a1a2e]">P2 - 中</option>
                  <option value="P3" className="bg-[#1a1a2e]">P3 - 低</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">截止日期</label>
                <input
                  type="date"
                  value={formData.plannedEnd}
                  onChange={e => setFormData({...formData, plannedEnd: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gradient px-4 py-3 rounded-xl"
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
    P0: 'bg-red-500/20 text-red-400 border-red-500/30',
    P1: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    P2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    P3: 'bg-white/10 text-white/50 border-white/20'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${colors[priority] || colors.P2}`}>
      {priority}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    todo: 'bg-white/10 text-white/50 border-white/20',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    done: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }
  const labels: Record<string, string> = {
    todo: '待处理',
    in_progress: '进行中',
    done: '已完成'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${colors[status] || colors.todo}`}>
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
