"use client";

import { useEffect, useMemo, useState } from “react”;

import Dashboard from “@/components/Dashboard”;
import NewSession from “@/components/NewSession”;
import ActiveSession from “@/components/ActiveSession”;
import TradeHistory from “@/components/TradeHistory”;

import type {
Session,
Trade,
TradeResult,
} from “@/components/ActiveSession”;

import type {
Pair,
AccountType,
} from “@/components/NewSession”;

import {
calculateTrading,
} from “@/lib/lot-calculator”;

import {
calculateRisk,
} from “@/lib/risk-engine”;

import {
loadSession,
saveSession,
clearSession,
} from “@/lib/storage”;

/* =========================================================
Screen
========================================================= */

type Screen =
| “dashboard”
| “new”
| “active”
| “history”;

/* =========================================================
Session Form
========================================================= */

type SessionForm = {
accountType: AccountType;

balance: string;
target: string;
maxLoss: string;
risk: string;

pair: Pair;

sl: string;
tp: string;

payout: string;
};

/* =========================================================
Initial Form
========================================================= */

const INITIAL_FORM: SessionForm = {
accountType: “QT_REAL”,

balance: “1000”,
target: “50”,
maxLoss: “30”,
risk: “1”,

pair: “EUR/USD”,

sl: “20”,
tp: “40”,

payout: “92”,
};

/* =========================================================
Page
========================================================= */

