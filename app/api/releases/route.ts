import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取版本列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (projectId) where.projectId = projectId

    const releases = await prisma.release.findMany({
      where,
      include: {
        _count: { select: { workPackages: true } }
      },
      orderBy: { plannedStart: 'desc' }
    })

    return NextResponse.json(releases)
  } catch (error) {
    return NextResponse.json({ error: '获取版本失败' }, { status: 500 })
  }
}

// 创建版本
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const release = await prisma.release.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        plannedStart: data.plannedStart ? new Date(data.plannedStart) : null,
        plannedEnd: data.plannedEnd ? new Date(data.plannedEnd) : null,
        status: data.status || 'planning'
      }
    })

    return NextResponse.json(release)
  } catch (error) {
    return NextResponse.json({ error: '创建版本失败' }, { status: 500 })
  }
}
