import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有项目
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studioId = searchParams.get('studioId')
    const status = searchParams.get('status')

    const where: any = {}
    if (studioId) where.studioId = studioId
    if (status) where.status = status

    const projects = await prisma.project.findMany({
      where,
      include: {
        studio: true,
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 })
  }
}

// 创建项目
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || 'planning',
        stage: data.stage || '预研',
        studioId: data.studioId,
        ownerId: data.ownerId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget
      }
    })

    // 自动创建 10 条预置管线
    const defaultPipelines = [
      { name: '角色原画', code: 'CHAR_CONCEPT', color: '#165DFF' },
      { name: '角色模型', code: 'CHAR_MODEL', color: '#36A3FF' },
      { name: '动作', code: 'ANIMATION', color: '#14C9C9' },
      { name: '地编', code: 'LEVEL_DESIGN', color: '#00B42A' },
      { name: '特效', code: 'VFX', color: '#F7BA1E' },
      { name: 'UI', code: 'UI', color: '#F53F3F' },
      { name: '场景原画', code: 'SCENE_CONCEPT', color: '#722ED1' },
      { name: '场景模型', code: 'SCENE_MODEL', color: '#D91AD9' },
      { name: '音频', code: 'AUDIO', color: '#F77234' },
      { name: '剧情', code: 'NARRATIVE', color: '#86909C' }
    ]

    await prisma.pipeline.createMany({
      data: defaultPipelines.map((p, i) => ({
        ...p,
        projectId: project.id,
        sortOrder: i
      }))
    })

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json({ error: '创建项目失败' }, { status: 500 })
  }
}
