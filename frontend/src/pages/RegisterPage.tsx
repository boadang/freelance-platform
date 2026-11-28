import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import type { UserRole } from '../types/auth'

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/

const AUTH_AMBIENT_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=65'

interface PasswordRule {
  id: string
  label: string
  passed: boolean
}

function evaluatePassword(password: string) {
  const rules: PasswordRule[] = [
    {
      id: 'length',
      label: 'Ít nhất 8 ký tự (tối đa 72 ký tự)',
      passed: password.length >= 8 && password.length <= 72,
    },
    {
      id: 'lower',
      label: 'Ít nhất 1 chữ thường (a–z)',
      passed: /[a-z]/.test(password),
    },
    {
      id: 'upper',
      label: 'Ít nhất 1 chữ in hoa (A–Z)',
      passed: /[A-Z]/.test(password),
    },
    {
      id: 'number',
      label: 'Ít nhất 1 chữ số (0–9)',
      passed: /\d/.test(password),
    },
    {
      id: 'special',
      label: 'Ít nhất 1 ký tự đặc biệt (VD: !@#$%^&*)',
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ]

  const passedCount = rules.filter((r) => r.passed).length

  if (password.length === 0) {
    return {
      score: 0,
      percent: 0,
      label: 'Chưa nhập',
      barColor: 'bg-[#C9C1B1]/30',
      textColor: 'text-[#C9C1B1]',
      rules,
    }
  }

  if (passedCount <= 2) {
    return {
      score: passedCount,
      percent: 33,
      label: 'Yếu',
      barColor: 'bg-[#A35139]',
      textColor: 'text-[#FFB162]',
      rules,
    }
  }

  if (passedCount <= 4) {
    return {
      score: passedCount,
      percent: 66,
      label: 'Trung bình',
      barColor: 'bg-[#FFB162]',
      textColor: 'text-[#FFB162]',
      rules,
    }
  }

  return {
    score: passedCount,
    percent: 100,
    label: 'Mạnh',
    barColor: 'bg-emerald-400',
    textColor: 'text-emerald-300',
    rules,
  }
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('freelancer')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => evaluatePassword(password), [password])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()

    if (trimmedName.length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.')
      return
    }

    if (!trimmedEmail) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.')
      return
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      setError(
        'Mật khẩu chưa đủ mạnh. Cần ít nhất 8 ký tự gồm chữ thường, chữ in hoa, số và ký tự đặc biệt.'
      )
      return
    }

    setSubmitting(true)
    try {
      await register({
        full_name: trimmedName,
        email: trimmedEmail,
        password,
        role,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] shadow-2xl lg:grid-cols-12">
        {/* Cột trái: Gợi mở vai trò & ảnh blur giảm dần */}
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
              Tạo tài khoản mới
            </span>
            <h2 className="text-2xl font-extrabold leading-tight text-[#EEE9DF] sm:text-3xl">
              Bắt đầu hợp tác minh bạch trên <span className="text-[#FFB162]">FreelanceHub</span>
            </h2>
            <p className="text-xs leading-relaxed text-[#C9C1B1] sm:text-sm">
              Chọn vai trò phù hợp với mục tiêu của bạn để đăng dự án, gửi báo giá hoặc quản lý hợp
              đồng theo từng cột mốc.
            </p>
          </div>

          <div className="relative z-10 mt-8 space-y-3 text-xs">
            <div className="group rounded-2xl border border-[#C9C1B1]/15 bg-[#2C3B4D]/85 p-4 transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]">
              <p className="font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                Freelancer
              </p>
              <p className="mt-1 text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                Tìm dự án mở, gửi proposal và nộp kết quả theo từng milestone.
              </p>
            </div>
            <div className="group rounded-2xl border border-[#C9C1B1]/15 bg-[#2C3B4D]/85 p-4 transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]">
              <p className="font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                Client
              </p>
              <p className="mt-1 text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                Đăng dự án, duyệt đề xuất phù hợp và nghiệm thu từng cột mốc.
              </p>
            </div>
          </div>
        </div>

        {/* Cột phải: Form đăng ký & kiểm tra độ mạnh mật khẩu */}
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-7">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#EEE9DF] sm:text-3xl">
              Đăng ký tài khoản
            </h1>
            <p className="mt-1.5 text-xs text-[#C9C1B1] sm:text-sm">
              Thiết lập thông tin cơ bản và mật khẩu mạnh để bảo vệ tài khoản.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-[#A35139] bg-[#A35139]/25 p-3.5 text-xs font-medium text-[#EEE9DF] sm:text-sm"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                />
              </div>

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
                  className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
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
                  placeholder="Ví dụ: MatKhau@123"
                  className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] placeholder-[#C9C1B1]/50 transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                />

                {/* Thanh tiến độ độ mạnh mật khẩu */}
                <div className="mt-2.5">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-[#C9C1B1]">Độ mạnh mật khẩu:</span>
                    <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#1B2632]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ease-in-out ${strength.barColor}`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                </div>

                {/* Chú thích điều kiện tạo mật khẩu mạnh */}
                <div className="mt-3 rounded-2xl border border-[#C9C1B1]/15 bg-[#1B2632]/90 p-3.5 text-xs text-[#C9C1B1]">
                  <p className="mb-2 font-bold text-[#EEE9DF]">Cách tạo mật khẩu mạnh:</p>
                  <ul className="space-y-1">
                    {strength.rules.map((rule) => (
                      <li
                        key={rule.id}
                        className={`transition-colors duration-200 ${
                          rule.passed ? 'font-medium text-emerald-300' : 'text-[#C9C1B1]'
                        }`}
                      >
                        {rule.passed ? '✓' : '•'} {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C9C1B1]">
                  Bạn muốn tham gia với vai trò
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1.5 w-full rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-sm text-[#EEE9DF] transition-all duration-300 ease-in-out focus:border-[#FFB162] focus:outline-none"
                >
                  <option value="freelancer">Freelancer (Nhận dự án)</option>
                  <option value="client">Client (Đăng dự án &amp; thuê freelancer)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl border border-[#FFB162] bg-[#FFB162] py-3 text-sm font-bold text-[#1B2632] shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl disabled:opacity-60"
              >
                {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#C9C1B1] sm:text-sm">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="rounded-lg px-2 py-1 font-bold text-[#FFB162] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}