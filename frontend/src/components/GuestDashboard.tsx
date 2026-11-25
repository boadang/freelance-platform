import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

interface JobCategoryItem {
  id: string
  title: string
  audience: 'client' | 'freelancer' | 'both'
  audienceLabel: string
  clientAction: string
  freelancerAction: string
  budgetHint: string
  skills: string[]
}

interface FeaturedFreelancer {
  id: string
  name: string
  role: string
  rate: string
  rating: string
  shortDesc: string
  avatar: string
  backdrop: string
  skills: string[]
  location: string
}

const HERO_BG_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=70'

const JOB_CATALOG: JobCategoryItem[] = [
  {
    id: 'web-fullstack',
    title: 'Phát triển Web & Full-stack',
    audience: 'both',
    audienceLabel: 'Client & Freelancer',
    clientAction: 'Đăng tin xây dựng website, SaaS, dashboard hoặc cổng thương mại điện tử.',
    freelancerAction: 'Nhận làm React, TypeScript, FastAPI, Node.js và tích hợp API/database.',
    budgetHint: '8.000.000 – 45.000.000đ',
    skills: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL'],
  },
  {
    id: 'ui-ux-design',
    title: 'Thiết kế UI/UX & Design System',
    audience: 'both',
    audienceLabel: 'Client & Freelancer',
    clientAction: 'Đăng dự án thiết kế giao diện web/app, wireframe hoặc bộ component chuẩn.',
    freelancerAction: 'Nhận thiết kế Figma, prototype tương tác, hệ thống màu sắc & typography.',
    budgetHint: '5.000.000 – 25.000.000đ',
    skills: ['Figma', 'UI/UX', 'Design System', 'Prototyping'],
  },
  {
    id: 'mobile-app',
    title: 'Ứng dụng Mobile iOS & Android',
    audience: 'both',
    audienceLabel: 'Client & Freelancer',
    clientAction: 'Tìm người phát triển ứng dụng đặt lịch, bán hàng, theo dõi công việc.',
    freelancerAction: 'Nhận xây dựng app di động mượt mà, đẩy store và kết nối backend.',
    budgetHint: '12.000.000 – 60.000.000đ',
    skills: ['React Native', 'Flutter', 'Mobile UI', 'REST API'],
  },
  {
    id: 'ai-automation',
    title: 'AI Workflow & Tự động hóa',
    audience: 'both',
    audienceLabel: 'Client & Freelancer',
    clientAction: 'Đăng bài tìm chuyên gia tích hợp AI, chatbot CSKH hoặc tự động hóa quy trình.',
    freelancerAction: 'Nhận xây dựng pipeline AI, script xử lý dữ liệu và kết nối webhook/API.',
    budgetHint: '7.000.000 – 40.000.000đ',
    skills: ['Python', 'LLM API', 'Automation', 'Data Pipeline'],
  },
  {
    id: 'backend-api',
    title: 'Kiến trúc Backend, API & Database',
    audience: 'client',
    audienceLabel: 'Phổ biến cho Client đăng',
    clientAction: 'Đăng nhu cầu tối ưu hiệu năng, thiết kế schema database và bảo mật JWT/RBAC.',
    freelancerAction: 'Tư vấn kiến trúc hệ thống, viết API chuẩn hóa và tối ưu truy vấn SQL.',
    budgetHint: '6.000.000 – 35.000.000đ',
    skills: ['FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Security'],
  },
  {
    id: 'devops-cloud',
    title: 'Triển khai Cloud, Docker & CI/CD',
    audience: 'freelancer',
    audienceLabel: 'Phổ biến cho Freelancer nhận',
    clientAction: 'Đăng dự án đưa ứng dụng lên server, cấu hình domain/SSL và giám sát lỗi.',
    freelancerAction: 'Nhận đóng gói Docker, thiết lập CI/CD, reverse proxy và backup tự động.',
    budgetHint: '4.000.000 – 22.000.000đ',
    skills: ['Docker', 'Linux', 'Nginx', 'CI/CD'],
  },
  {
    id: 'qa-testing',
    title: 'Kiểm thử phần mềm (QA & Automation Test)',
    audience: 'client',
    audienceLabel: 'Phổ biến cho Client đăng',
    clientAction: 'Đăng tin kiểm thử luồng nghiệp vụ, phát hiện bug trước khi ra mắt sản phẩm.',
    freelancerAction: 'Nhận viết test case, test API/UI và báo cáo lỗi chi tiết kèm tái hiện.',
    budgetHint: '3.500.000 – 18.000.000đ',
    skills: ['QA Testing', 'API Test', 'E2E', 'Bug Report'],
  },
  {
    id: 'product-copy-seo',
    title: 'Viết tài liệu kỹ thuật, Landing & Tối ưu SEO',
    audience: 'freelancer',
    audienceLabel: 'Phổ biến cho Freelancer nhận',
    clientAction: 'Đăng dự án làm trang giới thiệu sản phẩm, tài liệu hướng dẫn hoặc tối ưu tốc độ.',
    freelancerAction: 'Nhận trình bày nội dung sản phẩm rõ ràng, tối ưu cấu trúc trang & SEO.',
    budgetHint: '3.000.000 – 15.000.000đ',
    skills: ['Landing Page', 'Technical Docs', 'Performance', 'SEO'],
  },
]

