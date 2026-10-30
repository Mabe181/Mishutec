import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: "success" | "warning" | "danger" | "info" | "neutral";
  };
  accentColor?: "cyan" | "emerald" | "amber" | "rose" | "violet" | "blue";
  className?: string;
}

const accentColorMap = {
  cyan: "text-cyan-700 bg-cyan-50 border border-cyan-200/80",
  emerald: "text-emerald-700 bg-emerald-50 border border-emerald-200/80",
  amber: "text-amber-700 bg-amber-50 border border-amber-200/80",
  rose: "text-rose-700 bg-rose-50 border border-rose-200/80",
  violet: "text-purple-700 bg-purple-50 border border-purple-200/80",
  blue: "text-blue-700 bg-blue-50 border border-blue-200/80",
};

const badgeVariantMap = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  accentColor = "cyan",
  className = "",
}: MetricCardProps) {
  return (
    <div className={`bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-3.5 sm:p-5 transition-all shadow-xs flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 tracking-wide">
          {title}
        </span>
        <div
          className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${accentColorMap[accentColor]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3">
        <div className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-mono truncate">
          {value}
        </div>
        {subtitle && (
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 leading-snug line-clamp-1 sm:line-clamp-none">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border truncate ${badgeVariantMap[badge.variant]}`}
          >
            {badge.text}
          </span>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">SQL Server</span>
        </div>
      )}
    </div>
  );
}
