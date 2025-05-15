from fastapi import FastAPI
from app.api.v1.endpoints import alert, probes, pods, events
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "ISO Control API is running"}

app.include_router(alert.router)
app.include_router(probes.router)
app.include_router(pods.router)
app.include_router(events.router)
