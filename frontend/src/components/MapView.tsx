import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
// @ts-expect-error - topojson-client ships CJS without perfect TS types
import { feature } from "topojson-client";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Country, Relationship } from "../types";

interface Props {
  countries: Country[];
  relationships: Relationship[];
}

interface HoverInfo {
  name: string;
  iso: string;
  allies: { name: string; score: number }[];
  rivals: { name: string; score: number }[];
  x: number;
  y: number;
}

// ── ISO numeric → alpha-3 ────────────────────────────────────────────────────
const ISO_MAP: Record<number, string> = {
  840: "USA", 826: "GBR", 276: "DEU", 250: "FRA", 392: "JPN",
  124: "CAN",  36: "AUS", 380: "ITA", 724: "ESP", 528: "NLD",
   56: "BEL", 752: "SWE", 578: "NOR", 208: "DNK", 246: "FIN",
  616: "POL", 756: "CHE",  40: "AUT", 620: "PRT", 300: "GRC",
  410: "KOR", 554: "NZL", 372: "IRL", 203: "CZE", 376: "ISR",
  804: "UKR", 643: "RUS", 112: "BLR", 398: "KAZ", 688: "SRB",
  156: "CHN", 408: "PRK", 704: "VNM", 116: "KHM", 104: "MMR",
  356: "IND", 586: "PAK",  50: "BGD", 360: "IDN", 764: "THA",
  458: "MYS", 608: "PHL", 702: "SGP", 682: "SAU", 364: "IRN",
  368: "IRQ", 784: "ARE", 634: "QAT", 414: "KWT", 400: "JOR",
  422: "LBN", 760: "SYR", 887: "YEM", 512: "OMN", 792: "TUR",
  818: "EGY", 566: "NGA", 231: "ETH", 404: "KEN", 288: "GHA",
  834: "TZA",  12: "DZA", 504: "MAR",  24: "AGO", 508: "MOZ",
  120: "CMR", 686: "SEN", 716: "ZWE", 729: "SDN", 710: "ZAF",
   76: "BRA", 484: "MEX",  32: "ARG", 170: "COL", 152: "CHL",
  604: "PER", 862: "VEN", 192: "CUB",  68: "BOL", 218: "ECU",
  858: "URY",
};

// ── Bloc fill colours (muted, editorial palette) ─────────────────────────────
const WEST    = new Set(["USA","GBR","DEU","FRA","JPN","CAN","AUS","ITA","ESP",
                          "NLD","BEL","SWE","NOR","DNK","FIN","POL","CHE","AUT",
                          "PRT","GRC","KOR","NZL","IRL","CZE","ISR","UKR"]);
const RUSSIA  = new Set(["RUS","BLR","KAZ","SRB"]);
const CHINA   = new Set(["CHN","PRK","VNM","KHM","MMR"]);
const IRAN    = new Set(["IRN","SYR","YEM"]);
const RADICAL = new Set(["CUB","VEN","BOL"]);
const LATIN   = new Set(["BRA","MEX","ARG","COL","CHL","PER","URY","ECU"]);
const GULF    = new Set(["SAU","ARE","QAT","KWT","OMN","JOR","LBN"]);
const AFRICA  = new Set(["NGA","ETH","KEN","GHA","TZA","DZA","MAR","AGO",
                          "MOZ","CMR","SEN","ZWE","SDN","ZAF"]);
const SEA     = new Set(["IND","IDN","THA","MYS","PHL","SGP","BGD","PAK"]);
const MIDDLE  = new Set(["TUR","EGY","IRQ"]);

// [fill, border] — all muted and desaturated for a clean editorial look
const BLOC_STYLE: Record<string, [string, string]> = {
  west:    ["#d4e3f5", "#7aabd4"],
  russia:  ["#f5d4d4", "#d47a7a"],
  china:   ["#f5e8d4", "#d4a87a"],
  iran:    ["#f0ddd0", "#c4906a"],
  radical: ["#f5d4d8", "#d47a84"],
  latin:   ["#d4f0e0", "#7ac4a0"],
  gulf:    ["#f5f0d4", "#d4c47a"],
  africa:  ["#ede8dc", "#b8a882"],
  sea:     ["#d4eff5", "#7abcd4"],
  middle:  ["#ece0d4", "#c4a07a"],
  neutral: ["#eeebe4", "#ccc8c0"],
};

function getBloc(iso: string): string {
  if (WEST.has(iso))    return "west";
  if (RUSSIA.has(iso))  return "russia";
  if (CHINA.has(iso))   return "china";
  if (IRAN.has(iso))    return "iran";
  if (RADICAL.has(iso)) return "radical";
  if (LATIN.has(iso))   return "latin";
  if (GULF.has(iso))    return "gulf";
  if (AFRICA.has(iso))  return "africa";
  if (SEA.has(iso))     return "sea";
  if (MIDDLE.has(iso))  return "middle";
  return "neutral";
}

