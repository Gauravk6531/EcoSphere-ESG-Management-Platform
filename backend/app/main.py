import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models  # noqa: F401  (ensures models are registered on Base before create_all)
from .routers import core, environmental, social, governance, gamification, dashboard

app = FastAPI(
    title="EcoSphere ESG Management Platform API",
    description="Backend API for measuring, managing and improving Environmental, "
                 "Social and Governance performance across an organization.",
    version="1.0.0",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Creates all tables if they don't already exist. For production use Alembic migrations instead.
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"status": "ok", "service": "EcoSphere ESG Management Platform API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(core.router, prefix="/api")
app.include_router(environmental.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(governance.router, prefix="/api")
app.include_router(gamification.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
