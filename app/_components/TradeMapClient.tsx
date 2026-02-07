"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Grid = {
  id: string;
  r: number;
  c: number;
  q?: number | null;
  hex_r?: number | null;
  name: string | null;
  locked: boolean;
  owner_handle: string | null;
};

type Listing = {
  id: string;
  grid_id: string;
  price: number;
  seller_handle: string;
};

type Mode = "v1" | "v2";

type Props = {
  mode: Mode;
};

const MARS_TILE_URL =
  "https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png";

function parseFloatSafe(value: string | null, fallback: number) {
  if (!value) return fallback;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function toFeatureCollection(features: GeoJSON.Feature[]) {
  return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function axialFromGrid(g: Grid) {
  const q = Number.isFinite(g.q as number) ? (g.q as number) : g.c;
  const r = Number.isFinite(g.hex_r as number) ? (g.hex_r as number) : g.r;
  return { q, r };
}

function hexPolygon(centerLon: number, centerLat: number, sizeDeg: number): [number, number][] {
  const points: [number, number][] = [];
  const safeCos = Math.max(Math.cos((centerLat * Math.PI) / 180), 0.2);
  for (let i = 0; i < 6; i += 1) {
    const angle = ((60 * i - 30) * Math.PI) / 180;
    const dx = sizeDeg * Math.cos(angle);
    const dy = sizeDeg * Math.sin(angle);
    points.push([centerLon + dx / safeCos, centerLat + dy]);
  }
  points.push(points[0]);
  return points;
}

export default function TradeMapClient({ mode }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const [grids, setGrids] = useState<Grid[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [myHandle, setMyHandle] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [selectedId, setSelectedId] = useState<string>(searchParams.get("grid") ?? "");

  const anchorLat = useMemo(() => parseFloatSafe(searchParams.get("lat"), -14.56), [searchParams]);
  const anchorLon = useMemo(() => parseFloatSafe(searchParams.get("lon"), -34.19), [searchParams]);
  const globeUrl = useMemo(
    () => process.env.NEXT_PUBLIC_GLOBE_URL ?? "https://mars-globe-web.vercel.app",
    [],
  );

  const listingByGrid = useMemo(() => {
    const map: Record<string, Listing> = {};
    for (const l of listings) map[l.grid_id] = l;
    return map;
  }, [listings]);

  const selectedGrid = useMemo(() => grids.find((g) => g.id === selectedId) ?? null, [grids, selectedId]);
  const selectedListing = useMemo(
    () => (selectedId ? listingByGrid[selectedId] ?? null : null),
    [listingByGrid, selectedId],
  );

  const mapFeatures = useMemo(() => {
    const sizeDeg = 0.11;
    const features: GeoJSON.Feature[] = [];

    for (const g of grids) {
      const axial = axialFromGrid(g);
      const x = sizeDeg * Math.sqrt(3) * (axial.q + axial.r / 2);
      const y = sizeDeg * 1.5 * axial.r;
      const lat = anchorLat + y;
      const cosLat = Math.max(Math.cos((anchorLat * Math.PI) / 180), 0.2);
      const lon = anchorLon + x / cosLat;
      const listing = listingByGrid[g.id];

      features.push({
        type: "Feature",
        properties: {
          grid_id: g.id,
          owner_handle: g.owner_handle ?? "",
          name: g.name ?? "",
          locked: g.locked,
          listed: !!listing,
          price: listing?.price ?? null,
          seller_handle: listing?.seller_handle ?? "",
          mine: !!myHandle && g.owner_handle === myHandle,
        },
        geometry: {
          type: "Polygon",
          coordinates: [hexPolygon(lon, lat, sizeDeg)],
        },
      });
    }
    return toFeatureCollection(features);
  }, [anchorLat, anchorLon, grids, listingByGrid, myHandle]);

  const selectedFeature = useMemo(() => {
    if (!selectedId) return toFeatureCollection([]);
    return toFeatureCollection(
      mapFeatures.features.filter((f) => String(f.properties?.grid_id ?? "") === selectedId),
    );
  }, [mapFeatures, selectedId]);

  async function loadAll() {
    try {
      setErr(null);
      const [rg, rm, rme] = await Promise.all([
        fetch("/api/v1/grids", { cache: "no-store" }),
        fetch("/api/v1/market", { cache: "no-store" }),
        fetch("/api/v1/me", { cache: "no-store" }),
      ]);

      const jg = await rg.json();
      if (!jg.ok) throw new Error(jg.error ?? "GRIDS_FAILED");
      setGrids(jg.grids ?? []);
      if (!selectedId && jg.grids?.[0]?.id) {
        setSelectedId(jg.grids[0].id);
      }

      const jm = await rm.json();
      if (!jm.ok) throw new Error(jm.error ?? "MARKET_FAILED");
      setListings(jm.listings ?? []);

      const jme = await rme.json();
      if (jme.ok && jme.user?.handle) setMyHandle(jme.user.handle);
    } catch (error: unknown) {
      setErr(getErrorMessage(error, "LOAD_FAILED"));
    }
  }

  async function buySelected() {
    if (!selectedListing) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/v1/market/buy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId: selectedListing.id }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "BUY_FAILED");
      await loadAll();
    } catch (error: unknown) {
      setErr(getErrorMessage(error, "BUY_FAILED"));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      center: [anchorLon, anchorLat],
      zoom: 5,
      minZoom: 2.5,
      maxZoom: 11,
      style: {
        version: 8,
        sources: {
          "mars-basemap": {
            type: "raster",
            tiles: [MARS_TILE_URL],
            tileSize: 256,
            maxzoom: 7,
          },
          grids: {
            type: "geojson",
            data: toFeatureCollection([]),
          },
          selected: {
            type: "geojson",
            data: toFeatureCollection([]),
          },
        },
        layers: [
          { id: "mars-basemap", type: "raster", source: "mars-basemap" },
          {
            id: "grid-fill",
            type: "fill",
            source: "grids",
            paint: {
              "fill-color": [
                "case",
                ["==", ["get", "mine"], true],
                "#2f7de1",
                ["==", ["get", "listed"], true],
                "#a53d68",
                ["!=", ["get", "owner_handle"], ""],
                "#2f7a58",
                "#3b3732",
              ],
              "fill-opacity": 0.35,
            },
          },
          {
            id: "grid-line",
            type: "line",
            source: "grids",
            paint: {
              "line-color": "#f2d8c2",
              "line-width": 1.2,
              "line-opacity": 0.65,
            },
          },
          {
            id: "selected-fill",
            type: "fill",
            source: "selected",
            paint: {
              "fill-color": "#ffe88f",
              "fill-opacity": 0.72,
            },
          },
          {
            id: "selected-line",
            type: "line",
            source: "selected",
            paint: {
              "line-color": "#000000",
              "line-width": 4,
            },
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("click", "grid-fill", (event) => {
      const feature = event.features?.[0];
      const gridId = String(feature?.properties?.grid_id ?? "");
      if (gridId) setSelectedId(gridId);
    });

    mapRef.current = map;
    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, [anchorLat, anchorLon]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("grids") as maplibregl.GeoJSONSource | undefined;
    if (source) source.setData(mapFeatures);
  }, [mapFeatures]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("selected") as maplibregl.GeoJSONSource | undefined;
    if (source) source.setData(selectedFeature);
  }, [selectedFeature]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedId) params.set("grid", selectedId);
    else params.delete("grid");
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams, selectedId]);

  const title = mode === "v1" ? "v1 Map (Upgraded)" : "v2 Map (Upgraded)";

  return (
    <main style={{ width: "100vw", height: "100vh", display: "flex", background: "#0d0d0f" }}>
      <div ref={mapContainerRef} style={{ flex: 1 }} />
      <aside
        style={{
          width: 340,
          borderLeft: "1px solid rgba(255,255,255,0.18)",
          background: "#171310",
          color: "#f2e6da",
          padding: 14,
          overflowY: "auto",
          fontSize: 14,
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 6 }}>{title}</h1>
        <p style={{ opacity: 0.85, marginBottom: 12 }}>Mars-globe-web style map + trade panel.</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <a href="/v1/join" style={{ border: "1px solid #6b5f54", padding: "6px 10px", borderRadius: 8 }}>
            Join
          </a>
          <a href="/v2/me" style={{ border: "1px solid #6b5f54", padding: "6px 10px", borderRadius: 8 }}>
            My
          </a>
          <a href="/v1/market" style={{ border: "1px solid #6b5f54", padding: "6px 10px", borderRadius: 8 }}>
            Market
          </a>
          <a
            href={`${globeUrl}/`}
            target="_blank"
            rel="noreferrer"
            style={{ border: "1px solid #6b5f54", padding: "6px 10px", borderRadius: 8 }}
          >
            3D Globe
          </a>
        </div>

        <button
          onClick={() => void loadAll()}
          style={{ border: "1px solid #6b5f54", padding: "6px 10px", borderRadius: 8, marginBottom: 12 }}
        >
          Reload
        </button>

        {err && <div style={{ color: "#ff9c9c", marginBottom: 12 }}>Error: {err}</div>}

        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", marginBottom: 10 }}>
          <div>
            <b>grid_id</b>: {selectedId || "-"}
          </div>
          <div>
            <b>cells</b>: {grids.length}
          </div>
        </div>

        <div style={{ border: "1px solid #342d27", borderRadius: 10, padding: 10, marginBottom: 10 }}>
          <div>
            <b>Owner</b>: {selectedGrid?.owner_handle ?? "-"}
          </div>
          <div>
            <b>Name</b>: {selectedGrid?.name ?? "-"}
          </div>
          <div>
            <b>Locked</b>: {selectedGrid?.locked ? "YES" : "NO"}
          </div>
        </div>

        <div style={{ border: "1px solid #342d27", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Market Status</div>
          {!selectedListing ? (
            <div>出品なし</div>
          ) : (
            <>
              <div>
                <b>FOR SALE</b>: {selectedListing.price} CX
              </div>
              <div>
                <b>Seller</b>: {selectedListing.seller_handle}
              </div>
              <button
                onClick={() => void buySelected()}
                disabled={busy || selectedListing.seller_handle === myHandle}
                style={{
                  marginTop: 8,
                  border: "1px solid #6b5f54",
                  padding: "6px 10px",
                  borderRadius: 8,
                  opacity: busy || selectedListing.seller_handle === myHandle ? 0.6 : 1,
                }}
              >
                {busy ? "..." : "Buy"}
              </button>
            </>
          )}
        </div>
      </aside>
    </main>
  );
}
