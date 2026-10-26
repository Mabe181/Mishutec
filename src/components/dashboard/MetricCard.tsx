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
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const badgeVariantMap = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  neutral: "bg-slate-800 text-slate-400 border-slate-700",
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
    <div className={`bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 sm:p-5 transition-all shadow-sm flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400 tracking-wide">
          {title}
        </span>
        <div
          className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${accentColorMap[accentColor]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3">
        <div className="text-lg sm:text-2xl font-bold tracking-tight text-white font-mono truncate">
          {value}
        </div>
        {subtitle && (
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 leading-snug line-clamp-1 sm:line-clamp-none">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
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
