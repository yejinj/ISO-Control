from fastapi import FastAPI
from app.api.v1.endpoints import alert, probes, pods, events
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # 개발 중에는 *로 허용, 운영시에는 도메인 제한
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.include_router(alert.router)
app.include_router(probes.router)
app.include_router(pods.router)
app.include_router(events.router)
