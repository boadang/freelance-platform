# Freelance Platform (FastAPI + PostgreSQL + React)

Nền tảng kết nối khách hàng (**Client**) và **Freelancer** với các luồng xác thực JWT, quản lý dự án, chào giá (proposal), hợp đồng & cột mốc thanh toán (milestones), cùng đánh giá sau dự án.

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy 2.0, Pydantic v2, PostgreSQL, PyJWT, pwdlib
- **Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS
- **Version Control:** Git & GitHub

## Tính năng chính (MVP)

- **Xác thực & Phân quyền:** Đăng ký/đăng nhập JWT theo vai trò `client` hoặc `freelancer`, bảo vệ route và kiểm tra quyền theo vai trò/chủ sở hữu.
- **Dự án (Projects):** Client tạo dự án mới; Freelancer tìm kiếm và lọc dự án đang mở theo từ khóa và kỹ năng.
- **Chào giá (Proposals):** Freelancer gửi proposal (mức giá, số ngày dự kiến, thư chào hàng); Client duyệt proposal để tự động cập nhật trạng thái dự án (`in_progress`), từ chối các proposal còn lại và tạo hợp đồng (`Contract`).
- **Hợp đồng, Cột mốc & Đánh giá:** Client tạo milestone theo giá trị hợp đồng; Freelancer nộp kết quả; Client duyệt milestone (tự động chuyển hợp đồng và dự án sang `completed` khi toàn bộ milestone được duyệt); hai bên đánh giá 1–5 sao sau khi hoàn tất.

## Cấu trúc thư mục

```text
freelance-platform/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── types/
│   └── package.json
├── .gitignore
└── README.md