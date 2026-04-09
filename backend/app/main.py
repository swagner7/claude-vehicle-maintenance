from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import dashboard, maintenance, schedules, vehicles
from app.seed.schedules import seed_schedule_templates


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_schedule_templates()
    yield


app = FastAPI(title="Vehicle Maintenance Tracker", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehicles.router, prefix="/api/v1")
app.include_router(maintenance.router, prefix="/api/v1")
app.include_router(schedules.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

# Serve frontend static files in production
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
