from pathlib import Path

from fastapi import APIRouter, HTTPException

from models import AlignmentScore
from services.alignment import (
    build_country_vote_map,
    compute_pairwise_alignment,
    load_votes,
)

router = APIRouter(prefix="/alignment", tags=["alignment"])

_DATA_FILE = Path(__file__).parent.parent / "data" / "un_votes.csv"

# Compute once at startup
_votes = load_votes(_DATA_FILE)
_vote_map = build_country_vote_map(_votes)
_alignments: list[AlignmentScore] = [
    AlignmentScore(**row) for row in compute_pairwise_alignment(_vote_map)
]


@router.get("/", response_model=list[AlignmentScore])
def get_all_alignments() -> list[AlignmentScore]:
    """All country-pair alignment scores derived from UN voting records."""
    return _alignments


@router.get("/{country}", response_model=list[AlignmentScore])
def get_country_alignments(country: str) -> list[AlignmentScore]:
    """All alignment scores involving a given country (by ISO code)."""
    iso = country.upper()
    results = [
        a for a in _alignments
        if a.country_a == iso or a.country_b == iso
    ]
    if not results:
        raise HTTPException(status_code=404, detail=f"No data for country '{iso}'")
    return results
