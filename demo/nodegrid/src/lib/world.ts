// ============================================================
// world-atlas 底图数据加载（公有领域，public/countries-110m.json）
// 地球（S0）与网络地图（S2）共用一份缓存
// ============================================================

import { feature, mesh } from 'topojson-client';

export interface GeoFeature {
  id?: string | number;
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
}

export interface WorldData {
  countries: GeoFeature[];
  /** 国界 mesh（MultiLineString 坐标） */
  borders: number[][][];
  /** 海岸线外轮廓（countries 全量 mesh） */
  outline: number[][][];
}

let cache: Promise<WorldData> | null = null;

type Ring = number[][];

function flattenLines(geometry: { type: string; coordinates: unknown }): Ring[] {
  const out: Ring[] = [];
  const push = (c: unknown) => {
    if (!Array.isArray(c) || c.length === 0) return;
    if (typeof c[0] === 'number') out.push(c as Ring);
    else (c as unknown[]).forEach(push);
  };
  push(geometry.coordinates);
  return out;
}

export function loadWorld(): Promise<WorldData> {
  if (cache) return cache;
  cache = (async () => {
    const url = `${import.meta.env.BASE_URL}countries-110m.json`;
    const topo = await (await fetch(url)).json();
    const fc = feature(topo, (topo as { objects: { countries: unknown } }).objects.countries);
    const countries: GeoFeature[] = fc.features.map((f) => ({
      id: f.id,
      properties: f.properties ?? {},
      geometry: f.geometry,
    }));
    const borders = flattenLines(
      mesh(topo, (topo as { objects: { countries: unknown } }).objects.countries, (a, b) => a !== b) as never,
    );
    const outline = flattenLines(
      mesh(topo, (topo as { objects: { countries: unknown } }).objects.countries) as never,
    );
    return { countries, borders, outline };
  })();
  return cache;
}

/** GeoJSON 几何 → 环列表（Polygon / MultiPolygon 统一） */
export function geometryRings(geometry: { type: string; coordinates: unknown }): Ring[][] {
  const polys: unknown[] =
    geometry.type === 'Polygon' ? [geometry.coordinates] : (geometry.coordinates as unknown[]);
  const result: Ring[][] = [];
  for (const poly of polys) {
    if (!Array.isArray(poly)) continue;
    const rings: Ring[] = [];
    for (const ring of poly as unknown[]) {
      if (Array.isArray(ring) && typeof ring[0]?.[0] === 'number') rings.push(ring as Ring);
    }
    if (rings.length) result.push(rings);
  }
  return result;
}
