from fastapi import APIRouter
from analysis import compute_relationships
from models import Relationship

router = APIRouter(prefix="/relationships", tags=["relationships"])

_cache: list[Relationship] = compute_relationships()


@router.get("/", response_model=list[Relationship])
def get_relationships() -> list[Relationship]:
    return _cache
