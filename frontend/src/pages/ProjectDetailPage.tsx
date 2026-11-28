import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { apiRequest } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import type { Project, Proposal } from '../types/marketplace'

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-52 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-8" />
      <div className="h-64 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-8" />
      <div className="h-44 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-8" />
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user, token, isLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Form gửi proposal (freelancer)
  const [proposedAmount, setProposedAmount] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [acceptingId, setAcceptingId] = useState<number | null>(null)

  const loadDetails = async () => {
    if (!token || !id) return
    setLoadingDetail(true)
    setError(null)
    try {
      const proj = await apiRequest<Project>(`/projects/${id}`, {}, token)
      setProject(proj)
      const propsList = await apiRequest<Proposal[]>(`/projects/${id}/proposals`, {}, token)
      setProposals(propsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được chi tiết dự án')
    } finally {
      setLoadingDetail(false)
    }
  }

  useEffect(() => {
    if (token && id) {
      loadDetails()
    }
  }, [token, id])

  if (isLoading) {
    return (
      <MainLayout>
        <ProjectDetailSkeleton />
      </MainLayout>
    )
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  const handleSendProposal = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      await apiRequest<Proposal>(
        `/projects/${id}/proposals`,
        {
          method: 'POST',
          body: JSON.stringify({
            proposed_amount: Number(proposedAmount),
            estimated_days: Number(estimatedDays),
            cover_letter: coverLetter.trim(),
          }),
        },
        token
      )
      setProposedAmount('')
      setEstimatedDays('')
      setCoverLetter('')
      setInfo('Gửi proposal thành công!')
      await loadDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi proposal thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptProposal = async (proposalId: number) => {
    setError(null)
    setInfo(null)
    setAcceptingId(proposalId)
    try {
      await apiRequest<Proposal>(`/proposals/${proposalId}/accept`, { method: 'POST' }, token)
      setInfo('Đã chấp nhận proposal và khởi tạo hợp đồng thành công!')
      await loadDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể chấp nhận proposal')
    } finally {
      setAcceptingId(null)
    }
  }

  const isProjectOwner = user.role === 'client' && project?.client_id === user.id

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-xl border border-[#C9C1B1]/25 bg-[#2C3B4D] px-4 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
          >
            ← Quay lại danh sách dự án
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#A35139] bg-[#A35139]/25 p-4 text-xs font-medium text-[#EEE9DF] sm:text-sm"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={loadDetails}
              className="rounded-xl bg-[#FFB162] px-4 py-1.5 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
            >
              Thử lại
            </button>
          </div>
        )}

        {info && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-400/35 bg-emerald-500/15 p-4 text-xs font-medium text-emerald-200 sm:text-sm">
            <span>{info}</span>
            {project?.status === 'in_progress' && (
              <Link
                to="/contracts"
                className="rounded-full bg-[#FFB162] px-4 py-1.5 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
              >
                Mở trang Hợp đồng →
              </Link>
            )}
          </div>
        )}

        {loadingDetail ? (
          <ProjectDetailSkeleton />
        ) : (
          <>
            {/* Thông tin chi tiết dự án */}
            {project && (
              <section className="group rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 shadow-2xl transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] md:p-9">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                      Dự án #{project.id} • Client #{project.client_id}
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632] sm:text-3xl">
                      {project.title}
                    </h1>
                  </div>

                  <div className="rounded-full transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632]">
                    <StatusBadge status={project.status} />
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                  {project.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-6 border-t border-[#C9C1B1]/15 pt-5 text-xs text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:border-[#2C3B4D]/20 group-hover:text-[#2C3B4D] sm:text-sm">
                  <span>
                    Ngân sách:{' '}
                    <strong className="font-extrabold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                      {Number(project.budget_min).toLocaleString()} –{' '}
                      {Number(project.budget_max).toLocaleString()}
                    </strong>
                  </span>
                  <span>
                    Kỹ năng:{' '}
                    <strong className="font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                      {project.skills_required || 'Không ghi cụ thể'}
                    </strong>
                  </span>
                </div>
              </section>
            )}

            {/* Form gửi proposal cho Freelancer khi dự án đang mở */}
            {user.role === 'freelancer' && project?.status === 'open' && (
              <section className="rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 shadow-xl md:p-9">
                <h2 className="text-xl font-extrabold text-[#EEE9DF]">
                  Gửi đề xuất chào giá (Proposal)
                </h2>
                <p className="mt-1 text-xs text-[#C9C1B1] sm:text-sm">
                  Đề xuất mức giá, số ngày thực hiện và trình bày giải pháp phù hợp với dự án.
                </p>

                <form onSubmit={handleSendProposal} className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                        Mức giá đề xuất
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        step="any"
                        value={proposedAmount}
                        onChange={(e) => setProposedAmount(e.target.value)}
                        placeholder="Ví dụ: 800"
                        className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                        Số ngày hoàn thành dự kiến
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={365}
                        value={estimatedDays}
                        onChange={(e) => setEstimatedDays(e.target.value)}
                        placeholder="Ví dụ: 14"
                        className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                      Thư chào hàng
                    </label>
                    <textarea
                      required
                      minLength={10}
                      rows={3}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Trình bày kinh nghiệm phù hợp và cách bạn sẽ triển khai dự án..."
                      className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl border border-[#FFB162] bg-[#FFB162] px-6 py-2.5 text-sm font-bold text-[#1B2632] shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl disabled:opacity-60"
                  >
                    {submitting ? 'Đang gửi proposal...' : 'Gửi Proposal'}
                  </button>
                </form>
              </section>
            )}

            {/* Danh sách Proposal */}
            <section className="rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 shadow-xl md:p-9">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-extrabold text-[#EEE9DF]">
                  Danh sách Proposal ({proposals.length})
                </h2>
                {isProjectOwner && project?.status === 'open' && (
                  <span className="text-xs font-medium text-[#FFB162]">
                    Chọn một proposal để bắt đầu hợp đồng
                  </span>
                )}
              </div>

              {proposals.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#C9C1B1]/25 bg-[#1B2632]/60 p-6 text-center text-xs text-[#C9C1B1] sm:text-sm">
                  {user.role === 'freelancer'
                    ? 'Bạn chưa gửi proposal nào cho dự án này hoặc danh sách đang trống.'
                    : 'Chưa có freelancer nào gửi proposal cho dự án này.'}
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {proposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C9C1B1]/15 bg-[#1B2632] p-5 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-xl"
                    >
                      <div className="max-w-3xl space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <p className="text-sm font-extrabold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                            Freelancer #{prop.freelancer_id}
                          </p>
                          <span className="text-xs font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                            Giá: {Number(prop.proposed_amount).toLocaleString()} •{' '}
                            {prop.estimated_days} ngày
                          </span>
                          <div className="rounded-full transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632]">
                            <StatusBadge status={prop.status} />
                          </div>
                        </div>

                        <p className="text-xs leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D] sm:text-sm">
                          {prop.cover_letter}
                        </p>
                      </div>

                      {isProjectOwner &&
                        prop.status === 'pending' &&
                        project?.status === 'open' && (
                          <button
                            type="button"
                            disabled={acceptingId === prop.id}
                            onClick={() => handleAcceptProposal(prop.id)}
                            className="rounded-xl border border-[#FFB162] bg-[#FFB162] px-4 py-2 text-xs font-bold text-[#1B2632] shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#1B2632] hover:bg-[#1B2632] hover:text-[#FFB162] disabled:opacity-60 sm:text-sm"
                          >
                            {acceptingId === prop.id ? 'Đang duyệt...' : 'Chấp nhận'}
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MainLayout>
  )
}