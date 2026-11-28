import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'

const AUTH_AMBIENT_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=65'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] shadow-2xl lg:grid-cols-12">
        {/* Cột trái: Khung giới thiệu + ảnh mờ giảm dần */}
        <div className="relative flex flex-col justify-between overflow-hidden border-b border-[#C9C1B1]/15 bg-[#1B2632] p-8 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <img
              src={AUTH_AMBIENT_IMAGE}
              alt=""
              style={{
                WebkitMaskImage:
                  'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.05) 100%)',
                maskImage:
                  'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.05) 100%)',
              }}
              className="h-full w-full object-cover opacity-30 blur-[1.5px]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1B2632]/80 via-[#1B2632]/65 to-[#1B2632]" />
          </div>

          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center rounded-full border border-[#FFB162]/35 bg-[#2C3B4D]/85 px-3.5 py-1 text-xs font-semibold text-[#FFB162]">
              Chào mừng trở lại
            </span>
            <h2 className="text-2xl font-extrabold leading-tight text-[#EEE9DF] sm:text-3xl">
              Tiếp tục công việc trên <span className="text-[#FFB162]">FreelanceHub</span>
            </h2>
            <p className="text-xs leading-relaxed text-[#C9C1B1] sm:text-sm">
              Đăng nhập để quản lý dự án, phản hồi proposal, cập nhật cột mốc hợp đồng và theo dõi
              tiến độ bàn giao theo thời gian thực.
            </p>
          </div>

          <div className="relative z-10 mt-8 rounded-2xl border border-[#C9C1B1]/15 bg-[#2C3B4D]/80 p-4 text-xs text-[#C9C1B1]">
            <p className="font-semibold text-[#EEE9DF]">Không gian làm việc thống nhất</p>
            <p className="mt-1">
              Hỗ trợ đầy đủ luồng thao tác riêng biệt cho cả <strong>Client</strong> và{' '}
              <strong>Freelancer</strong>.
            </p>
          </div>
        </div>

        {/* Cột phải: Form đăng nhập */}
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-7">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#EEE9DF] sm:text-3xl">
              Đăng nhập
            </h1>
            <p className="mt-1.5 text-xs text-[#C9C1B1] sm:text-sm">
              Nhập email và mật khẩu tài khoản của bạn để truy cập workspace.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-[#A35139] bg-[#A35139]/25 p-3.5 text-xs font-medium text-[#EEE9DF] sm:text-sm"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@example.com"
                  className="mt-2 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-3 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-3 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl border border-[#FFB162] bg-[#FFB162] py-3 text-sm font-bold text-[#1B2632] shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl disabled:opacity-60"
              >
                {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#C9C1B1] sm:text-sm">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="rounded-lg px-2 py-1 font-bold text-[#FFB162] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}