/**
 * =========================================================
 * FOREX RISK MANAGER
 * Trading / Lot Calculator
 * =========================================================
 *
 * يدعم:
 *
 * Pocket Option:
 * - QT Real
 * - QT Demo
 * - Tournament
 *
 * Forex:
 * - MT5 Real
 * - MT5 Demo
 * - MT4 Real
 * - MT4 Demo
 *
 * Shares:
 * - Shares Real
 * - Shares Demo
 *
 * =========================================================
 */
export type AccountType =
  | "QT_REAL"
  | "QT_DEMO"
  | "TOURNAMENT"
  | "MT5_REAL"
  | "MT5_DEMO"
  | "MT4_REAL"
  | "MT4_DEMO"
  | "SHARES_REAL"
  | "SHARES_DEMO";
/* =========================================================
   Input
========================================================= */
export type TradingCalculationInput = {
  accountType: AccountType;
  balance: number;
  riskPercent: number;
  /**
   * Pocket Option payout.
   *
   * مثال:
   * 92 = 92%
   */
  payout?: number;
  /**
   * Forex / Shares
   */
  stopLossPips?: number;
  takeProfitPips?: number;
  /**
   * قيمة النقطة للوت قياسي.
   *
   * Forex:
   * غالبًا $10 للوت القياسي في أزواج USD
   */
  pipValuePerStandardLot?: number;
  /**
   * Shares:
   * قيمة المخاطرة لكل سهم
   */
  shareRiskPerUnit?: number;
  /**
   * حدود اللوت
   */
  minLot?: number;
  maxLot?: number;
  lotStep?: number;
};
/* =========================================================
   Result
========================================================= */
export type TradingCalculationResult = {
  accountType: AccountType;
  lot: number;
  riskMoney: number;
  potentialProfit: number;
  potentialLoss: number;
  theoreticalLot: number;
  stopLossPips: number;
  takeProfitPips: number;
  payout: number;
  pipValuePerLot: number;
  isValid: boolean;
  error?: string;
};
/* =========================================================
   Defaults
========================================================= */
/**
 * القيمة التقريبية لقيمة Pip
 * للوت القياسي.
 */
const DEFAULT_PIP_VALUE = 10;
/**
 * Payout افتراضي لـ Pocket Option.
 *
 * يجب تغييرها من الواجهة حسب
 * الـ payout الحالي.
 */
const DEFAULT_PAYOUT = 92;
/**
 * الحدود الافتراضية للوت Forex.
 */
const DEFAULT_MIN_LOT = 0.01;
const DEFAULT_MAX_LOT = 100;
const DEFAULT_LOT_STEP = 0.01;
/* =========================================================
   Helpers
========================================================= */
function isPocketOption(
  accountType: AccountType
): boolean {
  return (
    accountType === "QT_REAL" ||
    accountType === "QT_DEMO" ||
    accountType === "TOURNAMENT"
  );
}
function isForex(
  accountType: AccountType
): boolean {
  return (
    accountType === "MT5_REAL" ||
    accountType === "MT5_DEMO" ||
    accountType === "MT4_REAL" ||
    accountType === "MT4_DEMO"
  );
}
function isShares(
  accountType: AccountType
): boolean {
  return (
    accountType === "SHARES_REAL" ||
    accountType === "SHARES_DEMO"
  );
}
/* =========================================================
   Round Lot
========================================================= */
function roundDown(
  value: number,
  decimals: number
): number {
  const factor =
    Math.pow(10, decimals);
  return (
    Math.floor(
      value * factor
    ) / factor
  );
}
function roundToLotStep(
  lot: number,
  step: number
): number {
  if (
    !Number.isFinite(step) ||
    step <= 0
  ) {
    return lot;
  }
  return Math.floor(
    lot / step
  ) * step;
}
/* =========================================================
   Invalid Result
========================================================= */
function invalidResult(
  accountType: AccountType,
  error: string
): TradingCalculationResult {
  return {
    accountType,
    lot: 0,
    riskMoney: 0,
    potentialProfit: 0,
    potentialLoss: 0,
    theoreticalLot: 0,
    stopLossPips: 0,
    takeProfitPips: 0,
    payout: 0,
    pipValuePerLot: 0,
    isValid: false,
    error,
  };
}
/* =========================================================
   Pocket Option
========================================================= */
/**
 * حساب Pocket Option.
 *
 * في QT لا يوجد مفهوم Forex Lot / Pip
 * بنفس طريقة MT4 / MT5.
 *
 * لذلك:
 *
 * riskMoney = المبلغ المعرض للخطر
 *
 * payout = نسبة الربح
 *
 * potentialProfit =
 * riskMoney × payout
 *
 * lot = riskMoney
 *
 * هنا نستخدم "lot" كقيمة الصفقة
 * المالية في Pocket Option.
 */
