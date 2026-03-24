import './globals.css'
import type { Metadata } from 'next'
import { Layout } from '@/app/_components/Layout'

export const metadata: Metadata = {
  title: 'Art PM - 游戏美术项目管理',
  description: '面向游戏美术团队的全局项目管理工作台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
