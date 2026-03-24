'use client'

import { Layout, Menu, Button, Avatar, Grid } from '@arco-design/web-react'
import { 
  IconDashboard, 
  IconFolder, 
  IconList, 
  IconCalendar,
  IconSafe,
  IconUserGroup,
  IconGift,
  IconExclamationCircle,
  IconApps,
  IconSettings
} from '@arco-design/web-react/icon'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const { Sider, Header, Content } = Layout

const menuItems = [
  { key: '/', label: 'Dashboard', icon: <IconDashboard /> },
  { key: '/projects', label: '项目管理', icon: <IconFolder /> },
  { key: '/tasks', label: '任务管理', icon: <IconList /> },
  { key: '/calendar', label: '交付日历', icon: <IconCalendar /> },
  { key: '/assets', label: '资产总表', icon: <IconSafe /> },
  { key: '/persons', label: '人力资源', icon: <IconUserGroup /> },
  { key: '/outsource', label: '外包管理', icon: <IconGift /> },
  { key: '/risks', label: '风险管理', icon: <IconExclamationCircle /> },
  { key: '/reports', label: '数据报表', icon: <IconApps /> },
  { key: '/settings', label: '系统设置', icon: <IconSettings /> },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const selectedKeys = [pathname]

  return (
    <Layout className="h-screen">
      <Sider
        width={220}
        className="bg-[#1d2129]"
        trigger={null}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <span className="text-xl font-bold text-white">Art PM</span>
        </div>
        <Menu
          selectedKeys={selectedKeys}
          style={{ background: 'transparent', border: 'none' }}
          className="mt-2"
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key}>
              <Link href={item.key} className="flex items-center gap-2">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h1 className="text-lg font-medium text-gray-800">
            {menuItems.find(item => pathname === item.key || pathname.startsWith(item.key + '/'))?.label || 'Art PM'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">小宇</span>
            <Avatar size={32} style={{ backgroundColor: '#165DFF' }}>
              宇
            </Avatar>
          </div>
        </Header>
        <Content className="bg-gray-50 p-6 overflow-auto">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
