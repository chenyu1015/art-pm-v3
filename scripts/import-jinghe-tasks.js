const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. 创建或获取晶核项目
  let project = await prisma.project.findFirst({
    where: { name: '晶核' }
  });
  
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: '晶核',
        description: '晶核项目动作需求管理',
        status: 'active',
        stage: '量产'
      }
    });
    console.log('✓ 创建项目:', project.name);
  } else {
    console.log('✓ 使用已有项目:', project.name);
  }

  // 2. 获取动作管线
  let pipeline = await prisma.pipeline.findFirst({
    where: { projectId: project.id, code: 'ANIMATION' }
  });

  if (!pipeline) {
    // 创建10条预置管线
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
    ];

    for (let i = 0; i < defaultPipelines.length; i++) {
      await prisma.pipeline.create({
        data: {
          ...defaultPipelines[i],
          projectId: project.id,
          sortOrder: i
        }
      });
    }
    
    pipeline = await prisma.pipeline.findFirst({
      where: { projectId: project.id, code: 'ANIMATION' }
    });
    console.log('✓ 创建管线');
  }

  // 3. 读取Excel数据
  const filePath = '/home/xiaoyu/.openclaw/media/inbound/动作需求管理_晶核需求---3374766e-5e5f-4f3b-9208-5cc8bb752e8f.xlsx';
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // 4. 导入任务
  let created = 0;
  let skipped = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // 跳过空行

    const title = row[0]; // 需求
    const deadlineStr = row[1]; // 上线时间
    const statusText = row[2]; // 状态
    const personsStr = row[5]; // 负责人
    const type = row[6]; // 类型
    
    // 状态映射
    let status = 'todo';
    if (statusText === '进行中') status = 'in_progress';
    if (statusText === '已完成') status = 'done';
    
    // 解析负责人
    const personNames = personsStr ? personsStr.toString().split(',').map(p => p.trim()).filter(Boolean) : [];
    const assigneeName = personNames[0]; // 取第一个负责人
    
    // 查找负责人ID
    let assigneeId = null;
    if (assigneeName) {
      const person = await prisma.person.findFirst({
        where: { name: assigneeName }
      });
      if (person) {
        // 查找对应的User
        const user = await prisma.user.findFirst({
          where: { name: assigneeName }
        });
        if (user) assigneeId = user.id;
      }
    }
    
    // 解析截止日期
    let plannedEnd = null;
    if (deadlineStr && deadlineStr !== '') {
      try {
        const date = new Date(deadlineStr);
        if (!isNaN(date.getTime())) {
          plannedEnd = date;
        }
      } catch (e) {}
    }
    
    // 检查任务是否已存在
    const existing = await prisma.task.findFirst({
      where: { 
        projectId: project.id,
        title: title
      }
    });
    
    if (existing) {
      skipped++;
      continue;
    }
    
    // 创建任务
    await prisma.task.create({
      data: {
        projectId: project.id,
        pipelineId: pipeline.id,
        title: title,
        description: `类型: ${type || '未分类'}`,
        status: status,
        priority: 'P2',
        assigneeId: assigneeId,
        plannedEnd: plannedEnd,
        tags: type ? [type] : []
      }
    });
    
    created++;
    if (created % 10 === 0) {
      console.log(`  已导入 ${created} 个任务...`);
    }
  }

  console.log(`\n✅ 完成! 新建 ${created} 个任务, 跳过 ${skipped} 个已存在任务`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
