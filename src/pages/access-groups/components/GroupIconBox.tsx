import type { GroupColor, GroupIconKey } from '@/features/access-groups/types'
import {
  COLOR_STYLES,
  ICON_MAP,
} from '@/pages/access-groups/lib/accessGroupsLib'

export function GroupIconBox({
  color,
  iconKey,
  size = 'md',
  variant = 'table',
}: {
  color: GroupColor
  iconKey: GroupIconKey
  size?: 'sm' | 'md' | 'lg' | 'list'
  variant?: 'table' | 'editor'
}) {
  const Icon = variant === 'editor' ? ICON_MAP.shield : ICON_MAP[iconKey]
  const palette = COLOR_STYLES[color]
  const cls =
    size === 'lg'
      ? 'access-groups__icon-box access-groups__icon-box--lg'
      : size === 'list'
        ? 'access-groups__icon-box access-groups__icon-box--list'
        : size === 'sm'
          ? 'access-groups__icon-box access-groups__icon-box--sm'
          : 'access-groups__icon-box'
  return (
    <div
      className={cls}
      style={{ background: palette.soft, color: palette.bg }}
      aria-hidden
    >
      <Icon
        size={
          size === 'lg' ? 40 : size === 'list' ? 26 : size === 'sm' ? 18 : 22
        }
        strokeWidth={1.85}
      />
    </div>
  )
}
