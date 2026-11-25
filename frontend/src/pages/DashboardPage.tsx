import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api/client'
import GuestDashboard from '../components/GuestDashboard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import type { Contract, Milestone, Project } from '../types/marketplace'

function DashboardSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="grid gap-8 rounded-2xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-6">
          <div className="h-6 w-36 rounded-full bg-[#1B2632]" />
          <div className="h-10 w-3/4 rounded-lg bg-[#1B2632]" />
          <div className="h-4 w-full rounded bg-[#1B2632]" />
          <div className="h-11 w-44 rounded-full bg-[#1B2632]" />
        </div>
        <div className="grid grid-cols-2 gap-5 lg:col-span-6">
          <div className="row-span-2 h-48 rounded-2xl bg-[#1B2632]" />
          <div className="h-22 rounded-2xl bg-[#1B2632]" />
          <div className="h-22 rounded-2xl bg-[#1B2632]" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-52 rounded-2xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-6"
          />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="h-64 rounded-2xl border border-[#C9C1B1]/15 bg-[#2C3B4D] lg:col-span-6" />
        <div className="space-y-4 lg:col-span-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 rounded-2xl border border-[#C9C1B1]/15 bg-[#2C3B4D]"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, token, isLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projectTab, setProjectTab] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all')

  const loadDashboard = async () => {
    if (!token || !user) return
    setLoadingData(true)
    setError(null)
    try {
      const projectEndpoint = user.role === 'client' ? '/projects?mine=true' : '/projects'
      const [projectList, contractList] = await Promise.all([
        apiRequest<Project[]>(projectEndpoint, {}, token),
        apiRequest<Contract[]>('/contracts', {}, token),
      ])
      setProjects(projectList)
      setContracts(contractList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu bảng điều khiển')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (token && user) {
      loadDashboard()
    }
  }, [token, user])

  const stats = useMemo(() => {
    const allMilestones: (Milestone & { contractId: number; projectId: number })[] =
      contracts.flatMap((c) =>
        (c.milestones || []).map((m) => ({
          ...m,
          contractId: c.id,
          projectId: c.project_id,
        }))
      )

    const activeContracts = contracts.filter((c) => c.status === 'active').length
    const completedContracts = contracts.filter((c) => c.status === 'completed').length
    const approvedMilestones = allMilestones.filter((m) => m.status === 'approved').length
    const totalValue = contracts.reduce((sum, c) => sum + Number(c.agreed_amount || 0), 0)

    return {
      totalProjects: projects.length,
      activeContracts,
      completedContracts,
      approvedMilestones,
      totalMilestones: allMilestones.length,
      totalValue,
      recentMilestones: allMilestones.slice(0, 3),
    }
  }, [projects, contracts])

  const filteredProjects = useMemo(() => {
    if (projectTab === 'all') return projects.slice(0, 4)
    return projects.filter((p) => p.status === projectTab).slice(0, 4)
  }, [projects, projectTab])

  const featuredContract = useMemo(() => {
    return contracts.find((c) => c.status === 'active') || contracts[0] || null
  }, [contracts])

  if (isLoading) {
    return (
      <MainLayout>
        <DashboardSkeleton />
      </MainLayout>
    )
  }

  // CHẾ ĐỘ 1: CHƯA ĐĂNG NHẬP -> 4 LAYOUT NỐI TIẾP CUỘN MƯỢT
  if (!user || !token) {
    return (
      <MainLayout>
        <GuestDashboard />
      </MainLayout>
    )
  }

  // CHẾ ĐỘ 2: ĐÃ ĐĂNG NHẬP -> WORKSPACE GỢI MỞ THAO TÁC
  const isClient = user.role === 'client'

  return (
    <MainLayout>
      <div className="space-y-12">
        {error && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#A35139] bg-[#A35139]/25 p-5 text-sm text-[#EEE9DF] transition-all duration-300 ease-in-out">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadDashboard}
              className="rounded-xl bg-[#FFB162] px-4 py-2 text-xs font-semibold text-[#1B2632] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
            >
              Thử lại
            </button>
          </div>
        )}

        {loadingData ? (
          <DashboardSkeleton />
        ) : (
          <>
            <section className="grid items-center gap-10 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D]/90 p-7 shadow-xl backdrop-blur-sm md:p-10 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#FFB162]/35 bg-[#1B2632]/80 px-4 py-1.5 text-xs font-medium text-[#FFB162] transition-all duration-300 ease-in-out hover:border-[#FFB162] hover:bg-[#FFB162] hover:text-[#1B2632]">
                  {isClient ? 'Không gian Client' : 'Không gian Freelancer'} • {user.email}
                </span>

                <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#EEE9DF] md:text-4xl">
                  {isClient ? (
                    <>
                      Quản lý <span className="text-[#FFB162]">Dự án</span> & Đội ngũ Linh hoạt
                    </>
                  ) : (
                    <>
                      Khám phá <span className="text-[#FFB162]">Cơ hội</span> & Bứt phá Thu nhập
                    </>
                  )}
                </h1>

                <p className="text-sm leading-relaxed text-[#C9C1B1]">
                  {isClient
                    ? 'Theo dõi tiến độ các dự án đã đăng, duyệt đề xuất chào giá từ freelancer và nghiệm thu từng cột mốc minh bạch.'
                    : 'Tìm kiếm dự án phù hợp kỹ năng của bạn, gửi proposal chuyên nghiệp và cập nhật tiến độ bàn giao theo từng cột mốc.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/projects"
                    className="rounded-full border border-[#FFB162] bg-[#FFB162] px-6 py-3 text-sm font-semibold text-[#1B2632] shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-lg"
                  >
                    {isClient ? '+ Đăng dự án mới' : 'Khám phá dự án mở'}
                  </Link>
                  <Link
                    to="/contracts"
                    className="rounded-full border border-[#C9C1B1]/40 bg-[#1B2632]/75 px-6 py-3 text-sm font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-lg"
                  >
                    Quản lý hợp đồng
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 lg:col-span-6">
                <Link
                  to="/projects"
                  className="group row-span-2 flex flex-col justify-between rounded-2xl border border-[#C9C1B1]/20 bg-[#1B2632] p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                      {isClient ? 'Dự án của bạn' : 'Dự án đang mở'}
                    </span>
                    <span className="rounded-md bg-[#FFB162]/20 px-2.5 py-0.5 text-xs font-bold text-[#FFB162] transition-all duration-300 ease-in-out group-hover:bg-[#1B2632] group-hover:text-[#FFB162]">
                      Live
                    </span>
                  </div>

                  <div className="my-5">
                    <p className="text-4xl font-extrabold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                      {stats.totalProjects}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                      {isClient
                        ? 'Tổng số dự án đã khởi tạo'
                        : 'Cơ hội sẵn sàng nhận chào giá'}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                    Xem tất cả →
                  </span>
                </Link>

                <Link
                  to="/contracts"
                  className="group rounded-2xl border border-[#C9C1B1]/20 bg-[#1B2632] p-5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-xl"
                >
                  <p className="text-xs font-semibold text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                    Hợp đồng đang chạy
                  </p>
                  <div className="mt-3 flex items-baseline justify-between">
                    <p className="text-2xl font-extrabold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                      {stats.activeContracts}
                    </p>
                    <span className="text-xs font-semibold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                      {stats.completedContracts} hoàn tất
                    </span>
                  </div>
                </Link>

                <Link
                  to="/contracts"
                  className="group rounded-2xl border border-[#C9C1B1]/20 bg-[#1B2632] p-5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-xl"
                >
                  <p className="text-xs font-semibold text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                    {isClient ? 'Tổng ngân sách hợp đồng' : 'Milestone đã duyệt'}
                  </p>
                  <div className="mt-3 flex items-baseline justify-between">
                    <p className="text-2xl font-extrabold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                      {isClient
                        ? stats.totalValue.toLocaleString()
                        : `${stats.approvedMilestones}/${stats.totalMilestones}`}
                    </p>
                    <span className="text-xs font-medium text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                      {isClient ? 'cam kết' : 'cột mốc'}
                    </span>
                  </div>
                </Link>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-[#EEE9DF]">
                    {isClient ? 'Dự án gần đây của bạn' : 'Dự án nổi bật đang mở'}
                  </h2>
                  <div className="flex flex-wrap gap-2.5 text-xs">
                    {(
                      [
                        { key: 'all', label: 'Tất cả' },
                        { key: 'open', label: 'Đang mở' },
                        { key: 'in_progress', label: 'Đang thực hiện' },
                        { key: 'completed', label: 'Hoàn thành' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setProjectTab(tab.key)}
                        className={`rounded-full border px-4 py-1.5 font-semibold transition-all duration-300 ease-in-out ${
                          projectTab === tab.key
                            ? 'border-[#FFB162] bg-[#FFB162] text-[#1B2632] shadow-sm'
                            : 'border-[#C9C1B1]/20 bg-[#2C3B4D] text-[#C9C1B1] hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  to="/projects"
                  className="rounded-full border border-[#C9C1B1]/40 bg-[#2C3B4D]/60 px-5 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-md"
                >
                  Xem toàn bộ dự án
                </Link>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#C9C1B1]/30 bg-[#2C3B4D]/60 p-10 text-center">
                  <p className="text-base font-semibold text-[#EEE9DF]">
                    Chưa có dự án nào trong mục này
                  </p>
                  <p className="mt-2 text-xs text-[#C9C1B1]">
                    {isClient
                      ? 'Hãy đăng dự án đầu tiên để bắt đầu nhận chào giá từ các freelancer.'
                      : 'Hiện chưa có dự án khớp bộ lọc. Bạn có thể chuyển sang tab "Tất cả" hoặc vào trang Dự án.'}
                  </p>
                  <Link
                    to="/projects"
                    className="mt-5 inline-block rounded-full bg-[#FFB162] px-5 py-2.5 text-xs font-semibold text-[#1B2632] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    {isClient ? '+ Tạo dự án ngay' : 'Tới danh sách dự án'}
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="group flex flex-col justify-between rounded-2xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-6 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-2xl"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="rounded-full transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632]">
                            <StatusBadge status={project.status} />
                          </div>
                          <span className="text-[11px] font-semibold text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                            #{project.id}
                          </span>
                        </div>
                        <h3 className="mt-4 line-clamp-2 text-base font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                          {project.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                          {project.description}
                        </p>
                      </div>

                      <div className="mt-6 border-t border-[#C9C1B1]/20 pt-4 transition-colors duration-300 ease-in-out group-hover:border-[#2C3B4D]/20">
                        <p className="text-xs font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                          {Number(project.budget_min).toLocaleString()} –{' '}
                          {Number(project.budget_max).toLocaleString()}
                        </p>
                        <p className="mt-1.5 truncate text-[11px] text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                          {project.skills_required || 'Kỹ năng linh hoạt'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#EEE9DF]">
                  Tiến độ hợp đồng & Cột mốc
                </h2>
                <Link
                  to="/contracts"
                  className="rounded-full border border-[#C9C1B1]/40 bg-[#2C3B4D]/60 px-5 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-md"
                >
                  Mở trang hợp đồng
                </Link>
              </div>

              {!featuredContract ? (
                <div className="rounded-3xl border border-dashed border-[#C9C1B1]/30 bg-[#2C3B4D]/60 p-10 text-center">
                  <p className="text-base font-semibold text-[#EEE9DF]">
                    Chưa có hợp đồng nào được kích hoạt
                  </p>
                  <p className="mt-2 text-xs text-[#C9C1B1]">
                    {isClient
                      ? 'Hợp đồng sẽ tự động tạo sau khi bạn chấp nhận một proposal trong chi tiết dự án.'
                      : 'Hãy gửi proposal cho các dự án đang mở; hợp đồng sẽ xuất hiện tại đây khi Client chấp nhận.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-12">
                  <div className="group flex flex-col justify-between rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-2xl lg:col-span-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                          Hợp đồng trọng tâm
                        </span>
                        <div className="rounded-full transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632]">
                          <StatusBadge status={featuredContract.status} />
                        </div>
                      </div>

                      <h3 className="mt-4 text-xl font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                        Hợp đồng #{featuredContract.id} — Dự án #{featuredContract.project_id}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                        {isClient
                          ? `Đối tác: Freelancer #${featuredContract.freelancer_id}`
                          : `Khách hàng: Client #${featuredContract.client_id}`}
                      </p>

                      <div className="mt-6 rounded-2xl bg-[#1B2632] p-5 transition-colors duration-300 ease-in-out group-hover:bg-[#2C3B4D]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#C9C1B1]">Giá trị thỏa thuận</span>
                          <span className="text-sm font-bold text-[#FFB162]">
                            {Number(featuredContract.agreed_amount).toLocaleString()}
                          </span>
                        </div>

                        {(() => {
                          const total = featuredContract.milestones?.length || 0
                          const done =
                            featuredContract.milestones?.filter((m) => m.status === 'approved')
                              .length || 0
                          const percent = total > 0 ? Math.round((done / total) * 100) : 0
                          return (
                            <div className="mt-4">
                              <div className="mb-1.5 flex justify-between text-xs text-[#C9C1B1]">
                                <span>
                                  Tiến độ nghiệm thu ({done}/{total} milestones)
                                </span>
                                <span className="font-semibold text-[#EEE9DF]">{percent}%</span>
                              </div>
                              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1B2632]">
                                <div
                                  className="h-full rounded-full bg-[#FFB162] transition-all duration-500 ease-in-out"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="mt-6 pt-2">
                      <Link
                        to="/contracts"
                        className="inline-flex items-center text-xs font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139] hover:underline"
                      >
                        {isClient
                          ? 'Quản lý cột mốc & duyệt bàn giao →'
                          : 'Nộp kết quả cột mốc ngay →'}
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-4 lg:col-span-6">
                    {stats.recentMilestones.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-[#C9C1B1]/30 bg-[#2C3B4D]/60 p-8 text-center">
                        <p className="text-sm font-semibold text-[#EEE9DF]">
                          Chưa có cột mốc công việc nào
                        </p>
                        <p className="mt-2 text-xs text-[#C9C1B1]">
                          {isClient
                            ? 'Vào trang Hợp đồng để chia nhỏ các milestone thanh toán cho freelancer.'
                            : 'Chờ Client khởi tạo milestone cho hợp đồng của bạn.'}
                        </p>
                      </div>
                    ) : (
                      stats.recentMilestones.map((ms) => (
                        <div
                          key={ms.id}
                          className="group flex items-center justify-between gap-5 rounded-2xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-xl"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[11px] font-semibold text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                                HĐ #{ms.contractId}
                              </span>
                              <div className="rounded-full transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632]">
                                <StatusBadge status={ms.status} />
                              </div>
                            </div>
                            <p className="mt-2 truncate text-sm font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                              {ms.title}
                            </p>
                            <p className="mt-1 text-xs text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                              Giá trị:{' '}
                              <span className="font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                                {Number(ms.amount).toLocaleString()}
                              </span>
                            </p>
                          </div>

                          <Link
                            to="/contracts"
                            className="shrink-0 rounded-xl bg-[#1B2632] px-4 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out group-hover:bg-[#1B2632] group-hover:text-[#FFB162] hover:scale-105"
                          >
                            Chi tiết
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-[#A35139]/45 bg-gradient-to-r from-[#2C3B4D] via-[#2C3B4D] to-[#A35139]/45 p-8 text-center md:p-10">
              <h2 className="text-xl font-bold text-[#EEE9DF] md:text-2xl">
                {isClient
                  ? 'Sẵn sàng khởi động dự án tiếp theo?'
                  : 'Tìm kiếm dự án phù hợp nhất với thế mạnh của bạn'}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[#C9C1B1] md:text-sm">
                {isClient
                  ? 'Mô tả rõ yêu cầu, ngân sách và kỹ năng cần thiết để nhận đề xuất chất lượng chỉ sau vài phút.'
                  : 'Lọc nhanh theo kỹ năng và ngân sách, gửi thư chào hàng thuyết phục để chốt hợp đồng mới.'}
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  to="/projects"
                  className="rounded-full border border-[#FFB162] bg-[#FFB162] px-7 py-3 text-sm font-semibold text-[#1B2632] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-lg"
                >
                  {isClient ? 'Đăng dự án ngay' : 'Xem danh sách dự án'}
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </MainLayout>
  )
}