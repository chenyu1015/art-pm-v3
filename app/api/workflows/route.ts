import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取工作流列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (projectId) where.projectId = projectId

    const workflows = await prisma.workflow.findMany({
      where,
      include: {
        nodes: {
          orderBy: { sortOrder: 'asc' }
        },
        edges: true
      }
    })

    return NextResponse.json(workflows)
  } catch (error) {
    return NextResponse.json({ error: '获取工作流失败' }, { status: 500 })
  }
}

// 创建工作流
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const workflow = await prisma.workflow.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        nodes: {
          create: data.nodes?.map((n: any, i: number) => ({
            name: n.name,
            nodeType: n.nodeType,
            pipelineId: n.pipelineId,
            sortOrder: i,
            estimatedDays: n.estimatedDays,
            autoCreateTask: n.autoCreateTask
          })) || []
        }
      },
      include: {
        nodes: true
      }
    })

    return NextResponse.json(workflow)
  } catch (error) {
    return NextResponse.json({ error: '创建工作流失败' }, { status: 500 })
  }
}
