from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import pods

app = FastAPI(title="ISO Control API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(pods.router, prefix="/api/v1", tags=["pods"]) 