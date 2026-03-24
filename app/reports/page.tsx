'use client'

import { useEffect, useState } from 'react'

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        setReportData(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-gray-500">加载中...</div>
  if (!reportData) return <div className="text-red-500">加载失败</div>

  const { stats, pipelineProgress } = reportData

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">数据报表</h1>

      {/* 概览统计 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="总项目" value={stats.totalProjects} active={stats.activeProjects} suffix="进行中" />
        <StatCard title="总任务" value={stats.totalTasks} />
        <StatCard title="团队成员" value={stats.totalPersons} />
        <StatCard title="总成本" value={`¥${(stats.totalCost._sum.amount || 0).toLocaleString()}`} />
      </div>

      {/* 任务状态分布 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h2 className="font-medium text-gray-900 mb-4">任务状态分布</h2>
          <div className="space-y-3">
            {stats.taskByStatus.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {item.status === 'todo' ? '待处理' : 
                   item.status === 'in_progress' ? '进行中' : 
                   item.status === 'done' ? '已完成' : item.status}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.status === 'done' ? 'bg-green-500' :
                        item.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${(item._count.status / stats.totalTasks) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item._count.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 管线进度 */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h2 className="font-medium text-gray-900 mb-4">管线完成率</h2>
          <div className="space-y-3">
            {pipelineProgress?.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm text-gray-600">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${p.progress}%`, backgroundColor: p.color }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 风险分布 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <h2 className="font-medium text-gray-900 mb-4">风险分布</h2>
        <div className="flex gap-8">
          {stats.riskByLevel.map((item: any) => (
            <div key={item.level} className="text-center">
              <div className={`text-3xl font-bold ${
                item.level === 'critical' ? 'text-red-500' :
                item.level === 'high' ? 'text-orange-500' :
                item.level === 'medium' ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {item._count.level}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {item.level === 'critical' ? '严重' :
                 item.level === 'high' ? '高' :
                 item.level === 'medium' ? '中' : '低'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 外包统计 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <h2 className="font-medium text-gray-900 mb-4">外包概览</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats.outsourceOrders}</div>
            <div className="text-sm text-gray-500">订单数量</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              ¥{(stats.outsourceAmount._sum.contractPrice || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">合同总额</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {((stats.outsourceAmount._sum.contractPrice || 0) / (stats.totalCost._sum.amount || 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">外包占比</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, active, suffix }: { title: string, value: string | number, active?: number, suffix?: string }) {
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {active !== undefined && (
        <div className="text-sm text-green-600 mt-1">{active} {suffix}</div>
      )}
    </div>
  )
}
