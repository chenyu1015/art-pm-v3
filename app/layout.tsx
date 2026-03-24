export const metadata = {
  title: 'Art PM - v0.3',
  description: '项目管理工具 v0.3',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
