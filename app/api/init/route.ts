import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 初始化数据库
export async function POST(req: NextRequest) {
  try {
    // 检查是否已初始化
    const existingRoles = await prisma.role.count()
    if (existingRoles > 0) {
      return NextResponse.json({ message: '数据库已初始化' })
    }

    // 创建角色
    await prisma.role.createMany({
      data: [
        {
          name: 'super_admin',
          label: '超级管理员',
          description: '系统运维，全局所有权限',
          permissions: ['*:*'],
          dataScope: 'global'
        },
        {
          name: 'studio_head',
          label: '工作室负责人',
          description: '全工作室项目组合、成本汇总、人力全局',
          permissions: ['project:view', 'project:manage', 'cost:view', 'person:view', 'report:view'],
          dataScope: 'studio'
        },
        {
          name: 'project_owner',
          label: '项目负责人',
          description: '单项目全貌、里程碑、预算、风险',
          permissions: ['project:view', 'project:edit', 'task:*', 'milestone:*', 'risk:*', 'cost:view'],
          dataScope: 'project'
        },
        {
          name: 'pm',
          label: '项目经理',
          description: '日常管控：进度、任务、人力、周报、数据',
          permissions: ['project:view', 'task:*', 'milestone:*', 'risk:*', 'cost:view', 'report:view'],
          dataScope: 'project'
        },
        {
          name: 'art_director',
          label: '美术总监',
          description: '跨项目质量标准、风格一致性、关键产出评审',
          permissions: ['project:view', 'task:view', 'asset:review', 'report:view'],
          dataScope: 'project'
        },
        {
          name: 'lead',
          label: '美术组长',
          description: '本组任务、组员排期、产出进度',
          permissions: ['project:view', 'task:view', 'task:edit', 'person:view'],
          dataScope: 'group'
        },
        {
          name: 'artist',
          label: '美术执行',
          description: '自己的任务、排期、工时填报',
          permissions: ['task:view', 'time:edit'],
          dataScope: 'personal'
        }
      ]
    })

    // 创建默认用户
    const pmRole = await prisma.role.findUnique({ where: { name: 'pm' } })
    if (pmRole) {
      await prisma.user.create({
        data: {
          email: 'pm@example.com',
          name: '项目经理',
          roleId: pmRole.id,
          avatar: '👤'
        }
      })
    }

    // 创建工作室
    const studio = await prisma.studio.create({
      data: {
        name: '主工作室',
        description: '默认工作室'
      }
    })

    // 创建部门
    await prisma.department.createMany({
      data: [
        { studioId: studio.id, name: '角色原画组', sortOrder: 0 },
        { studioId: studio.id, name: '角色模型组', sortOrder: 1 },
        { studioId: studio.id, name: '场景组', sortOrder: 2 },
        { studioId: studio.id, name: '动作组', sortOrder: 3 },
        { studioId: studio.id, name: '特效组', sortOrder: 4 },
        { studioId: studio.id, name: 'UI组', sortOrder: 5 }
      ]
    })

    // 创建示例人员
    const departments = await prisma.department.findMany()
    await prisma.person.createMany({
      data: [
        { departmentId: departments[0]?.id, name: '张三', email: 'zhangsan@example.com', title: '资深原画', skills: ['角色设计', '概念设计'] },
        { departmentId: departments[1]?.id, name: '李四', email: 'lisi@example.com', title: '3D组长', skills: ['角色建模', 'ZBrush'] },
        { departmentId: departments[2]?.id, name: '王五', email: 'wangwu@example.com', title: '场景主美', skills: ['场景设计', '地编'] },
        { departmentId: departments[3]?.id, name: '赵六', email: 'zhaoliu@example.com', title: '动作设计师', skills: ['动画', '绑定'] },
        { departmentId: departments[4]?.id, name: '钱七', email: 'qianqi@example.com', title: '特效师', skills: ['粒子特效', 'Shader'] },
        { departmentId: departments[5]?.id, name: '孙八', email: 'sunba@example.com', title: 'UI设计师', skills: ['界面设计', '图标'] }
      ]
    })

    // 创建示例供应商
    await prisma.outsourceVendor.createMany({
      data: [
        { name: '外包公司A', contactPerson: '张经理', contactInfo: 'zhang@waibao.com', specialties: ['角色建模', '贴图'], rating: 'A' },
        { name: '外包公司B', contactPerson: '李经理', contactInfo: 'li@waibao.com', specialties: ['场景模型', '地编'], rating: 'B' },
        { name: '外包公司C', contactPerson: '王经理', contactInfo: 'wang@waibao.com', specialties: ['动作', '动画'], rating: 'A' }
      ]
    })

    return NextResponse.json({ 
      message: '数据库初始化成功',
      data: {
        roles: 7,
        studio: studio.id,
        departments: departments.length
      }
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: '初始化失败' }, { status: 500 })
  }
}
