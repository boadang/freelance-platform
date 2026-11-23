import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import type { Contract, Review } from '../types/marketplace'

export default function ContractsPage() {
  const { user, token, isLoading } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [reviewsByContract, setReviewsByContract] = useState<Record<number, Review[]>>({})
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
        <p className="text-sm text-slate-600">Đang tải...</p>
      </MainLayout>
    )
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

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
            title: msTitle[contractId] || '',
            description: msDesc[contractId] || '',
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
            submission_note: submitNotes[milestoneId] || 'Đã hoàn thành cột mốc',
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
            comment: comments[contractId] || '',
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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Hợp đồng & Cột mốc</h1>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {info && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{info}</p>}

        {contracts.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-slate-500">
            Bạn chưa có hợp đồng nào.
          </div>
        ) : (
          contracts.map((contract) => (
            <section key={contract.id} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h2 className="text-lg font-bold">
                    Hợp đồng #{contract.id} (Dự án #{contract.project_id})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Client #{contract.client_id} — Freelancer #{contract.freelancer_id} | Giá trị:{' '}
                    <strong>{contract.agreed_amount}</strong>
                  </p>
                </div>
                <span className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {contract.status}
                </span>
              </div>

              {/* Danh sách Milestones */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700">Milestones</h3>
                {contract.milestones.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có milestone nào.</p>
                ) : (
                  contract.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {ms.title} — <strong>{ms.amount}</strong>{' '}
                          <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs">
                            {ms.status}
                          </span>
                        </p>
                        {ms.description && <p className="text-xs text-slate-600">{ms.description}</p>}
                        {ms.submission_note && (
                          <p className="mt-1 text-xs text-indigo-700">
                            Ghi chú nộp: {ms.submission_note}
                          </p>
                        )}
                      </div>

                      {user.role === 'freelancer' &&
                        contract.status === 'active' &&
                        ms.status !== 'approved' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Link/ghi chú bàn giao..."
                              value={submitNotes[ms.id] || ''}
                              onChange={(e) =>
                                setSubmitNotes((prev) => ({ ...prev, [ms.id]: e.target.value }))
                              }
                              className="rounded border border-slate-300 px-2 py-1 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSubmitMilestone(ms.id)}
                              className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                            >
                              Nộp bài
                            </button>
                          </div>
                        )}

                      {user.role === 'client' && ms.status === 'submitted' && (
                        <button
                          type="button"
                          onClick={() => handleApproveMilestone(ms.id)}
                          className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          Duyệt & thanh toán
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Form tạo Milestone cho Client */}
              {user.role === 'client' && contract.status === 'active' && (
                <form
                  onSubmit={(e) => handleCreateMilestone(e, contract.id)}
                  className="grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-3"
                >
                  <input
                    type="text"
                    required
                    placeholder="Tên cột mốc (VD: Thiết kế giao diện)"
                    value={msTitle[contract.id] || ''}
                    onChange={(e) =>
                      setMsTitle((prev) => ({ ...prev, [contract.id]: e.target.value }))
                    }
                    className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs"
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
                    className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Mô tả ngắn"
                      value={msDesc[contract.id] || ''}
                      onChange={(e) =>
                        setMsDesc((prev) => ({ ...prev, [contract.id]: e.target.value }))
                      }
                      className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
                    >
                      + Thêm
                    </button>
                  </div>
                </form>
              )}

              {/* Đánh giá khi hợp đồng hoàn tất */}
              {contract.status === 'completed' && (
                <div className="space-y-3 border-t pt-3">
                  <h3 className="text-sm font-semibold text-slate-700">Đánh giá sau dự án</h3>
                  {(reviewsByContract[contract.id] || []).map((rev) => (
                    <div key={rev.id} className="rounded bg-amber-50 p-2.5 text-xs text-slate-700">
                      <strong>User #{rev.reviewer_id}</strong> đánh giá{' '}
                      <strong>{rev.rating}/5 ★</strong>: {rev.comment}
                    </div>
                  ))}

                  <form
                    onSubmit={(e) => handleCreateReview(e, contract.id)}
                    className="flex flex-wrap gap-2"
                  >
                    <select
                      value={ratings[contract.id] || 5}
                      onChange={(e) =>
                        setRatings((prev) => ({ ...prev, [contract.id]: Number(e.target.value) }))
                      }
                      className="rounded border border-slate-300 px-2 py-1.5 text-xs"
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
                      className="min-w-60 flex-1 rounded border border-slate-300 px-3 py-1.5 text-xs"
                    />
                    <button
                      type="submit"
                      className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Gửi đánh giá
                    </button>
                  </form>
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </MainLayout>
  )
}