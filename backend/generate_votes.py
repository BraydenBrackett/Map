"""
Generate mock UN General Assembly votes for all countries.
Run once to produce data/un_votes.csv.

Voting patterns are based on real geopolitical blocs.
"""
import csv
from pathlib import Path

# ── Geopolitical blocs ───────────────────────────────────────────────────────

WEST = {
    "USA", "GBR", "DEU", "FRA", "JPN", "CAN", "AUS", "ITA", "ESP",
    "NLD", "BEL", "SWE", "NOR", "DNK", "FIN", "POL", "CHE", "AUT",
    "PRT", "GRC", "KOR", "NZL", "IRL", "CZE", "UKR",
}
RUSSIA   = {"RUS", "BLR", "KAZ", "SRB"}
CHINA    = {"CHN", "PRK", "VNM", "KHM", "MMR"}
IRAN     = {"IRN", "SYR", "YEM"}
LATIN    = {"BRA", "MEX", "ARG", "COL", "CHL", "PER", "URY", "ECU"}
RADICAL  = {"CUB", "VEN", "BOL"}   # left-leaning, closer to Russia/China
GULF     = {"SAU", "ARE", "QAT", "KWT", "OMN", "JOR", "LBN"}
AFRICA   = {"NGA", "ETH", "KEN", "GHA", "TZA", "DZA", "MAR", "AGO",
            "MOZ", "CMR", "SEN", "ZWE", "SDN", "ZAF"}
SEA      = {"IND", "IDN", "THA", "MYS", "PHL", "SGP", "BGD", "PAK"}
SPECIAL  = {"TUR", "EGY", "IRQ", "ISR"}

ALL = WEST | RUSSIA | CHINA | IRAN | LATIN | RADICAL | GULF | AFRICA | SEA | SPECIAL

# ── Vote-logic per resolution type ───────────────────────────────────────────

def vote(country: str, res_type: str, variant: int) -> str | None:
    """Return YES / NO / ABSTAIN, or None to skip (absent)."""

    if res_type == "HR":          # Human-rights enforcement
        if country in WEST | {"ISR"}:          return "YES"
        if country in RUSSIA | CHINA | IRAN | RADICAL | {"PAK"}: return "NO"
        if country in GULF:
            return "NO" if variant % 2 == 0 else "ABSTAIN"
        if country in AFRICA:
            return "ABSTAIN"
        if country in SEA - {"ISR"}:
            return "ABSTAIN"
        if country in LATIN:
            return "YES" if variant % 3 != 0 else "ABSTAIN"
        if country in {"TUR", "EGY", "IRQ"}:  return "ABSTAIN"
        return "ABSTAIN"

    elif res_type == "SOV":       # Sovereignty / non-interference
        if country in WEST | {"ISR"}:          return "NO"
        if country in RUSSIA | CHINA | IRAN | RADICAL: return "YES"
        if country in GULF | AFRICA | SEA | LATIN:     return "YES"
        if country in {"TUR", "EGY", "IRQ"}:  return "YES"
        return "YES"

    elif res_type == "CLI":       # Climate action
        oil_states = {"SAU", "ARE", "QAT", "KWT", "OMN", "IRN"}
        if country in oil_states:
            return "NO" if variant == 2 else "ABSTAIN"
        if country in RUSSIA:     return "ABSTAIN"
        if country in {"PRK"}:    return None      # absent
        if variant == 2:          # binding fossil-fuel targets: more resistance
            if country in {"USA", "AUS", "CAN"}: return "ABSTAIN"
            if country in {"CHN", "IND", "IDN"}: return "ABSTAIN"
        return "YES"

    elif res_type == "NUC":       # Nuclear weapons
        nuclear = {"USA", "RUS", "CHN", "GBR", "FRA", "IND", "PAK", "PRK", "ISR"}
        if variant == 3:          # non-proliferation — broad consensus
            return "YES"
        return "NO" if country in nuclear else "YES"

    elif res_type == "MID":       # Israeli-Palestinian / Middle East
        if country in {"USA", "ISR"}:          return "NO"
        if country in {"CAN", "AUS"} and variant == 1: return "NO"
        if country in WEST - {"USA", "CAN", "AUS"}:
            return "ABSTAIN" if variant == 1 else "YES"
        return "YES"

    elif res_type == "ECO":       # Economic fairness / trade
        if country in RUSSIA:         return "NO"
        if country in CHINA:          return "ABSTAIN"
        if country in RADICAL | IRAN: return "NO"
        return "YES"

    return "ABSTAIN"

# ── Resolution schedule ───────────────────────────────────────────────────────

RESOLUTIONS = [
    ("HR-2020-001",  2020, "HR",  1),
    ("HR-2020-002",  2020, "HR",  2),
    ("HR-2020-003",  2020, "HR",  3),
    ("HR-2021-001",  2021, "HR",  4),
    ("HR-2021-002",  2021, "HR",  5),
    ("SOV-2020-001", 2020, "SOV", 1),
    ("SOV-2020-002", 2020, "SOV", 2),
    ("SOV-2021-001", 2021, "SOV", 3),
    ("SOV-2021-002", 2021, "SOV", 4),
    ("SOV-2022-001", 2022, "SOV", 5),
    ("CLI-2020-001", 2020, "CLI", 1),
    ("CLI-2021-001", 2021, "CLI", 1),
    ("CLI-2021-002", 2021, "CLI", 2),
    ("CLI-2022-001", 2022, "CLI", 1),
    ("NUC-2020-001", 2020, "NUC", 1),
    ("NUC-2021-001", 2021, "NUC", 2),
    ("NUC-2022-001", 2022, "NUC", 3),
    ("MID-2020-001", 2020, "MID", 1),
    ("MID-2021-001", 2021, "MID", 2),
    ("ECO-2021-001", 2021, "ECO", 1),
]

# ── Generate ──────────────────────────────────────────────────────────────────

def main() -> None:
    out = Path(__file__).parent / "data" / "un_votes.csv"
    rows: list[dict] = []

    for res_id, year, res_type, variant in RESOLUTIONS:
        for country in sorted(ALL):
            v = vote(country, res_type, variant)
            if v is None:
                continue
            rows.append({
                "resolution_id": res_id,
                "year": year,
                "country": country,
                "vote": v,
            })

    out.parent.mkdir(exist_ok=True)
    with open(out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["resolution_id", "year", "country", "vote"])
        writer.writeheader()
        writer.writerows(rows)

    n_countries = len(ALL)
    print(f"OK: {len(rows)} rows written to {out}")
    print(f"  {n_countries} countries × {len(RESOLUTIONS)} resolutions")


if __name__ == "__main__":
    main()
