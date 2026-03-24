import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取单个项目
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        studio: true,
        owner: { select: { id: true, name: true, avatar: true } },
        pipelines: { orderBy: { sortOrder: 'asc' } },
        milestones: { orderBy: { plannedDate: 'asc' } },
        assignments: {
          include: {
            person: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 })
  }
}

// 更新项目
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        stage: data.stage,
        ownerId: data.ownerId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        budget: data.budget
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json({ error: '更新项目失败' }, { status: 500 })
  }
}

// 删除项目
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '删除项目失败' }, { status: 500 })
  }
}
