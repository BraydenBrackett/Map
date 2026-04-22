"""
UN voting alignment service.

Computes Country Alignment Score (CAS) between every pair of countries
by comparing their votes on shared UN General Assembly resolutions.

Scoring per shared resolution:
  YES  + YES  = 1.0
  NO   + NO   = 1.0
  ABS  + ABS  = 0.5
  any mismatch = 0.0

Vote Similarity Score (VSS) = total_score / shared_votes
Country Alignment Score (CAS) = (VSS - 0.5) * 2   → range [-1, 1]
"""

import csv
from dataclasses import dataclass
from itertools import combinations
from pathlib import Path

VALID_VOTES = {"YES", "NO", "ABSTAIN"}

# Maps raw CSV values to canonical forms
_VOTE_ALIASES: dict[str, str] = {
    "Y": "YES",
    "YES": "YES",
    "N": "NO",
    "NO": "NO",
    "ABS": "ABSTAIN",
    "ABSTAIN": "ABSTAIN",
    "ABSTENTIONS": "ABSTAIN",
}


@dataclass(frozen=True)
class VoteRecord:
    resolution_id: str
    year: int
    country: str
    vote: str  # YES | NO | ABSTAIN


def load_votes(file_path: str | Path) -> list[VoteRecord]:
    """
    Load votes from CSV. Rows with absent, missing, or unrecognised
    vote values are silently dropped.
    """
    records: list[VoteRecord] = []
    with open(file_path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            raw = row.get("vote", "").strip().upper()
            vote = _VOTE_ALIASES.get(raw)
            if vote is None:
                continue
            records.append(VoteRecord(
                resolution_id=row["resolution_id"].strip(),
                year=int(row["year"]),
                country=row["country"].strip(),
                vote=vote,
            ))
    return records


def build_country_vote_map(votes: list[VoteRecord]) -> dict[str, dict[str, str]]:
    """
    Build { country: { resolution_id: vote } } from a flat list of records.
    If a country votes twice on the same resolution the later row wins.
    """
    vote_map: dict[str, dict[str, str]] = {}
    for record in votes:
        vote_map.setdefault(record.country, {})[record.resolution_id] = record.vote
    return vote_map


def _vote_score(v_a: str, v_b: str) -> float:
    if v_a == "YES" and v_b == "YES":
        return 1.0
    if v_a == "NO" and v_b == "NO":
        return 1.0
    if v_a == "ABSTAIN" and v_b == "ABSTAIN":
        return 0.5
    return 0.0


def compute_pairwise_alignment(
    vote_map: dict[str, dict[str, str]],
    min_shared: int = 1,
) -> list[dict]:
    """
    Return a list of dicts with keys country_a, country_b, cas.

    Pairs with fewer than `min_shared` common resolutions are skipped.
    """
    results: list[dict] = []

    for c_a, c_b in combinations(vote_map, 2):
        votes_a = vote_map[c_a]
        votes_b = vote_map[c_b]
        shared = set(votes_a) & set(votes_b)

        if len(shared) < min_shared:
            continue

        total_score = sum(_vote_score(votes_a[r], votes_b[r]) for r in shared)
        vss = total_score / len(shared)
        cas = round((vss - 0.5) * 2, 4)

        results.append({
            "country_a": c_a,
            "country_b": c_b,
            "cas": cas,
            "shared_votes": len(shared),
        })

    return results
