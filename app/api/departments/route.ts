import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取部门列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studioId = searchParams.get('studioId')

    const where: any = {}
    if (studioId) where.studioId = studioId

    const departments = await prisma.department.findMany({
      where,
      include: {
        _count: { select: { persons: true } }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(departments)
  } catch (error) {
    return NextResponse.json({ error: '获取部门失败' }, { status: 500 })
  }
}

// 创建部门
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const department = await prisma.department.create({
      data: {
        name: data.name,
        studioId: data.studioId,
        sortOrder: data.sortOrder || 0
      }
    })

    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json({ error: '创建部门失败' }, { status: 500 })
  }
}
