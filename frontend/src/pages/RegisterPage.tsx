import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import type { UserRole } from '../types/auth'

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/

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
      barColor: 'bg-slate-200',
      textColor: 'text-slate-500',
      rules,
    }
  }

  if (passedCount <= 2) {
    return {
      score: passedCount,
      percent: 33,
      label: 'Yếu',
      barColor: 'bg-red-500',
      textColor: 'text-red-600',
      rules,
    }
  }

  if (passedCount <= 4) {
    return {
      score: passedCount,
      percent: 66,
      label: 'Trung bình',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      rules,
    }
  }

  return {
    score: passedCount,
    percent: 100,
    label: 'Mạnh',
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
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
      <div className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Họ và tên</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@example.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ví dụ: MatKhau@123"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />

            {/* Thanh tiến độ độ mạnh mật khẩu */}
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                <span className={`font-semibold ${strength.textColor}`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${strength.barColor}`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
            </div>

            {/* Chú thích điều kiện tạo mật khẩu mạnh */}
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="mb-1.5 font-semibold text-slate-700">
                Cách tạo mật khẩu mạnh:
              </p>
              <ul className="space-y-1">
                {strength.rules.map((rule) => (
                  <li
                    key={rule.id}
                    className={rule.passed ? 'text-emerald-700' : 'text-slate-500'}
                  >
                    {rule.passed ? '✓' : '•'} {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Bạn muốn tham gia với vai trò
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="freelancer">Freelancer (Nhận dự án)</option>
              <option value="client">Client (Đăng dự án & thuê freelancer)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </MainLayout>
  )
}