const PLATFORM_BENEFITS = [
  {
    step: '01',
    title: 'Khởi tạo dự án & Chào giá minh bạch',
    desc: 'Client mô tả rõ ngân sách và kỹ năng cần thiết; Freelancer gửi đề xuất giá, thời gian và thư chào hàng trực tiếp trên từng dự án.',
  },
  {
    step: '02',
    title: 'Chốt hợp đồng & Chia nhỏ Milestone',
    desc: 'Khi duyệt proposal, hợp đồng được tạo ngay. Công việc chia theo từng cột mốc giúp nộp bài và nghiệm thu rõ ràng từng giai đoạn.',
  },
  {
    step: '03',
    title: 'Phân quyền chặt chẽ & Bảo mật chuẩn mực',
    desc: 'Tách biệt rõ quyền Client và Freelancer, xác thực JWT, băm mật khẩu an toàn và kiểm soát quyền truy cập trên từng tài nguyên.',
  },
  {
    step: '04',
    title: 'Đánh giá hai chiều xây dựng uy tín',
    desc: 'Sau khi hoàn tất hợp đồng, cả hai bên có thể chấm sao và để lại nhận xét thực tế để nâng cao độ tin cậy cho cộng đồng.',
  },
]

const FEATURED_FREELANCERS: FeaturedFreelancer[] = [
  {
    id: 'minh-khoa',
    name: 'Trần Minh Khoa',
    role: 'Full-stack Engineer (FastAPI & React)',
    rate: '$28 / giờ',
    rating: '4.9 ★ (24 dự án)',
    shortDesc:
      'Chuyên xây dựng hệ thống web API hiệu năng cao, phân quyền chặt chẽ và giao diện React/TypeScript gọn gàng.',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=75',
    backdrop:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=65',
    skills: ['FastAPI', 'React', 'PostgreSQL', 'Docker'],
    location: 'Đà Nẵng, VN',
  },
  {
    id: 'thao-vy',
    name: 'Lê Thảo Vy',
    role: 'Senior UI/UX & Product Designer',
    rate: '$24 / giờ',
    rating: '5.0 ★ (31 dự án)',
    shortDesc:
      'Thiết kế giao diện sản phẩm số dễ dùng, giàu tính tương tác và đồng bộ hệ thống màu sắc cho startup & doanh nghiệp.',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=75',
    backdrop:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1400&q=65',
    skills: ['Figma', 'UI/UX', 'Design System', 'Motion'],
    location: 'TP. Hồ Chí Minh, VN',
  },
  {
    id: 'hoang-nam',
    name: 'Nguyễn Hoàng Nam',
    role: 'Backend & Automation Specialist',
    rate: '$30 / giờ',
    rating: '4.8 ★ (19 dự án)',
    shortDesc:
      'Tối ưu cơ sở dữ liệu quan hệ, tự động hóa quy trình xử lý dữ liệu và tích hợp dịch vụ bên thứ ba ổn định.',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=75',
    backdrop:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=65',
    skills: ['Python', 'SQL', 'Automation', 'Linux'],
    location: 'Hà Nội, VN',
  },
]

