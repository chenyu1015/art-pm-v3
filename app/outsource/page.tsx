'use client'

import { useEffect, useState } from 'react'

export default function OutsourcePage() {
  const [orders, setOrders] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showVendorModal, setShowVendorModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [ordersRes, vendorsRes, projectsRes] = await Promise.all([
      fetch('/api/outsource/orders'),
      fetch('/api/outsource/vendors'),
      fetch('/api/projects')
    ])
    const [ordersData, vendorsData, projectsData] = await Promise.all([
      ordersRes.json(),
      vendorsRes.json(),
      projectsRes.json()
    ])
    setOrders(ordersData)
    setVendors(vendorsData)
    setProjects(projectsData)
    setLoading(false)
  }

  if (loading) return <div className="text-gray-500">加载中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">外包管理</h1>
        <div className="flex gap-3">
          {activeTab === 'orders' && (
            <button
              onClick={() => setShowOrderModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + 新建订单
            </button>
          )}
          {activeTab === 'vendors' && (
            <button
              onClick={() => setShowVendorModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + 添加供应商
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'orders', label: '外包订单' },
            { key: 'vendors', label: '供应商' },
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

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">订单</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">供应商</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">项目</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">合同金额</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">计划交付</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium">{order.title}</td>
                  <td className="px-4 py-3 text-sm">{order.vendor?.name}</td>
                  <td className="px-4 py-3 text-sm">{order.project?.name}</td>
                  <td className="px-4 py-3 text-sm">¥{order.contractPrice?.toLocaleString() || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {order.plannedDelivery ? new Date(order.plannedDelivery).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="grid grid-cols-3 gap-4">
          {vendors.map((vendor: any) => (
            <div key={vendor.id} className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                <RatingBadge rating={vendor.rating} />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>联系人: {vendor.contactPerson || '-'}</p>
                <p>联系方式: {vendor.contactInfo || '-'}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {vendor.specialties?.map((s: string) => (
                    <span key={s} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-semibold">{vendor.totalOrders}</div>
                  <div className="text-xs text-gray-500">订单数</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{(vendor.avgOnTimeRate * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">准时率</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{(vendor.avgReworkRate * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">返工率</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-600',
    in_progress: 'bg-yellow-100 text-yellow-600',
    reviewing: 'bg-purple-100 text-purple-600',
    completed: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600'
  }
  const labels: Record<string, string> = {
    draft: '草稿',
    sent: '已发送',
    in_progress: '制作中',
    reviewing: '审核中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[status] || colors.draft}`}>
      {labels[status] || status}
    </span>
  )
}

function RatingBadge({ rating }: { rating: string }) {
  const colors: Record<string, string> = {
    A: 'bg-green-100 text-green-600',
    B: 'bg-blue-100 text-blue-600',
    C: 'bg-yellow-100 text-yellow-600',
    D: 'bg-red-100 text-red-600'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[rating] || colors.C}`}>
      {rating}级
    </span>
  )
}
