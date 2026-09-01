/**
 * Smart Risk Engine
 *
 * الهدف:
 * تنظيم المخاطرة أثناء جلسة التداول.
 *
 * لا يحاول ضمان الربح.
 *
 * يقوم بـ:
 * - تحديد المخاطرة الأساسية
 * - تخفيض المخاطرة بعد الخسائر
 * - منع تجاوز الحد اليومي
 * - التوقف عند تحقيق الهدف
 * - حماية الحساب من سلسلة خسائر
 */

export type TradeResult =
  | "WIN"
  | "LOSS";

export type RiskEngineInput = {
  balance: number;

  startBalance: number;

  target: number;

  maxLoss: number;

  baseRiskPercent: number;

  trades: TradeResult[];

  minRiskPercent?: number;

  maxRiskPercent?: number;
};

export type RiskEngineResult = {
  status: "SAFE" | "CAUTION" | "STOP";

  currentRiskPercent: number;

  riskMoney: number;

  profit: number;

  loss: number;

  targetRemaining: number;

  lossLimitRemaining: number;

  consecutiveLosses: number;

  consecutiveWins: number;

  shouldTrade: boolean;

  reason: string;
};

/**
 * الحدود الافتراضية.
 */
const DEFAULT_MIN_RISK = 0.25;

const DEFAULT_MAX_RISK = 2;

/**
 * احسب النتائج الحالية.
 */
function calculatePerformance(
  trades: TradeResult[]
) {
  let consecutiveLosses = 0;
  let consecutiveWins = 0;

  for (
    let i = trades.length - 1;
    i >= 0;
    i--
  ) {
    if (trades[i] === "LOSS") {
      consecutiveLosses++;
    } else {
      break;
    }
  }

  for (
    let i = trades.length - 1;
    i >= 0;
    i--
  ) {
    if (trades[i] === "WIN") {
      consecutiveWins++;
    } else {
      break;
    }
  }

  return {
    consecutiveLosses,
    consecutiveWins,
  };
}

/**
 * محرك المخاطر الرئيسي.
 */
