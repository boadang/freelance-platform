type StatusType =
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'submitted'
  | 'approved'
  | 'active'
  | string

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open: {
    label: 'Đang mở',
    className: 'border-[#FFB162]/40 bg-[#FFB162]/15 text-[#FFB162]',
  },
  in_progress: {
    label: 'Đang thực hiện',
    className: 'border-sky-400/30 bg-sky-400/15 text-sky-300',
  },
  active: {
    label: 'Đang hoạt động',
    className: 'border-sky-400/30 bg-sky-400/15 text-sky-300',
  },
  completed: {
    label: 'Hoàn thành',
    className: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
  },
  approved: {
    label: 'Đã duyệt',
    className: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
  },
  accepted: {
    label: 'Đã chấp nhận',
    className: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
  },
  pending: {
    label: 'Chờ xử lý',
    className: 'border-[#C9C1B1]/30 bg-[#C9C1B1]/15 text-[#EEE9DF]',
  },
  submitted: {
    label: 'Đã nộp bài',
    className: 'border-[#FFB162]/40 bg-[#FFB162]/15 text-[#FFB162]',
  },
  rejected: {
    label: 'Từ chối',
    className: 'border-[#A35139]/50 bg-[#A35139]/25 text-[#FFB162]',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'border-[#A35139]/50 bg-[#A35139]/25 text-[#FFB162]',
  },
  withdrawn: {
    label: 'Đã rút',
    className: 'border-slate-400/30 bg-slate-400/15 text-slate-300',
  },
}

export default function StatusBadge({ status }: { status: StatusType }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'border-[#C9C1B1]/30 bg-[#C9C1B1]/15 text-[#EEE9DF]',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  )
}