/**
 * Forex Risk Manager
 * Safe Local Storage
 */
/* =========================================================
   Storage Keys
========================================================= */
export const SESSION_STORAGE_KEY =
  "forex-risk-manager-session";
export const SETTINGS_STORAGE_KEY =
  "forex-risk-manager-settings";
/* =========================================================
   Account Types
========================================================= */
export type StoredAccountType =
  | "QT_REAL"
  | "QT_DEMO"
  | "FOREX"
  | "TOURNAMENT";
/* =========================================================
   Trade
========================================================= */
export type StoredTrade = {
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
/* =========================================================
   Session
========================================================= */
export type StoredSession = {
  balance: number;
  startBalance: number;
  target: number;
  maxLoss: number;
  baseRisk: number;
  pair: string;
  sl: number;
  tp: number;
  trades: StoredTrade[];
  createdAt: string;
  status: "active" | "complete";
  /*
   * Optional fields keep compatibility
   * with sessions created by older versions.
   */
  accountType?: StoredAccountType;
  payout?: number;
  pipValuePerStandardLot?: number;
  minLot?: number;
  maxLot?: number;
  lotStep?: number;
};
/* =========================================================
   Browser Check
========================================================= */
function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}
/* =========================================================
   Safe JSON Parse
========================================================= */
function parseJSON(
  value: string
): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
/* =========================================================
   Save Session
========================================================= */
export function saveSession(
  session: StoredSession
): boolean {
  if (!isBrowser()) {
    return false;
  }
  try {
    const serialized =
      JSON.stringify(session);
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      serialized
    );
    return true;
  } catch (error) {
    console.error(
      "Forex Risk Manager: failed to save session",
      error
    );
    return false;
  }
}
/* =========================================================
   Load Session
========================================================= */
export function loadSession():
  | StoredSession
  | null {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw =
      window.localStorage.getItem(
        SESSION_STORAGE_KEY
      );
    if (!raw) {
      return null;
    }
    const parsed =
      parseJSON(raw);
    if (!isValidSession(parsed)) {
      /*
       * Remove corrupted or incompatible
       * session data.
       */
      try {
        window.localStorage.removeItem(
          SESSION_STORAGE_KEY
        );
      } catch {
        // Ignore storage errors.
      }
      return null;
    }
    /*
     * Normalize optional fields so old
     * sessions continue working.
     */
    return normalizeSession(parsed);
  } catch (error) {
    console.error(
      "Forex Risk Manager: failed to load session",
      error
    );
    try {
      window.localStorage.removeItem(
        SESSION_STORAGE_KEY
      );
    } catch {
      // Ignore storage errors.
    }
    return null;
  }
}
/* =========================================================
   Normalize Session
========================================================= */
function normalizeSession(
  session: StoredSession
): StoredSession {
  return {
    ...session,
    accountType:
      session.accountType ??
      "QT_REAL",
    payout:
      typeof session.payout === "number" &&
      Number.isFinite(session.payout) &&
      session.payout > 0 &&
      session.payout <= 100
        ? session.payout
        : 92,
    pipValuePerStandardLot:
      typeof session.pipValuePerStandardLot ===
        "number" &&
      Number.isFinite(
        session.pipValuePerStandardLot
      ) &&
      session.pipValuePerStandardLot > 0
        ? session.pipValuePerStandardLot
        : 10,
    minLot:
      typeof session.minLot === "number" &&
      Number.isFinite(session.minLot) &&
      session.minLot > 0
        ? session.minLot
        : 0.01,
    maxLot:
      typeof session.maxLot === "number" &&
      Number.isFinite(session.maxLot) &&
      session.maxLot > 0
        ? session.maxLot
        : 100,
    lotStep:
      typeof session.lotStep === "number" &&
      Number.isFinite(session.lotStep) &&
      session.lotStep > 0
        ? session.lotStep
        : 0.01,
  };
}
/* =========================================================
   Clear Session
========================================================= */
export function clearSession(): boolean {
  if (!isBrowser()) {
    return false;
  }
  try {
    window.localStorage.removeItem(
      SESSION_STORAGE_KEY
    );
    return true;
  } catch (error) {
    console.error(
      "Forex Risk Manager: failed to clear session",
      error
    );
    return false;
  }
}
/* =========================================================
   Update Session
========================================================= */
export function updateSession(
  updater: (
    session: StoredSession
  ) => StoredSession
):
  | StoredSession
  | null {
  const current =
    loadSession();
  if (!current) {
    return null;
  }
  try {
    const updated =
      updater(current);
    if (!isValidSession(updated)) {
      console.error(
        "Forex Risk Manager: updater returned invalid session"
      );
      return null;
    }
    saveSession(updated);
    return updated;
  } catch (error) {
    console.error(
      "Forex Risk Manager: failed to update session",
      error
    );
    return null;
  }
}
/* =========================================================
   Add Trade
========================================================= */
export function addTrade(
  trade: StoredTrade
):
  | StoredSession
  | null {
  return updateSession(
    (session) => ({
      ...session,
      trades: [
        ...session.trades,
        trade,
      ],
    })
  );
}
/* =========================================================
   Session Status
========================================================= */
export function setSessionStatus(
  status:
    | "active"
    | "complete"
):
  | StoredSession
  | null {
  return updateSession(
    (session) => ({
      ...session,
      status,
    })
  );
}
/* =========================================================
   Settings
========================================================= */
export function saveSettings<
  T extends Record<string, unknown>
