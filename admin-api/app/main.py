from fastapi import FastAPI
from app.routes import events, status

app = FastAPI()

app.include_router(events.router)
app.include_router(status.router)
