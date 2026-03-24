import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects - 获取所有项目
export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(projects)
}

// POST /api/projects - 创建新项目
export async function POST(request: Request) {
  const data = await request.json()
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      status: data.status || '进行中'
    }
  })
  return NextResponse.json(project)
}
