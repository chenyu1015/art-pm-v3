import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 更新任务
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId
    if (data.pipelineId !== undefined) updateData.pipelineId = data.pipelineId
    if (data.plannedStart !== undefined) updateData.plannedStart = data.plannedStart ? new Date(data.plannedStart) : null
    if (data.plannedEnd !== undefined) updateData.plannedEnd = data.plannedEnd ? new Date(data.plannedEnd) : null
    if (data.actualStart !== undefined) updateData.actualStart = data.actualStart ? new Date(data.actualStart) : null
    if (data.actualEnd !== undefined) updateData.actualEnd = data.actualEnd ? new Date(data.actualEnd) : null
    if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours
    if (data.progress !== undefined) updateData.progress = data.progress
    if (data.milestoneId !== undefined) updateData.milestoneId = data.milestoneId
    if (data.tags !== undefined) updateData.tags = data.tags

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        pipeline: { select: { id: true, name: true, color: true } }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: '更新任务失败' }, { status: 500 })
  }
}

// 删除任务
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '删除任务失败' }, { status: 500 })
  }
}
