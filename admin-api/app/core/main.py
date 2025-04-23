from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import events_router, status_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events_router, prefix="/events")
app.include_router(status_router, prefix="/status")

@app.get("/")
def root():
    return {"message": "It works!"}
