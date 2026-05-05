from fastapi import FastAPI, Depends, Request
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Score
from prometheus_fastapi_instrumentator import Instrumentator

import logging
import sys

# ---------------- Logging ----------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# ---------------- App ----------------
app = FastAPI()

# ---------------- CORS ----------------
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Middleware (request logging) ----------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response

# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- Startup ----------------
@app.on_event("startup")
async def startup():
    # Prometheus metrics
    Instrumentator().instrument(app).expose(app)

    # DB initialization (safe)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

# ---------------- Routes ----------------
@app.get("/")
def root():
    return {"service": "tic-tac-toe-backend", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/win/{player}")
def win(player: str, db: Session = Depends(get_db)):
    try:
        user = db.query(Score).filter(Score.player == player).first()

        if not user:
            user = Score(player=player, wins=1)
            db.add(user)
        else:
            user.wins += 1

        db.commit()
        db.refresh(user)

        return {
            "player": user.player,
            "wins": user.wins
        }

    except Exception as e:
        logger.error(f"DB error: {e}")
        return {"error": "database failure"}

@app.get("/scores")
def scores(db: Session = Depends(get_db)):
    try:
        users = db.query(Score).all()
        return [
            {"player": u.player, "wins": u.wins}
            for u in users
        ]
    except Exception as e:
        logger.error(f"DB error: {e}")
        return {"error": "database failure"}