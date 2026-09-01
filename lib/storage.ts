/**
 * Forex Risk Manager
 * Local Storage
 *
 * متوافق مع:
 * - accountType
 * - payout
 * - pipValuePerStandardLot
 * - minLot
 * - maxLot
 * - lotStep
 */

export const SESSION_STORAGE_KEY =
  "forex-risk-manager-session";

export const SETTINGS_STORAGE_KEY =
  "forex-risk-manager-settings";

/* =========================================================
   Account Type
========================================================= */

export type AccountType =
  | "QT_REAL"
  | "QT_DEMO"
  | "FOREX_REAL"
  | "FOREX_DEMO"
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

  status:
    | "active"
    | "complete";

  /* ---------------------------------------------
     Account Settings
  --------------------------------------------- */

  accountType: AccountType;

  payout: number;

  /* ---------------------------------------------
     Lot Settings
  --------------------------------------------- */

  pipValuePerStandardLot: number;

  minLot: number;

  maxLot: number;

  lotStep: number;
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
   Number Helper
========================================================= */

function isFiniteNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

/* =========================================================
   Account Type Helper
========================================================= */

function isAccountType(
  value: unknown
): value is AccountType {
  return (
    value === "QT_REAL" ||
    value === "QT_DEMO" ||
    value === "FOREX_REAL" ||
    value === "FOREX_DEMO" ||
    value === "TOURNAMENT"
  );
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
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(session)
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

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !isValidSession(parsed)
    ) {
      /*
       * نحاول ترقية الجلسات القديمة
       * قبل حذفها.
       */

      const migrated =
        migrateSession(parsed);

      if (migrated) {
        saveSession(migrated);

        return migrated;
      }

      window.localStorage.removeItem(
        SESSION_STORAGE_KEY
      );

      return null;
    }

    return parsed;
  } catch (error) {
    console.error(
      "Forex Risk Manager: failed to load session",
      error
    );

    /*
     * البيانات تالفة.
     * نحذفها حتى لا يبقى التطبيق
     * عالقًا عند التحميل.
     */

    try {
      window.localStorage.removeItem(
        SESSION_STORAGE_KEY
      );
    } catch {
      // Ignore storage errors
    }

    return null;
  }
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

    if (
      !isValidSession(updated)
    ) {
      console.error(
        "Forex Risk Manager: updater produced invalid session"
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

    const parsed: unknown =
      JSON.parse(raw);

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
   Validate Trade
========================================================= */

function isValidTrade(
  value: unknown
): value is StoredTrade {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const trade =
    value as Record<string, unknown>;

  if (
    !isFiniteNumber(trade.id) ||
    trade.id < 1
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
    !isFiniteNumber(trade.lot) ||
    trade.lot <= 0
  ) {
    return false;
  }

  if (
    !isFiniteNumber(trade.riskMoney) ||
    trade.riskMoney < 0
  ) {
    return false;
  }

  if (
    !isFiniteNumber(trade.sl) ||
    trade.sl <= 0
  ) {
    return false;
  }

  if (
    !isFiniteNumber(trade.tp) ||
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
    !isFiniteNumber(trade.pnl)
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

/* =========================================================
   Validation
========================================================= */

function isValidSession(
  value: unknown
): value is StoredSession {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const session =
    value as Record<string, unknown>;

  /* ---------------------------------------------
     Balance
  --------------------------------------------- */

  if (
    !isFiniteNumber(
      session.balance
    ) ||
    session.balance <= 0
  ) {
    return false;
  }

  if (
    !isFiniteNumber(
      session.startBalance
    ) ||
    session.startBalance <= 0
  ) {
    return false;
  }

  /* ---------------------------------------------
     Targets
  --------------------------------------------- */

  if (
    !isFiniteNumber(
      session.target
    ) ||
    session.target < 0
  ) {
    return false;
  }

  if (
    !isFiniteNumber(
      session.maxLoss
    ) ||
    session.maxLoss < 0
  ) {
    return false;
  }

  /* ---------------------------------------------
     Risk
  --------------------------------------------- */

  if (
    !isFiniteNumber(
      session.baseRisk
    ) ||
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
     SL / TP
  --------------------------------------------- */

  if (
    !isFiniteNumber(session.sl) ||
    session.sl <= 0
  ) {
    return false;
  }

  if (
    !isFiniteNumber(session.tp) ||
    session.tp <= 0
  ) {
    return false;
  }

  /* ---------------------------------------------
     Trades
  --------------------------------------------- */

  if (
    !Array.isArray(
      session.trades
    )
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
     Date
  --------------------------------------------- */

  if (
    typeof session.createdAt !== "string"
  ) {
    return false;
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
     Account Type
  --------------------------------------------- */

  if (
    !isAccountType(
      session.accountType
    )
  ) {
    return false;
  }

  /* ---------------------------------------------
     Payout
  --------------------------------------------- */

  if (
    !isFiniteNumber(
      session.payout
    ) ||
    session.payout <= 0 ||
    session.payout > 100
  ) {
    return false;
  }

  /* ---------------------------------------------
     Lot Configuration
  --------------------------------------------- */

  if (
    !isFiniteNumber(
      session.pipValuePerStandardLot
    ) ||
    session.pipValuePerStandardLot <= 0
  ) {
    return false;
  }

  if (
    !isFiniteNumber(
      session.minLot
    ) ||
    session.minLot <= 0
  ) {
    return false;
  }

  if (
    !isFiniteNumber(
      session.maxLot
    ) ||
    session.maxLot <= 0 ||
    session.maxLot < session.minLot
  ) {
    return false;
  }

  if (
    !isFiniteNumber(
      session.lotStep
    ) ||
    session.lotStep <= 0
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   Migrate Old Session
========================================================= */

function migrateSession(
  value: unknown
):
  | StoredSession
  | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const old =
    value as Record<string, unknown>;

  /*
   * الجلسات القديمة لم تكن تحتوي
   * على accountType / payout / lot settings.
   */

  const balance =
    isFiniteNumber(old.balance)
      ? old.balance
      : 0;

  const startBalance =
    isFiniteNumber(
      old.startBalance
    )
      ? old.startBalance
      : balance;

  const target =
    isFiniteNumber(old.target)
      ? old.target
      : 0;

  const maxLoss =
    isFiniteNumber(old.maxLoss)
      ? old.maxLoss
      : 0;

  const baseRisk =
    isFiniteNumber(old.baseRisk)
      ? old.baseRisk
      : 1;

  const pair =
    typeof old.pair === "string"
      ? old.pair
      : "EUR/USD";

  const sl =
    isFiniteNumber(old.sl)
      ? old.sl
      : 20;

  const tp =
    isFiniteNumber(old.tp)
      ? old.tp
      : 40;

  const trades =
    Array.isArray(old.trades)
      ? old.trades.filter(
          isValidTrade
        )
      : [];

  const createdAt =
    typeof old.createdAt === "string"
      ? old.createdAt
      : new Date().toISOString();

  const status =
    old.status === "complete"
      ? "complete"
      : "active";

  const accountType =
    isAccountType(
      old.accountType
    )
      ? old.accountType
      : "QT_REAL";

  const payout =
    isFiniteNumber(
      old.payout
    ) &&
    old.payout > 0 &&
    old.payout <= 100
      ? old.payout
      : 92;

  const pipValuePerStandardLot =
    isFiniteNumber(
      old.pipValuePerStandardLot
    ) &&
    old.pipValuePerStandardLot > 0
      ? old.pipValuePerStandardLot
      : 10;

  const minLot =
    isFiniteNumber(
      old.minLot
    ) &&
    old.minLot > 0
      ? old.minLot
      : 0.01;

  const maxLot =
    isFiniteNumber(
      old.maxLot
    ) &&
    old.maxLot >= minLot
      ? old.maxLot
      : 100;

  const lotStep =
    isFiniteNumber(
      old.lotStep
    ) &&
    old.lotStep > 0
      ? old.lotStep
      : 0.01;

  const migrated: StoredSession = {
    balance,
    startBalance,

    target,
    maxLoss,

    baseRisk,

    pair,

    sl,
    tp,

    trades,

    createdAt,

    status,

    accountType,

    payout,

    pipValuePerStandardLot,

    minLot,

    maxLot,

    lotStep,
  };

  if (
    !isValidSession(
      migrated
    )
  ) {
    return null;
  }

  return migrated;
}