function useScrollReveal() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

export default function GuestDashboard() {
  const [jobFilter, setJobFilter] = useState<'all' | 'client' | 'freelancer'>('all')
  const [slideIndex, setSlideIndex] = useState(0)
  const [contactTarget, setContactTarget] = useState<FeaturedFreelancer | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactNote, setContactNote] = useState('')
  const [contactSent, setContactSent] = useState<string | null>(null)

  const secJobs = useScrollReveal()
  const secBenefits = useScrollReveal()
  const secCinema = useScrollReveal()

  const filteredJobs = useMemo(() => {
    if (jobFilter === 'all') return JOB_CATALOG
    if (jobFilter === 'client') {
      return JOB_CATALOG.filter((j) => j.audience === 'client' || j.audience === 'both')
    }
    return JOB_CATALOG.filter((j) => j.audience === 'freelancer' || j.audience === 'both')
  }, [jobFilter])

  const currentFreelancer = FEATURED_FREELANCERS[slideIndex]

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev === 0 ? FEATURED_FREELANCERS.length - 1 : prev - 1))
  }

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev === FEATURED_FREELANCERS.length - 1 ? 0 : prev + 1))
  }

  const handleOpenContact = (freelancer: FeaturedFreelancer) => {
    setContactTarget(freelancer)
    setContactSent(null)
  }

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!contactTarget) return
    setContactSent(
      `Đã ghi nhận lời nhắn gửi tới ${contactTarget.name}. Đăng ký hoặc đăng nhập tài khoản để trao đổi trực tiếp và tạo dự án/hợp đồng chính thức.`
    )
    setContactName('')
    setContactEmail('')
    setContactNote('')
  }

  return (
    <div className="space-y-20 pb-8">
      {/* =====================================================================
          LAYOUT 1: GỢI MỞ SỬ DỤNG + ĐĂNG KÝ / ĐĂNG NHẬP
      ===================================================================== */}
      <section
        id="layout-invite"
        className="relative overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-8 shadow-2xl transition-all duration-500 ease-in-out md:p-12"
      >
        {/* Ảnh nền blur giảm dần tạo chiều sâu */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full lg:w-7/12"
        >
          <img
            src={HERO_BG_IMAGE}
            alt=""
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.85) 100%)',
              maskImage:
                'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.85) 100%)',
            }}
            className="h-full w-full object-cover opacity-30 blur-[1.5px] transition-all duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C3B4D] via-[#2C3B4D]/75 to-transparent" />
        </div>

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FFB162]/40 bg-[#1B2632]/85 px-4 py-1.5 text-xs font-semibold text-[#FFB162] transition-all duration-300 ease-in-out hover:border-[#FFB162] hover:bg-[#FFB162] hover:text-[#1B2632]">
              Chào mừng đến với FreelanceHub • Bắt đầu hành trình của bạn
            </span>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#EEE9DF] sm:text-4xl lg:text-5xl">
              Kết nối <span className="text-[#FFB162]">Client</span> &{' '}
              <span className="text-[#FFB162]">Freelancer</span> trong một không gian minh bạch
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-[#C9C1B1] sm:text-base">
              Bạn chưa đăng nhập nên đang xem chế độ giới thiệu tổng quan. Hãy tạo tài khoản miễn
              phí để đăng dự án, gửi báo giá proposal, quản lý cột mốc thanh toán và đánh giá sau
              dự án chỉ trong vài bước.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="rounded-full border border-[#FFB162] bg-[#FFB162] px-7 py-3.5 text-sm font-bold text-[#1B2632] shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl"
              >
                Đăng ký miễn phí ngay
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-[#C9C1B1]/45 bg-[#1B2632]/80 px-7 py-3.5 text-sm font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl"
              >
                Đăng nhập
              </Link>
            </div>

            {/* Điều hướng cuộn mượt tới 3 layout tiếp theo */}
            <div className="flex flex-wrap items-center gap-3 pt-4 text-xs">
              <span className="text-[#C9C1B1]">Cuộn nhanh:</span>
              <a
                href="#layout-jobs"
                className="rounded-full border border-[#C9C1B1]/25 bg-[#1B2632]/70 px-3.5 py-1.5 font-medium text-[#EEE9DF] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
              >
                2. Danh mục công việc
              </a>
              <a
                href="#layout-benefits"
                className="rounded-full border border-[#C9C1B1]/25 bg-[#1B2632]/70 px-3.5 py-1.5 font-medium text-[#EEE9DF] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
              >
                3. Lợi ích nền tảng
              </a>
              <a
                href="#layout-cinema"
                className="rounded-full border border-[#C9C1B1]/25 bg-[#1B2632]/70 px-3.5 py-1.5 font-medium text-[#EEE9DF] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
              >
                4. Freelancer nổi bật & Liên hệ
              </a>
            </div>
          </div>

          {/* 2 thẻ gợi mở vai trò bên phải (đảo màu đối lập khi hover) */}
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <div className="group rounded-2xl border border-[#C9C1B1]/20 bg-[#1B2632]/90 p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                  Dành cho Client
                </span>
                <span className="rounded-full bg-[#2C3B4D] px-2.5 py-0.5 text-[11px] font-semibold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632] group-hover:text-[#FFB162]">
                  Thuê nhân sự
                </span>
              </div>
              <h2 className="mt-3 text-lg font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                Đăng dự án & duyệt proposal dễ dàng
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                Đặt ngân sách, liệt kê kỹ năng, so sánh báo giá từ freelancer và duyệt từng milestone
                trước khi giải ngân.
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center text-xs font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139] hover:underline"
              >
                Đăng ký vai trò Client →
              </Link>
            </div>

            <div className="group rounded-2xl border border-[#C9C1B1]/20 bg-[#1B2632]/90 p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                  Dành cho Freelancer
                </span>
                <span className="rounded-full bg-[#2C3B4D] px-2.5 py-0.5 text-[11px] font-semibold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632] group-hover:text-[#FFB162]">
                  Nhận dự án
                </span>
              </div>
              <h2 className="mt-3 text-lg font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                Tìm job phù hợp & làm việc theo cột mốc
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                Chủ động gửi chào giá, nhận hợp đồng khi được chọn, nộp kết quả theo từng milestone
                và tích lũy đánh giá uy tín.
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center text-xs font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139] hover:underline"
              >
                Đăng ký vai trò Freelancer →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          LAYOUT 2: CÁC CÔNG VIỆC CLIENT & FREELANCER CÓ THỂ ĐĂNG / NHẬN
      ===================================================================== */}
      <section
        id="layout-jobs"
        ref={secJobs.ref}
        className={`scroll-mt-24 space-y-8 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D]/75 p-8 shadow-xl transition-all duration-700 ease-in-out md:p-10 ${
          secJobs.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFB162]">
              02 • Hệ sinh thái công việc
            </span>
            <h2 className="text-2xl font-extrabold text-[#EEE9DF] sm:text-3xl">
              Công việc Client có thể đăng & Freelancer có thể nhận
            </h2>
            <p className="max-w-2xl text-sm text-[#C9C1B1]">
              Từ phát triển sản phẩm số, thiết kế giao diện, AI/tự động hóa đến kiểm thử và triển
              khai hệ thống — cả hai phía đều có luồng việc rõ ràng.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(
              [
                { key: 'all', label: 'Tất cả nhóm việc (8)' },
                { key: 'client', label: 'Client đăng tin' },
                { key: 'freelancer', label: 'Freelancer nhận việc' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setJobFilter(tab.key)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ease-in-out ${
                  jobFilter === tab.key
                    ? 'border-[#FFB162] bg-[#FFB162] text-[#1B2632] shadow-md'
                    : 'border-[#C9C1B1]/25 bg-[#1B2632] text-[#C9C1B1] hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#C9C1B1]/20 bg-[#1B2632] p-6 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-2xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[#2C3B4D] px-3 py-1 text-[11px] font-semibold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632] group-hover:text-[#FFB162]">
                    {job.audienceLabel}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                  {job.title}
                </h3>

                <div className="space-y-2 text-xs leading-relaxed">
                  <p className="text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                    <strong className="text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                      Client đăng:
                    </strong>{' '}
                    {job.clientAction}
                  </p>
                  <p className="text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                    <strong className="text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                      Freelancer nhận:
                    </strong>{' '}
                    {job.freelancerAction}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-[#C9C1B1]/15 pt-4 transition-colors duration-300 ease-in-out group-hover:border-[#2C3B4D]/20">
                <p className="text-xs font-bold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                  {job.budgetHint}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-[#2C3B4D] px-2 py-0.5 text-[11px] font-medium text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:bg-[#2C3B4D] group-hover:text-[#EEE9DF]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <Link
                  to="/register"
                  className="inline-flex pt-1 text-xs font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632] hover:underline"
                >
                  Bắt đầu với nhóm việc này →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          LAYOUT 3: LỢI ÍCH CỦA TRANG WEB
      ===================================================================== */}
      <section
        id="layout-benefits"
        ref={secBenefits.ref}
        className={`scroll-mt-24 space-y-8 rounded-3xl border border-[#C9C1B1]/15 bg-[#1B2632]/90 p-8 shadow-xl transition-all duration-700 ease-in-out md:p-10 ${
          secBenefits.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFB162]">
              03 • Giá trị cốt lõi
            </span>
            <h2 className="text-2xl font-extrabold text-[#EEE9DF] sm:text-3xl">
              Lợi ích khi làm việc trên FreelanceHub
            </h2>
          </div>
          <Link
            to="/register"
            className="rounded-full border border-[#FFB162] bg-[#FFB162] px-5 py-2.5 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
          >
            Trải nghiệm ngay
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PLATFORM_BENEFITS.map((item) => (
            <div
              key={item.step}
              className="group flex flex-col justify-between rounded-2xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B2632] text-sm font-extrabold text-[#FFB162] transition-colors duration-300 ease-in-out group-hover:bg-[#1B2632] group-hover:text-[#FFB162]">
                    {item.step}
                  </span>
                  <span className="text-xs font-semibold text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#A35139]">
                    Quy trình chuẩn
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          LAYOUT 4: CINEMA SLIDE WINDOW FREELANCER NỔI BẬT & LIÊN HỆ
      ===================================================================== */}
      <section
        id="layout-cinema"
        ref={secCinema.ref}
        className={`scroll-mt-24 space-y-8 rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-8 shadow-2xl transition-all duration-700 ease-in-out md:p-10 ${
          secCinema.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFB162]">
              04 • Cinema Spotlight & Liên hệ
            </span>
            <h2 className="text-2xl font-extrabold text-[#EEE9DF] sm:text-3xl">
              Freelancer nổi bật & Kết nối liên hệ
            </h2>
          </div>

          {/* Điều khiển Slide Window */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevSlide}
              aria-label="Slide trước"
              className="rounded-full border border-[#C9C1B1]/35 bg-[#1B2632] px-4 py-2 text-xs font-bold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
            >
              ← Trước
            </button>
            <div className="flex items-center gap-2">
              {FEATURED_FREELANCERS.map((fl, idx) => (
                <button
                  key={fl.id}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Chọn ${fl.name}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${
                    idx === slideIndex ? 'w-8 bg-[#FFB162]' : 'w-2.5 bg-[#C9C1B1]/40 hover:bg-[#EEE9DF]'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNextSlide}
              aria-label="Slide tiếp theo"
              className="rounded-full border border-[#C9C1B1]/35 bg-[#1B2632] px-4 py-2 text-xs font-bold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
            >
              Tiếp →
            </button>
          </div>
        </div>

        {/* Khung Cinema Slide Window */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C9C1B1]/25 bg-[#1B2632] shadow-2xl">
          {/* Ảnh nền cinema mờ giảm dần */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <img
              src={currentFreelancer.backdrop}
              alt=""
              style={{
                WebkitMaskImage:
                  'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.08) 100%)',
                maskImage:
                  'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.08) 100%)',
              }}
              className="h-full w-full object-cover opacity-35 blur-[1px] transition-all duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B2632] via-[#1B2632]/85 to-[#1B2632]/70" />
          </div>

          <div
            key={currentFreelancer.id}
            className="relative z-10 grid items-center gap-8 p-7 transition-all duration-500 ease-in-out md:p-10 lg:grid-cols-12"
          >
            {/* Ảnh người nổi bật */}
            <div className="flex flex-col items-center lg:col-span-4">
              <div className="relative h-48 w-48 overflow-hidden rounded-2xl border-2 border-[#FFB162]/60 shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:border-[#EEE9DF]">
                <img
                  src={currentFreelancer.avatar}
                  alt={currentFreelancer.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="mt-3 rounded-full bg-[#2C3B4D] px-3.5 py-1 text-xs font-medium text-[#C9C1B1]">
                {currentFreelancer.location} • {currentFreelancer.rating}
              </span>
            </div>

            {/* Thông tin rate, mô tả ngắn & nút Liên hệ */}
            <div className="space-y-4 lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#FFB162]">
                    {currentFreelancer.role}
                  </span>
                  <h3 className="mt-1 text-2xl font-extrabold text-[#EEE9DF] sm:text-3xl">
                    {currentFreelancer.name}
                  </h3>
                </div>

                <div className="rounded-2xl border border-[#FFB162]/40 bg-[#2C3B4D] px-4 py-2 text-right">
                  <span className="block text-[11px] text-[#C9C1B1]">Rate tham khảo</span>
                  <span className="text-lg font-extrabold text-[#FFB162]">
                    {currentFreelancer.rate}
                  </span>
                </div>
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-[#EEE9DF]/90">
                {currentFreelancer.shortDesc}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {currentFreelancer.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-[#C9C1B1]/20 bg-[#2C3B4D] px-3 py-1 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => handleOpenContact(currentFreelancer)}
                  className="rounded-full border border-[#FFB162] bg-[#FFB162] px-6 py-3 text-sm font-bold text-[#1B2632] shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl"
                >
                  Liên hệ với {currentFreelancer.name.split(' ').slice(-1)[0]}
                </button>
                <Link
                  to="/register"
                  className="rounded-full border border-[#C9C1B1]/35 bg-[#2C3B4D] px-5 py-3 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                >
                  Đăng ký để gửi Proposal chính thức
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hộp liên hệ nhanh khi bấm nút Liên hệ trên slide */}
        {contactTarget && (
          <div className="rounded-2xl border border-[#FFB162]/40 bg-[#1B2632] p-6 shadow-xl transition-all duration-300 ease-in-out">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-[#EEE9DF]">
                  Liên hệ nhanh tới {contactTarget.name}{' '}
                  <span className="text-xs font-semibold text-[#FFB162]">
                    ({contactTarget.rate})
                  </span>
                </h4>
                <p className="mt-1 text-xs text-[#C9C1B1]">
                  Gửi lời nhắn sơ bộ về nhu cầu dự án hoặc hợp tác của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContactTarget(null)}
                className="rounded-lg border border-[#C9C1B1]/25 px-3 py-1 text-xs text-[#C9C1B1] transition-all duration-300 ease-in-out hover:border-[#A35139] hover:bg-[#A35139] hover:text-[#EEE9DF]"
              >
                Đóng
              </button>
            </div>

            {contactSent ? (
              <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
                <p>{contactSent}</p>
                <div className="mt-3 flex gap-3">
                  <Link
                    to="/register"
                    className="rounded-lg bg-[#FFB162] px-4 py-2 font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF]"
                  >
                    Đăng ký ngay
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-lg border border-[#C9C1B1]/35 px-4 py-2 font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Tên của bạn"
                  className="rounded-xl border border-[#C9C1B1]/25 bg-[#2C3B4D] px-4 py-2.5 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none"
                />
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Email liên hệ của bạn"
                  className="rounded-xl border border-[#C9C1B1]/25 bg-[#2C3B4D] px-4 py-2.5 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none"
                />
                <textarea
                  required
                  rows={3}
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                  placeholder={`Mô tả ngắn gọn công việc bạn muốn trao đổi với ${contactTarget.name}...`}
                  className="rounded-xl border border-[#C9C1B1]/25 bg-[#2C3B4D] px-4 py-2.5 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none md:col-span-2"
                />
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-xl border border-[#FFB162] bg-[#FFB162] px-5 py-2.5 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    Gửi yêu cầu liên hệ
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>
    </div>
  )
}