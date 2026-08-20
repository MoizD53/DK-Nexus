import { ReactNode } from "react";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

type BadgeVariant = "green" | "amber" | "red" | "stone";

interface ListItemProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  right?: ReactNode;
  showAvatar?: boolean;
}

export function ListItem({
  title,
  subtitle,
  badge,
  badgeVariant = "stone",
  right,
  showAvatar = false,
}: ListItemProps) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-stone-800 last:border-0">
      {showAvatar && <Avatar name={title} size="sm" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-200 truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-stone-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        {right && <div className="text-stone-400">{right}</div>}
      </div>
    </div>
  );
}
