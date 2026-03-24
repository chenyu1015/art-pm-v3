import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取任务列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const pipelineId = searchParams.get('pipelineId')
    const status = searchParams.get('status')
    const assigneeId = searchParams.get('assigneeId')

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (pipelineId) where.pipelineId = pipelineId
    if (status) where.status = status
    if (assigneeId) where.assigneeId = assigneeId

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        pipeline: { select: { id: true, name: true, color: true } },
        milestone: { select: { id: true, name: true, plannedDate: true } },
        parent: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: '获取任务失败' }, { status: 500 })
  }
}

// 创建任务
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        pipelineId: data.pipelineId,
        title: data.title,
        description: data.description,
        status: data.status || 'todo',
        priority: data.priority || 'P2',
        assigneeId: data.assigneeId,
        plannedStart: data.plannedStart ? new Date(data.plannedStart) : null,
        plannedEnd: data.plannedEnd ? new Date(data.plannedEnd) : null,
        estimatedHours: data.estimatedHours,
        milestoneId: data.milestoneId,
        workPackageId: data.workPackageId,
        tags: data.tags || [],
        createdById: data.createdById
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        pipeline: { select: { id: true, name: true, color: true } }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: '创建任务失败' }, { status: 500 })
  }
}
