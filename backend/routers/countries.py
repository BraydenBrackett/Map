from fastapi import APIRouter
from data import COUNTRIES
from models import Country

router = APIRouter(prefix="/countries", tags=["countries"])


@router.get("/", response_model=list[Country])
def get_countries() -> list[Country]:
    return COUNTRIES
