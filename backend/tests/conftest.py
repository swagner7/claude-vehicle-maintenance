import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.seed.schedules import DEFAULT_SCHEDULES
from app.models.schedule_template import ScheduleTemplate
from app.models import Vehicle, MaintenanceRecord  # noqa: F401


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)

    TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestSession()

    # Seed schedule templates
    for data in DEFAULT_SCHEDULES:
        session.add(ScheduleTemplate(**data, is_custom=False, source="industry_standard"))
    session.commit()

    def override():
        try:
            yield session
        finally:
            pass

    from app.main import app
    app.dependency_overrides[get_db] = override

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
    session.close()
    Base.metadata.drop_all(bind=engine)
