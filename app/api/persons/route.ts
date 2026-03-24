import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取人员列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get('departmentId')
    const status = searchParams.get('status')

    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (status) where.status = status

    const persons = await prisma.person.findMany({
      where,
      include: {
        department: true,
        projectAssignments: {
          include: { project: { select: { id: true, name: true, status: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(persons)
  } catch (error) {
    return NextResponse.json({ error: '获取人员失败' }, { status: 500 })
  }
}

// 创建人员
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const person = await prisma.person.create({
      data: {
        name: data.name,
        email: data.email,
        departmentId: data.departmentId,
        title: data.title,
        skills: data.skills || [],
        costFactor: data.costFactor || 1.0
      }
    })

    return NextResponse.json(person)
  } catch (error) {
    return NextResponse.json({ error: '创建人员失败' }, { status: 500 })
  }
}