export default function Page() {
const [screen, setScreen] =
useState(“dashboard”);

const [session, setSession] =
useState<Session | null>(null);

const [form, setForm] =
useState(INITIAL_FORM);

const [ready, setReady] =
useState(false);

/* =======================================================
Load Saved Session
======================================================= */

useEffect(() => {
const stored = loadSession();

if (stored) {
  setSession(stored as Session);
  if (stored.status === "active") {
    setScreen("active");
  }
}
setReady(true);

}, []);

/* =======================================================
Save Session
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

const risk = useMemo(() => {
if (!session) {
return null;
}

return calculateRisk({
  balance: session.balance,
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
Trading Calculation
======================================================= */

const tradingCalculation = useMemo(() => {
if (!session || !risk) {
return null;
}

if (!risk.shouldTrade) {
  return null;
}
const storedSession = session as Session & {
  accountType?: AccountType;
  payout?: number;
  pipValuePerStandardLot?: number;
  minLot?: number;
  maxLot?: number;
  lotStep?: number;
};
const accountType =
  storedSession.accountType ??
  "QT_REAL";
const payout =
  storedSession.payout ??
  92;
const pipValuePerStandardLot =
  storedSession.pipValuePerStandardLot ??
  10;
const minLot =
  storedSession.minLot ??
  0.01;
const maxLot =
  storedSession.maxLot ??
  100;
const lotStep =
  storedSession.lotStep ??
  0.01;
return calculateTrading({
  accountType,
  balance:
    session.balance,
  riskPercent:
    risk.currentRiskPercent,
  payout,
  stopLossPips:
    session.sl,
  takeProfitPips:
    session.tp,
  pipValuePerStandardLot,
  minLot,
  maxLot,
  lotStep,
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
const payout =
  Number(form.payout);
/* ---------------------------------------------
   Basic Validation
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
   Pocket Option Payout Validation
--------------------------------------------- */
const isPocketOption =
  form.accountType === "QT_REAL" ||
  form.accountType === "QT_DEMO" ||
  form.accountType === "TOURNAMENT";
if (isPocketOption) {
  if (
    !Number.isFinite(payout) ||
    payout <= 0 ||
    payout > 100
  ) {
    return;
  }
}
/* ---------------------------------------------
   New Session
--------------------------------------------- */
const newSession = {
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
  status:
    "active",
  accountType:
    form.accountType,
  payout:
    isPocketOption
      ? payout
      : 0,
  pipValuePerStandardLot:
    10,
  minLot:
    0.01,
  maxLot:
    100,
  lotStep:
    0.01,
} as Session;
setSession(newSession);
setScreen("active");

}

/* =======================================================
Form Update
======================================================= */

function updateForm(
values: Partial
) {
setForm((current) => ({
…current,
…values,
}));
}

/* =======================================================
Register Trade Result
======================================================= */

function handleTradeResult(
result: TradeResult
) {
if (
!session ||
!risk ||
!tradingCalculation
) {
return;
}

if (!risk.shouldTrade) {
  return;
}
if (!tradingCalculation.isValid) {
  return;
}
/* ---------------------------------------------
   P/L
--------------------------------------------- */
const pnl =
  result === "WIN"
    ? tradingCalculation.potentialProfit
    : -tradingCalculation.potentialLoss;
const safePnl =
  Number(pnl.toFixed(2));
/* ---------------------------------------------
   Lot
--------------------------------------------- */
const lot =
  tradingCalculation.lot;
/* ---------------------------------------------
   Risk Money
--------------------------------------------- */
const riskMoney =
  tradingCalculation.riskMoney;
/* ---------------------------------------------
   New Balance
--------------------------------------------- */
const newBalance =
  Number(
    (
      session.balance +
      safePnl
    ).toFixed(2)
  );
/* ---------------------------------------------
   New Trade
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
   Trades
--------------------------------------------- */
const trades = [
  ...session.trades,
  trade,
];
/* ---------------------------------------------
   Calculate Next Risk
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
        (item) =>
          item.result
      ),
  });
/* ---------------------------------------------
   Session Protection
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
const sessionComplete =
  targetReached ||
  maxLossReached ||
  !nextRisk.shouldTrade;
/* ---------------------------------------------
   Update Session
--------------------------------------------- */
const updatedSession = {
  ...session,
  balance:
    Math.max(
      0,
      newBalance
    ),
  trades,
  status:
    sessionComplete
      ? "complete"
      : "active",
} as Session;
setSession(updatedSession);

}

/* =======================================================
Navigation
======================================================= */

function goDashboard() {
setScreen(“dashboard”);
}

function goNewSession() {
setScreen(“new”);
}

function goActiveSession() {
if (!session) {
setScreen(“new”);
return;
}

setScreen("active");

}

function goHistory() {
setScreen(“history”);
}

/* =======================================================
Clear Session
======================================================= */

function handleClearSession() {
clearSession();

setSession(null);
setForm(INITIAL_FORM);
setScreen("dashboard");

}

/* =======================================================
Loading
======================================================= */

if (!ready) {
return (
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

if (screen === “dashboard”) {
return (
<Dashboard
session={session}

    onNewSession={
      goNewSession
    }
    onContinue={
      goActiveSession
    }
    onHistory={
      goHistory
    }
  />
);

}

/* =======================================================
New Session
======================================================= */

if (screen === “new”) {
return (
<NewSession
accountType={
form.accountType
}

    setAccountType={(value) =>
      updateForm({
        accountType:
          value,
      })
    }
    balance={
      form.balance
    }
    setBalance={(value) =>
      updateForm({
        balance:
          value,
      })
    }
    target={
      form.target
    }
    setTarget={(value) =>
      updateForm({
        target:
          value,
      })
    }
    maxLoss={
      form.maxLoss
    }
    setMaxLoss={(value) =>
      updateForm({
        maxLoss:
          value,
      })
    }
    risk={
      form.risk
    }
    setRisk={(value) =>
      updateForm({
        risk:
          value,
      })
    }
    pair={
      form.pair
    }
    setPair={(value) =>
      updateForm({
        pair:
          value,
      })
    }
    sl={
      form.sl
    }
    setSl={(value) =>
      updateForm({
        sl:
          value,
      })
    }
    tp={
      form.tp
    }
    setTp={(value) =>
      updateForm({
        tp:
          value,
      })
    }
    payout={
      form.payout
    }
    setPayout={(value) =>
      updateForm({
        payout:
          value,
      })
    }
    onBack={
      session
        ? goActiveSession
        : goDashboard
    }
    onStart={
      handleStartSession
    }
  />
);

}

/* =======================================================
History
======================================================= */

if (screen === “history”) {
return (
<TradeHistory
session={session}

    onBack={
      session
        ? goActiveSession
        : goDashboard
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
screen === “active” &&
session &&
risk
) {
const recommendation = {
lot:
tradingCalculation?.lot ??
0,

  riskMoney:
    tradingCalculation?.riskMoney ??
    0,
  potentialProfit:
    tradingCalculation?.potentialProfit ??
    0,
};
return (
  <ActiveSession
    session={
      session
    }
    riskPct={
      risk.currentRiskPercent
    }
    recommendation={
      recommendation
    }
    onBack={
      goDashboard
    }
    onResult={
      handleTradeResult
    }
    onHistory={
      goHistory
    }
    onNewSession={
      goNewSession
    }
  />
);

}

/* =======================================================
Fallback
======================================================= */

return (
FOREX RISK
    <h1 className="mt-3 text-xl font-black">
      Forex Risk Manager
    </h1>
    <p className="mt-2 text-xs leading-5 text-white/35">
      ابدأ جلسة تداول جديدة
      لحساب المخاطرة واللوت.
    </p>
    <button
      type="button"
      onClick={
        goNewSession
      }
      className="mt-6 h-13 w-full rounded-2xl bg-emerald-400 text-sm font-black text-[#04120c]"
    >
      إنشاء جلسة جديدة
    </button>
  </div>
</main>

);
}
