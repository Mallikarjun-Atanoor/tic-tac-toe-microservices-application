from sqlalchemy import Column, Integer, String
from database import Base

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True)
    player = Column(String, unique=True)
    wins = Column(Integer, default=0)