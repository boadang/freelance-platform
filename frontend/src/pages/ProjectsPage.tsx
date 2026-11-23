import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import type { Project } from '../types/marketplace'

export default function ProjectsPage() {
  const { user, token, isLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [loadingList, setLoadingList] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form tạo dự án (dành cho client)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [skillsRequired, setSkillsRequired] = useState('')
  const [creating, setCreating] = useState(false)
  const [createMessage, setCreateMessage] = useState<string | null>(null)

  const fetchProjects = async () => {
    if (!token) return
    setLoadingList(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('q', search.trim())
      if (skillFilter.trim()) params.set('skill', skillFilter.trim())
      const queryString = params.toString()
      const data = await apiRequest<Project[]>(
        `/projects${queryString ? `?${queryString}` : ''}`,
        {},
        token
      )
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách dự án')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchProjects()
    }
  }, [token])

  if (isLoading) {
    return (
      <MainLayout>
        <p className="text-sm text-slate-600">Đang tải...</p>
      </MainLayout>
    )
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreateMessage(null)
    setCreating(true)
    try {
      await apiRequest<Project>(
        '/projects',
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            budget_min: Number(budgetMin),
            budget_max: Number(budgetMax),
            skills_required: skillsRequired,
          }),
        },
        token
      )
      setTitle('')
      setDescription('')
      setBudgetMin('')
      setBudgetMax('')
      setSkillsRequired('')
      setCreateMessage('Đăng dự án thành công!')
      await fetchProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo dự án thất bại')
    } finally {
      setCreating(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {user.role === 'client' && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Đăng dự án mới</h2>
            {createMessage && (
              <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                {createMessage}
              </p>
            )}
            {error && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}
            <form onSubmit={handleCreateProject} className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Tiêu đề dự án</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Xây dựng landing page bán khóa học"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Mô tả chi tiết</label>
                <textarea
                  required
                  minLength={15}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Yêu cầu tính năng, thời gian mong muốn, tài liệu tham khảo..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Ngân sách tối thiểu</label>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Ngân sách tối đa</label>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Kỹ năng yêu cầu (phân tách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  placeholder="React, TypeScript, FastAPI"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating ? 'Đang đăng...' : 'Đăng dự án'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-xl font-bold">
              {user.role === 'client' ? 'Danh sách dự án' : 'Dự án đang mở'}
            </h1>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo từ khóa..."
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="Lọc kỹ năng..."
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={fetchProjects}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          {loadingList ? (
            <p className="mt-4 text-sm text-slate-600">Đang tải danh sách dự án...</p>
          ) : projects.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Chưa có dự án nào phù hợp.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border border-slate-200 p-4 hover:border-indigo-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-lg font-semibold text-indigo-600 hover:underline"
                      >
                        {project.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                    </div>
                    <span className="shrink-0 rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {project.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      Ngân sách: <strong>{project.budget_min}</strong> –{' '}
                      <strong>{project.budget_max}</strong>
                    </span>
                    <span>Kỹ năng: {project.skills_required || 'Không ghi cụ thể'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  )
}