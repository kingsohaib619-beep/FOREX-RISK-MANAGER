/**
 * Forex Risk Manager
 * Local Storage
 */
export const SESSION_STORAGE_KEY =
  "forex-risk-manager-session";
export const SETTINGS_STORAGE_KEY =
  "forex-risk-manager-settings";
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
    if (!isValidSession(parsed)) {
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
     * إذا كانت البيانات القديمة تالفة،
     * نحذفها حتى لا يبقى التطبيق عالقًا.
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
  const updated =
    updater(current);
  saveSession(updated);
  return updated;
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
    return JSON.parse(raw) as T;
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
    value === null
  ) {
    return false;
  }
  const session =
    value as Record<string, unknown>;
  if (
    typeof session.balance !== "number" ||
    !Number.isFinite(session.balance) ||
    session.balance <= 0
  ) {
    return false;
  }
  if (
    typeof session.startBalance !== "number" ||
    !Number.isFinite(session.startBalance) ||
    session.startBalance <= 0
  ) {
    return false;
  }
  if (
    typeof session.target !== "number" ||
    !Number.isFinite(session.target) ||
    session.target < 0
  ) {
    return false;
  }
  if (
    typeof session.maxLoss !== "number" ||
    !Number.isFinite(session.maxLoss) ||
    session.maxLoss < 0
  ) {
    return false;
  }
  if (
    typeof session.baseRisk !== "number" ||
    !Number.isFinite(session.baseRisk) ||
    session.baseRisk <= 0
  ) {
    return false;
  }
  if (
    typeof session.pair !== "string" ||
    session.pair.trim().length === 0
  ) {
    return false;
  }
  if (
    typeof session.sl !== "number" ||
    !Number.isFinite(session.sl) ||
    session.sl <= 0
  ) {
    return false;
  }
  if (
    typeof session.tp !== "number" ||
    !Number.isFinite(session.tp) ||
    session.tp <= 0
  ) {
    return false;
  }
  if (
    !Array.isArray(session.trades)
  ) {
    return false;
  }
  if (
    session.status !== "active" &&
    session.status !== "complete"
  ) {
    return false;
  }
  if (
    typeof session.createdAt !== "string"
  ) {
    return false;
  }
  return true;
}
