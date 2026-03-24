'use client'

import { useEffect, useState } from 'react'

export default function PersonsPage() {
  const [persons, setPersons] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [personsRes, deptsRes] = await Promise.all([
      fetch('/api/persons'),
      fetch('/api/departments')
    ])
    const [personsData, deptsData] = await Promise.all([
      personsRes.json(),
      deptsRes.json()
    ])
    setPersons(personsData)
    setDepartments(deptsData)
    setLoading(false)
  }

  if (loading) return <div className="text-gray-500">加载中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">人力资源</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + 添加成员
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {persons.map((person: any) => (
          <div key={person.id} className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-medium">
                  {person.name[0]}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.title || '暂无职级'}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                person.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {person.status === 'active' ? '在职' : '离职'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">部门</span>
                <span>{person.department?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">邮箱</span>
                <span className="text-gray-600">{person.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">成本系数</span>
                <span>{person.costFactor}x</span>
              </div>
            </div>

            {person.skills?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {person.skills.map((skill: string) => (
                    <span key={skill} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.projectAssignments?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">项目分配</p>
                {person.projectAssignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center justify-between text-sm mb-1">
                    <span className="truncate">{assignment.project?.name}</span>
                    <span className="text-blue-600">{assignment.allocation}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
