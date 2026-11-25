import { Link, useLocation, useNavigate, type ReactNode } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AMBIENT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=60'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinkClass = (path: string) => {
    const isActive = pathname === path
    return `relative rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300 ease-in-out ${
      isActive
        ? 'border-[#FFB162] bg-[#FFB162] text-[#1B2632] shadow-md hover:bg-[#EEE9DF] hover:border-[#EEE9DF] hover:text-[#1B2632]'
        : 'border-transparent bg-[#2C3B4D]/55 text-[#C9C1B1] hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-md'
    }`
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#1B2632] text-[#EEE9DF]">
      {/* Hình ảnh nền trang trí có hiệu ứng blur giảm dần ở góc trên */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-80 overflow-hidden"
      >
        <img
          src={AMBIENT_BANNER_IMAGE}
          alt=""
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0) 100%)',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0) 100%)',
          }}
          className="h-full w-full scale-105 object-cover object-center opacity-35 blur-[2px] transition-all duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B2632]/50 via-[#1B2632]/75 to-[#1B2632]" />
      </div>

      {/* Khối ảnh mờ giảm dần góc dưới tạo chiều sâu */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-16 -right-16 z-0 h-72 w-96 overflow-hidden rounded-3xl"
      >
        <img
          src={AMBIENT_BANNER_IMAGE}
          alt=""
          style={{
            WebkitMaskImage:
              'radial-gradient(circle at bottom right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 85%)',
            maskImage:
              'radial-gradient(circle at bottom right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 85%)',
          }}
          className="h-full w-full object-cover opacity-25 blur-sm"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#C9C1B1]/15 bg-[#1B2632]/85 backdrop-blur-md transition-all duration-300 ease-in-out">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-4">
          <div className="flex flex-wrap items-center gap-8">
            <Link
              to="/"
              className="group flex items-center gap-3 rounded-xl px-2 py-1 text-lg font-bold tracking-tight text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFB162] text-sm font-extrabold text-[#1B2632] shadow-sm transition-all duration-300 ease-in-out group-hover:bg-[#1B2632] group-hover:text-[#FFB162]">
                FH
              </span>
              <span className="pr-1">FreelanceHub</span>
            </Link>

            <nav className="flex flex-wrap items-center gap-3 md:gap-4">
              <Link to="/" className={navLinkClass('/')}>
                Trang chủ
              </Link>

              {user && (
                <>
                  <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/projects" className={navLinkClass('/projects')}>
                    Dự án
                  </Link>
                  <Link to="/contracts" className={navLinkClass('/contracts')}>
                    Hợp đồng
                  </Link>
                </>
              )}

              {user?.role === 'client' && (
                <span className="cursor-default rounded-full border border-[#FFB162]/40 bg-[#2C3B4D] px-3.5 py-1.5 text-xs font-semibold text-[#FFB162] transition-all duration-300 ease-in-out hover:border-[#FFB162] hover:bg-[#FFB162] hover:text-[#1B2632]">
                  Khu vực Client
                </span>
              )}

              {user?.role === 'freelancer' && (
                <span className="cursor-default rounded-full border border-[#C9C1B1]/40 bg-[#2C3B4D] px-3.5 py-1.5 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]">
                  Khu vực Freelancer
                </span>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <div className="group hidden cursor-default rounded-xl border border-[#C9C1B1]/20 bg-[#2C3B4D] px-4 py-2 text-xs text-[#C9C1B1] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#2C3B4D] sm:block">
                  Xin chào,{' '}
                  <strong className="text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                    {user.full_name}
                  </strong>{' '}
                  <span className="font-semibold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                    ({user.role})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-[#A35139]/60 bg-[#2C3B4D] px-4 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#A35139] hover:bg-[#A35139] hover:text-[#EEE9DF] hover:shadow-md"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-[#C9C1B1]/30 bg-[#2C3B4D] px-4 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-md"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl border border-[#FFB162] bg-[#FFB162] px-4 py-2 text-xs font-semibold text-[#1B2632] shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-md"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Nội dung chính */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}