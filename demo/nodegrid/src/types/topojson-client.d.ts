// topojson-client 最小类型垫片（避免引入未列出的 @types 依赖）
declare module 'topojson-client' {
  export function feature(topology: unknown, object: unknown): {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      id?: string | number;
      properties: Record<string, unknown>;
      geometry: { type: string; coordinates: unknown };
    }>;
  };
  export function mesh(
    topology: unknown,
    object?: unknown,
    filter?: (a: unknown, b: unknown) => boolean,
  ): { type: string; coordinates: unknown };
}
