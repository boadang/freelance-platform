import { useEffect, useState } from 'react'

type HealthResponse = {
  status: string
  database: string
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/health')
      .then((res) => {
        if (!res.ok) throw new Error('Không gọi được API')
        return res.json()
      })
      .then((data: HealthResponse) => setHealth(data))
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="mx-auto max-w-xl rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Freelance Platform</h1>
        <p className="mt-2 text-sm text-slate-600">
          Kiểm tra kết nối React + Tailwind + FastAPI + PostgreSQL:
        </p>
        {health && (
          <p className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-700">
            API: {health.status} | DB: {health.database}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
            Lỗi: {error}
          </p>
        )}
      </div>
    </div>
  )
}