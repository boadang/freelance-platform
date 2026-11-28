import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

interface FeatureBlockItem {
  id: string
  glyph: string
  title: string
  description: string
}


// Video nền tự động phát, lặp lại, tắt tiếng (có fallback poster nếu mạng chậm)
const HERO_VIDEO_URL =
  'https://assets.mixkit.co/videos/preview/mixkit-people-working-in-a-modern-office-4354-large.mp4'
const HERO_VIDEO_POSTER =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=70'

const LAYER2_FEATURE_BLOCKS: FeatureBlockItem[] = [
  {
    id: 'client-post-projects',
    glyph: '✦',
    title: 'Client đăng dự án rõ ràng',
    description:
      'Tạo tin tuyển chọn nhanh với ngân sách, kỹ năng yêu cầu và phạm vi công việc minh bạch.',
  },
  {
    id: 'freelancer-proposals',
    glyph: '◈',
    title: 'Freelancer gửi chào giá chuẩn',
    description:
      'Đề xuất chi phí, thời gian hoàn thiện và thư chào hàng trực tiếp trên từng dự án đang mở.',
  },
  {
    id: 'contracts-milestones',
    glyph: '❖',
    title: 'Hợp đồng & cột mốc chặt chẽ',
    description:
      'Chốt hợp đồng tự động khi duyệt proposal, chia nhỏ milestone để nộp bài và nghiệm thu từng bước.',
  },
  {
    id: 'reviews-trust',
    glyph: '★',
    title: 'Đánh giá hai chiều uy tín',
    description:
      'Chấm điểm và nhận xét sau khi hoàn tất hợp đồng để xây dựng hồ sơ tin cậy cho cả hai phía.',
  },
  {
    id: 'role-rbac',
    glyph: '⬡',
    title: 'Phân quyền Client & Freelancer',
    description:
      'Tách biệt luồng thao tác và kiểm soát quyền truy cập chuẩn xác trên từng dự án lẫn hợp đồng.',
  },
  {
    id: 'multi-domain-jobs',
    glyph: '⌘',
    title: 'Đa dạng nhóm việc thực tế',
    description:
      'Hỗ trợ từ Web/Full-stack, UI/UX, Mobile, AI/Automation đến QA, DevOps và tối ưu sản phẩm.',
  },
]

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate('/login')
  }

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
          HERO SECTION: FULL-VIEWPORT VIDEO BG + DIMMING GRADIENT +
          TOP NAV OVERLAY + BOTTOM VERTICAL STACK OVERLAY
      ===================================================================== */}
      <section
        id="layout-invite"
        className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-[#1B2632] shadow-2xl"
      >
        {/* Background autoplaying, looping, muted video filling edge-to-edge */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={HERO_VIDEO_POSTER}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Semi-transparent dimming gradient layered over the video */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#1B2632]/75 via-[#1B2632]/55 to-[#1B2632]/90"
        />

        {/* BOTTOM OVERLAY: Left-aligned vertical stack anchored to lower portion
            Order: 1. Heading on its own line -> 2. Supporting paragraph -> 3. Two CTA buttons side by side */}
        <div className="relative z-20 mt-auto w-full px-6 pb-10 pt-16 md:px-10 md:pb-14">
          <div className="mx-auto max-w-6xl">
            <div className="flex max-w-2xl flex-col items-start space-y-5 text-left">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#EEE9DF] sm:text-4xl lg:text-5xl">
                Kết nối <span className="text-[#FFB162]">Client</span> &{' '}
                <span className="text-[#FFB162]">Freelancer</span> trong một không gian minh bạch
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-[#C9C1B1] sm:text-base">
                Đăng dự án rõ ràng, gửi đề xuất chào giá nhanh chóng, theo dõi hợp đồng theo từng
                cột mốc thanh toán và đánh giá hai chiều ngay trên một nền tảng thống nhất.
              </p>

              <div className="flex flex-row items-center gap-4 pt-1">
                <Link
                  to="/register"
                  className="rounded-full border border-[#FFB162] bg-[#FFB162] px-6 py-3 text-sm font-bold text-[#1B2632] shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl"
                >
                  Đăng ký ngay
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-[#C9C1B1]/50 bg-[#2C3B4D]/80 px-6 py-3 text-sm font-semibold text-[#EEE9DF] backdrop-blur-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          LAYOUT 2: FEATURE SECTION 3 CỘT + GRID SUBTLE + SCROLL & BOTTOM BLUR
      ===================================================================== */}
      <section
        id="layout-jobs"
        ref={secJobs.ref}
        className={`scroll-mt-24 transition-all duration-700 ease-in-out ${
          secJobs.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="mx-4 sm:mx-8 lg:mx-10">
          <div className="relative overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 shadow-2xl md:p-10">
            {/* Họa tiết lưới hình học rất nhẹ chỉ ở một vùng góc/dải chéo phía sau nội dung */}
            <div
              aria-hidden="true"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(238,233,223,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(238,233,223,0.08) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                WebkitMaskImage:
                  'polygon(35% 0%, 100% 0%, 100% 100%, 45% 100%)',
                maskImage:
                  'polygon(35% 0%, 100% 0%, 100% 100%, 45% 100%)',
              }}
              className="pointer-events-none absolute inset-0 z-0 opacity-70"
            />

            {/* Khung cuộn nếu có nhiều thẻ + lớp gradient blur ở phía dưới */}
            <div className="relative z-10">
              <div className="max-h-[540px] overflow-y-auto pr-1 pb-24 [scrollbar-width:thin]">
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_1fr_1fr] xl:gap-10">
                  {/* CỘT TRÁI (rộng hơn): Heading -> Paragraph -> Text link có mũi tên ở cuối */}
                  <div className="flex flex-col items-start space-y-5 text-left">
                    <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-[#EEE9DF] sm:text-3xl lg:text-4xl">
                      Mọi luồng việc cho <span className="text-[#FFB162]">Client</span> &{' '}
                      <span className="text-[#FFB162]">Freelancer</span>
                    </h2>

                    <p className="max-w-md text-sm leading-relaxed text-[#C9C1B1] sm:text-base">
                      Dù bạn cần đăng dự án tìm nhân sự chuyên môn hay nhận việc theo từng cột mốc
                      minh bạch, hệ thống đều sắp xếp quy trình rõ ràng từ lúc khởi tạo đến nghiệm
                      thu.
                    </p>

                    <Link
                      to="/register"
                      className="group/link inline-flex items-center gap-2 text-sm font-bold text-[#FFB162] transition-all duration-300 ease-in-out hover:text-[#EEE9DF]"
                    >
                      <span>Bắt đầu đăng ký tài khoản</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 ease-in-out group-hover/link:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </div>

                  {/* CỘT GIỮA (xếp dọc 2 block đầu) */}
                  <div className="flex flex-col space-y-6">
                    {LAYER2_FEATURE_BLOCKS.filter((_, idx) => idx % 2 === 0).map((item) => (
                      <div
                        key={item.id}
                        className="group flex flex-col items-start rounded-2xl border border-[#C9C1B1]/15 bg-[#1B2632]/90 p-5 text-left transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-xl"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FFB162]/40 bg-[#2C3B4D] text-base font-bold text-[#FFB162] transition-all duration-300 ease-in-out group-hover:border-[#1B2632] group-hover:bg-[#1B2632] group-hover:text-[#FFB162]">
                          {item.glyph}
                        </div>
                        <h3 className="mt-4 text-base font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CỘT PHẢI (xếp dọc 2 block tiếp theo, bằng độ rộng cột giữa) */}
                  <div className="flex flex-col space-y-6">
                    {LAYER2_FEATURE_BLOCKS.filter((_, idx) => idx % 2 === 1).map((item) => (
                      <div
                        key={item.id}
                        className="group flex flex-col items-start rounded-2xl border border-[#C9C1B1]/15 bg-[#1B2632]/90 p-5 text-left transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:shadow-xl"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FFB162]/40 bg-[#2C3B4D] text-base font-bold text-[#FFB162] transition-all duration-300 ease-in-out group-hover:border-[#1B2632] group-hover:bg-[#1B2632] group-hover:text-[#FFB162]">
                          {item.glyph}
                        </div>
                        <h3 className="mt-4 text-base font-bold text-[#EEE9DF] transition-colors duration-300 ease-in-out group-hover:text-[#1B2632]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-[#C9C1B1] transition-colors duration-300 ease-in-out group-hover:text-[#2C3B4D]">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lớp gradient blur phía dưới che các thẻ chưa hiện khi cuộn */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-[#2C3B4D] via-[#2C3B4D]/80 to-transparent backdrop-blur-[2px]"
              />
            </div>
          </div>
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
          (Đồng bộ tỷ lệ 3 cột, lưới hình học mờ & hiệu ứng đảo màu với các phần trên)
      ===================================================================== */}
      <section
        id="layout-cinema"
        ref={secCinema.ref}
        className={`scroll-mt-24 transition-all duration-700 ease-in-out ${
          secCinema.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="relative overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-[#2C3B4D] p-7 shadow-2xl md:p-10">
          {/* Họa tiết lưới hình học nhẹ đồng bộ với Layer 2 */}
          <div
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(238,233,223,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(238,233,223,0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              WebkitMaskImage:
                'polygon(0% 0%, 60% 0%, 40% 100%, 0% 100%)',
              maskImage:
                'polygon(0% 0%, 60% 0%, 40% 100%, 0% 100%)',
            }}
            className="pointer-events-none absolute inset-0 z-0 opacity-70"
          />

          <div className="relative z-10 grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_2fr] xl:gap-10">
            {/* CỘT TRÁI: Tiêu đề, điều khiển Cinema Slide & danh sách chọn nhanh */}
            <div className="flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#FFB162]/35 bg-[#1B2632]/85 px-3.5 py-1 text-xs font-semibold text-[#FFB162]">
                  04 • Cinema Spotlight
                </span>

                <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-[#EEE9DF] sm:text-3xl lg:text-4xl">
                  Kết nối trực tiếp <span className="text-[#FFB162]">Freelancer</span> tiêu biểu
                </h2>

                <p className="max-w-md text-sm leading-relaxed text-[#C9C1B1]">
                  Khám phá hồ sơ năng lực, mức giá tham khảo và gửi lời nhắn trao đổi nhu cầu dự án
                  ngay tại khung trình chiếu bên cạnh.
                </p>
              </div>

              {/* Danh sách chọn nhanh từng freelancer (đảo màu đối lập khi hover) */}
              <div className="space-y-2.5">
                {FEATURED_FREELANCERS.map((fl, idx) => {
                  const isSelected = idx === slideIndex
                  return (
                    <button
                      key={fl.id}
                      type="button"
                      onClick={() => {
                        setSlideIndex(idx)
                        setContactTarget(null)
                      }}
                      className={`group flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 ease-in-out ${
                        isSelected
                          ? 'border-[#FFB162] bg-[#1B2632] text-[#EEE9DF] shadow-md'
                          : 'border-[#C9C1B1]/15 bg-[#1B2632]/55 text-[#C9C1B1] hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={fl.avatar}
                          alt={fl.name}
                          className="h-9 w-9 shrink-0 rounded-xl object-cover border border-[#C9C1B1]/30"
                        />
                        <div className="min-w-0">
                          <p
                            className={`truncate text-xs font-bold transition-colors duration-300 ease-in-out ${
                              isSelected
                                ? 'text-[#FFB162]'
                                : 'text-[#EEE9DF] group-hover:text-[#1B2632]'
                            }`}
                          >
                            {fl.name}
                          </p>
                          <p
                            className={`truncate text-[11px] transition-colors duration-300 ease-in-out ${
                              isSelected
                                ? 'text-[#C9C1B1]'
                                : 'text-[#C9C1B1] group-hover:text-[#2C3B4D]'
                            }`}
                          >
                            {fl.role}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 text-xs font-bold transition-colors duration-300 ease-in-out ${
                          isSelected
                            ? 'text-[#FFB162]'
                            : 'text-[#C9C1B1] group-hover:text-[#A35139]'
                        }`}
                      >
                        {fl.rate}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Thanh điều hướng Prev / Next */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {FEATURED_FREELANCERS.map((fl, idx) => (
                    <button
                      key={fl.id}
                      type="button"
                      onClick={() => {
                        setSlideIndex(idx)
                        setContactTarget(null)
                      }}
                      aria-label={`Chọn ${fl.name}`}
                      className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                        idx === slideIndex
                          ? 'w-8 bg-[#FFB162]'
                          : 'w-2 bg-[#C9C1B1]/40 hover:bg-[#EEE9DF]'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handlePrevSlide()
                      setContactTarget(null)
                    }}
                    aria-label="Slide trước"
                    className="rounded-full border border-[#C9C1B1]/30 bg-[#1B2632] px-4 py-2 text-xs font-bold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleNextSlide()
                      setContactTarget(null)
                    }}
                    aria-label="Slide tiếp theo"
                    className="rounded-full border border-[#C9C1B1]/30 bg-[#1B2632] px-4 py-2 text-xs font-bold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (2/3 bề ngang): KHUNG CINEMA SLIDE WINDOW ĐỒNG BỘ */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-[#1B2632] shadow-2xl">
              {/* Ảnh nền cinema blur giảm dần */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
                <img
                  src={currentFreelancer.backdrop}
                  alt=""
                  style={{
                    WebkitMaskImage:
                      'linear-gradient(to left, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.05) 100%)',
                    maskImage:
                      'linear-gradient(to left, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.05) 100%)',
                  }}
                  className="h-full w-full object-cover opacity-35 blur-[1.5px] transition-all duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B2632] via-[#1B2632]/75 to-[#1B2632]/40" />
              </div>

              {/* Nội dung slide */}
              <div
                key={currentFreelancer.id}
                className="relative z-10 flex flex-1 flex-col justify-between p-7 transition-all duration-500 ease-in-out md:p-9"
              >
                {/* Hàng trên: Avatar + Thông tin định danh + Rate */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-[#FFB162]/70 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 sm:h-28 sm:w-28">
                      <img
                        src={currentFreelancer.avatar}
                        alt={currentFreelancer.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="inline-block rounded-full bg-[#2C3B4D] px-3 py-0.5 text-[11px] font-semibold text-[#FFB162]">
                        {currentFreelancer.location} • {currentFreelancer.rating}
                      </span>
                      <h3 className="text-2xl font-extrabold text-[#EEE9DF] sm:text-3xl">
                        {currentFreelancer.name}
                      </h3>
                      <p className="text-xs font-medium text-[#C9C1B1] sm:text-sm">
                        {currentFreelancer.role}
                      </p>
                    </div>
                  </div>

                  <div className="self-start rounded-2xl border border-[#FFB162]/35 bg-[#2C3B4D]/90 px-4 py-2.5 text-left sm:self-center sm:text-right">
                    <span className="block text-[11px] text-[#C9C1B1]">Mức phí tham khảo</span>
                    <span className="text-lg font-extrabold text-[#FFB162]">
                      {currentFreelancer.rate}
                    </span>
                  </div>
                </div>

                {/* Hàng giữa: Mô tả ngắn + Kỹ năng */}
                <div className="my-6 space-y-4">
                  <p className="max-w-2xl text-sm leading-relaxed text-[#EEE9DF]/90">
                    {currentFreelancer.shortDesc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {currentFreelancer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-xl border border-[#C9C1B1]/20 bg-[#2C3B4D]/90 px-3.5 py-1.5 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hàng dưới: 2 nút hành động cùng baseline */}
                <div className="flex flex-wrap items-center gap-4 border-t border-[#C9C1B1]/15 pt-5">
                  <button
                    type="button"
                    onClick={() => handleOpenContact(currentFreelancer)}
                    className="rounded-full border border-[#FFB162] bg-[#FFB162] px-6 py-3 text-sm font-bold text-[#1B2632] shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl"
                  >
                    Liên hệ với {currentFreelancer.name.split(' ').slice(-1)[0]}
                  </button>

                  <Link
                    to="/register"
                    className="rounded-full border border-[#C9C1B1]/40 bg-[#2C3B4D]/80 px-6 py-3 text-xs font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632] hover:shadow-xl"
                  >
                    Đăng ký để gửi Proposal
                  </Link>
                </div>

                {/* Form liên hệ nhanh tích hợp mượt ngay trong khung Cinema */}
                {contactTarget && (
                  <div className="mt-6 rounded-2xl border border-[#FFB162]/40 bg-[#2C3B4D]/95 p-5 shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-[#EEE9DF]">
                          Gửi lời nhắn nhanh tới {contactTarget.name}
                        </h4>
                        <p className="mt-0.5 text-xs text-[#C9C1B1]">
                          Để lại thông tin để trao đổi sơ bộ về phạm vi công việc và ngân sách.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setContactTarget(null)}
                        className="rounded-lg border border-[#C9C1B1]/25 bg-[#1B2632] px-3 py-1 text-xs font-semibold text-[#C9C1B1] transition-all duration-300 ease-in-out hover:border-[#A35139] hover:bg-[#A35139] hover:text-[#EEE9DF]"
                      >
                        Đóng
                      </button>
                    </div>

                    {contactSent ? (
                      <div className="mt-4 rounded-xl border border-emerald-400/30 bg-[#1B2632] p-4 text-xs text-emerald-300">
                        <p>{contactSent}</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Link
                            to="/register"
                            className="rounded-full bg-[#FFB162] px-4 py-2 font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF]"
                          >
                            Đăng ký ngay
                          </Link>
                          <Link
                            to="/login"
                            className="rounded-full border border-[#C9C1B1]/35 px-4 py-2 font-semibold text-[#EEE9DF] transition-all duration-300 ease-in-out hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                          >
                            Đăng nhập
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleContactSubmit}
                        className="mt-4 grid gap-3.5 sm:grid-cols-2"
                      >
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Tên của bạn"
                          className="rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none"
                        />
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Email liên hệ"
                          className="rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none"
                        />
                        <textarea
                          required
                          rows={2}
                          value={contactNote}
                          onChange={(e) => setContactNote(e.target.value)}
                          placeholder={`Nội dung công việc muốn trao đổi với ${contactTarget.name}...`}
                          className="rounded-xl border border-[#C9C1B1]/25 bg-[#1B2632] px-4 py-2.5 text-xs text-[#EEE9DF] placeholder-[#C9C1B1]/60 focus:border-[#FFB162] focus:outline-none sm:col-span-2"
                        />
                        <div className="sm:col-span-2">
                          <button
                            type="submit"
                            className="rounded-full border border-[#FFB162] bg-[#FFB162] px-5 py-2 text-xs font-bold text-[#1B2632] transition-all duration-300 ease-in-out hover:border-[#EEE9DF] hover:bg-[#EEE9DF] hover:text-[#1B2632]"
                          >
                            Gửi yêu cầu liên hệ
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER TỐI GIẢN ĐỒNG BỘ CUỐI TRANG */}
      <footer className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-[#C9C1B1]/15 bg-[#2C3B4D]/60 px-6 py-6 text-xs text-[#C9C1B1] sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFB162] text-[11px] font-extrabold text-[#1B2632]">
            FH
          </span>
          <span className="font-bold text-[#EEE9DF]">FreelanceHub</span>
          <span>• Nền tảng kết nối Client &amp; Freelancer</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="#layout-invite"
            className="transition-colors duration-300 ease-in-out hover:text-[#FFB162]"
          >
            Lên đầu trang ↑
          </a>
          <Link
            to="/login"
            className="transition-colors duration-300 ease-in-out hover:text-[#FFB162]"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="font-semibold text-[#FFB162] transition-colors duration-300 ease-in-out hover:text-[#EEE9DF]"
          >
            Đăng ký tài khoản
          </Link>
        </div>
      </footer>
    </div>
  )
}