>(
  settings: T
): boolean {
  if (!isBrowser()) {
    return false;
  }
  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
    return true;
  } catch (error) {
    console.error(
      "Forex Risk Manager: failed to save settings",
      error
    );
    return false;
  }
}
/* =========================================================
   Load Settings
========================================================= */
export function loadSettings<
  T extends Record<string, unknown>
>(): T | null {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw =
      window.localStorage.getItem(
        SETTINGS_STORAGE_KEY
      );
    if (!raw) {
      return null;
    }
    const parsed =
      parseJSON(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    return parsed as T;
  } catch (error) {
    console.error(
      "Forex Risk Manager: failed to load settings",
      error
    );
    return null;
  }
}
/* =========================================================
   Validation
========================================================= */
function isValidSession(
  value: unknown
): value is StoredSession {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }
  const session =
    value as Record<string, unknown>;
  /* ---------------------------------------------
     Balance
  --------------------------------------------- */
  if (
    typeof session.balance !== "number" ||
    !Number.isFinite(session.balance) ||
    session.balance <= 0
  ) {
    return false;
  }
  /* ---------------------------------------------
     Start Balance
  --------------------------------------------- */
  if (
    typeof session.startBalance !== "number" ||
    !Number.isFinite(
      session.startBalance
    ) ||
    session.startBalance <= 0
  ) {
    return false;
  }
  /* ---------------------------------------------
     Target
  --------------------------------------------- */
  if (
    typeof session.target !== "number" ||
    !Number.isFinite(session.target) ||
    session.target < 0
  ) {
    return false;
  }
  /* ---------------------------------------------
     Max Loss
  --------------------------------------------- */
  if (
    typeof session.maxLoss !== "number" ||
    !Number.isFinite(session.maxLoss) ||
    session.maxLoss < 0
  ) {
    return false;
  }
  /* ---------------------------------------------
     Base Risk
  --------------------------------------------- */
  if (
    typeof session.baseRisk !== "number" ||
    !Number.isFinite(session.baseRisk) ||
    session.baseRisk <= 0
  ) {
    return false;
  }
  /* ---------------------------------------------
     Pair
  --------------------------------------------- */
  if (
    typeof session.pair !== "string" ||
    session.pair.trim().length === 0
  ) {
    return false;
  }
  /* ---------------------------------------------
     Stop Loss
  --------------------------------------------- */
  if (
    typeof session.sl !== "number" ||
    !Number.isFinite(session.sl) ||
    session.sl <= 0
  ) {
    return false;
  }
  /* ---------------------------------------------
     Take Profit
  --------------------------------------------- */
  if (
    typeof session.tp !== "number" ||
    !Number.isFinite(session.tp) ||
    session.tp <= 0
  ) {
    return false;
  }
  /* ---------------------------------------------
     Trades
  --------------------------------------------- */
  if (
    !Array.isArray(session.trades)
  ) {
    return false;
  }
  for (
    const trade of session.trades
  ) {
    if (
      !isValidTrade(trade)
    ) {
      return false;
    }
  }
  /* ---------------------------------------------
     Status
  --------------------------------------------- */
  if (
    session.status !== "active" &&
    session.status !== "complete"
  ) {
    return false;
  }
  /* ---------------------------------------------
     Created At
  --------------------------------------------- */
  if (
    typeof session.createdAt !== "string" ||
    session.createdAt.trim().length === 0
  ) {
    return false;
  }
  /* ---------------------------------------------
     Account Type
  --------------------------------------------- */
  if (
    session.accountType !== undefined &&
    session.accountType !== "QT_REAL" &&
    session.accountType !== "QT_DEMO" &&
    session.accountType !== "FOREX" &&
    session.accountType !== "TOURNAMENT"
  ) {
    return false;
  }
  /* ---------------------------------------------
     Payout
  --------------------------------------------- */
  if (
    session.payout !== undefined &&
    (
      typeof session.payout !== "number" ||
      !Number.isFinite(session.payout) ||
      session.payout <= 0 ||
      session.payout > 100
    )
  ) {
    return false;
  }
  /* ---------------------------------------------
     Pip Value
  --------------------------------------------- */
  if (
    session.pipValuePerStandardLot !== undefined &&
    (
      typeof session.pipValuePerStandardLot !==
        "number" ||
      !Number.isFinite(
        session.pipValuePerStandardLot
      ) ||
      session.pipValuePerStandardLot <= 0
    )
  ) {
    return false;
  }
  /* ---------------------------------------------
     Lot Settings
  --------------------------------------------- */
  if (
    session.minLot !== undefined &&
    (
      typeof session.minLot !== "number" ||
      !Number.isFinite(session.minLot) ||
      session.minLot <= 0
    )
  ) {
    return false;
  }
  if (
    session.maxLot !== undefined &&
    (
      typeof session.maxLot !== "number" ||
      !Number.isFinite(session.maxLot) ||
      session.maxLot <= 0
    )
  ) {
    return false;
  }
  if (
    session.lotStep !== undefined &&
    (
      typeof session.lotStep !== "number" ||
      !Number.isFinite(session.lotStep) ||
      session.lotStep <= 0
    )
  ) {
    return false;
  }
  return true;
}
/* =========================================================
   Trade Validation
========================================================= */
function isValidTrade(
  value: unknown
): value is StoredTrade {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }
  const trade =
    value as Record<string, unknown>;
  if (
    typeof trade.id !== "number" ||
    !Number.isFinite(trade.id)
  ) {
    return false;
  }
  if (
    typeof trade.pair !== "string" ||
    trade.pair.trim().length === 0
  ) {
    return false;
  }
  if (
    typeof trade.lot !== "number" ||
    !Number.isFinite(trade.lot) ||
    trade.lot <= 0
  ) {
    return false;
  }
  if (
    typeof trade.riskMoney !== "number" ||
    !Number.isFinite(
      trade.riskMoney
    ) ||
    trade.riskMoney < 0
  ) {
    return false;
  }
  if (
    typeof trade.sl !== "number" ||
    !Number.isFinite(trade.sl) ||
    trade.sl <= 0
  ) {
    return false;
  }
  if (
    typeof trade.tp !== "number" ||
    !Number.isFinite(trade.tp) ||
    trade.tp <= 0
  ) {
    return false;
  }
  if (
    trade.result !== "WIN" &&
    trade.result !== "LOSS"
  ) {
    return false;
  }
  if (
    typeof trade.pnl !== "number" ||
    !Number.isFinite(trade.pnl)
  ) {
    return false;
  }
  if (
    typeof trade.time !== "string"
  ) {
    return false;
  }
  return true;
}
