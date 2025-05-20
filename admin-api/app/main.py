from fastapi import FastAPI
from app.api.v1.endpoints import alert, probes, pods, events, latency
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.latency import latency_middleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.middleware("http")
async def add_latency_middleware(request, call_next):
    return await latency_middleware(request, call_next)

@app.get("/")
async def root():
    return {"status": "ok", "message": "ISO Control API is running"}

app.include_router(alert.router, prefix="/api/v1")
app.include_router(probes.router, prefix="/api/v1")
app.include_router(pods.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(latency.router, prefix="/api/v1")
