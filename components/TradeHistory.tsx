"use client";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  CircleX,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
export type TradeResult = "WIN" | "LOSS";
export type Trade = {
  id: number;
  pair: string;
  lot: number;
  riskMoney: number;
  sl: number;
  tp: number;
  result: TradeResult;
  pnl: number;
  time: string;
};
export type Session = {
  balance: number;
  startBalance: number;
  target: number;
  maxLoss: number;
  baseRisk: number;
  pair: string;
  sl: number;
  tp: number;
  trades: Trade[];
  createdAt: string;
  status: "active" | "complete";
};
type TradeHistoryProps = {
  session: Session | null;
  onBack: () => void;
  onClear: () => void;
};
export default function TradeHistory({
  session,
  onBack,
  onClear,
}: TradeHistoryProps) {
  if (!session) {
    return (
      <div className="min-h-screen bg-[#07090d] text-white">
        <div className="mx-auto min-h-screen max-w-md bg-[#0b0e13]">
          <Header onBack={onBack} />
          <main className="px-5 pb-10">
            <EmptyState />
          </main>
        </div>
      </div>
    );
  }
  const trades = session.trades;
  const wins = trades.filter(
    (trade) => trade.result === "WIN"
  ).length;
  const losses = trades.filter(
    (trade) => trade.result === "LOSS"
  ).length;
  const totalProfit = trades.reduce(
    (sum, trade) => sum + trade.pnl,
    0
  );
  const winRate =
    trades.length > 0
      ? (wins / trades.length) * 100
      : 0;
  const averageTrade =
    trades.length > 0
      ? totalProfit / trades.length
      : 0;
  const bestTrade =
    trades.length > 0
      ? Math.max(...trades.map((trade) => trade.pnl))
      : 0;
  const worstTrade =
    trades.length > 0
      ? Math.min(...trades.map((trade) => trade.pnl))
      : 0;
  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto min-h-screen max-w-md bg-[#0b0e13]">
        {/* Header */}
        <Header onBack={onBack} />
        <main className="px-5 pb-10">
          {/* Page title */}
          <div className="mb-5">
            <div className="text-[10px] font-bold tracking-[0.24em] text-emerald-400">
              TRADE HISTORY
            </div>
            <h1 className="mt-2 text-2xl font-black">
              سجل الصفقات
            </h1>
            <p className="mt-2 text-xs leading-5 text-white/35">
              جميع الصفقات المسجلة في جلسة التداول الحالية.
            </p>
          </div>
          {/* Session summary */}
          <section className="rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-white/30">
                  SESSION RESULT
                </div>
                <div
                  className={`mt-2 text-3xl font-black ${
                    totalProfit >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {totalProfit >= 0 ? "+" : ""}
                  ${totalProfit.toFixed(2)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
                <BarChart3
                  size={22}
                  className="text-white/50"
                />
              </div>
            </div>
          </section>
          {/* Statistics */}
          <section className="mt-4 grid grid-cols-2 gap-3">
            <StatCard
              label="إجمالي الصفقات"
              value={String(trades.length)}
            />
            <StatCard
              label="نسبة الفوز"
              value={`${winRate.toFixed(1)}%`}
              valueClass={
                winRate >= 50
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            />
            <StatCard
              label="WIN"
              value={String(wins)}
              icon={
                <CheckCircle2
                  size={14}
                  className="text-emerald-400"
                />
              }
            />
            <StatCard
              label="LOSS"
              value={String(losses)}
              icon={
                <CircleX
                  size={14}
                  className="text-red-400"
                />
              }
            />
          </section>
          {/* Performance */}
          <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">
            <h2 className="text-sm font-bold">
              أداء الجلسة
            </h2>
            <div className="mt-4 space-y-4">
              <PerformanceRow
                label="متوسط الصفقة"
                value={`${averageTrade >= 0 ? "+" : ""}$${averageTrade.toFixed(2)}`}
                positive={averageTrade >= 0}
              />
              <PerformanceRow
                label="أفضل صفقة"
                value={`+$${bestTrade.toFixed(2)}`}
                positive
              />
              <PerformanceRow
                label="أسوأ صفقة"
                value={`${worstTrade >= 0 ? "+" : ""}$${worstTrade.toFixed(2)}`}
                positive={worstTrade >= 0}
              />
              <PerformanceRow
                label="الرصيد الابتدائي"
                value={`$${session.startBalance.toFixed(2)}`}
              />
              <PerformanceRow
                label="الرصيد الحالي"
                value={`$${session.balance.toFixed(2)}`}
              />
            </div>
          </section>
          {/* Trade list */}
          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">
                الصفقات
              </h2>
              <span className="text-[10px] text-white/25">
                {trades.length} صفقة
              </span>
            </div>
            {trades.length === 0 ? (
              <EmptyTrades />
            ) : (
              <div className="space-y-2">
                {[...trades]
                  .reverse()
                  .map((trade) => (
                    <TradeRow
                      key={trade.id}
                      trade={trade}
                    />
                  ))}
              </div>
            )}
          </section>
          {/* Delete */}
          {trades.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-400/15 bg-red-400/[0.05] text-xs font-bold text-red-400 transition active:scale-[0.98]"
            >
              <Trash2 size={16} />
              حذف الجلسة والصفقات
            </button>
          )}
          {/* Disclaimer */}
          <p className="mt-6 text-center text-[10px] leading-5 text-white/20">
            سجل الصفقات يعرض النتائج التي أدخلتها يدويًا.
            لا يتم تنفيذ أو إرسال أي أوامر تداول من هذه الشاشة.
          </p>
        </main>
      </div>
    </div>
  );
}
/* ================================= */
/* Header */
/* ================================= */
function Header({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-5 pb-5 pt-6">
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] transition active:scale-95"
        aria-label="رجوع"
      >
        <ArrowLeft size={19} />
      </button>
      <div className="text-center">
        <div className="text-[10px] font-bold tracking-[0.24em] text-emerald-400">
          FOREX RISK
        </div>
        <div className="mt-1 text-sm font-bold">
          History
        </div>
      </div>
      <div className="w-10" />
    </header>
  );
}
/* ================================= */
/* Stat Card */
/* ================================= */
function StatCard({
  label,
  value,
  valueClass = "",
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.07] bg-[#0f1319] p-4">
      <div className="flex items-center gap-1.5 text-[10px] text-white/30">
        {icon}
        <span>
          {label}
        </span>
      </div>
      <div
        className={`mt-2 text-xl font-black ${valueClass}`}
      >
        {value}
      </div>
    </div>
  );
}
/* ================================= */
/* Performance Row */
/* ================================= */
function PerformanceRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/35">
        {label}
      </span>
      <span
        className={`text-xs font-bold ${
          positive === true
            ? "text-emerald-400"
            : positive === false
            ? "text-red-400"
            : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
/* ================================= */
/* Trade Row */
/* ================================= */
function TradeRow({
  trade,
}: {
  trade: Trade;
}) {
  const isWin = trade.result === "WIN";
  return (
    <div className="rounded-[20px] border border-white/[0.07] bg-[#0f1319] p-4">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isWin
                ? "bg-emerald-400/10"
                : "bg-red-400/10"
            }`}
          >
            {isWin ? (
              <TrendingUp
                size={19}
                className="text-emerald-400"
              />
            ) : (
              <TrendingDown
                size={19}
                className="text-red-400"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">
                {trade.pair}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[8px] font-black ${
                  isWin
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-red-400/10 text-red-400"
                }`}
              >
                {trade.result}
              </span>
            </div>
            <div className="mt-1 text-[9px] text-white/25">
              #{trade.id} · {trade.time}
            </div>
          </div>
        </div>
        {/* PNL */}
        <div className="text-right">
          <div
            className={`text-sm font-black ${
              trade.pnl >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {trade.pnl >= 0 ? "+" : ""}
            ${trade.pnl.toFixed(2)}
          </div>
          <div className="mt-1 text-[9px] text-white/25">
            {trade.lot.toFixed(2)} LOT
          </div>
        </div>
      </div>
      {/* Details */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
        <Detail
          label="Risk"
          value={`$${trade.riskMoney.toFixed(2)}`}
        />
        <Detail
          label="SL"
          value={`${trade.sl} Pips`}
        />
        <Detail
          label="TP"
          value={`${trade.tp} Pips`}
        />
      </div>
    </div>
  );
}
/* ================================= */
/* Detail */
/* ================================= */
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[9px] text-white/25">
        {label}
      </div>
      <div className="mt-1 text-[10px] font-bold text-white/65">
        {value}
      </div>
    </div>
  );
}
/* ================================= */
/* Empty Trades */
/* ================================= */
function EmptyTrades() {
  return (
    <div className="rounded-[22px] border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center">
      <BarChart3
        size={28}
        className="mx-auto text-white/20"
      />
      <div className="mt-3 text-sm font-bold text-white/50">
        لا توجد صفقات
      </div>
      <p className="mt-2 text-[10px] leading-5 text-white/25">
        ستظهر الصفقات هنا بعد تسجيل نتيجة
        أول صفقة.
      </p>
    </div>
  );
}
/* ================================= */
/* Empty Session */
/* ================================= */
function EmptyState() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
          <BarChart3
            size={27}
            className="text-white/20"
          />
        </div>
        <h2 className="mt-5 text-lg font-bold">
          لا توجد جلسة
        </h2>
        <p className="mt-2 text-xs leading-5 text-white/30">
          أنشئ جلسة تداول أولًا حتى يظهر
          سجل الصفقات.
        </p>
      </div>
    </div>
  );
}