function calculatePocketOption(
  input: TradingCalculationInput
): TradingCalculationResult {
  const {
    accountType,
    balance,
    riskPercent,
    payout = DEFAULT_PAYOUT,
  } = input;
  if (
    !Number.isFinite(balance) ||
    balance <= 0
  ) {
    return invalidResult(
      accountType,
      "رصيد الحساب غير صالح."
    );
  }
  if (
    !Number.isFinite(riskPercent) ||
    riskPercent <= 0
  ) {
    return invalidResult(
      accountType,
      "نسبة المخاطرة غير صالحة."
    );
  }
  if (
    !Number.isFinite(payout) ||
    payout <= 0 ||
    payout > 100
  ) {
    return invalidResult(
      accountType,
      "نسبة Payout يجب أن تكون بين 0 و100."
    );
  }
  const riskMoney =
    balance *
    (riskPercent / 100);
  /**
   * في Pocket Option:
   *
   * إذا خاطرنا بـ $10
   * و Payout = 92%
   *
   * الربح = $9.20
   */
  const potentialProfit =
    riskMoney *
    (payout / 100);
  const potentialLoss =
    riskMoney;
  /**
   * نستخدم مبلغ الصفقة
   * كقيمة lot داخل التطبيق.
   *
   * مثال:
   *
   * Balance = 1000
   * Risk = 1%
   *
   * Trade Amount = $10
   */
  const lot =
    roundDown(
      riskMoney,
      2
    );
  return {
    accountType,
    lot,
    riskMoney:
      Number(
        riskMoney.toFixed(2)
      ),
    potentialProfit:
      Number(
        potentialProfit.toFixed(2)
      ),
    potentialLoss:
      Number(
        potentialLoss.toFixed(2)
      ),
    theoreticalLot:
      Number(
        riskMoney.toFixed(2)
      ),
    stopLossPips: 0,
    takeProfitPips: 0,
    payout,
    pipValuePerLot: 0,
    isValid: true,
  };
}
/* =========================================================
   Forex MT4 / MT5
========================================================= */
/**
 * حساب Forex.
 *
 * Lot =
 *
 * Risk Money /
 * (SL Pips × Pip Value)
 */
