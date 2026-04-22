import { useEffect, useRef } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";

export function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    let viewer: any = null;

    (async () => {
      const Cesium = await import("cesium");
      if (!el || el.childElementCount > 0) return; // guard double-mount

      // Suppress Cesium ion — we use ESRI tiles exclusively
      Cesium.Ion.defaultAccessToken = "";

      viewer = new Cesium.Viewer(el, {
        baseLayer:             false,
        terrainProvider:       new Cesium.EllipsoidTerrainProvider(),
        baseLayerPicker:       false,
        geocoder:              false,
        homeButton:            false,
        sceneModePicker:       false,
        navigationHelpButton:  false,
        animation:             false,
        timeline:              false,
        fullscreenButton:      false,
        infoBox:               false,
        selectionIndicator:    false,
        vrButton:              false,
        // ── Performance ────────────────────────────────────────────────────
        msaaSamples:           1,    // disable MSAA — biggest single GPU win
        requestRenderMode:     true, // only re-render when the scene actually changes
        maximumRenderTimeChange: Infinity,
      });

      // ESRI World Imagery — free, no API key, streams up to zoom 19
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maximumLevel: 19,
          credit: "Tiles © Esri — Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN",
        })
      );

      // ── Scene appearance ───────────────────────────────────────────────────
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#080b12");
      viewer.scene.skyBox.show = false;
      viewer.scene.sun.show   = false;
      viewer.scene.moon.show  = false;
      viewer.scene.skyAtmosphere.show = true;
      viewer.scene.skyAtmosphere.atmosphereLightIntensity = 12.0;

      // Dim imagery slightly so the globe doesn't blow out against the dark background
      viewer.imageryLayers.get(0).brightness = 0.72;

      // ── Globe tile performance ─────────────────────────────────────────────
      // Higher SSE = fewer tiles fetched per frame = smoother panning
      viewer.scene.globe.maximumScreenSpaceError = 3;   // default 2
      // Larger cache avoids re-fetching tiles you've already seen
      viewer.scene.globe.tileCacheSize = 300;           // default 100
      // Don't pre-load neighbouring tiles — wait until needed
      viewer.scene.globe.preloadSiblings = false;
      // Disable dynamic fog computation (pure overhead at this zoom range)
      viewer.scene.fog.enabled = false;

      // Start with a nice full-earth view
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(10, 20, 18_000_000),
      });

    })();

    return () => {
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", background: "#080b12" }}
    />
  );
}