const WORLD_TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ── Component ────────────────────────────────────────────────────────────────
export function MapView({ countries, relationships }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<maplibregl.Map | null>(null);
  const hoveredId    = useRef<number | string | null>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const countryRef       = useRef(countries);
  const relationshipsRef = useRef(relationships);
  countryRef.current       = countries;
  relationshipsRef.current = relationships;

  function buildHoverInfo(iso: string, x: number, y: number): HoverInfo {
    const nameMap = new Map(countryRef.current.map(c => [c.iso_code, c.name]));
    const allies: { name: string; score: number }[] = [];
    const rivals: { name: string; score: number }[] = [];

    for (const r of relationshipsRef.current) {
      const other = r.country_a === iso ? r.country_b
                  : r.country_b === iso ? r.country_a
                  : null;
      if (!other) continue;
      const entry = { name: nameMap.get(other) ?? other, score: r.alignment_score };
      if (r.alignment_score >= 0.1)  allies.push(entry);
      if (r.alignment_score <= -0.1) rivals.push(entry);
    }

    allies.sort((a, b) => b.score - a.score);
    rivals.sort((a, b) => a.score - b.score);

    return {
      name: nameMap.get(iso) ?? iso,
      iso,
      allies: allies.slice(0, 4),
      rivals: rivals.slice(0, 4),
      x,
      y,
    };
  }

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json",
      center: [10, 20],
      zoom: 1.7,
      minZoom: 1,
    });

    mapRef.current = map;

    map.on("load", async () => {
      let worldGeo: GeoJSON.FeatureCollection;
      try {
        const topo = await fetch(WORLD_TOPO_URL).then(r => r.json());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        worldGeo = feature(topo, (topo as any).objects.countries) as GeoJSON.FeatureCollection;
      } catch {
        console.error("Failed to load world topology");
        return;
      }

      const enriched: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: worldGeo.features.map(f => {
          const iso  = ISO_MAP[(f as GeoJSON.Feature & { id: number }).id] ?? null;
          const bloc = iso ? getBloc(iso) : "neutral";
          const [fill, border] = BLOC_STYLE[bloc];
          return {
            ...f,
            properties: { ...f.properties, iso_a3: iso, fill, border },
          };
        }),
      };

      map.addSource("countries", {
        type: "geojson",
        data: enriched,
        generateId: true,
      });

      // Fill
      map.addLayer({
        id: "country-fills",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color":   ["get", "fill"],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hovered"], false],
            0.85,
            0.55,
          ],
        },
      });

      // Border
      map.addLayer({
        id: "country-borders",
        type: "line",
        source: "countries",
        paint: {
          "line-color":   ["get", "border"],
          "line-width":   0.8,
          "line-opacity": 0.7,
        },
      });

      // Hover interactions
      map.on("mousemove", "country-fills", e => {
        if (!e.features?.length) return;
        map.getCanvas().style.cursor = "pointer";

        const fid = e.features[0].id as number;
        if (hoveredId.current !== null && hoveredId.current !== fid) {
          map.setFeatureState({ source: "countries", id: hoveredId.current }, { hovered: false });
        }
        hoveredId.current = fid;
        map.setFeatureState({ source: "countries", id: fid }, { hovered: true });

        const iso = e.features[0].properties?.iso_a3 as string | null;
        if (iso) setHover(buildHoverInfo(iso, e.point.x, e.point.y));
        else     setHover(null);
      });

      map.on("mouseleave", "country-fills", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredId.current !== null) {
          map.setFeatureState({ source: "countries", id: hoveredId.current }, { hovered: false });
          hoveredId.current = null;
        }
        setHover(null);
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 28, left: 12, zIndex: 10,
        pointerEvents: "none",
        background: "#fff",
        border: "1px solid #e2ddd6",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", gap: 5,
      }}>
        <div style={{ fontSize: 10, fontWeight: 500, color: "#9b9389", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
          Geopolitical Bloc
        </div>
        {([
          ["west",    "Western / NATO",   "#7aabd4"],
          ["russia",  "Russia & Allies",  "#d47a7a"],
          ["china",   "China Sphere",     "#d4a87a"],
          ["iran",    "Iran Axis",        "#c4906a"],
          ["latin",   "Latin America",    "#7ac4a0"],
          ["gulf",    "Gulf States",      "#d4c47a"],
          ["africa",  "Africa",           "#b8a882"],
          ["sea",     "South / SE Asia",  "#7abcd4"],
          ["middle",  "Middle East",      "#c4a07a"],
          ["radical", "Radical Left",     "#d47a84"],
        ] as [string, string, string][]).map(([, label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#5a5348" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Hover tooltip */}
      {hover && <HoverCard hover={hover} />}
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function HoverCard({ hover }: { hover: HoverInfo }) {
  const x = Math.min(hover.x + 14, window.innerWidth - 220);

  return (
    <div style={{
      position: "absolute", left: x, top: hover.y - 10,
      zIndex: 20, pointerEvents: "none",
      width: 210,
      background: "#fff",
      border: "1px solid #e2ddd6",
      borderRadius: 8,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px 8px",
        borderBottom: "1px solid #f0ede8",
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 17, color: "#1a1916", lineHeight: 1.2,
        }}>
          {hover.name}
        </div>
        <div style={{ fontSize: 11, color: "#9b9389", marginTop: 2 }}>{hover.iso}</div>
      </div>

      <div style={{ padding: "8px 14px 10px" }}>
        {hover.allies.length > 0 && (
          <ScoreSection label="Aligned with" color="#16a34a" items={hover.allies} positive />
        )}
        {hover.rivals.length > 0 && (
          <ScoreSection label="Opposed to" color="#dc2626" items={hover.rivals} positive={false} />
        )}
        {hover.allies.length === 0 && hover.rivals.length === 0 && (
          <span style={{ fontSize: 11, color: "#9b9389" }}>No alignment data</span>
        )}
      </div>
    </div>
  );
}

function ScoreSection({
  label, color, items, positive,
}: {
  label: string; color: string;
  items: { name: string; score: number }[];
  positive: boolean;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        fontSize: 10, fontWeight: 500, color,
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
      }}>
        {label}
      </div>
      {items.map(({ name, score }) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "#5a5348", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </span>
          <div style={{ width: 50, height: 2, background: "#f0ede8", borderRadius: 1, flexShrink: 0 }}>
            <div style={{
              height: "100%",
              width: `${Math.abs(score) * 100}%`,
              background: positive ? "#16a34a" : "#dc2626",
              borderRadius: 1,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
