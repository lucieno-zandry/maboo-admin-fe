// ~/components/promotions/promotion-targeting-badge.tsx
import { Badge } from "~/components/ui/badge";
import { Users, UserCheck, User } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Promotion } from "wle-core";

export type PromotionTargetingBadgeProps = {
  appliesTo: Promotion["applies_to"];
  size?: "sm" | "xs";
};

const CONFIG = {
  all: {
    label: "Everyone",
    icon: Users,
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  client_code_only: {
    label: "Client Code",
    icon: UserCheck,
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
  regular_only: {
    label: "Regular",
    icon: User,
    className:
      "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  },
} as const;

export function PromotionTargetingBadge({
  appliesTo,
  size = "xs",
}: PromotionTargetingBadgeProps) {
  const config = CONFIG[appliesTo];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 font-medium gap-1 inline-flex items-center",
        size === "xs" && "text-[10px] py-0 h-4",
        size === "sm" && "text-xs py-0.5 h-5",
        config.className
      )}
    >
      <Icon className={cn(size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3")} />
      {config.label}
    </Badge>
  );
}