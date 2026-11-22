import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <MainLayout>
        <p className="text-sm text-slate-600">Đang tải thông tin người dùng...</p>
      </MainLayout>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <MainLayout>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
        <p className="mt-2 text-sm text-slate-600">
          Email: <strong>{user.email}</strong> | Vai trò: <strong>{user.role}</strong>
        </p>

        {user.role === 'client' ? (
          <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            Bạn đang đăng nhập với quyền <strong>Client</strong>. Ở Bước 3 bạn sẽ có thể tạo dự án mới và duyệt proposal từ freelancer.
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            Bạn đang đăng nhập với quyền <strong>Freelancer</strong>. Ở Bước 3 bạn sẽ có thể tìm dự án mở và gửi proposal chào giá.
          </div>
        )}
      </div>
    </MainLayout>
  )
}