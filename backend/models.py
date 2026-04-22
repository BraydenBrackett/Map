from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import DeclarativeBase
from pydantic import BaseModel


class Base(DeclarativeBase):
    pass


class CountryORM(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    iso_code = Column(String(3), unique=True, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)


class RelationshipORM(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    country_a = Column(Integer, ForeignKey("countries.id"), nullable=False)
    country_b = Column(Integer, ForeignKey("countries.id"), nullable=False)
    alignment_score = Column(Float, nullable=False)


class Country(BaseModel):
    id: int
    name: str
    iso_code: str
    lat: float
    lon: float

    model_config = {"from_attributes": True}


class Relationship(BaseModel):
    country_a: str
    country_b: str
    alignment_score: float


class AlignmentScore(BaseModel):
    country_a: str
    country_b: str
    cas: float
    shared_votes: int
