"use client";
import { useEffect, useMemo, useState } from "react";
import Dashboard from "@/components/Dashboard";
import NewSession, {
  type Pair,
} from "@/components/NewSession";
import ActiveSession, {
  type Session,
  type Trade,
  type TradeResult,
} from "@/components/ActiveSession";
import TradeHistory from "@/components/TradeHistory";
import {
  calculateRisk,
  type RiskEngineResult,
} from "@/lib/risk-engine";
import {
  calculateLot,
  type LotCalculationResult,
} from "@/lib/lot-calculator";
import {
  loadSession,
  saveSession,
  clearSession,
} from "@/lib/storage";
/* =========================================================
   Screen
========================================================= */
type Screen =
  | "dashboard"
  | "new"
  | "active"
  | "history";
/* =========================================================
   New Session Form
========================================================= */
type SessionForm = {
  balance: string;
  target: string;
  maxLoss: string;
  risk: string;
  pair: Pair;
  sl: string;
  tp: string;
};
/* =========================================================
   Initial Form
========================================================= */
const INITIAL_FORM: SessionForm = {
  balance: "1000",
  target: "50",
  maxLoss: "30",
  risk: "1",
  pair: "EUR/USD",
  sl: "20",
  tp: "40",
};
/* =========================================================
   Main Page
========================================================= */
export default function Page() {
  const [screen, setScreen] =
    useState<Screen>("dashboard");
  const [session, setSession] =
    useState<Session | null>(null);
  const [form, setForm] =
    useState<SessionForm>(INITIAL_FORM);
  const [ready, setReady] =
    useState(false);
  /* =======================================================
     Load saved session
  ======================================================= */
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setSession(saved);
    }
    setReady(true);
  }, []);
  /* =======================================================
     Save session
  ======================================================= */
  useEffect(() => {
    if (!ready) {
      return;
    }
    if (session) {
      saveSession(session);
    }
  }, [session, ready]);
  /* =======================================================
     Risk Engine
  ======================================================= */
  const risk: RiskEngineResult | null =
    useMemo(() => {
      if (!session) {
        return null;
      }
      return calculateRisk({
        balance:
          session.balance,
        startBalance:
          session.startBalance,
        target:
          session.target,
        maxLoss:
          session.maxLoss,
        baseRiskPercent:
          session.baseRisk,
        trades:
          session.trades.map(
            (trade) => trade.result
          ),
      });
    }, [session]);
  /* =======================================================
     Lot Calculator
  ======================================================= */
  const recommendation:
    | LotCalculationResult
    | null = useMemo(() => {
    if (!session || !risk) {
      return null;
    }
    if (!risk.shouldTrade) {
      return {
        lot: 0,
        riskMoney: 0,
        stopLossPips: session.sl,
        pipValuePerLot: 10,
        theoreticalLot: 0,
        potentialProfit: 0,
        isValid: false,
      };
    }
    return calculateLot({
      balance:
        session.balance,
      riskPercent:
        risk.currentRiskPercent,
      stopLossPips:
        session.sl,
      /*
       * قيمة تقريبية للوت القياسي.
       *
       * سيتم تحسينها لاحقًا لتصبح
       * مرتبطة بالزوج وعملة الحساب.
       */
      pipValuePerStandardLot: 10,
      minLot: 0.01,
      maxLot: 100,
      lotStep: 0.01,
    });
  }, [session, risk]);
  /* =======================================================
     Create Session
  ======================================================= */
  function handleStartSession() {
    const balance =
      Number(form.balance);
    const target =
      Number(form.target);
    const maxLoss =
      Number(form.maxLoss);
    const baseRisk =
      Number(form.risk);
    const sl =
      Number(form.sl);
    const tp =
      Number(form.tp);
    /* ---------------------------------------------
       Validation
    --------------------------------------------- */
    if (
      !Number.isFinite(balance) ||
      balance <= 0
    ) {
      return;
    }
    if (
      !Number.isFinite(target) ||
      target <= 0
    ) {
      return;
    }
    if (
      !Number.isFinite(maxLoss) ||
      maxLoss <= 0
    ) {
      return;
    }
    if (
      !Number.isFinite(baseRisk) ||
      baseRisk <= 0
    ) {
      return;
    }
    if (
      !Number.isFinite(sl) ||
      sl <= 0
    ) {
      return;
    }
    if (
      !Number.isFinite(tp) ||
      tp <= 0
    ) {
      return;
    }
    /* ---------------------------------------------
       Create session
    --------------------------------------------- */
    const newSession: Session = {
      balance,
      startBalance:
        balance,
      target,
      maxLoss,
      baseRisk,
      pair:
        form.pair,
      sl,
      tp,
      trades: [],
      createdAt:
        new Date().toISOString(),
      status: "active",
    };
    setSession(
      newSession
    );
    setScreen("active");
  }
  /* =======================================================
     Update Form
  ======================================================= */
  function updateForm(
    patch: Partial<SessionForm>
  ) {
    setForm(
      (current) => ({
        ...current,
        ...patch,
      })
    );
  }
  /* =======================================================
     Register WIN / LOSS
  ======================================================= */
  function handleTradeResult(
    result: TradeResult
  ) {
    if (
      !session ||
      !risk ||
      !recommendation
    ) {
      return;
    }
    if (
      !risk.shouldTrade
    ) {
      return;
    }
    if (
      !recommendation.isValid
    ) {
      return;
    }
    const lot =
      recommendation.lot;
    const riskMoney =
      recommendation.riskMoney;
    /*
     * النسخة الحالية تستخدم قيمة Pip
     * تقريبية للوت القياسي.
     */
    const pipValue =
      10;
    /* ---------------------------------------------
       Calculate P&L
    --------------------------------------------- */
    const pnl =
      result === "WIN"
        ? lot *
          session.tp *
          pipValue
        : -riskMoney;
    const safePnl =
      Number(
        pnl.toFixed(2)
      );
    /* ---------------------------------------------
       New balance
    --------------------------------------------- */
    const newBalance =
      Number(
        (
          session.balance +
          safePnl
        ).toFixed(2)
      );
    /* ---------------------------------------------
       Create trade
    --------------------------------------------- */
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
        safePnl,
      time:
        new Date().toLocaleTimeString(
          "ar-DZ",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
    };
    /* ---------------------------------------------
       Add trade
    --------------------------------------------- */
    const trades = [
      ...session.trades,
      trade,
    ];
    /* ---------------------------------------------
       Calculate next risk
    --------------------------------------------- */
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
          trades.map(
            (item) => item.result
          ),
      });
    /* ---------------------------------------------
       Determine session status
    --------------------------------------------- */
    const profit =
      newBalance -
      session.startBalance;
    const loss =
      session.startBalance -
      newBalance;
    const targetReached =
      profit >= session.target;
    const maxLossReached =
      loss >= session.maxLoss;
    const completed =
      targetReached ||
      maxLossReached ||
      !nextRisk.shouldTrade;
    /* ---------------------------------------------
       Update session
    --------------------------------------------- */
    const updatedSession: Session = {
      ...session,
      balance:
        Math.max(
          0,
          newBalance
        ),
      trades,
      status:
        completed
          ? "complete"
          : "active",
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
     Continue Session
  ======================================================= */
  function handleContinue() {
    if (!session) {
      setScreen("new");
      return;
    }
    setScreen("active");
  }
  /* =======================================================
     Clear Session
  ======================================================= */
  function handleClearSession() {
    clearSession();
    setSession(null);
    setForm(
      INITIAL_FORM
    );
    setScreen("dashboard");
  }
  /* =======================================================
     Loading
  ======================================================= */
  if (!ready) {
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
     DASHBOARD
  ======================================================= */
  if (
    screen === "dashboard"
  ) {
    return (
      <Dashboard
        session={
          session
        }
        onNewSession={
          handleNewSession
        }
        onContinue={
          handleContinue
        }
        onHistory={() =>
          setScreen("history")
        }
      />
    );
  }
  /* =======================================================
     NEW SESSION
  ======================================================= */
  if (
    screen === "new"
  ) {
    return (
      <NewSession
        balance={
          form.balance
        }
        setBalance={(value) =>
          updateForm({
            balance: value,
          })
        }
        target={
          form.target
        }
        setTarget={(value) =>
          updateForm({
            target: value,
          })
        }
        maxLoss={
          form.maxLoss
        }
        setMaxLoss={(value) =>
          updateForm({
            maxLoss: value,
          })
        }
        risk={
          form.risk
        }
        setRisk={(value) =>
          updateForm({
            risk: value,
          })
        }
        pair={
          form.pair
        }
        setPair={(value) =>
          updateForm({
            pair: value,
          })
        }
        sl={
          form.sl
        }
        setSl={(value) =>
          updateForm({
            sl: value,
          })
        }
        tp={
          form.tp
        }
        setTp={(value) =>
          updateForm({
            tp: value,
          })
        }
        onBack={() =>
          setScreen(
            session
              ? "active"
              : "dashboard"
          )
        }
        onStart={
          handleStartSession
        }
      />
    );
  }
  /* =======================================================
     TRADE HISTORY
  ======================================================= */
  if (
    screen === "history"
  ) {
    return (
      <TradeHistory
        session={
          session
        }
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
     ACTIVE SESSION
  ======================================================= */
  if (
    screen === "active" &&
    session &&
    risk &&
    recommendation
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
            recommendation.lot,
          riskMoney:
            recommendation.riskMoney,
          potential:
            recommendation.potentialProfit,
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
     FALLBACK
  ======================================================= */
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-5 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/[0.08] bg-[#0f1319] p-6 text-center">
        <div className="text-[10px] font-bold tracking-[0.25em] text-emerald-400">
          FOREX RISK
        </div>
        <h1 className="mt-3 text-xl font-black">
          لا توجد جلسة نشطة
        </h1>
        <p className="mt-2 text-xs leading-5 text-white/35">
          ابدأ جلسة جديدة لحساب
          حجم المخاطرة واللوت.
        </p>
        <button
          type="button"
          onClick={
            handleNewSession
          }
          className="mt-6 h-13 w-full rounded-2xl bg-emerald-400 text-sm font-black text-[#04120c]"
        >
          إنشاء جلسة جديدة
        </button>
      </div>
    </main>
  );
}
