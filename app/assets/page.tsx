'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    assetType: '角色',
    priority: 'P2'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [assetsRes, projectsRes] = await Promise.all([
      fetch('/api/assets'),
      fetch('/api/projects')
    ])
    const [assetsData, projectsData] = await Promise.all([
      assetsRes.json(),
      projectsRes.json()
    ])
    setAssets(assetsData)
    setProjects(projectsData)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      setShowModal(false)
      setFormData({ name: '', projectId: '', assetType: '角色', priority: 'P2' })
      loadData()
    }
  }

  if (loading) return <div className="text-gray-500">加载中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">资产总表</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 新建资产
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">资产</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">优先级</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">总体进度</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">管线进度</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assets.map((asset: any) => (
              <tr key={asset.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{asset.name}</div>
                  <div className="text-sm text-gray-500">{asset.project?.name}</div>
                </td>
                <td className="px-4 py-3 text-sm">{asset.assetType}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={asset.priority} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${asset.overallProgress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{asset.overallProgress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {asset.stages?.map((stage: any) => (
                      <div
                        key={stage.id}
                        className="w-6 h-6 rounded text-xs flex items-center justify-center text-white"
                        style={{ 
                          backgroundColor: stage.status === 'completed' 
                            ? stage.pipeline?.color 
                            : '#e5e7eb',
                          color: stage.status === 'completed' ? 'white' : '#9ca3af'
                        }}
                        title={stage.pipeline?.name}
                      >
                        {stage.pipeline?.name?.[0]}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新建资产弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">新建资产</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">资产名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
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
                <label className="block text-sm text-gray-600 mb-1">资产类型</label>
                <select
                  value={formData.assetType}
                  onChange={e => setFormData({...formData, assetType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="角色">角色</option>
                  <option value="场景">场景</option>
                  <option value="道具">道具</option>
                  <option value="UI界面">UI界面</option>
                  <option value="特效">特效</option>
                  <option value="音频">音频</option>
                  <option value="过场动画">过场动画</option>
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

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    P0: 'bg-red-100 text-red-600',
    P1: 'bg-orange-100 text-orange-600',
    P2: 'bg-blue-100 text-blue-600',
    P3: 'bg-gray-100 text-gray-600'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[priority] || colors.P2}`}>
      {priority}
    </span>
  )
}
