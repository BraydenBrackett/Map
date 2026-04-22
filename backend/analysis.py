import math
from itertools import combinations

import networkx as nx

from data import COUNTRIES, ATTRIBUTE_VECTORS
from models import Relationship


def _cosine_sim(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x ** 2 for x in a))
    norm_b = math.sqrt(sum(x ** 2 for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def compute_relationships() -> list[Relationship]:
    results: list[Relationship] = []
    country_list = [c for c in COUNTRIES if c.iso_code in ATTRIBUTE_VECTORS]
    for c_a, c_b in combinations(country_list, 2):
        vec_a = ATTRIBUTE_VECTORS[c_a.iso_code]
        vec_b = ATTRIBUTE_VECTORS[c_b.iso_code]
        cosine = _cosine_sim(vec_a, vec_b)
        score = round((cosine * 2) - 1, 4)
        results.append(Relationship(
            country_a=c_a.iso_code,
            country_b=c_b.iso_code,
            alignment_score=score,
        ))
    return results


def build_graph() -> nx.Graph:
    g = nx.Graph()
    for country in COUNTRIES:
        g.add_node(country.iso_code, name=country.name)
    for rel in compute_relationships():
        g.add_edge(rel.country_a, rel.country_b, weight=rel.alignment_score)
    return g
