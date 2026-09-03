"use client";

import {
  ArrowLeft,
  History,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  CircleAlert,
  Target,
} from "lucide-react";

import type {
  StoredSession,
  StoredTrade,
} from "@/lib/storage";

/* =========================================================
   Shared Types
========================================================= */

export type TradeResult = "WIN" | "LOSS";

export type Trade = StoredTrade;

export type Session = StoredSession;

/* =========================================================
   Recommendation
========================================================= */

type Recommendation = {
  lot: number;
  riskMoney: number;
  potentialProfit: number;
};

/* =========================================================
   Props
========================================================= */

type ActiveSessionProps = {
  session: Session;
  riskPct: number;
  recommendation: Recommendation;

  onBack: () => void;

  onResult: (
    result: TradeResult
  ) => void;

  onHistory: () => void;

  onNewSession: () => void;
};

/* =========================================================
   Active Session
========================================================= */

export default function ActiveSession({
  session,
  riskPct,
  recommendation,
  onBack,
  onResult,
  onHistory,
  onNewSession,
}: ActiveSessionProps) {

  /* =======================================================
     Session Calculations
  ======================================================= */

  const profit =
    session.balance -
    session.startBalance;

  const remainingTarget =
    Math.max(
      0,
      session.target - profit
    );

  const targetProgress =
    session.target > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (profit /
              session.target) *
              100
          )
        )
      : 0;

  const lossUsed =
    Math.max(
      0,
      session.startBalance -
        session.balance
    );

  const lossProgress =
    session.maxLoss > 0
      ? Math.min(
          100,
          (lossUsed /
            session.maxLoss) *
            100
        )
      : 0;

  const targetReached =
    session.target > 0 &&
    profit >= session.target;

  const maxLossReached =
    session.maxLoss > 0 &&
    lossUsed >= session.maxLoss;

  const sessionComplete =
    session.status === "complete" ||
    targetReached ||
    maxLossReached;

  const riskReward =
    session.sl > 0
      ? session.tp /
        session.sl
      : 0;

  /* =======================================================
     Estimated Trades Remaining
  ======================================================= */

  const potentialProfit =
    Math.max(
      0,
      recommendation.potentialProfit
    );

  const estimatedTradesRemaining =
    remainingTarget > 0 &&
    potentialProfit > 0
      ? Math.ceil(
          remainingTarget /
            potentialProfit
        )
      : 0;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#07090d] text-white"
    >

      <div className="mx-auto min-h-screen max-w-md bg-[#0b0e13]">

        {/* =================================================
            Header
        ================================================= */}

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

            <h1 className="mt-1 text-base font-bold">
              التداول
            </h1>

          </div>

          <div className="w-10" />

        </header>

        <main className="px-5 pb-10">

          {/* =================================================
              Account Overview
          ================================================= */}

          <section className="grid grid-cols-2 gap-3">

            <InfoCard
              label="الرصيد الحالي"
              value={`$${session.balance.toFixed(
                2
              )}`}
            />

            <InfoCard
              label="نتيجة الجلسة"
              value={`${
                profit >= 0
                  ? "+"
                  : ""
              }$${profit.toFixed(2)}`}
              valueClass={
                profit >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            />

          </section>

          {/* =================================================
              Target Progress
          ================================================= */}

          <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-[10px] font-bold tracking-wider text-white/30">
                  DAILY TARGET
                </div>

                <div className="mt-2 text-lg font-black">
                  $
                  {Math.max(
                    0,
                    profit
                  ).toFixed(2)}
                </div>

              </div>

              <div className="text-right">

                <div className="text-xs font-bold text-white/60">
                  {targetProgress.toFixed(
                    0
                  )}
                  %
                </div>

                <div className="mt-1 text-[10px] text-white/30">
                  هدف $
                  {session.target.toFixed(
                    2
                  )}
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

            <div className="mt-3 text-[10px] text-white/30">

              {targetReached
                ? "🏆 تم الوصول إلى الهدف اليومي."
                : `متبقي $${remainingTarget.toFixed(
                    2
                  )}`}

            </div>

          </section>

          {/* =================================================
              Estimated Trades Remaining
          ================================================= */}

          {!targetReached &&
            !maxLossReached &&
            session.target > 0 && (
              <section className="mt-4 rounded-[24px] border border-emerald-400/10 bg-emerald-400/[0.04] p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">

                    <Target
                      size={19}
                      className="text-emerald-400"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between">

                      <span className="text-sm font-bold">
                        الصفقات المتبقية للهدف
                      </span>

                      <span className="text-2xl font-black text-emerald-400">
                        {estimatedTradesRemaining}
                      </span>

                    </div>

                    <div className="mt-1 text-[10px] leading-5 text-white/30">
                      عدد تقديري بناءً على الربح المتوقع
                      للصفقة الحالية
                    </div>

                  </div>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">

                  <div className="rounded-xl bg-white/[0.025] p-3">

                    <div className="text-[9px] text-white/25">
                      المتبقي للهدف
                    </div>

                    <div className="mt-1 text-sm font-bold">
                      $
                      {remainingTarget.toFixed(
                        2
                      )}
                    </div>

                  </div>

                  <div className="rounded-xl bg-white/[0.025] p-3">

                    <div className="text-[9px] text-white/25">
                      الربح المتوقع
                    </div>

                    <div className="mt-1 text-sm font-bold text-emerald-400">
                      +$
                      {potentialProfit.toFixed(
                        2
                      )}
                    </div>

                  </div>

                </div>

              </section>
            )}

          {/* =================================================
              Risk Protection
          ================================================= */}

          <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">

                <ShieldCheck
                  size={19}
                  className="text-emerald-400"
                />

              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-center justify-between">

                  <span className="text-sm font-bold">
                    إدارة المخاطر
                  </span>

                  <span className="text-sm font-black text-emerald-400">
                    {riskPct.toFixed(2)}
                    %
                  </span>

                </div>

                <div className="mt-1 text-[10px] text-white/30">
                  المخاطرة الحالية لكل صفقة
                </div>

              </div>

            </div>

            {/* Loss Limit */}

            <div className="mt-5">

              <div className="flex justify-between text-[10px]">

                <span className="text-white/30">
                  حد الخسارة اليومي
                </span>

                <span className="text-white/45">
                  $
                  {lossUsed.toFixed(2)}
                  {" / $"}
                  {session.maxLoss.toFixed(
                    2
                  )}
                </span>

              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                <div
                  className={`h-full rounded-full transition-all ${
                    lossProgress >= 80
                      ? "bg-red-400"
                      : "bg-white/30"
                  }`}
                  style={{
                    width: `${lossProgress}%`,
                  }}
                />

              </div>

            </div>

          </section>

          {/* =================================================
              Next Trade
          ================================================= */}

          <section className="mt-4 rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-[#111820] to-[#0e1218] p-6 text-center">

            <div className="text-[10px] font-bold tracking-[0.25em] text-white/35">
              NEXT TRADE
            </div>

            {sessionComplete ? (
              <>

                <div className="mt-7 flex justify-center">

                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-400/10">

                    <CircleAlert
                      size={34}
                      className="text-red-400"
                    />

                  </div>

                </div>

                <h2 className="mt-5 text-xl font-black">
                  توقف عن التداول
                </h2>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-white/35">

                  {targetReached
                    ? "تم تحقيق هدف الجلسة. الأفضل إيقاف التداول والمحافظة على النتيجة."
                    : "تم الوصول إلى حد الخسارة اليومي. تم إيقاف الجلسة لحماية رأس المال."}

                </p>

              </>
            ) : (
              <>

                {/* Lot */}

                <div className="mt-3 text-6xl font-black tracking-tight">

                  {recommendation.lot.toFixed(
                    2
                  )}

                </div>

                <div className="text-sm font-bold text-emerald-400">
                  LOT
                </div>

                {/* Pair */}

                <div className="mt-5 inline-flex rounded-full border border-white/[0.07] bg-white/[0.04] px-4 py-2 text-xs font-bold">

                  {session.pair}

                </div>

                {/* Trade Stats */}

                <div className="mt-6 grid grid-cols-3 gap-2">

                  <TradeStat
                    label="المخاطرة"
                    value={`$${recommendation.riskMoney.toFixed(
                      2
                    )}`}
                  />

                  <TradeStat
                    label="SL"
                    value={`${session.sl} Pips`}
                  />

                  <TradeStat
                    label="TP"
                    value={`${session.tp} Pips`}
                  />

                </div>

                {/* Risk Reward */}

                <div className="mt-5 border-t border-white/[0.07] pt-4">

                  <div className="flex items-center justify-between text-xs">

                    <span className="text-white/35">
                      Risk / Reward
                    </span>

                    <span className="font-bold">
                      1 :{" "}
                      {riskReward.toFixed(
                        2
                      )}
                    </span>

                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">

                    <span className="text-white/35">
                      الربح المحتمل
                    </span>

                    <span className="font-bold text-emerald-400">
                      +$
                      {recommendation.potentialProfit.toFixed(
                        2
                      )}
                    </span>

                  </div>

                </div>

              </>
            )}

          </section>

          {/* =================================================
              Result Buttons
          ================================================= */}

          {!sessionComplete && (
            <section className="mt-4">

              <div className="mb-3 text-center text-[10px] text-white/25">
                بعد إغلاق الصفقة اختر النتيجة
              </div>

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    onResult("WIN")
                  }
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-sm font-black text-emerald-400 transition active:scale-[0.98]"
                >

                  <TrendingUp size={19} />

                  WIN

                </button>

                <button
                  type="button"
                  onClick={() =>
                    onResult("LOSS")
                  }
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/[0.08] text-sm font-black text-red-400 transition active:scale-[0.98]"
                >

                  <TrendingDown size={19} />

                  LOSS

                </button>

              </div>

            </section>
          )}

          {/* =================================================
              Actions
          ================================================= */}

          <section className="mt-4 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={onHistory}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-xs font-bold text-white/70 transition active:scale-[0.98]"
            >

              <History size={17} />

              سجل الصفقات

            </button>

            <button
              type="button"
              onClick={onNewSession}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-xs font-bold text-white/70 transition active:scale-[0.98]"
            >

              <Plus size={17} />

              جلسة جديدة

            </button>

          </section>

          {/* =================================================
              Recent Trades
          ================================================= */}

          {session.trades.length > 0 && (
            <section className="mt-5">

              <div className="mb-3 flex items-center justify-between">

                <h3 className="text-sm font-bold">
                  آخر الصفقات
                </h3>

                <button
                  type="button"
                  onClick={onHistory}
                  className="text-[10px] text-emerald-400"
                >
                  عرض الكل
                </button>

              </div>

              <div className="space-y-2">

                {session.trades
                  .slice(-3)
                  .reverse()
                  .map((trade) => (

                    <div
                      key={trade.id}
                      className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#0f1319] p-3"
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${
                            trade.result === "WIN"
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >

                          {trade.result === "WIN"
                            ? "↑"
                            : "↓"}

                        </div>

                        <div>

                          <div className="text-xs font-bold">
                            {trade.pair}
                          </div>

                          <div className="mt-1 text-[9px] text-white/25">

                            {trade.lot.toFixed(2)}

                            {" LOT · "}

                            {trade.time}

                          </div>

                        </div>

                      </div>

                      <div
                        className={`text-xs font-black ${
                          trade.pnl >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >

                        {trade.pnl >= 0
                          ? "+"
                          : ""}

                        ${trade.pnl.toFixed(2)}

                      </div>

                    </div>

                  ))}

              </div>

            </section>
          )}

          {/* =================================================
              Disclaimer
          ================================================= */}

          <p className="mt-6 text-center text-[10px] leading-5 text-white/20">

            عدد الصفقات المتبقية تقديري ويعتمد على
            الربح المتوقع للصفقة الحالية. لا يضمن
            الوصول إلى الهدف، كما أن حجم اللوت أداة
            لإدارة المخاطر وليس توصية تداول.

          </p>

        </main>

      </div>

    </div>
  );
}

/* =========================================================
   Info Card
========================================================= */

function InfoCard({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/[0.07] bg-[#0f1319] p-4">

      <div className="text-[10px] text-white/30">
        {label}
      </div>

      <div
        className={`mt-2 text-xl font-black ${valueClass}`}
      >
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   Trade Stat
========================================================= */

function TradeStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.025] p-3">

      <div className="text-[9px] text-white/25">
        {label}
      </div>

      <div className="mt-1 text-xs font-bold">
        {value}
      </div>

    </div>
  );
}
