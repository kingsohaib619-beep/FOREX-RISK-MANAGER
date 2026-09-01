/**
 * Forex Lot Calculator
 *
 * يحسب حجم اللوت بناءً على:
 * - رصيد الحساب
 * - نسبة المخاطرة
 * - وقف الخسارة بالنقاط
 * - قيمة النقطة للوت القياسي
 *
 * ملاحظة:
 * قيمة الـ Pip تختلف حسب الزوج، حجم العقد،
 * وعملة الحساب والوسيط.
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
/**
 * القيمة الافتراضية للنقطة للوت قياسي.
 *
 * تستخدم كقيمة تقريبية فقط.
 * في التطبيق الحقيقي يمكن لاحقًا إدخال
 * Pip Value حقيقي من بيانات الوسيط.
 */
const DEFAULT_PIP_VALUE = 10;
/**
 * التقريب إلى خطوة اللوت.
 *
 * مثال:
 * 0.137 → 0.13 إذا كانت الخطوة 0.01
 */
function roundToLotStep(
  lot: number,
  step: number
): number {
  if (step <= 0) {
    return lot;
  }
  return Math.floor(lot / step) * step;
}
/**
 * حساب حجم اللوت.
 */
export function calculateLot(
  input: LotCalculationInput
): LotCalculationResult {
  const {
    balance,
    riskPercent,
    stopLossPips,
    pipValuePerStandardLot = DEFAULT_PIP_VALUE,
    minLot = 0.01,
    maxLot = 100,
    lotStep = 0.01,
  } = input;
  // -----------------------------
  // Validation
  // -----------------------------
  if (!Number.isFinite(balance) || balance <= 0) {
    return invalidResult(
      "رصيد الحساب غير صالح."
    );
  }
  if (
    !Number.isFinite(riskPercent) ||
    riskPercent <= 0
  ) {
    return invalidResult(
      "نسبة المخاطرة غير صالحة."
    );
  }
  if (
    !Number.isFinite(stopLossPips) ||
    stopLossPips <= 0
  ) {
    return invalidResult(
      "Stop Loss يجب أن يكون أكبر من صفر."
    );
  }
  if (
    !Number.isFinite(pipValuePerStandardLot) ||
    pipValuePerStandardLot <= 0
  ) {
    return invalidResult(
      "قيمة النقطة غير صالحة."
    );
  }
  // -----------------------------
  // Risk money
  // -----------------------------
  const riskMoney =
    balance * (riskPercent / 100);
  // -----------------------------
  // Theoretical lot
  //
  // Lot =
  // Risk Money /
  // (SL Pips × Pip Value)
  // -----------------------------
  const theoreticalLot =
    riskMoney /
    (stopLossPips * pipValuePerStandardLot);
  // -----------------------------
  // Apply broker lot limits
  // -----------------------------
  let lot = roundToLotStep(
    theoreticalLot,
    lotStep
  );
  lot = Math.max(minLot, lot);
  lot = Math.min(maxLot, lot);
  lot = Number(lot.toFixed(2));
  // -----------------------------
  // Potential profit
  // -----------------------------
  const potentialProfit =
    lot *
    stopLossPips *
    pipValuePerStandardLot;
  return {
    lot,
    riskMoney: Number(riskMoney.toFixed(2)),
    stopLossPips,
    pipValuePerLot: pipValuePerStandardLot,
    theoreticalLot: Number(
      theoreticalLot.toFixed(4)
    ),
    potentialProfit: Number(
      potentialProfit.toFixed(2)
    ),
    isValid: true,
  };
}
/**
 * إنشاء نتيجة غير صالحة.
 */
function invalidResult(
  error: string
): LotCalculationResult {
  return {
    lot: 0,
    riskMoney: 0,
    stopLossPips: 0,
    pipValuePerLot: 0,
    theoreticalLot: 0,
    potentialProfit: 0,
    isValid: false,
    error,
  };
}
/**
 * حساب سريع للوت.
 */
export function getLotSize(
  balance: number,
  riskPercent: number,
  stopLossPips: number,
  pipValuePerStandardLot = DEFAULT_PIP_VALUE
): number {
  const result = calculateLot({
    balance,
    riskPercent,
    stopLossPips,
    pipValuePerStandardLot,
  });
  return result.lot;
}
/**
 * حساب مبلغ المخاطرة.
 */
export function getRiskMoney(
  balance: number,
  riskPercent: number
): number {
  if (
    !Number.isFinite(balance) ||
    balance <= 0 ||
    !Number.isFinite(riskPercent) ||
    riskPercent <= 0
  ) {
    return 0;
  }
  return Number(
    (balance * (riskPercent / 100)).toFixed(2)
  );
}
/**
 * حساب نسبة المخاطرة المطلوبة
 * للوصول إلى مبلغ معين.
 */
export function getRiskPercent(
  balance: number,
  riskMoney: number
): number {
  if (
    balance <= 0 ||
    riskMoney <= 0
  ) {
    return 0;
  }
  return Number(
    ((riskMoney / balance) * 100).toFixed(4)
  );
}
