'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { key: '/', label: 'Dashboard', icon: '⌘' },
  { key: '/projects', label: '项目管理', icon: '📁' },
  { key: '/tasks', label: '任务管理', icon: '📋' },
  { key: '/calendar', label: '交付日历', icon: '📅' },
  { key: '/assets', label: '资产总表', icon: '🎨' },
  { key: '/persons', label: '人力资源', icon: '👥' },
  { key: '/outsource', label: '外包管理', icon: '📦' },
  { key: '/risks', label: '风险管理', icon: '⚠️' },
  { key: '/reports', label: '数据报表', icon: '📊' },
  { key: '/settings', label: '系统设置', icon: '⚙️' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600">
            {collapsed ? 'A' : 'Art PM'}
          </span>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.key}
              href={item.key}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                pathname === item.key || pathname.startsWith(item.key + '/')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-4 left-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          {collapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">
            {menuItems.find(item => item.key === pathname || pathname.startsWith(item.key + '/'))?.label || 'Art PM'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">小宇</span>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
              宇
            </div>
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
