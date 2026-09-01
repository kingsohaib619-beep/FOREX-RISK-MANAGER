"use client";
import {
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
type RiskStatus =
  | "SAFE"
  | "CAUTION"
  | "STOP";
type RiskCardProps = {
  pair: string;
  lot: number;
  riskMoney: number;
  riskPercent: number;
  sl: number;
  tp: number;
  potentialProfit: number;
  status?: RiskStatus;
  consecutiveLosses?: number;
  onWin?: () => void;
  onLoss?: () => void;
};
export default function RiskCard({
  pair,
  lot,
  riskMoney,
  riskPercent,
  sl,
  tp,
  potentialProfit,
  status = "SAFE",
  consecutiveLosses = 0,
  onWin,
  onLoss,
}: RiskCardProps) {
  const riskReward =
    sl > 0 ? tp / sl : 0;
  const statusConfig = {
    SAFE: {
      label: "مخاطرة آمنة",
      description:
        "يمكن متابعة الخطة الحالية.",
      icon: ShieldCheck,
      box: "border-emerald-400/10 bg-emerald-400/[0.035]",
      iconBox: "bg-emerald-400/10",
      iconColor: "text-emerald-400",
      textColor: "text-emerald-400",
    },
    CAUTION: {
      label: "انتبه للمخاطرة",
      description:
        "تم تخفيض حجم المخاطرة لحماية الحساب.",
      icon: AlertTriangle,
      box: "border-yellow-400/10 bg-yellow-400/[0.035]",
      iconBox: "bg-yellow-400/10",
      iconColor: "text-yellow-400",
      textColor: "text-yellow-400",
    },
    STOP: {
      label: "توقف عن التداول",
      description:
        "تم الوصول إلى مستوى الحماية.",
      icon: AlertTriangle,
      box: "border-red-400/10 bg-red-400/[0.035]",
      iconBox: "bg-red-400/10",
      iconColor: "text-red-400",
      textColor: "text-red-400",
    },
  };
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-[#121921] to-[#0e1218]">
      {/* ================================= */}
      {/* Header */}
      {/* ================================= */}
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
        <div>
          <div className="text-[9px] font-bold tracking-[0.25em] text-white/30">
            SMART RISK
          </div>
          <div className="mt-1 text-sm font-bold">
            الصفقة القادمة
          </div>
        </div>
        <div className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[10px] font-bold text-white/60">
          {pair}
        </div>
      </div>
      {/* ================================= */}
      {/* Lot */}
      {/* ================================= */}
      <div className="px-5 pb-5 pt-7 text-center">
        <div className="text-[10px] font-bold tracking-[0.25em] text-white/30">
          RECOMMENDED LOT
        </div>
        <div className="mt-2 text-6xl font-black tracking-tight">
          {lot.toFixed(2)}
        </div>
        <div className="mt-1 text-xs font-bold text-emerald-400">
          LOT
        </div>
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-4 py-2">
          <ShieldCheck
            size={14}
            className="text-emerald-400"
          />
          <span className="text-[10px] text-white/50">
            محسوب حسب المخاطرة الحالية
          </span>
        </div>
      </div>
      {/* ================================= */}
      {/* Risk numbers */}
      {/* ================================= */}
      <div className="grid grid-cols-3 gap-2 px-5">
        <Metric
          label="المخاطرة"
          value={`$${riskMoney.toFixed(2)}`}
          sub={`${riskPercent.toFixed(2)}%`}
        />
        <Metric
          label="Stop Loss"
          value={`${sl}`}
          sub="Pips"
        />
        <Metric
          label="Take Profit"
          value={`${tp}`}
          sub="Pips"
        />
      </div>
      {/* ================================= */}
      {/* Reward */}
      {/* ================================= */}
      <div className="mx-5 mt-4 rounded-2xl bg-white/[0.025] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/35">
            Risk / Reward
          </span>
          <span className="text-sm font-black">
            1 : {riskReward.toFixed(2)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-white/35">
            الربح المحتمل
          </span>
          <span className="text-sm font-black text-emerald-400">
            +${potentialProfit.toFixed(2)}
          </span>
        </div>
      </div>
      {/* ================================= */}
      {/* Status */}
      {/* ================================= */}
      <div
        className={`mx-5 mt-4 rounded-2xl border p-4 ${config.box}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBox}`}
          >
            <StatusIcon
              size={19}
              className={config.iconColor}
            />
          </div>
          <div className="min-w-0">
            <div
              className={`text-xs font-bold ${config.textColor}`}
            >
              {config.label}
            </div>
            <div className="mt-1 text-[10px] leading-5 text-white/35">
              {config.description}
            </div>
          </div>
        </div>
      </div>
      {/* ================================= */}
      {/* Loss streak */}
      {/* ================================= */}
      {consecutiveLosses > 0 && (
        <div className="mx-5 mt-3 flex items-center justify-between rounded-2xl border border-red-400/10 bg-red-400/[0.035] px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingDown
              size={15}
              className="text-red-400"
            />
            <span className="text-[10px] text-white/45">
              الخسائر المتتالية
            </span>
          </div>
          <span className="text-xs font-black text-red-400">
            {consecutiveLosses}
          </span>
        </div>
      )}
      {/* ================================= */}
      {/* Result buttons */}
      {/* ================================= */}
      {(onWin || onLoss) && status !== "STOP" && (
        <div className="grid grid-cols-2 gap-3 p-5">
          {onWin && (
            <button
              type="button"
              onClick={onWin}
              className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.08] text-xs font-black text-emerald-400 transition active:scale-[0.98]"
            >
              <TrendingUp size={17} />
              WIN
            </button>
          )}
          {onLoss && (
            <button
              type="button"
              onClick={onLoss}
              className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-red-400/15 bg-red-400/[0.06] text-xs font-black text-red-400 transition active:scale-[0.98]"
            >
              <TrendingDown size={17} />
              LOSS
            </button>
          )}
        </div>
      )}
      {/* ================================= */}
      {/* Stop message */}
      {/* ================================= */}
      {status === "STOP" && (
        <div className="p-5">
          <div className="flex h-13 items-center justify-center rounded-2xl bg-red-400/[0.07] text-xs font-black text-red-400">
            التداول متوقف لحماية الحساب
          </div>
        </div>
      )}
      {/* ================================= */}
      {/* Footer */}
      {/* ================================= */}
      <div className="border-t border-white/[0.06] px-5 py-3 text-center">
        <p className="text-[9px] leading-4 text-white/20">
          اللوت المقترح يعتمد على قيمة المخاطرة
          ووقف الخسارة. لا يضمن الربح.
        </p>
      </div>
    </section>
  );
}
/* ================================= */
/* Metric */
/* ================================= */
function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.025] p-3 text-center">
      <div className="text-[9px] text-white/25">
        {label}
      </div>
      <div className="mt-2 text-sm font-black">
        {value}
      </div>
      <div className="mt-1 text-[9px] text-white/25">
        {sub}
      </div>
    </div>
  );
}