function calculateForex(
  input: TradingCalculationInput
): TradingCalculationResult {
  const {
    accountType,
    balance,
    riskPercent,
    stopLossPips = 0,
    takeProfitPips = 0,
    pipValuePerStandardLot =
      DEFAULT_PIP_VALUE,
    minLot =
      DEFAULT_MIN_LOT,
    maxLot =
      DEFAULT_MAX_LOT,
    lotStep =
      DEFAULT_LOT_STEP,
  } = input;
  if (
    !Number.isFinite(balance) ||
    balance <= 0
  ) {
    return invalidResult(
      accountType,
      "رصيد الحساب غير صالح."
    );
  }
  if (
    !Number.isFinite(riskPercent) ||
    riskPercent <= 0
  ) {
    return invalidResult(
      accountType,
      "نسبة المخاطرة غير صالحة."
    );
  }
  if (
    !Number.isFinite(
      stopLossPips
    ) ||
    stopLossPips <= 0
  ) {
    return invalidResult(
      accountType,
      "Stop Loss يجب أن يكون أكبر من صفر."
    );
  }
  if (
    !Number.isFinite(
      pipValuePerStandardLot
    ) ||
    pipValuePerStandardLot <= 0
  ) {
    return invalidResult(
      accountType,
      "قيمة Pip غير صالحة."
    );
  }
  const riskMoney =
    balance *
    (riskPercent / 100);
  /**
   * Lot الحقيقي:
   *
   * $10 risk
   * / (20 pips × $10)
   *
   * = 0.05 lot
   */
  const theoreticalLot =
    riskMoney /
    (
      stopLossPips *
      pipValuePerStandardLot
    );
  let lot =
    roundToLotStep(
      theoreticalLot,
      lotStep
    );
  /**
   * لا نرفع اللوت إلى minLot
   * إذا كان ذلك سيجعل المخاطرة أكبر
   * من المخاطرة المطلوبة.
   *
   * لذلك إذا كانت النتيجة أقل من
   * الحد الأدنى للوسيط نستخدم minLot
   * لكن نترك الحساب واضحًا للمستخدم.
   */
  lot =
    Math.max(
      minLot,
      lot
    );
  lot =
    Math.min(
      maxLot,
      lot
    );
  lot =
    Number(
      lot.toFixed(2)
    );
  /**
   * الخسارة الفعلية
   * حسب اللوت بعد التقريب.
   */
  const potentialLoss =
    lot *
    stopLossPips *
    pipValuePerStandardLot;
  /**
   * الربح المتوقع
   * حسب TP.
   */
  const potentialProfit =
    takeProfitPips > 0
      ? lot *
        takeProfitPips *
        pipValuePerStandardLot
      : 0;
  return {
    accountType,
    lot,
    riskMoney:
      Number(
        riskMoney.toFixed(2)
      ),
    potentialProfit:
      Number(
        potentialProfit.toFixed(2)
      ),
    potentialLoss:
      Number(
        potentialLoss.toFixed(2)
      ),
    theoreticalLot:
      Number(
        theoreticalLot.toFixed(4)
      ),
    stopLossPips,
    takeProfitPips,
    payout: 0,
    pipValuePerLot:
      pipValuePerStandardLot,
    isValid: true,
  };
}
/* =========================================================
   Shares
========================================================= */
/**
 * حساب الأسهم.
 *
 * في الأسهم لا نستخدم Forex Lot.
 *
 * نحسب عدد الوحدات/الأسهم:
 *
 * Risk Money /
 * Risk Per Share
 *
 * ثم نضع العدد في lot
 * حتى يستطيع النظام الحالي
 * عرضه بدون تغيير الواجهة بالكامل.
 */
function calculateShares(
  input: TradingCalculationInput
): TradingCalculationResult {
  const {
    accountType,
    balance,
    riskPercent,
    shareRiskPerUnit = 1,
    minLot = 1,
    maxLot = 100000,
    lotStep = 1,
  } = input;
  if (
    !Number.isFinite(balance) ||
    balance <= 0
  ) {
    return invalidResult(
      accountType,
      "رصيد الحساب غير صالح."
    );
  }
  if (
    !Number.isFinite(riskPercent) ||
    riskPercent <= 0
  ) {
    return invalidResult(
      accountType,
      "نسبة المخاطرة غير صالحة."
    );
  }
  if (
    !Number.isFinite(
      shareRiskPerUnit
    ) ||
    shareRiskPerUnit <= 0
  ) {
    return invalidResult(
      accountType,
      "قيمة المخاطرة لكل سهم غير صالحة."
    );
  }
  const riskMoney =
    balance *
    (riskPercent / 100);
  const theoreticalUnits =
    riskMoney /
    shareRiskPerUnit;
  let units =
    roundToLotStep(
      theoreticalUnits,
      lotStep
    );
  units =
    Math.max(
      minLot,
      units
    );
  units =
    Math.min(
      maxLot,
      units
    );
  units =
    Number(
      units.toFixed(2)
    );
  const potentialLoss =
    units *
    shareRiskPerUnit;
  return {
    accountType,
    lot: units,
    riskMoney:
      Number(
        riskMoney.toFixed(2)
      ),
    potentialProfit: 0,
    potentialLoss:
      Number(
        potentialLoss.toFixed(2)
      ),
    theoreticalLot:
      Number(
        theoreticalUnits.toFixed(4)
      ),
    stopLossPips: 0,
    takeProfitPips: 0,
    payout: 0,
    pipValuePerLot: 0,
    isValid: true,
  };
}
/* =========================================================
   Main Calculator
========================================================= */
export function calculateTrading(
  input: TradingCalculationInput
): TradingCalculationResult {
  if (
    isPocketOption(
      input.accountType
    )
  ) {
    return calculatePocketOption(
      input
    );
  }
  if (
    isForex(
      input.accountType
    )
  ) {
    return calculateForex(
      input
    );
  }
  if (
    isShares(
      input.accountType
    )
  ) {
    return calculateShares(
      input
    );
  }
  return invalidResult(
    input.accountType,
    "نوع الحساب غير مدعوم."
  );
}
/* =========================================================
   Backward Compatibility
========================================================= */
/**
 * الإصدارات القديمة من المشروع
 * تستخدم calculateLot().
 *
 * نبقيها حتى لا تنكسر الملفات
 * الأخرى في المشروع.
 */
