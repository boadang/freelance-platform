import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import type { Project, Proposal } from '../types/marketplace'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user, token, isLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Form gửi proposal (freelancer)
  const [proposedAmount, setProposedAmount] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDetails = async () => {
    if (!token || !id) return
    setError(null)
    try {
      const proj = await apiRequest<Project>(`/projects/${id}`, {}, token)
      setProject(proj)
      const propsList = await apiRequest<Proposal[]>(`/projects/${id}/proposals`, {}, token)
      setProposals(propsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được chi tiết dự án')
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
        <p className="text-sm text-slate-600">Đang tải...</p>
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
            cover_letter: coverLetter,
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
    try {
      await apiRequest<Proposal>(
        `/proposals/${proposalId}/accept`,
        { method: 'POST' },
        token
      )
      setInfo('Đã chấp nhận proposal và khởi tạo hợp đồng!')
      await loadDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể chấp nhận proposal')
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        {info && (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{info}</p>
        )}

        {project && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <span className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {project.status}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-600">
              <span>
                Ngân sách: <strong>{project.budget_min}</strong> – <strong>{project.budget_max}</strong>
              </span>
              <span>Kỹ năng: <strong>{project.skills_required || 'Không ghi cụ thể'}</strong></span>
            </div>
          </section>
        )}

        {user.role === 'freelancer' && project?.status === 'open' && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Gửi đề xuất chào giá (Proposal)</h2>
            <form onSubmit={handleSendProposal} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Mức giá đề xuất
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    value={proposedAmount}
                    onChange={(e) => setProposedAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Số ngày hoàn thành dự kiến
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={365}
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Thư chào hàng</label>
                <textarea
                  required
                  minLength={10}
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Trình bày kinh nghiệm phù hợp và cách bạn sẽ triển khai dự án..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Đang gửi...' : 'Gửi Proposal'}
              </button>
            </form>
          </section>
        )}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Danh sách Proposal</h2>
          {proposals.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Chưa có proposal nào.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Freelancer #{prop.freelancer_id} — Giá: {prop.proposed_amount} |{' '}
                      {prop.estimated_days} ngày
                    </p>
                    <p className="text-sm text-slate-600">{prop.cover_letter}</p>
                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      Trạng thái: {prop.status}
                    </span>
                  </div>

                  {user.role === 'client' &&
                    project?.client_id === user.id &&
                    prop.status === 'pending' &&
                    project?.status === 'open' && (
                      <button
                        type="button"
                        onClick={() => handleAcceptProposal(prop.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        Chấp nhận
                      </button>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  )
}