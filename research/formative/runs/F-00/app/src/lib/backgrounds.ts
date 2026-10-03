import aerialNight from '../assets/bg-71SHXwBLp5w.jpg';
import buildingLights from '../assets/bg-r7YZXv5f5cc.jpg';
import neonCity from '../assets/cyber-city-neon.jpg';
import neonSigns from '../assets/bg-kUpA8qN28GE.jpg';
import nightTrain from '../assets/bg-ez4pqCpEfuI.jpg';
import skyline from '../assets/bg-Io1lz5bZ0as.jpg';
import type { BgId } from './types';

export interface BgOption {
  id: BgId;
  label: string;
  /** null = 纯渐变（无照片层） */
  url: string | null;
}

/** 背景注册表：门B 已批渠道（Unsplash 免费商用）+ 渐变降级 + 用户自定义 */
export const BACKGROUNDS: BgOption[] = [
  { id: 'neon-city', label: '霓虹之城', url: neonCity },
  { id: 'building-lights', label: '楼宇灯火', url: buildingLights },
  { id: 'neon-signs', label: '霓虹街巷', url: neonSigns },
  { id: 'aerial-night', label: '夜城俯瞰', url: aerialNight },
  { id: 'night-train', label: '午夜列车', url: nightTrain },
  { id: 'skyline', label: '摩天天际', url: skyline },
  { id: 'gradient', label: '纯色渐变', url: null },
];

export const BG_IDS: readonly BgId[] = BACKGROUNDS.map((b) => b.id);

export function bgLabel(id: BgId): string {
  if (id === 'custom') return '自定义';
  return BACKGROUNDS.find((b) => b.id === id)?.label ?? '霓虹之城';
}
