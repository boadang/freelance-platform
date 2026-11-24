const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail
    if (typeof detail === 'string') {
      return detail
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string }
      if (first?.msg) {
        // Pydantic v2 thường có tiền tố "Value error, " trước thông báo của field_validator
        return first.msg.replace(/^Value error,\s*/i, '')
      }
    }
  }
  return `Lỗi hệ thống (${status})`
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối mạng.')
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, response.status))
  }

  return data as T
}