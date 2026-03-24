import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取里程碑列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (projectId) where.projectId = projectId

    const milestones = await prisma.milestone.findMany({
      where,
      include: {
        _count: { select: { tasks: true } }
      },
      orderBy: { plannedDate: 'asc' }
    })

    return NextResponse.json(milestones)
  } catch (error) {
    return NextResponse.json({ error: '获取里程碑失败' }, { status: 500 })
  }
}

// 创建里程碑
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const milestone = await prisma.milestone.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        plannedDate: new Date(data.plannedDate),
        status: data.status || 'upcoming'
      }
    })

    return NextResponse.json(milestone)
  } catch (error) {
    return NextResponse.json({ error: '创建里程碑失败' }, { status: 500 })
  }
}

// 更新里程碑
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    
    const milestone = await prisma.milestone.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        plannedDate: data.plannedDate ? new Date(data.plannedDate) : undefined,
        actualDate: data.actualDate ? new Date(data.actualDate) : null,
        progress: data.progress
      }
    })

    return NextResponse.json(milestone)
  } catch (error) {
    return NextResponse.json({ error: '更新里程碑失败' }, { status: 500 })
  }
}

// 删除里程碑
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.milestone.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '删除里程碑失败' }, { status: 500 })
  }
}
