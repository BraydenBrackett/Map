import { GlobeView } from "./components/GlobeView";

export function App() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#080b12" }}>
      {/* Globe fills the full viewport */}
      <GlobeView />

      {/* Floating header */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        padding: "18px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(to bottom, rgba(8,11,18,0.85) 0%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#4a9eff",
            boxShadow: "0 0 8px #4a9eff",
          }} />
          <span style={{
            fontSize: 13, fontWeight: 500, letterSpacing: "0.12em",
            color: "#94b8d8", textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
          }}>
            GeoNet OSINT
          </span>
        </div>

        <div style={{
          fontSize: 11, color: "#3a5a78",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.06em",
        }}>
          DRAG TO ROTATE · SCROLL TO ZOOM
        </div>
      </div>
    </div>
  );
}
