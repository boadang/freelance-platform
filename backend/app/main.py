from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.models import User  # noqa: F401 - đảm bảo model được đăng ký trước create_all

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Freelance Platform API", version="0.2.0")

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")


app.include_router(api_router)