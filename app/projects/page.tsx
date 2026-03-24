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

  if (loading) return <div className="text-gray-500">加载中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">项目管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 新建项目
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((project: any) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {project.description || '暂无描述'}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{project._count?.tasks || 0} 个任务</span>
              <span>{project.stage}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 新建项目弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">新建项目</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">项目名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">项目描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">当前阶段</label>
                <select
                  value={formData.stage}
                  onChange={e => setFormData({...formData, stage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="预研">预研</option>
                  <option value="量产">量产</option>
                  <option value="运营">运营</option>
                </select>
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
    <span className={`text-xs px-2 py-1 rounded ${colors[status] || colors.planning}`}>
      {labels[status] || status}
    </span>
  )
}
