from fastapi import FastAPI
from app.api.v1.endpoints import alert

app = FastAPI()

app.include_router(alert.router)
