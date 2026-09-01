"use client";
import { useEffect, useMemo, useState } from "react";
import Dashboard from "@/components/Dashboard";
import NewSession from "@/components/NewSession";
import ActiveSession, {
  Session,
  Trade,
  TradeResult,
} from "@/components/ActiveSession";
import TradeHistory from "@/components/TradeHistory";
import {
  calculateLot,
  LotCalculationResult,
} from "@/lib/lot-calculator";
import {
  calculateRisk,
  RiskEngineResult,
} from "@/lib/risk-engine";
import {
  loadSession,
  saveSession,
  clearSession,
} from "@/lib/storage";
/* =========================================================
   Types
========================================================= */
type Screen =
  | "dashboard"
  | "new"
  | "active"
  | "history";
type NewSessionData = {
  balance: number;
  target: number;
  maxLoss: number;
  baseRisk: number;
  pair: string;
  sl: number;
  tp: number;
};
/* =========================================================
   Main App
========================================================= */
export default function Home() {
  const [screen, setScreen] =
    useState<Screen>("dashboard");
  const [session, setSession] =
    useState<Session | null>(null);
  const [loaded, setLoaded] =
    useState(false);
  /* =======================================================
     Load saved session
  ======================================================= */
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setSession(saved as Session);
      if (saved.status === "active") {
        setScreen("active");
      }
    }
    setLoaded(true);
  }, []);
  /* =======================================================
     Save session automatically
  ======================================================= */
  useEffect(() => {
    if (!loaded || !session) {
      return;
    }
    saveSession(session);
  }, [session, loaded]);
  /* =======================================================
     Risk Engine
  ======================================================= */
  const risk: RiskEngineResult | null =
    useMemo(() => {
      if (!session) {
        return null;
      }
      return calculateRisk({
        balance: session.balance,
        startBalance:
          session.startBalance,
        target: session.target,
        maxLoss: session.maxLoss,
        baseRiskPercent:
          session.baseRisk,
        trades: session.trades.map(
          (trade) => trade.result
        ),
      });
    }, [session]);
  /* =======================================================
     Lot Calculator
  ======================================================= */
  const lotCalculation:
    | LotCalculationResult
    | null = useMemo(() => {
    if (!session || !risk) {
      return null;
    }
    if (!risk.shouldTrade) {
      return null;
    }
    return calculateLot({
      balance: session.balance,
      riskPercent:
        risk.currentRiskPercent,
      stopLossPips:
        session.sl,
      pipValuePerStandardLot: 10,
      minLot: 0.01,
      maxLot: 100,
      lotStep: 0.01,
    });
  }, [session, risk]);
  /* =======================================================
     Create New Session
  ======================================================= */
  function handleCreateSession(
    data: NewSessionData
  ) {
    const newSession: Session = {
      balance: data.balance,
      startBalance: data.balance,
      target: data.target,
      maxLoss: data.maxLoss,
      baseRisk: data.baseRisk,
      pair: data.pair,
      sl: data.sl,
      tp: data.tp,
      trades: [],
      createdAt:
        new Date().toISOString(),
      status: "active",
    };
    setSession(newSession);
    setScreen("active");
  }
  /* =======================================================
     Register Trade Result
  ======================================================= */
  function handleTradeResult(
    result: TradeResult
  ) {
    if (!session || !lotCalculation) {
      return;
    }
    if (risk && !risk.shouldTrade) {
      return;
    }
    const lot =
      lotCalculation.lot;
    const riskMoney =
      lotCalculation.riskMoney;
    /*
     * الربح/الخسارة هنا محسوب بطريقة
     * مبسطة للنسخة التجريبية.
     *
     * WIN:
     * TP × Pip Value × Lot
     *
     * LOSS:
     * SL × Pip Value × Lot
     */
    const pipValue =
      10;
    const pnl =
      result === "WIN"
        ? lot *
          session.tp *
          pipValue
        : -(
            lot *
            session.sl *
            pipValue
          );
    const trade: Trade = {
      id:
        session.trades.length + 1,
      pair:
        session.pair,
      lot,
      riskMoney,
      sl:
        session.sl,
      tp:
        session.tp,
      result,
      pnl:
        Number(pnl.toFixed(2)),
      time:
        new Date().toLocaleTimeString(
          "ar-DZ",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
    };
    const newBalance =
      Number(
        (
          session.balance +
          pnl
        ).toFixed(2)
      );
    const updatedTrades = [
      ...session.trades,
      trade,
    ];
    /*
     * نحسب حالة المخاطر الجديدة
     * بعد تسجيل الصفقة.
     */
    const nextRisk =
      calculateRisk({
        balance:
          newBalance,
        startBalance:
          session.startBalance,
        target:
          session.target,
        maxLoss:
          session.maxLoss,
        baseRiskPercent:
          session.baseRisk,
        trades:
          updatedTrades.map(
            (item) => item.result
          ),
      });
    const updatedSession: Session = {
      ...session,
      balance:
        newBalance,
      trades:
        updatedTrades,
      status:
        nextRisk.shouldTrade
          ? "active"
          : "complete",
    };
    setSession(
      updatedSession
    );
  }
  /* =======================================================
     Start New Session
  ======================================================= */
  function handleNewSession() {
    setScreen("new");
  }
  /* =======================================================
     Clear Current Session
  ======================================================= */
  function handleClearSession() {
    clearSession();
    setSession(null);
    setScreen("dashboard");
  }
  /* =======================================================
     Loading
  ======================================================= */
  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
          <p className="mt-4 text-xs text-white/30">
            جاري تحميل التطبيق...
          </p>
        </div>
      </main>
    );
  }
  /* =======================================================
     Dashboard
  ======================================================= */
  if (screen === "dashboard") {
    return (
      <Dashboard
        session={session}
        onNewSession={
          handleNewSession
        }
        onContinue={() =>
          setScreen("active")
        }
        onHistory={() =>
          setScreen("history")
        }
      />
    );
  }
  /* =======================================================
     New Session
  ======================================================= */
  if (screen === "new") {
    return (
      <NewSession
        onBack={() =>
          setScreen(
            session
              ? "active"
              : "dashboard"
          )
        }
        onCreate={
          handleCreateSession
        }
      />
    );
  }
  /* =======================================================
     Trade History
  ======================================================= */
  if (screen === "history") {
    return (
      <TradeHistory
        session={session}
        onBack={() =>
          setScreen(
            session
              ? "active"
              : "dashboard"
          )
        }
        onClear={
          handleClearSession
        }
      />
    );
  }
  /* =======================================================
     Active Session
  ======================================================= */
  if (
    screen === "active" &&
    session &&
    risk &&
    lotCalculation
  ) {
    return (
      <ActiveSession
        session={
          session
        }
        riskPct={
          risk.currentRiskPercent
        }
        recommendation={{
          lot:
            lotCalculation.lot,
          riskMoney:
            lotCalculation.riskMoney,
          potential:
            lotCalculation.lot *
            session.tp *
            10,
        }}
        onBack={() =>
          setScreen("dashboard")
        }
        onResult={
          handleTradeResult
        }
        onHistory={() =>
          setScreen("history")
        }
        onNewSession={
          handleNewSession
        }
      />
    );
  }
  /* =======================================================
     Session exists but trading stopped
     ======================================================= */
  if (
    screen === "active" &&
    session &&
    risk &&
    !risk.shouldTrade
  ) {
    return (
      <ActiveSession
        session={{
          ...session,
          status: "complete",
        }}
        riskPct={
          risk.currentRiskPercent
        }
        recommendation={{
          lot: 0,
          riskMoney: 0,
          potential: 0,
        }}
        onBack={() =>
          setScreen("dashboard")
        }
        onResult={() => {}}
        onHistory={() =>
          setScreen("history")
        }
        onNewSession={
          handleNewSession
        }
      />
    );
  }
  /* =======================================================
     Fallback
  ======================================================= */
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0f1319] p-6 text-center">
        <h1 className="text-lg font-black">
          Forex Risk Manager
        </h1>
        <p className="mt-2 text-xs leading-5 text-white/35">
          لا توجد جلسة تداول نشطة.
        </p>
        <button
          type="button"
          onClick={
            handleNewSession
          }
          className="mt-5 h-12 w-full rounded-2xl bg-emerald-400 text-sm font-black text-black"
        >
          إنشاء جلسة جديدة
        </button>
      </div>
    </main>
  );
}
