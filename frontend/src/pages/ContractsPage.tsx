import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { apiRequest } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import type { Contract, Review } from '../types/marketplace'

const CONTRACTS_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=60'

function ContractsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-36 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-8" />
      <div className="h-64 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-8" />
      <div className="h-64 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D] p-8" />
    </div>
  )
}

export default function ContractsPage() {
  const { user, token, isLoading } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [reviewsByContract, setReviewsByContract] = useState<Record<number, Review[]>>({})
  const [loadingContracts, setLoadingContracts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // State form tạo milestone theo contractId
  const [msTitle, setMsTitle] = useState<Record<number, string>>({})
  const [msAmount, setMsAmount] = useState<Record<number, string>>({})
  const [msDesc, setMsDesc] = useState<Record<number, string>>({})

  // State ghi chú nộp milestone theo milestoneId
  const [submitNotes, setSubmitNotes] = useState<Record<number, string>>({})

  // State form đánh giá theo contractId
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [comments, setComments] = useState<Record<number, string>>({})

  const loadContracts = async () => {
    if (!token) return
    setLoadingContracts(true)
    setError(null)
    try {
      const data = await apiRequest<Contract[]>('/contracts', {}, token)
      setContracts(data)

      const reviewEntries = await Promise.all(
        data.map(async (c) => {
          const revs = await apiRequest<Review[]>(`/contracts/${c.id}/reviews`, {}, token)
          return [c.id, revs] as const
        })
      )
      setReviewsByContract(Object.fromEntries(reviewEntries))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách hợp đồng')
    } finally {
      setLoadingContracts(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadContracts()
    }
  }, [token])

  if (isLoading) {
    return (
      <MainLayout>
        <ContractsSkeleton />
      </MainLayout>
    )
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  const isClient = user.role === 'client'

  const handleCreateMilestone = async (e: FormEvent, contractId: number) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    try {
      await apiRequest(
        `/contracts/${contractId}/milestones`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: (msTitle[contractId] || '').trim(),
            description: (msDesc[contractId] || '').trim(),
            amount: Number(msAmount[contractId] || 0),
          }),
        },
        token
      )
      setMsTitle((prev) => ({ ...prev, [contractId]: '' }))
      setMsAmount((prev) => ({ ...prev, [contractId]: '' }))
      setMsDesc((prev) => ({ ...prev, [contractId]: '' }))
      setInfo('Đã thêm milestone mới!')
      await loadContracts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm milestone thất bại')
    }
  }

  const handleSubmitMilestone = async (milestoneId: number) => {
    setError(null)
    setInfo(null)
    try {
      await apiRequest(
        `/milestones/${milestoneId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({
            submission_note: (submitNotes[milestoneId] || '').trim() || 'Đã hoàn thành cột mốc',
          }),
        },
        token
      )
      setInfo('Đã nộp milestone chờ Client duyệt!')
      await loadContracts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nộp milestone thất bại')
    }
  }

  const handleApproveMilestone = async (milestoneId: number) => {
    setError(null)
    setInfo(null)
    try {
      await apiRequest(`/milestones/${milestoneId}/approve`, { method: 'POST' }, token)
      setInfo('Đã duyệt milestone!')
      await loadContracts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duyệt milestone thất bại')
    }
  }

  const handleCreateReview = async (e: FormEvent, contractId: number) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    try {
      await apiRequest(
        `/contracts/${contractId}/reviews`,
        {
          method: 'POST',
          body: JSON.stringify({
            rating: ratings[contractId] || 5,
            comment: (comments[contractId] || '').trim(),
          }),
        },
        token
      )
      setComments((prev) => ({ ...prev, [contractId]: '' }))
      setInfo('Gửi đánh giá thành công!')
      await loadContracts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi đánh giá thất bại')
    }
  }

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Header section có ảnh blur giảm dần đồng bộ */}
        <section className="relative overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 shadow-2xl md:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full lg:w-1/2"
          >
            <img
              src={CONTRACTS_BANNER_IMAGE}
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
                {isClient ? 'Quản lý Milestone & Nghiệm thu' : 'Bàn giao Milestone & Đánh giá'}
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#EEE9DF] sm:text-3xl lg:text-4xl">
                Hợp đồng &amp; <span className="text-[#FFB162]">Cột mốc</span>
              </h1>
              <p className="text-xs leading-relaxed text-[#C9C1B1] sm:text-sm">
                {isClient
                  ? 'Khởi tạo các cột mốc công việc theo giá trị hợp đồng, duyệt bàn giao từ freelancer và gửi đánh giá khi hoàn tất.'
                  : 'Theo dõi các hợp đồng đang thực hiện, nộp kết quả kèm ghi chú cho từng milestone và đánh giá sau dự án.'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#C9C1B1]/20 bg-[#1B2632]/90 px-4 py-2.5 text-xs text-[#C9C1B1]">
              Tổng cộng: <strong className="text-[#FFB162]">{contracts.length}</strong> hợp đồng
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
              onClick={loadContracts}
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

        {loadingContracts ? (
          <ContractsSkeleton />
        ) : contracts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#C9C1B1]/30 bg-[#2C3B4D]/60 p-10 text-center">
            <p className="text-base font-bold text-[#EEE9DF]">Bạn chưa có hợp đồng nào</p>
            <p className="mt-2 text-xs text-[#C9C1B1] sm:text-sm">
              {isClient
                ? 'Hợp đồng sẽ tự động tạo khi bạn chấp nhận một proposal trong trang chi tiết dự án.'
                : 'Hãy gửi proposal cho các dự án đang mở để nhận hợp đồng khi được Client lựa chọn.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {contracts.map((contract) => {
              const totalMs = contract.milestones?.length || 0
              const approvedMs =
                contract.milestones?.filter((m) => m.status === 'approved').length || 0
              const progressPercent = totalMs > 0 ? Math.round((approvedMs / totalMs) * 100) : 0

              return (
                <section
                  key={contract.id}
                  className="space-y-6 rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 shadow-2xl md:p-9"
                >
                  {/* Header hợp đồng */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#C9C1B1]/15 pb-5">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FFB162]">
                        Dự án #{contract.project_id} • Proposal #{contract.proposal_id}
                      </span>
                      <h2 className="text-xl font-extrabold text-[#EEE9DF] sm:text-2xl">
                        Hợp đồng #{contract.id}
                      </h2>
                      <p className="text-xs text-[#C9C1B1] sm:text-sm">
                        Client #{contract.client_id} — Freelancer #{contract.freelancer_id} | Giá
                        trị thỏa thuận:{' '}
                        <strong className="font-extrabold text-[#FFB162]">
                          {Number(contract.agreed_amount).toLocaleString()}
                        </strong>
                      </p>
                    </div>

                    <StatusBadge status={contract.status} />
                  </div>

                  {/* Thanh tiến độ cột mốc */}
                  <div className="rounded-2xl border border-[#C9C1B1]/15 bg-[#1B2632]/85 p-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#C9C1B1]">
                      <span>
                        Tiến độ nghiệm thu cột mốc ({approvedMs}/{totalMs} đã duyệt)
                      </span>
                      <span className="font-bold text-[#FFB162]">{progressPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#2C3B4D]">
                      <div
                        className="h-full rounded-full bg-[#FFB162] transition-all duration-500 ease-in-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Danh sách Milestones (hover đảo màu đối lập) */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#EEE9DF]">
                      Milestones ({totalMs})
                    </h3>

                    {contract.milestones.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#C9C1B1]/25 bg-[#1B2632]/60 p-5 text-xs text-[#C9C1B1] sm:text-sm">
                        Chưa có milestone nào cho hợp đồng này.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contract.milestones.map((ms) => (
                          <div
                            key={ms.id}
                            className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C9C1B1]/15 bg-[#1B2632] p-5 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-xl"
                          >
                            <div className="max-w-2xl space-y-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <p className="text-sm font-extrabold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                                  {ms.title}
                                </p>
                                <span className="text-xs font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                                  {Number(ms.amount).toLocaleString()}
                                </span>
                                <div className="rounded-full transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632]">
                                  <StatusBadge status={ms.status} />
                                </div>
                              </div>

                              {ms.description && (
                                <p className="text-xs text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                                  {ms.description}
                                </p>
                              )}

                              {ms.submission_note && (
                                <p className="pt-1 text-xs font-medium text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                                  Ghi chú nộp: {ms.submission_note}
                                </p>
                              )}
                            </div>

                            {user.role === 'freelancer' &&
                              contract.status === 'active' &&
                              ms.status !== 'approved' && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Link / ghi chú bàn giao..."
                                    value={submitNotes[ms.id] || ''}
                                    onChange={(e) =>
                                      setSubmitNotes((prev) => ({
                                        ...prev,
                                        [ms.id]: e.target.value,
                                      }))
                                    }
                                    className="rounded-xl border border-[#C9C1B1]/25 bg-[#2C3B4D] px-3 py-2 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSubmitMilestone(ms.id)}
                                    className="rounded-xl border border-[#FFB162] bg-[#FFB162] px-4 py-2 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#1B2632] hover:bg-[#1B2632] hover:text-[#FFB162]"
                                  >
                                    Nộp bài
                                  </button>
                                </div>
                              )}

                            {user.role === 'client' && ms.status === 'submitted' && (
                              <button
                                type="button"
                                onClick={() => handleApproveMilestone(ms.id)}
                                className="rounded-xl border border-[#FFB162] bg-[#FFB162] px-4 py-2 text-xs font-bold text-[#1B2632] shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#1B2632] hover:bg-[#1B2632] hover:text-[#FFB162]"
                              >
                                Duyệt &amp; thanh toán
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form tạo Milestone cho Client */}
                  {user.role === 'client' && contract.status === 'active' && (
                    <form
                      onSubmit={(e) => handleCreateMilestone(e, contract.id)}
                      className="grid gap-3 rounded-2xl border border-[#C9C1B1]/15 bg-[#1B2632]/85 p-4 md:grid-cols-3"
                    >
                      <input
                        type="text"
                        required
                        placeholder="Tên cột mốc (VD: Thiết kế giao diện)"
                        value={msTitle[contract.id] || ''}
                        onChange={(e) =>
                          setMsTitle((prev) => ({ ...prev, [contract.id]: e.target.value }))
                        }
                        className="rounded-xl border border-[#C9C1B1]/25 bg-[#2C3B4D] px-3.5 py-2 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none"
                      />
                      <input
                        type="number"
                        required
                        min={1}
                        step="any"
                        placeholder="Số tiền"
                        value={msAmount[contract.id] || ''}
                        onChange={(e) =>
                          setMsAmount((prev) => ({ ...prev, [contract.id]: e.target.value }))
                        }
                        className="rounded-xl border border-[#C9C1B1]/25 bg-[#2C3B4D] px-3.5 py-2 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Mô tả ngắn"
                          value={msDesc[contract.id] || ''}
                          onChange={(e) =>
                            setMsDesc((prev) => ({ ...prev, [contract.id]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-[#C9C1B1]/25 bg-[#2C3B4D] px-3.5 py-2 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="shrink-0 rounded-xl border border-[#FFB162] bg-[#FFB162] px-4 py-2 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                        >
                          + Thêm
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Đánh giá khi hợp đồng hoàn tất */}
                  {contract.status === 'completed' && (
                    <div className="space-y-4 border-t border-[#C9C1B1]/15 pt-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#EEE9DF]">
                        Đánh giá sau dự án
                      </h3>

                      {(reviewsByContract[contract.id] || []).map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-2xl border border-[#FFB162]/30 bg-[#1B2632] p-4 text-xs text-[#EEE9DF]"
                        >
                          <strong className="text-[#FFB162]">User #{rev.reviewer_id}</strong> đánh
                          giá <strong className="text-[#EEE9DF]">{rev.rating}/5 ★</strong>:{' '}
                          <span className="text-[#C9C1B1]">{rev.comment}</span>
                        </div>
                      ))}

                      <form
                        onSubmit={(e) => handleCreateReview(e, contract.id)}
                        className="flex flex-wrap gap-3"
                      >
                        <select
                          value={ratings[contract.id] || 5}
                          onChange={(e) =>
                            setRatings((prev) => ({
                              ...prev,
                              [contract.id]: Number(e.target.value),
                            }))
                          }
                          className="rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-3.5 py-2 text-xs text-[#EEE9DF] focus:border-[#FFB162] focus:outline-none"
                        >
                          <option value={5}>5 sao</option>
                          <option value={4}>4 sao</option>
                          <option value={3}>3 sao</option>
                          <option value={2}>2 sao</option>
                          <option value={1}>1 sao</option>
                        </select>
                        <input
                          type="text"
                          required
                          minLength={5}
                          placeholder="Nhận xét về quá trình làm việc..."
                          value={comments[contract.id] || ''}
                          onChange={(e) =>
                            setComments((prev) => ({ ...prev, [contract.id]: e.target.value }))
                          }
                          className="min-w-60 flex-1 rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-xl border border-[#FFB162] bg-[#FFB162] px-5 py-2 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                        >
                          Gửi đánh giá
                        </button>
                      </form>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}