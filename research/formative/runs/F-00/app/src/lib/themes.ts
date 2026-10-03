import type { ThemeId } from './types';

export interface ThemePack {
  id: ThemeId;
  label: string;
  className: string;
}

export const THEMES: Record<ThemeId, ThemePack> = {
  'neon-city': { id: 'neon-city', label: '霓虹之城', className: 'theme-neon-city' },
  'magenta-rain': { id: 'magenta-rain', label: '品红雨夜', className: 'theme-magenta-rain' },
};

export const THEME_ORDER: ThemeId[] = ['neon-city', 'magenta-rain'];
