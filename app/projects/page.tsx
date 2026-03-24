'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stage: '预研'
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      setShowModal(false)
      setFormData({ name: '', description: '', stage: '预研' })
      loadProjects()
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-white/50">加载中...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">项目管理</h1>
          <p className="text-white/50 mt-1">管理你的游戏美术项目，共 {projects.length} 个项目</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-gradient px-6 py-3 rounded-xl font-medium"
        >
          + 新建项目
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {projects.map((project: any) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="glass-card p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-2xl border border-white/10 group-hover:border-violet-500/30 transition-colors">
                ◈
              </div>
              <StatusBadge status={project.status} />
            </div>
            <h3 className="font-semibold text-white/90 text-lg mb-2 group-hover:text-white transition-colors">{project.name}</h3>
            <p className="text-sm text-white/40 mb-4 line-clamp-2">
              {project.description || '暂无描述'}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">{project._count?.tasks || 0} 个任务</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-xs">{project.stage}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 新建项目弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-96 max-w-[90%]">
            <h2 className="text-xl font-bold text-gradient mb-6">新建项目</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">项目名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                  placeholder="输入项目名称"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">项目描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all resize-none"
                  placeholder="输入项目描述"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">当前阶段</label>
                <select
                  value={formData.stage}
                  onChange={e => setFormData({...formData, stage: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="预研" className="bg-[#1a1a2e]">预研</option>
                  <option value="量产" className="bg-[#1a1a2e]">量产</option>
                  <option value="运营" className="bg-[#1a1a2e]">运营</option>
                </select>
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    planning: 'bg-white/10 text-white/60 border-white/10',
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }
  const labels: Record<string, string> = {
    planning: '规划中',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成'
  }
  return (
    <span className={`text-xs px-3 py-1 rounded-full border ${styles[status] || styles.planning}`}>
      {labels[status] || status}
    </span>
  )
}
