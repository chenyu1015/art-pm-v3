import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取管线列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: '缺少 projectId' }, { status: 400 })
    }

    const pipelines = await prisma.pipeline.findMany({
      where: { projectId },
      include: {
        lead: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(pipelines)
  } catch (error) {
    return NextResponse.json({ error: '获取管线失败' }, { status: 500 })
  }
}

// 更新管线
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    
    const pipeline = await prisma.pipeline.update({
      where: { id: params.id },
      data: {
        name: data.name,
        color: data.color,
        isActive: data.isActive,
        leadId: data.leadId
      }
    })

    return NextResponse.json(pipeline)
  } catch (error) {
    return NextResponse.json({ error: '更新管线失败' }, { status: 500 })
  }
}
