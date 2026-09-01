/**
 * Local Storage Manager
 *
 * يحفظ بيانات Forex Risk Manager
 * داخل متصفح المستخدم.
 */
export const SESSION_STORAGE_KEY =
  "forex-risk-manager-session";
export const SETTINGS_STORAGE_KEY =
  "forex-risk-manager-settings";
/**
 * نوع الصفقة.
 */
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
/**
 * نوع الجلسة.
 */
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
/**
 * التأكد من أننا في المتصفح.
 */
function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}
/**
 * حفظ الجلسة.
 */
export function saveSession(
  session: StoredSession
): boolean {
  if (!isBrowser()) {
    return false;
  }
  try {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(session)
    );
    return true;
  } catch (error) {
    console.error(
      "Failed to save session:",
      error
    );
    return false;
  }
}
/**
 * قراءة الجلسة.
 */
export function loadSession():
  | StoredSession
  | null {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw =
      localStorage.getItem(
        SESSION_STORAGE_KEY
      );
    if (!raw) {
      return null;
    }
    const session = JSON.parse(
      raw
    ) as StoredSession;
    if (!isValidSession(session)) {
      return null;
    }
    return session;
  } catch (error) {
    console.error(
      "Failed to load session:",
      error
    );
    return null;
  }
}
/**
 * حذف الجلسة.
 */
export function clearSession(): boolean {
  if (!isBrowser()) {
    return false;
  }
  try {
    localStorage.removeItem(
      SESSION_STORAGE_KEY
    );
    return true;
  } catch (error) {
    console.error(
      "Failed to clear session:",
      error
    );
    return false;
  }
}
/**
 * تحديث الجلسة.
 */
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
/**
 * إضافة صفقة للجلسة.
 */
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
/**
 * تغيير حالة الجلسة.
 */
export function setSessionStatus(
  status: "active" | "complete"
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
/**
 * حفظ إعدادات عامة.
 */
export function saveSettings<
  T extends Record<string, unknown>
>(
  settings: T
): boolean {
  if (!isBrowser()) {
    return false;
  }
  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
    return true;
  } catch (error) {
    console.error(
      "Failed to save settings:",
      error
    );
    return false;
  }
}
/**
 * قراءة الإعدادات.
 */
export function loadSettings<
  T extends Record<string, unknown>
>(): T | null {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw =
      localStorage.getItem(
        SETTINGS_STORAGE_KEY
      );
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(
      "Failed to load settings:",
      error
    );
    return null;
  }
}
/**
 * التحقق من صحة الجلسة.
 */
function isValidSession(
  session: StoredSession
): boolean {
  if (!session) {
    return false;
  }
  if (
    typeof session.balance !==
      "number" ||
    session.balance <= 0
  ) {
    return false;
  }
  if (
    typeof session.startBalance !==
      "number" ||
    session.startBalance <= 0
  ) {
    return false;
  }
  if (
    typeof session.target !==
      "number" ||
    session.target < 0
  ) {
    return false;
  }
  if (
    typeof session.maxLoss !==
      "number" ||
    session.maxLoss < 0
  ) {
    return false;
  }
  if (
    typeof session.baseRisk !==
      "number" ||
    session.baseRisk <= 0
  ) {
    return false;
  }
  if (
    typeof session.pair !==
      "string" ||
    session.pair.length === 0
  ) {
    return false;
  }
  if (
    typeof session.sl !==
      "number" ||
    session.sl <= 0
  ) {
    return false;
  }
  if (
    typeof session.tp !==
      "number" ||
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
  return true;
}