export type LotCalculationInput = {
  balance: number;
  riskPercent: number;
  stopLossPips: number;
  pipValuePerStandardLot?: number;
  minLot?: number;
  maxLot?: number;
  lotStep?: number;
};
export type LotCalculationResult = {
  lot: number;
  riskMoney: number;
  stopLossPips: number;
  pipValuePerLot: number;
  theoreticalLot: number;
  potentialProfit: number;
  isValid: boolean;
  error?: string;
};
export function calculateLot(
  input: LotCalculationInput
): LotCalculationResult {
  const result =
    calculateForex({
      accountType:
        "MT5_DEMO",
      balance:
        input.balance,
      riskPercent:
        input.riskPercent,
      stopLossPips:
        input.stopLossPips,
      takeProfitPips:
        input.stopLossPips,
      pipValuePerStandardLot:
        input.pipValuePerStandardLot ??
        DEFAULT_PIP_VALUE,
      minLot:
        input.minLot ??
        DEFAULT_MIN_LOT,
      maxLot:
        input.maxLot ??
        DEFAULT_MAX_LOT,
      lotStep:
        input.lotStep ??
        DEFAULT_LOT_STEP,
    });
  return {
    lot:
      result.lot,
    riskMoney:
      result.riskMoney,
    stopLossPips:
      result.stopLossPips,
    pipValuePerLot:
      result.pipValuePerLot,
    theoreticalLot:
      result.theoreticalLot,
    potentialProfit:
      result.potentialProfit,
    isValid:
      result.isValid,
    error:
      result.error,
  };
}
/* =========================================================
   Quick Lot
========================================================= */
export function getLotSize(
  balance: number,
  riskPercent: number,
  stopLossPips: number,
  pipValuePerStandardLot =
    DEFAULT_PIP_VALUE
): number {
  const result =
    calculateLot({
      balance,
      riskPercent,
      stopLossPips,
      pipValuePerStandardLot,
    });
  return result.lot;
}
/* =========================================================
   Risk Money
========================================================= */
export function getRiskMoney(
  balance: number,
  riskPercent: number
): number {
  if (
    !Number.isFinite(balance) ||
    balance <= 0 ||
    !Number.isFinite(
      riskPercent
    ) ||
    riskPercent <= 0
  ) {
    return 0;
  }
  return Number(
    (
      balance *
      (riskPercent / 100)
    ).toFixed(2)
  );
}
/* =========================================================
   Risk Percent
========================================================= */
export function getRiskPercent(
  balance: number,
  riskMoney: number
): number {
  if (
    !Number.isFinite(balance) ||
    balance <= 0 ||
    !Number.isFinite(riskMoney) ||
    riskMoney <= 0
  ) {
    return 0;
  }
  return Number(
    (
      (riskMoney / balance) *
      100
    ).toFixed(4)
  );
}
