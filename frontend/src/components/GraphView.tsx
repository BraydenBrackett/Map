import { useEffect, useRef, useState } from "react";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import Sigma from "sigma";
import type { Country, Relationship } from "../types";

interface Props {
  countries: Country[];
  relationships: Relationship[];
}

interface NodeInfo {
  name: string;
  iso: string;
  aligned: { name: string; score: number }[];
  opposed: { name: string; score: number }[];
}

export function GraphView({ countries, relationships }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Sigma | null>(null);
  const [selected, setSelected] = useState<NodeInfo | null>(null);

  useEffect(() => {
    if (!containerRef.current || countries.length === 0) return;

    const nameMap = new Map(countries.map((c) => [c.iso_code, c.name]));
    const graph = new Graph({ type: "undirected" });

    countries.forEach((c, i) => {
      const angle = (2 * Math.PI * i) / countries.length;
      graph.addNode(c.iso_code, {
        label: c.name,
        x: Math.cos(angle),
        y: Math.sin(angle),
        size: 8,
        color: "#1a1916",
      });
    });

    relationships.forEach((r) => {
      if (graph.hasNode(r.country_a) && graph.hasNode(r.country_b)) {
        const positive = r.alignment_score >= 0;
        graph.addEdge(r.country_a, r.country_b, {
          weight: Math.abs(r.alignment_score),
          color: positive ? "rgba(22,163,74,0.45)" : "rgba(220,38,38,0.35)",
          size: Math.max(0.5, Math.abs(r.alignment_score) * 2),
          _score: r.alignment_score,
        });
      }
    });

    forceAtlas2.assign(graph, {
      iterations: 150,
      settings: { gravity: 1.2, scalingRatio: 3, strongGravityMode: false },
    });

    const renderer = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      labelColor: { color: "#1a1916" },
      labelSize: 11,
      labelFont: "DM Sans, sans-serif",
      labelWeight: "400",
      stagePadding: 40,
      defaultEdgeColor: "#c4bfb8",
      defaultNodeColor: "#1a1916",
    });

    // Node click → show detail panel
    renderer.on("clickNode", ({ node }) => {
      const name = nameMap.get(node) ?? node;
      const aligned: { name: string; score: number }[] = [];
      const opposed: { name: string; score: number }[] = [];

      graph.edges(node).forEach((edge) => {
        const [a, b] = graph.extremities(edge);
        const other = a === node ? b : a;
        const score = graph.getEdgeAttribute(edge, "_score") as number;
        const entry = { name: nameMap.get(other) ?? other, score };
        if (score >= 0) aligned.push(entry);
        else opposed.push(entry);
      });

      aligned.sort((a, b) => b.score - a.score);
      opposed.sort((a, b) => a.score - b.score);

      setSelected({ name, iso: node, aligned, opposed });
    });

    renderer.on("clickStage", () => setSelected(null));

    rendererRef.current = renderer;

    return () => {
      renderer.kill();
      rendererRef.current = null;
    };
  }, [countries, relationships]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#f7f5f0" }}>
      {/* Subtle grid texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(#d8d3cb 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        opacity: 0.5,
      }} />

      <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }} />

      {/* Detail panel */}
      {selected && (
        <div style={{
          position: "absolute", top: 16, right: 16, zIndex: 20,
          background: "#fff", border: "1px solid #e2ddd6", borderRadius: 10,
          padding: "16px 18px", width: 240,
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              position: "absolute", top: 10, right: 12,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 16, color: "#9b9389", lineHeight: 1,
            }}
          >
            ×
          </button>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, lineHeight: 1.1, marginBottom: 4 }}>
            {selected.name}
          </div>
          <div style={{ fontSize: 11, color: "#9b9389", marginBottom: 16 }}>{selected.iso}</div>

          {selected.aligned.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Aligned with
              </div>
              {selected.aligned.map(({ name, score }) => (
                <ScoreRow key={name} name={name} score={score} positive />
              ))}
            </div>
          )}

          {selected.opposed.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 500, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Opposed to
              </div>
              {selected.opposed.map(({ name, score }) => (
                <ScoreRow key={name} name={name} score={score} positive={false} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hint */}
      {!selected && (
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          fontSize: 11, color: "#9b9389", pointerEvents: "none", zIndex: 10,
          background: "rgba(247,245,240,0.85)", padding: "4px 12px", borderRadius: 20,
          border: "1px solid #e2ddd6",
        }}>
          Click a node to explore relationships
        </div>
      )}
    </div>
  );
}

function ScoreRow({ name, score, positive }: { name: string; score: number; positive: boolean }) {
  const pct = Math.abs(score) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#1a1916", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
        <div style={{ marginTop: 3, height: 2, background: "#f0ede8", borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: positive ? "#16a34a" : "#dc2626", borderRadius: 1 }} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#9b9389", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
        {score > 0 ? "+" : ""}{score.toFixed(2)}
      </div>
    </div>
  );
}
