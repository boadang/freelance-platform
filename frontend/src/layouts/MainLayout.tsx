import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-bold text-indigo-600">
              FreelanceHub
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link to="/" className="text-slate-600 hover:text-slate-900">
                Trang chủ
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">
                    Dashboard
                  </Link>
                  <Link to="/projects" className="text-slate-600 hover:text-slate-900">
                    Dự án
                  </Link>
                </>
              )}
              {user?.role === 'client' && (
                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                  Khu vực Client
                </span>
              )}
              {user?.role === 'freelancer' && (
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                  Khu vực Freelancer
                </span>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-slate-700">
                  Xin chào, <strong>{user.full_name}</strong> ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}