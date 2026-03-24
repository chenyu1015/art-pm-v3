'use client'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient">系统设置</h1>
        <p className="text-white/50 mt-1">管理系统配置和功能开关</p>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white/90 mb-4">系统信息</h2>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between py-3 border-b border-white/10">
            <span className="text-white/50">系统名称</span>
            <span className="text-white/80">Art PM - 游戏美术项目管理工作台</span>
          </div>
          <div className="flex justify-between py-3 border-b border-white/10">
            <span className="text-white/50">版本</span>
            <span className="text-white/80">v1.0.0</span>
          </div>
          <div className="flex justify-between py-3 border-b border-white/10">
            <span className="text-white/50">技术栈</span>
            <span className="text-white/80">Next.js 14 + React 18 + Prisma + PostgreSQL</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-semibold text-white/90 mb-4">功能模块状态</h2>
        <div className="grid grid-cols-2 gap-3">
          <FeatureItem name="Dashboard" status="completed" />
          <FeatureItem name="项目管理" status="completed" />
          <FeatureItem name="管线配置" status="completed" />
          <FeatureItem name="任务管理" status="completed" />
          <FeatureItem name="里程碑管理" status="completed" />
          <FeatureItem name="交付日历" status="completed" />
          <FeatureItem name="资产总表" status="completed" />
          <FeatureItem name="人力资源" status="completed" />
          <FeatureItem name="外包管理" status="completed" />
          <FeatureItem name="风险管理" status="completed" />
          <FeatureItem name="数据报表" status="completed" />
          <FeatureItem name="工作流引擎" status="planned" />
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-semibold text-white/90 mb-4">数据管理</h2>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm">
            导出数据
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm">
            导入数据
          </button>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ name, status }: { name: string, status: 'completed' | 'planned' | 'in_progress' }) {
  const colors = {
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    planned: 'bg-white/10 text-white/40 border-white/20'
  }
  const labels = {
    completed: '已完成',
    in_progress: '进行中',
    planned: '规划中'
  }
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
      <span className="text-sm text-white/70">{name}</span>
      <span className={`text-xs px-2 py-1 rounded-full border ${colors[status]}`}>
        {labels[status]}
      </span>
    </div>
  )
}
