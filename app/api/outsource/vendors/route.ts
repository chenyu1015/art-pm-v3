import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取供应商列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status

    const vendors = await prisma.outsourceVendor.findMany({
      where,
      orderBy: { rating: 'asc' }
    })

    return NextResponse.json(vendors)
  } catch (error) {
    return NextResponse.json({ error: '获取供应商失败' }, { status: 500 })
  }
}

// 创建供应商
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const vendor = await prisma.outsourceVendor.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        contactInfo: data.contactInfo,
        specialties: data.specialties || [],
        rating: data.rating || 'B',
        status: data.status || 'active'
      }
    })

    return NextResponse.json(vendor)
  } catch (error) {
    return NextResponse.json({ error: '创建供应商失败' }, { status: 500 })
  }
}
