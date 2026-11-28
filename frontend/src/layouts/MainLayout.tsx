import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AMBIENT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=60'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate('/login')
  }

  const sectionHref = (hash: string) => (pathname === '/' ? hash : `/${hash}`)

  const navItemClass = (path: string) => {
    const isActive = pathname === path
    return `rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-300 ease-in-out ${
      isActive
        ? 'bg-[#FFB162] text-[#1B2632] shadow-sm hover:bg-[#EEE9DF] hover:text-[#1B2632]'
        : 'text-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]'
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

      {/* Header chính đồng bộ với thiết kế mới */}
      <header className="sticky top-0 z-30 border-b border-[#C9C1B1]/15 bg-[#1B2632]/80 backdrop-blur-md transition-all duration-300 ease-in-out">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex items-center gap-3 rounded-xl px-2 py-1 text-base font-bold tracking-tight text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFB162] text-xs font-extrabold text-[#1B2632] transition-all duration-300 ease-in-out group-hover:bg-[#1B2632] group-hover:text-[#FFB162]">
              FH
            </span>
            <span>FreelanceHub</span>
          </Link>

          {/* Desktop horizontal navigation */}
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-2 md:flex">
            {!user && (
              <>
                <a
                  href={sectionHref('#layout-jobs')}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                >
                  Công việc
                </a>
                <a
                  href={sectionHref('#layout-benefits')}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                >
                  Lợi ích
                </a>
                <a
                  href={sectionHref('#layout-cinema')}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                >
                  Freelancer &amp; Liên hệ
                </a>
              </>
            )}

            {user && (
              <>
                <Link to="/dashboard" className={navItemClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/projects" className={navItemClass('/projects')}>
                  Dự án
                </Link>
                <Link to="/contracts" className={navItemClass('/contracts')}>
                  Hợp đồng
                </Link>
                <span
                  className={`cursor-default rounded-full border px-3 py-1 text-[11px] font-semibold transition-all duration-300 ease-in-out ${
                    user.role === 'client'
                      ? 'border-[#FFB162]/40 bg-[#2C3B4D] text-[#FFB162] hover:border-[#FFB162] hover:bg-[#FFB162] hover:text-[#1B2632]'
                      : 'border-[#C9C1B1]/40 bg-[#2C3B4D] text-[#EEE9DF] hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]'
                  }`}
                >
                  {user.role === 'client' ? 'Client' : 'Freelancer'}
                </span>
              </>
            )}

            <div className="ml-2 flex items-center gap-2.5">
              {user ? (
                <>
                  <span className="hidden rounded-xl border border-[#C9C1B1]/20 bg-[#2C3B4D]/80 px-3 py-1.5 text-xs text-[#C9C1B1] lg:inline-block">
                    <strong className="text-[#EEE9DF]">{user.full_name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-[#A35139] bg-[#A35139] px-3.5 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl border border-[#C9C1B1]/35 bg-[#2C3B4D]/80 px-4 py-2 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl border border-[#FFB162] bg-[#FFB162] px-4 py-2 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button on narrow viewports */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Mở hoặc đóng menu điều hướng"
            className="rounded-xl border border-[#C9C1B1]/35 bg-[#2C3B4D]/85 px-3.5 py-2 text-xs font-bold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] md:hidden"
          >
            {mobileMenuOpen ? 'Đóng ✕' : 'Menu ☰'}
          </button>
        </div>

        {/* Mobile collapsed menu preserving reading order */}
        {mobileMenuOpen && (
          <div className="border-t border-[#C9C1B1]/15 bg-[#1B2632]/95 px-4 py-4 backdrop-blur-md md:hidden">
            <div className="flex flex-col space-y-2 text-sm">
              {!user && (
                <>
                  <a
                    href={sectionHref('#layout-jobs')}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3.5 py-2.5 font-medium text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Công việc
                  </a>
                  <a
                    href={sectionHref('#layout-benefits')}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3.5 py-2.5 font-medium text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Lợi ích
                  </a>
                  <a
                    href={sectionHref('#layout-cinema')}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3.5 py-2.5 font-medium text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Freelancer &amp; Liên hệ
                  </a>
                </>
              )}

              {user && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3.5 py-2.5 font-medium text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3.5 py-2.5 font-medium text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Dự án
                  </Link>
                  <Link
                    to="/contracts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3.5 py-2.5 font-medium text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Hợp đồng
                  </Link>
                </>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl bg-[#A35139] px-4 py-2.5 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-[#C9C1B1]/35 bg-[#2C3B4D] px-4 py-2.5 text-center text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl bg-[#FFB162] px-4 py-2.5 text-center text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Nội dung chính mở rộng bề ngang + hiệu ứng pop-up nhẹ mỗi lần đổi route */}
      <main className="relative z-10 mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div key={pathname} className="page-popup-enter">
          {children}
        </div>
      </main>
    </div>
  )
}