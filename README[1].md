# PDF2Word Pro

Website chuyển PDF sang DOCX với giao diện hiện đại và backend FastAPI.

## 1. Chạy backend bằng Docker

```bash
docker compose up --build
```

API chạy tại:

`http://localhost:8000`

## 2. Chạy frontend

Mở thư mục `frontend` bằng một static server, ví dụ:

```bash
cd frontend
python -m http.server 5500
```

Sau đó mở:

`http://localhost:5500`

## 3. Công nghệ

- Frontend: HTML/CSS/JavaScript thuần
- Backend: FastAPI
- PDF → DOCX: pdf2docx
- Docker để triển khai dễ dàng

## Lưu ý về độ chính xác

Không có thuật toán PDF → Word nào đảm bảo 100% mọi PDF giữ nguyên tuyệt đối, vì PDF là định dạng bố cục còn DOCX là định dạng tài liệu có cấu trúc.

Phiên bản này phù hợp nhất với PDF có text thật. PDF scan/ảnh cần bổ sung OCR (Tesseract hoặc dịch vụ OCR) nếu muốn nhận dạng chữ.
