"use client";
import {
  ArrowLeft,
  History,
  Plus,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
type SessionStatus = "active" | "complete";
type Trade = {
  id: number;
  pair: string;
  lot: number;
  riskMoney: number;
  sl: number;
  tp: number;
  result: "WIN" | "LOSS";
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
  status: SessionStatus;
};
type DashboardProps = {
  session: Session | null;
  onNewSession: () => void;
  onContinue: () => void;
  onHistory: () => void;
};
export default function Dashboard({
  session,
  onNewSession,
  onContinue,
  onHistory,
}: DashboardProps) {
  const profit = session
    ? session.balance - session.startBalance
    : 0;
  const targetProgress =
    session && session.target > 0
      ? Math.min(
          100,
          Math.max(0, (profit / session.target) * 100)
        )
      : 0;
  const isProfit = profit >= 0;
  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto min-h-screen max-w-md bg-[#0b0e13]">
        {/* Header */}
        <header className="px-5 pb-6 pt-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold tracking-[0.25em] text-emerald-400">
                FOREX RISK
              </div>
              <h1 className="mt-1 text-xl font-bold">
                Smart Manager
              </h1>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <ShieldCheck
                size={20}
                className="text-emerald-400"
              />
            </div>
          </div>
        </header>
        <main className="px-5 pb-28">
          {/* Main balance card */}
          <section className="rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#121921] to-[#0e1218] p-6">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Wallet size={15} />
              ACCOUNT BALANCE
            </div>
            <div className="mt-3 text-4xl font-black tracking-tight">
              $
              {session
                ? session.balance.toFixed(2)
                : "0.00"}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              {session ? (
                <>
                  {isProfit ? (
                    <TrendingUp
                      size={16}
                      className="text-emerald-400"
                    />
                  ) : (
                    <TrendingDown
                      size={16}
                      className="text-red-400"
                    />
                  )}
                  <span
                    className={
                      isProfit
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {isProfit ? "+" : ""}
                    ${profit.toFixed(2)}
                  </span>
                  <span className="text-white/30">
                    today
                  </span>
                </>
              ) : (
                <span className="text-white/30">
                  لا توجد جلسة نشطة
                </span>
              )}
            </div>
          </section>
          {/* No session */}
          {!session && (
            <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">
              <div className="mb-5">
                <div className="text-lg font-bold">
                  ابدأ جلسة التداول
                </div>
                <p className="mt-2 text-sm leading-6 text-white/40">
                  أدخل رأس المال والهدف والمخاطرة
                  ليحسب التطبيق حجم الصفقة المناسب.
                </p>
              </div>
              <button
                onClick={onNewSession}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 font-bold text-[#04120c] transition active:scale-[0.98]"
              >
                <Plus size={19} />
                ابدأ جلسة جديدة
              </button>
            </section>
          )}
          {/* Active session */}
          {session && (
            <>
              {/* Today's stats */}
              <section className="mt-4 grid grid-cols-3 gap-2">
                <StatCard
                  label="الهدف"
                  value={`$${session.target.toFixed(0)}`}
                  icon={<Target size={15} />}
                />
                <StatCard
                  label="أقصى خسارة"
                  value={`$${session.maxLoss.toFixed(0)}`}
                />
                <StatCard
                  label="الصفقات"
                  value={String(session.trades.length)}
                />
              </section>
              {/* Progress */}
              <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/40">
                      DAILY TARGET
                    </div>
                    <div className="mt-1 text-lg font-bold">
                      {isProfit ? "+" : ""}
                      ${profit.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/30">
                      {targetProgress.toFixed(0)}%
                    </div>
                    <div className="mt-1 text-xs text-white/40">
                      ${session.target.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{
                      width: `${targetProgress}%`,
                    }}
                  />
                </div>
                <div className="mt-3 text-[11px] text-white/30">
                  {profit >= session.target ? (
                    "🏆 تم تحقيق الهدف اليومي"
                  ) : (
                    <>
                      متبقي $
                      {Math.max(
                        0,
                        session.target - profit
                      ).toFixed(2)}
                    </>
                  )}
                </div>
              </section>
              {/* Session status */}
              <section className="mt-4 rounded-[24px] border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                    <ShieldCheck
                      size={19}
                      className="text-emerald-400"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {session.status === "active"
                        ? "الجلسة نشطة"
                        : "الجلسة مكتملة"}
                    </div>
                    <div className="mt-1 text-[11px] text-white/35">
                      {session.status === "active"
                        ? "يمكنك متابعة الصفقة التالية."
                        : "تم إنهاء جلسة التداول."}
                    </div>
                  </div>
                </div>
              </section>
              {/* Continue */}
              {session.status === "active" && (
                <button
                  onClick={onContinue}
                  className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 font-bold text-[#04120c] transition active:scale-[0.98]"
                >
                  متابعة الجلسة
                  <ArrowLeft size={18} />
                </button>
              )}
              {/* History */}
              <button
                onClick={onHistory}
                className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 text-sm font-bold transition active:scale-[0.98]"
              >
                <History size={17} />
                سجل الصفقات
              </button>
            </>
          )}
          {/* Disclaimer */}
          <div className="mt-7 text-center text-[10px] leading-5 text-white/20">
            Forex Risk Manager أداة لإدارة المخاطر
            وحساب حجم الصفقة، وليست توصية بالشراء
            أو البيع ولا تضمن الأرباح.
          </div>
        </main>
        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 border-t border-white/[0.08] bg-[#0b0e13]/95 px-6 py-3 backdrop-blur-xl">
          <NavItem
            active
            icon={<Wallet size={18} />}
            label="الرئيسية"
          />
          <NavItem
            icon={<TrendingUp size={18} />}
            label="الجلسة"
            onClick={session ? onContinue : onNewSession}
          />
          <NavItem
            icon={<History size={18} />}
            label="السجل"
            onClick={onHistory}
          />
        </nav>
      </div>
    </div>
  );
}
/* -------------------------------- */
/* Stat Card */
/* -------------------------------- */
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.07] bg-[#0f1319] p-4">
      <div className="flex items-center gap-1 text-[10px] text-white/30">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-bold">
        {value}
      </div>
    </div>
  );
}
/* -------------------------------- */
/* Navigation */
/* -------------------------------- */
function NavItem({
  active = false,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1.5 bg-transparent text-[10px] transition ${
        active
          ? "text-emerald-400"
          : "text-white/30"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