export function calculateRisk(
  input: RiskEngineInput
): RiskEngineResult {
  const {
    balance,
    startBalance,
    target,
    maxLoss,
    baseRiskPercent,
    trades,
    minRiskPercent = DEFAULT_MIN_RISK,
    maxRiskPercent = DEFAULT_MAX_RISK,
  } = input;

  // -----------------------------
  // Basic validation
  // -----------------------------

  if (balance <= 0 || startBalance <= 0) {
    return stopResult(
      "رصيد الحساب غير صالح."
    );
  }

  // -----------------------------
  // Performance
  // -----------------------------

  const {
    consecutiveLosses,
    consecutiveWins,
  } = calculatePerformance(trades);

  // -----------------------------
  // Profit / Loss
  // -----------------------------

  const profit =
    Math.max(
      0,
      balance - startBalance
    );

  const loss =
    Math.max(
      0,
      startBalance - balance
    );

  // -----------------------------
  // Target protection
  // -----------------------------

  if (
    target > 0 &&
    balance - startBalance >= target
  ) {
    return {
      status: "STOP",
      currentRiskPercent: 0,
      riskMoney: 0,
      profit,
      loss,
      targetRemaining: 0,
      lossLimitRemaining: Math.max(
        0,
        maxLoss - loss
      ),
      consecutiveLosses,
      consecutiveWins,
      shouldTrade: false,
      reason:
        "تم تحقيق الهدف اليومي. أوقف الجلسة وحافظ على الأرباح.",
    };
  }

  // -----------------------------
  // Maximum loss protection
  // -----------------------------

  if (
    maxLoss > 0 &&
    loss >= maxLoss
  ) {
    return {
      status: "STOP",
      currentRiskPercent: 0,
      riskMoney: 0,
      profit,
      loss,
      targetRemaining: Math.max(
        0,
        target - profit
      ),
      lossLimitRemaining: 0,
      consecutiveLosses,
      consecutiveWins,
      shouldTrade: false,
      reason:
        "تم الوصول إلى الحد الأقصى للخسارة اليومية.",
    };
  }

  // -----------------------------
  // Start with base risk
  // -----------------------------

  let currentRisk =
    baseRiskPercent;

  // -----------------------------
  // Consecutive loss protection
  //
  // LOSS 1 → 75%
  // LOSS 2 → 50%
  // LOSS 3 → 35%
  // LOSS 4+ → minimum risk
  // -----------------------------

  if (consecutiveLosses === 1) {
    currentRisk *= 0.75;
  }

  if (consecutiveLosses === 2) {
    currentRisk *= 0.5;
  }

  if (consecutiveLosses === 3) {
    currentRisk *= 0.35;
  }

  if (consecutiveLosses >= 4) {
    currentRisk *= 0.25;
  }

  // -----------------------------
  // Profit protection
  //
  // عندما نقترب من الهدف،
  // نخفض المخاطرة.
  // -----------------------------

  if (
    target > 0 &&
    profit >= target * 0.75
  ) {
    currentRisk *= 0.5;
  }

  if (
    target > 0 &&
    profit >= target * 0.9
  ) {
    currentRisk *= 0.35;
  }

  // -----------------------------
  // Never exceed configured limits
  // -----------------------------

  currentRisk = Math.min(
    maxRiskPercent,
    currentRisk
  );

  currentRisk = Math.max(
    minRiskPercent,
    currentRisk
  );

  // -----------------------------
  // Remaining loss protection
  //
  // لا نسمح أن تكون المخاطرة
  // أكبر من المساحة المتبقية
  // قبل Max Daily Loss.
  // -----------------------------

  if (maxLoss > 0) {
    const remainingLoss =
      Math.max(
        0,
        maxLoss - loss
      );

    const maxRiskFromLoss =
      (remainingLoss / balance) * 100;

    currentRisk = Math.min(
      currentRisk,
      maxRiskFromLoss
    );
  }

  // -----------------------------
  // Final safety check
  // -----------------------------

  if (
    currentRisk <= 0 ||
    !Number.isFinite(currentRisk)
  ) {
    return stopResult(
      "لا توجد مساحة مخاطرة آمنة متبقية."
    );
  }

  currentRisk = Number(
    currentRisk.toFixed(2)
  );

  const riskMoney =
    balance * (currentRisk / 100);

  // -----------------------------
  // Status
  // -----------------------------

  let status: "SAFE" | "CAUTION" | "STOP" =
    "SAFE";

  if (
    consecutiveLosses >= 1 ||
    currentRisk < baseRiskPercent
  ) {
    status = "CAUTION";
  }

  return {
    status,

    currentRiskPercent: currentRisk,

    riskMoney: Number(
      riskMoney.toFixed(2)
    ),

    profit: Number(
      profit.toFixed(2)
    ),

    loss: Number(
      loss.toFixed(2)
    ),

    targetRemaining: Number(
      Math.max(
        0,
        target - profit
      ).toFixed(2)
    ),

    lossLimitRemaining: Number(
      Math.max(
        0,
        maxLoss - loss
      ).toFixed(2)
    ),

    consecutiveLosses,

    consecutiveWins,

    shouldTrade: true,

    reason:
      consecutiveLosses > 0
        ? "تم تخفيض المخاطرة لحماية الحساب بعد الخسارة."
        : "المخاطرة ضمن المستوى الأساسي المحدد.",
  };
}

/**
 * نتيجة التوقف.
 */
function stopResult(
  reason: string
): RiskEngineResult {
  return {
    status: "STOP",

    currentRiskPercent: 0,

    riskMoney: 0,

    profit: 0,

    loss: 0,

    targetRemaining: 0,

    lossLimitRemaining: 0,

    consecutiveLosses: 0,

    consecutiveWins: 0,

    shouldTrade: false,

    reason,
  };
}

/**
 * مساعد لتحديد المخاطرة
 * بعد إضافة نتيجة صفقة جديدة.
 */
export function getNextRisk(
  input: RiskEngineInput,
  result: TradeResult
): RiskEngineResult {
  return calculateRisk({
    ...input,
    trades: [
      ...input.trades,
      result,
    ],
  });
}
