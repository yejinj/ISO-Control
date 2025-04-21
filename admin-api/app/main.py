from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import events, status

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "IsoCtrl API root"}

app.include_router(events.router, prefix="/events")
app.include_router(status.router, prefix="/status")
