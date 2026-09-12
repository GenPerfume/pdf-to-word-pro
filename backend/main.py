import os
import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pdf2docx import Converter

BASE = Path("/tmp/pdf2word")
BASE.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="PDF to Word Pro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED = {".pdf"}

@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/convert")
async def convert_pdf(file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED:
        raise HTTPException(400, "Chỉ hỗ trợ file PDF.")

    job = uuid.uuid4().hex
    work = BASE / job
    work.mkdir(parents=True)

    src = work / "input.pdf"
    out = work / "converted.docx"

    try:
        with src.open("wb") as f:
            while chunk := await file.read(1024 * 1024):
                f.write(chunk)

        if src.stat().st_size == 0:
            raise HTTPException(400, "File PDF rỗng.")

        # pdf2docx giữ bố cục, font, hình ảnh và bảng tốt hơn
        # so với việc chỉ trích xuất text rồi tạo DOCX.
        cv = Converter(str(src))
        try:
            cv.convert(str(out), start=0, end=None)
        finally:
            cv.close()

        if not out.exists() or out.stat().st_size == 0:
            raise HTTPException(500, "Không tạo được file Word.")

        return FileResponse(
            out,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{Path(file.filename).stem}.docx",
            background=None,
        )
    except HTTPException:
        shutil.rmtree(work, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(work, ignore_errors=True)
        raise HTTPException(500, f"Lỗi chuyển đổi: {e}")

@app.on_event("shutdown")
def cleanup():
    # Không bắt buộc; container restart sẽ tự dọn /tmp.
    pass
