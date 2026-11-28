import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiRequest } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import type { Project } from '../types/marketplace'

const PROJECTS_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=60'

function ProjectsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-36 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-8" />
      <div className="h-24 rounded-2xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-6" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-56 rounded-2xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-6"
          />
        ))}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { user, token, isLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Bộ lọc tìm kiếm
  const [q, setQ] = useState('')
  const [skill, setSkill] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)

  // Form tạo dự án mới (chỉ cho Client)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [skillsRequired, setSkillsRequired] = useState('')
  const [creating, setCreating] = useState(false)

  const loadProjects = async () => {
    if (!token) return
    setLoadingProjects(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (skill.trim()) params.set('skill', skill.trim())
      if (statusFilter) params.set('status', statusFilter)
      if (onlyMine && user?.role === 'client') params.set('mine', 'true')

      const queryString = params.toString()
      const endpoint = queryString ? `/projects?${queryString}` : '/projects'
      const data = await apiRequest<Project[]>(endpoint, {}, token)
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách dự án')
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    if (token && user) {
      loadProjects()
    }
  }, [token, user, statusFilter, onlyMine])

  if (isLoading) {
    return (
      <MainLayout>
        <ProjectsSkeleton />
      </MainLayout>
    )
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  const isClient = user.role === 'client'

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    await loadProjects()
  }

  const handleResetFilters = () => {
    setQ('')
    setSkill('')
    setStatusFilter('')
    setOnlyMine(false)
  }

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    const minVal = Number(budgetMin)
    const maxVal = Number(budgetMax)
    if (minVal > maxVal) {
      setError('Ngân sách tối thiểu không được lớn hơn ngân sách tối đa.')
      return
    }

    setCreating(true)
    try {
      await apiRequest<Project>(
        '/projects',
        {
          method: 'POST',
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            budget_min: minVal,
            budget_max: maxVal,
            skills_required: skillsRequired.trim(),
          }),
        },
        token
      )
      setTitle('')
      setDescription('')
      setBudgetMin('')
      setBudgetMax('')
      setSkillsRequired('')
      setInfo('Đã đăng dự án mới thành công!')
      await loadProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng dự án thất bại')
    } finally {
      setCreating(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Header section có ảnh blur giảm dần đồng bộ */}
        <section className="relative overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 shadow-2xl md:p-9">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full lg:w-1/2">
            <img
              src={PROJECTS_BANNER_IMAGE}
              alt=""
              style={{
                WebkitMaskImage:
                  'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.85) 100%)',
                maskImage:
                  'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.85) 100%)',
              }}
              className="h-full w-full object-cover opacity-30 blur-[1.5px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2C3B4D] via-[#2C3B4D]/80 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <span className="inline-flex items-center rounded-full border border-[#FFB162]/35 bg-[#1B2632]/85 px-3.5 py-1 text-xs font-semibold text-[#FFB162]">
                {isClient ? 'Quản lý & Đăng tin dự án' : 'Chợ dự án dành cho Freelancer'}
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#EEE9DF] sm:text-3xl lg:text-4xl">
                Danh sách <span className="text-[#FFB162]">Dự án</span>
              </h1>
              <p className="text-xs leading-relaxed text-[#C9C1B1] sm:text-sm">
                {isClient
                  ? 'Khởi tạo dự án mới với ngân sách và kỹ năng rõ ràng, theo dõi trạng thái và duyệt proposal ngay trên chi tiết dự án.'
                  : 'Tìm kiếm dự án đang mở theo từ khóa, kỹ năng hoặc trạng thái để gửi đề xuất chào giá phù hợp.'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#C9C1B1]/20 bg-[#1B2632]/90 px-4 py-2.5 text-xs text-[#C9C1B1]">
              Hiển thị: <strong className="text-[#FFB162]">{projects.length}</strong> dự án
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#A35139] bg-[#A35139]/25 p-4 text-xs font-medium text-[#EEE9DF] sm:text-sm"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={loadProjects}
              className="rounded-xl bg-[#FFB162] px-4 py-1.5 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
            >
              Thử lại
            </button>
          </div>
        )}

        {info && (
          <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/15 p-4 text-xs font-medium text-emerald-200 sm:text-sm">
            {info}
          </div>
        )}

        {/* Form tạo dự án cho Client */}
        {isClient && (
          <section className="rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 shadow-xl md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-[#EEE9DF] sm:text-xl">
                Đăng dự án mới
              </h2>
              <span className="text-xs font-medium text-[#FFB162]">Dành cho Client</span>
            </div>

            <form onSubmit={handleCreateProject} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                  Tiêu đề dự án
                </label>
                <input
                  type="text"
                  required
                  minLength={5}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Xây dựng landing page & dashboard quản lý đơn hàng"
                  className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                  Mô tả chi tiết
                </label>
                <textarea
                  required
                  minLength={15}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả mục tiêu sản phẩm, các tính năng chính và tiêu chí bàn giao..."
                  className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                    Ngân sách tối thiểu
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="500"
                    className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                    Ngân sách tối đa
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="1500"
                    className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                    Kỹ năng yêu cầu
                  </label>
                  <input
                    type="text"
                    value={skillsRequired}
                    onChange={(e) => setSkillsRequired(e.target.value)}
                    placeholder="FastAPI, React, PostgreSQL"
                    className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl border border-[#FFB162] bg-[#FFB162] px-6 py-2.5 text-sm font-bold text-[#1B2632] shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl disabled:opacity-60"
                >
                  {creating ? 'Đang đăng dự án...' : 'Đăng dự án'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Bộ lọc tìm kiếm dự án */}
        <section className="rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D]/85 p-6 shadow-xl">
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-12">
            <input
              type="text"
              placeholder="Tìm theo từ khóa tiêu đề hoặc mô tả..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none sm:text-sm md:col-span-4"
            />
            <input
              type="text"
              placeholder="Lọc theo kỹ năng (VD: React, FastAPI)..."
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none sm:text-sm md:col-span-3"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-xs text-[#EEE9DF] transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none sm:text-sm md:col-span-2"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="open">Đang mở (open)</option>
              <option value="in_progress">Đang làm (in_progress)</option>
              <option value="completed">Hoàn thành (completed)</option>
            </select>

            <div className="flex flex-wrap items-center gap-2.5 md:col-span-3">
              <button
                type="submit"
                className="flex-1 rounded-xl border border-[#FFB162] bg-[#FFB162] px-4 py-2.5 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
              >
                Tìm kiếm
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-xl border border-[#C9C1B1]/30 bg-[#1B2632] px-3.5 py-2.5 text-xs font-semibold text-[#C9C1B1] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
              >
                Đặt lại
              </button>
            </div>

            {isClient && (
              <div className="md:col-span-12">
                <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#C9C1B1]/15 bg-[#1B2632]/75 px-4 py-2 text-xs font-medium text-[#C9C1B1] transition-all duration-300 ease-in-out hover:border-[#FFB162]/50 hover:text-[#EEE9DF]">
                  <input
                    type="checkbox"
                    checked={onlyMine}
                    onChange={(e) => setOnlyMine(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#FFB162]"
                  />
                  Chỉ hiển thị dự án của tôi (mine)
                </label>
              </div>
            )}
          </form>
        </section>

        {/* Danh sách card dự án (đảo màu đối lập khi hover) */}
        {loadingProjects ? (
          <ProjectsSkeleton />
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#C9C1B1]/30 bg-[#2C3B4D]/60 p-10 text-center">
            <p className="text-base font-bold text-[#EEE9DF]">Không tìm thấy dự án phù hợp</p>
            <p className="mt-2 text-xs text-[#C9C1B1] sm:text-sm">
              {isClient
                ? 'Thử bỏ bớt bộ lọc hoặc đăng một dự án mới để bắt đầu nhận đề xuất.'
                : 'Thử thay đổi từ khóa, kỹ năng hoặc bộ lọc trạng thái để xem thêm dự án.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((proj) => (
              <Link
                key={proj.id}
                to={`/projects/${proj.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-6 shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="rounded-full transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632]">
                      <StatusBadge status={proj.status} />
                    </div>
                    <span className="text-xs font-semibold text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                      Client #{proj.client_id}
                    </span>
                  </div>

                  <h2 className="mt-4 line-clamp-2 text-lg font-extrabold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                    {proj.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D] sm:text-sm">
                    {proj.description}
                  </p>
                </div>

                <div className="mt-6 space-y-2 border-t border-[#C9C1B1]/15 pt-4 transition-colors duration-300 ease-in-out group-hover:border-[#2C3B4D]/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                      Ngân sách:
                    </span>
                    <strong className="text-sm font-extrabold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                      {Number(proj.budget_min).toLocaleString()} –{' '}
                      {Number(proj.budget_max).toLocaleString()}
                    </strong>
                  </div>

                  <p className="truncate text-xs text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                    Kỹ năng:{' '}
                    <strong className="text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                      {proj.skills_required || 'Không ghi cụ thể'}
                    </strong>
                  </p>

                  <div className="pt-2 text-xs font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                    {isClient ? 'Xem chi tiết & duyệt proposal →' : 'Xem chi tiết & gửi proposal →'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}