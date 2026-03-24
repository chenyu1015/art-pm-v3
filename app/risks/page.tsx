'use client'

import { useEffect, useState } from 'react'

export default function RisksPage() {
  const [risks, setRisks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    category: '进度',
    probability: 3,
    impact: 3,
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [risksRes, projectsRes] = await Promise.all([
      fetch('/api/risks'),
      fetch('/api/projects')
    ])
    const [risksData, projectsData] = await Promise.all([
      risksRes.json(),
      projectsRes.json()
    ])
    setRisks(risksData)
    setProjects(projectsData)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      setShowModal(false)
      setFormData({ title: '', projectId: '', category: '进度', probability: 3, impact: 3, description: '' })
      loadData()
    }
  }

  if (loading) return <div className="text-gray-500">加载中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">风险管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 登记风险
        </button>
      </div>

      {/* 风险矩阵概览 */}
      <div className="grid grid-cols-4 gap-4">
        <RiskSummaryCard level="critical" count={risks.filter(r => r.level === 'critical').length} label="严重风险" color="red" />
        <RiskSummaryCard level="high" count={risks.filter(r => r.level === 'high').length} label="高风险" color="orange" />
        <RiskSummaryCard level="medium" count={risks.filter(r => r.level === 'medium').length} label="中风险" color="yellow" />
        <RiskSummaryCard level="low" count={risks.filter(r => r.level === 'low').length} label="低风险" color="green" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">风险</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类别</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">概率</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">影响</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">等级</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {risks.map((risk: any) => (
              <tr key={risk.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{risk.title}</div>
                  <div className="text-sm text-gray-500">{risk.description}</div>
                </td>
                <td className="px-4 py-3 text-sm">{risk.category}</td>
                <td className="px-4 py-3 text-sm">{risk.probability}/5</td>
                <td className="px-4 py-3 text-sm">{risk.impact}/5</td>
                <td className="px-4 py-3">
                  <LevelBadge level={risk.level} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={risk.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新建风险弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">登记风险</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">风险标题</label>
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
                <label className="block text-sm text-gray-600 mb-1">类别</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="进度">进度</option>
                  <option value="成本">成本</option>
                  <option value="质量">质量</option>
                  <option value="资源">资源</option>
                  <option value="技术">技术</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">概率 (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.probability}
                    onChange={e => setFormData({...formData, probability: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">影响 (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.impact}
                    onChange={e => setFormData({...formData, impact: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
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

function RiskSummaryCard({ level, count, label, color }: { level: string, count: number, label: string, color: string }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600'
  }

  return (
    <div className={`p-4 rounded-lg ${colorMap[color]}`}>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-sm">{label}</div>
    </div>
  )
}

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-600',
    high: 'bg-orange-100 text-orange-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-green-100 text-green-600'
  }
  const labels: Record<string, string> = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[level] || colors.medium}`}>
      {labels[level] || level}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-600',
    assessing: 'bg-yellow-100 text-yellow-600',
    mitigating: 'bg-purple-100 text-purple-600',
    closed: 'bg-green-100 text-green-600',
    accepted: 'bg-gray-100 text-gray-600'
  }
  const labels: Record<string, string> = {
    new: '新建',
    assessing: '评估中',
    mitigating: '应对中',
    closed: '已关闭',
    accepted: '已接受'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[status] || colors.new}`}>
      {labels[status] || status}
    </span>
  )
}
