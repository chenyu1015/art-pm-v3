'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { key: '/', label: 'Dashboard', icon: '◆' },
  { key: '/projects', label: '项目管理', icon: '◈' },
  { key: '/tasks', label: '任务管理', icon: '◉' },
  { key: '/calendar', label: '交付日历', icon: '◎' },
  { key: '/assets', label: '资产总表', icon: '◊' },
  { key: '/persons', label: '人力资源', icon: '○' },
  { key: '/outsource', label: '外包管理', icon: '□' },
  { key: '/risks', label: '风险管理', icon: '△' },
  { key: '/reports', label: '数据报表', icon: '◇' },
  { key: '/settings', label: '系统设置', icon: '⚙' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-[#0f0f1a]/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <span className="text-2xl font-bold text-gradient">
            {collapsed ? 'A' : 'Art PM'}
          </span>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = pathname === item.key || pathname.startsWith(item.key + '/')
            return (
              <Link
                key={item.key}
                href={item.key}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`text-lg w-6 text-center transition-transform group-hover:scale-110 ${
                  isActive ? 'text-fuchsia-400' : ''
                }`}>{item.icon}</span>
                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-4 border-t border-white/10 text-white/40 hover:text-white transition-colors"
        >
          {collapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
          <h1 className="text-lg font-medium text-white/90">
            {menuItems.find(item => pathname === item.key || pathname.startsWith(item.key + '/'))?.label || 'Art PM'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">小宇</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-medium">
              宇
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
