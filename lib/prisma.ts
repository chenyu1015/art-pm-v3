// 临时 mock 数据，后续替换为真实数据库
export const prisma = {
  project: {
    findMany: async () => mockProjects,
    create: async (data: any) => {
      const newProject = { ...data.data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
      mockProjects.push(newProject);
      return newProject;
    }
  },
  cost: {
    findMany: async () => mockCosts,
    create: async (data: any) => {
      const newCost = { ...data.data, id: Date.now().toString(), createdAt: new Date() };
      mockCosts.push(newCost);
      return newCost;
    }
  }
};

const mockProjects: any[] = [
  { id: '1', name: '示例项目', description: '这是一个示例', status: '进行中', createdAt: new Date(), updatedAt: new Date() }
];

const mockCosts: any[] = [
  { id: '1', projectId: '1', category: '美术', amount: 5000, description: '原画设计', date: new Date(), createdAt: new Date() }
];
