import { useEffect, useState } from 'react';
import { BACKGROUNDS } from '../lib/backgrounds';
import { picsumFull } from '../lib/picsum';
import type { BgId, RemoteBackground, ThemeId } from '../lib/types';

interface LayerSpec {
  themeId: ThemeId;
  bgId: BgId;
  customBg: string | null;
  remoteBg: RemoteBackground | null;
  /** 自定义图版本号：同选 custom 重新上传时也触发交叉淡入 */
  rev: number;
}

function specKey(s: LayerSpec): string {
  const variant =
    s.bgId === 'custom'
      ? `custom-${s.rev}`
      : s.bgId === 'remote'
        ? `remote-${s.remoteBg?.id ?? 'none'}`
        : s.bgId;
  return `${s.themeId}:${variant}`;
}

function layerSrcOf(s: LayerSpec): string | null {
  if (s.bgId === 'custom') return s.customBg;
  if (s.bgId === 'remote') return s.remoteBg ? picsumFull(s.remoteBg.id) : null;
  return BACKGROUNDS.find((b) => b.id === s.bgId)?.url ?? null;
}

export interface BackgroundLayerProps {
  themeId: ThemeId;
  bgId: BgId;
  customBg: string | null;
  remoteBg: RemoteBackground | null;
  customBgRev: number;
  reduced: boolean;
  onPhotoError: () => void;
}

/**
 * 背景层 v3：bgId → 注册表解析（custom → 用户上传 dataURL；
 * remote → 素材工坊 Picsum/Unsplash CDN 直链）。
 * 主题/背景切换时交叉淡入 300ms（Elegant），旧层淡出后卸载；
 * prefers-reduced-motion 下即时切换。
 * 背景图加载失败自动降级为纯渐变底（回调上抛）。
 */
export function BackgroundLayer({
  themeId,
  bgId,
  customBg,
  remoteBg,
  customBgRev,
  reduced,
  onPhotoError,
}: BackgroundLayerProps) {
  const [layers, setLayers] = useState<LayerSpec[]>([
    { themeId, bgId, customBg, remoteBg, rev: customBgRev },
  ]);

  const key = specKey({ themeId, bgId, customBg, remoteBg, rev: customBgRev });

  useEffect(() => {
    setLayers((prev) => {
      if (specKey(prev[prev.length - 1]) === key) return prev;
      return [...prev.slice(-1), { themeId, bgId, customBg, remoteBg, rev: customBgRev }];
    });
    // key 涵盖 themeId/bgId/remoteBg.id/customBgRev 的全部变化，按 key 触发即可
  }, [key]);

  // 新层淡入完成后移除旧层
  useEffect(() => {
    if (layers.length < 2) return;
    const t = window.setTimeout(
      () => setLayers((prev) => prev.slice(-1)),
      reduced ? 0 : 340,
    );
    return () => window.clearTimeout(t);
  }, [layers, reduced]);

  return (
    <div className="bg-stack" aria-hidden="true">
      {layers.map((l, i) => {
        const layerSrc = layerSrcOf(l);
        return (
          <div
            key={`${specKey(l)}:${i}`}
            className={`bg-layer bg-layer--${l.themeId} ${layerSrc ? 'bg-layer--photo' : 'bg-layer--gradient'}`}
            data-active={i === layers.length - 1}
          >
            {layerSrc && (
              <img
                className="bg-photo"
                src={layerSrc}
                alt=""
                loading="eager"
                decoding="async"
                onError={onPhotoError}
              />
            )}
            <div className="bg-tint" />
          </div>
        );
      })}
    </div>
  );
}
