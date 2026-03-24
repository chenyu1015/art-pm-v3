const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMoreData() {
  console.log('开始注入更多需求数据...\n');
  
  // 1. 创建更多项目
  const projects = [
    { name: '原神', description: '原神项目美术资源制作', stage: '量产' },
    { name: '崩坏：星穹铁道', description: '星穹铁道角色与场景制作', stage: '预研' },
    { name: '绝区零', description: '绝区零动作游戏项目', stage: '量产' },
    { name: '鸣潮', description: '鸣潮开放世界项目', stage: '运营' }
  ];
  
  for (const p of projects) {
    const existing = await prisma.project.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.project.create({
        data: {
          name: p.name,
          description: p.description,
          status: 'active',
          stage: p.stage
        }
      });
      console.log(`✓ 创建项目: ${p.name}`);
    }
  }
  
  // 2. 为每个项目创建管线
  const allProjects = await prisma.project.findMany();
  const defaultPipelines = [
    { name: '角色原画', code: 'CHAR_CONCEPT', color: '#165DFF' },
    { name: '角色模型', code: 'CHAR_MODEL', color: '#36A3FF' },
    { name: '动作', code: 'ANIMATION', color: '#14C9C9' },
    { name: '特效', code: 'VFX', color: '#F7BA1E' },
    { name: '场景原画', code: 'SCENE_CONCEPT', color: '#722ED1' },
    { name: '场景模型', code: 'SCENE_MODEL', color: '#D91AD9' },
    { name: 'UI', code: 'UI', color: '#F53F3F' }
  ];
  
  for (const project of allProjects) {
    const existingPipelines = await prisma.pipeline.count({ where: { projectId: project.id } });
    if (existingPipelines === 0) {
      for (let i = 0; i < defaultPipelines.length; i++) {
        await prisma.pipeline.create({
          data: {
            ...defaultPipelines[i],
            projectId: project.id,
            sortOrder: i
          }
        });
      }
      console.log(`✓ 为 ${project.name} 创建管线`);
    }
  }
  
  // 3. 创建更多任务
  const taskTemplates = [
    // 原神任务
    { project: '原神', title: '雷电将军角色模型', type: '角色模型', status: 'done', priority: 'P0' },
    { project: '原神', title: '纳西妲动作设计', type: '动作', status: 'in_progress', priority: 'P0' },
    { project: '原神', title: '枫丹场景地编', type: '地编', status: 'in_progress', priority: 'P1' },
    { project: '原神', title: '那维莱特特效', type: '特效', status: 'todo', priority: 'P1' },
    { project: '原神', title: '芙宁娜角色原画', type: '角色原画', status: 'done', priority: 'P0' },
    { project: '原神', title: '新BOSS草龙动画', type: '动作', status: 'in_progress', priority: 'P0' },
    { project: '原神', title: '水神技能特效', type: '特效', status: 'todo', priority: 'P0' },
    { project: '原神', title: '须弥雨林场景', type: '场景模型', status: 'done', priority: 'P1' },
    
    // 星穹铁道任务
    { project: '崩坏：星穹铁道', title: '卡芙卡角色设计', type: '角色原画', status: 'in_progress', priority: 'P0' },
    { project: '崩坏：星穹铁道', title: '银狼动作设计', type: '动作', status: 'todo', priority: 'P0' },
    { project: '崩坏：星穹铁道', title: '空间站场景概念', type: '场景原画', status: 'in_progress', priority: 'P1' },
    { project: '崩坏：星穹铁道', title: '刃角色模型', type: '角色模型', status: 'todo', priority: 'P0' },
    { project: '崩坏：星穹铁道', title: '仙舟罗浮地编', type: '地编', status: 'in_progress', priority: 'P1' },
    
    // 绝区零任务
    { project: '绝区零', title: '妮可角色模型', type: '角色模型', status: 'in_progress', priority: 'P0' },
    { project: '绝区零', title: '比利动作设计', type: '动作', status: 'in_progress', priority: 'P0' },
    { project: '绝区零', title: '安比特效制作', type: '特效', status: 'todo', priority: 'P1' },
    { project: '绝区零', title: '新艾利都场景', type: '场景原画', status: 'in_progress', priority: 'P1' },
    { project: '绝区零', title: 'UI界面设计', type: 'UI', status: 'done', priority: 'P1' },
    
    // 鸣潮任务
    { project: '鸣潮', title: '忌炎角色模型', type: '角色模型', status: 'done', priority: 'P0' },
    { project: '鸣潮', title: '今汐动作设计', type: '动作', status: 'in_progress', priority: 'P0' },
    { project: '鸣潮', title: '龙BOSS特效', type: '特效', status: 'todo', priority: 'P0' },
    { project: '鸣潮', title: '今州城场景', type: '场景模型', status: 'in_progress', priority: 'P1' }
  ];
  
  // 获取所有人员用于分配
  const persons = await prisma.person.findMany();
  const personIds = persons.map(p => p.id);
  
  let createdTasks = 0;
  
  for (const template of taskTemplates) {
    const project = await prisma.project.findFirst({ where: { name: template.project } });
    if (!project) continue;
    
    const pipeline = await prisma.pipeline.findFirst({
      where: { projectId: project.id, name: template.type }
    });
    
    // 检查任务是否已存在
    const existing = await prisma.task.findFirst({
      where: { projectId: project.id, title: template.title }
    });
    
    if (!existing) {
      // 随机分配负责人
      const randomPersonId = personIds.length > 0 
        ? personIds[Math.floor(Math.random() * personIds.length)]
        : null;
      
      // 查找对应的用户
      let assigneeId = null;
      if (randomPersonId) {
        const person = await prisma.person.findUnique({ where: { id: randomPersonId } });
        if (person) {
          const user = await prisma.user.findFirst({ where: { name: person.name } });
          if (user) assigneeId = user.id;
        }
      }
      
      await prisma.task.create({
        data: {
          projectId: project.id,
          pipelineId: pipeline?.id || null,
          title: template.title,
          description: `类型: ${template.type}`,
          status: template.status,
          priority: template.priority,
          assigneeId: assigneeId,
          tags: [template.type],
          plannedEnd: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) // 随机未来30天内
        }
      });
      createdTasks++;
    }
  }
  
  console.log(`✓ 创建 ${createdTasks} 个新任务`);
  
  // 4. 创建里程碑
  const milestones = [
    { project: '晶核', name: 'Alpha版本交付', date: new Date('2026-06-01') },
    { project: '晶核', name: 'Beta测试', date: new Date('2026-08-15') },
    { project: '原神', name: '4.0版本更新', date: new Date('2026-04-20') },
    { project: '绝区零', name: '公测版本', date: new Date('2026-07-01') }
  ];
  
  for (const m of milestones) {
    const project = await prisma.project.findFirst({ where: { name: m.project } });
    if (!project) continue;
    
    const existing = await prisma.milestone.findFirst({
      where: { projectId: project.id, name: m.name }
    });
    
    if (!existing) {
      await prisma.milestone.create({
        data: {
          projectId: project.id,
          name: m.name,
          plannedDate: m.date,
          status: 'upcoming'
        }
      });
    }
  }
  console.log(`✓ 创建里程碑`);
  
  // 5. 创建资产
  const assets = [
    { project: '晶核', name: '枪兵-初始', type: '角色' },
    { project: '晶核', name: '亚克莉丝BOSS', type: 'BOSS' },
    { project: '原神', name: '雷电将军', type: '角色' },
    { project: '绝区零', name: '妮可', type: '角色' },
    { project: '鸣潮', name: '忌炎', type: '角色' }
  ];
  
  for (const a of assets) {
    const project = await prisma.project.findFirst({ where: { name: a.project } });
    if (!project) continue;
    
    const existing = await prisma.asset.findFirst({
      where: { projectId: project.id, name: a.name }
    });
    
    if (!existing) {
      await prisma.asset.create({
        data: {
          projectId: project.id,
          name: a.name,
          assetType: a.type,
          priority: 'P1',
          overallStatus: Math.random() > 0.5 ? 'in_progress' : 'not_started',
          overallProgress: Math.floor(Math.random() * 100)
        }
      });
    }
  }
  console.log(`✓ 创建资产`);
  
  console.log('\n✅ 数据注入完成!');
  
  // 统计
  const stats = {
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    persons: await prisma.person.count(),
    assets: await prisma.asset.count(),
    milestones: await prisma.milestone.count()
  };
  
  console.log('\n当前数据统计:');
  console.log(`  项目: ${stats.projects}`);
  console.log(`  任务: ${stats.tasks}`);
  console.log(`  人员: ${stats.persons}`);
  console.log(`  资产: ${stats.assets}`);
  console.log(`  里程碑: ${stats.milestones}`);
}

seedMoreData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
