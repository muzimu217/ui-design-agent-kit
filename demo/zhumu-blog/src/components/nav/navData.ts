import type { ComponentType, SVGProps } from 'react';
import { ArchiveIcon, HomeIcon, PostIcon, TvIcon, UserIcon } from '../Icons';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  /** 激活匹配（'/' 精确，其余前缀） */
  exact?: boolean;
}

/** 五栏目（§2.2）：桌面「关于」= 移动「我的」。 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '首页', icon: HomeIcon, exact: true },
  { to: '/posts', label: '文章', icon: PostIcon },
  { to: '/essays', label: '随笔', icon: TvIcon },
  { to: '/archives', label: '归档', icon: ArchiveIcon },
  { to: '/about', label: '我的', icon: UserIcon },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === '/';
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

/** 桌面端展示名（移动「我的」在桌面为「关于」）。 */
export function desktopLabel(item: NavItem): string {
  return item.to === '/about' ? '关于' : item.label;
}
