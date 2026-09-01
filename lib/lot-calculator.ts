/**
 * Pocket Option / Forex / Shares Risk Calculator
 *
 * يدعم:
 * - Pocket Option QT Real
 * - Pocket Option QT Demo
 * - Pocket Option Tournament
 * - Forex MT5 Real
 * - Forex MT5 Demo
 * - Forex MT4 Real
 * - Forex MT4 Demo
 * - Shares Real
 * - Shares Demo
 *
 * مهم:
 * هذه الحاسبة تحسب حجم المخاطرة/الصفقة رياضيًا.
 * لا تضمن الربح.
 */
/* =========================================================
   Account Types
========================================================= */
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
   Instrument Types
========================================================= */
export type InstrumentType =
  | "QUICK_TRADING"
  | "FOREX"
  | "SHARES";
/* =========================================================
   Account helpers
========================================================= */
export function isQuickTrading(
  accountType: AccountType
): boolean {
  return (
    accountType === "QT_REAL" ||
    accountType === "QT_DEMO" ||
    accountType === "TOURNAMENT"
  );
}
export function isForexAccount(
  accountType: AccountType
): boolean {
  return (
    accountType === "MT5_REAL" ||
    accountType === "MT5_DEMO" ||
    accountType === "MT4_REAL" ||
    accountType === "MT4_DEMO"
  );
}
export function isSharesAccount(
  accountType: AccountType
): boolean {
  return (
    accountType === "SHARES_REAL" ||
    accountType === "SHARES_DEMO"
  );
}
export function getInstrumentType(
  accountType: AccountType
): InstrumentType {
  if (isQuickTrading(accountType)) {
    return "QUICK_TRADING";
  }
  if (isSharesAccount(accountType)) {
    return "SHARES";
  }
  return "FOREX";
}
/* =========================================================
   Account Labels
========================================================= */
export const ACCOUNT_LABELS: Record<
  AccountType,
  string
> = {
  QT_REAL: "QT Real",
  QT_DEMO: "QT Demo",
  TOURNAMENT: "Tournament",
  MT5_REAL: "Forex MT5 Real",
  MT5_DEMO: "Forex MT5 Demo",
  MT4_REAL: "Forex MT4 Real",
  MT4_DEMO: "Forex MT4 Demo",
  SHARES_REAL: "Shares Real",
  SHARES_DEMO: "Shares Demo",
};
/* =========================================================
   Legacy Forex Lot Calculator
========================================================= */
export type LotCalculationInput = {
  balance: number;
  riskPercent: number;
  stopLossPips: number;
  /**
   * قيمة النقطة للوت القياسي.
   *
   * لا يجب افتراض أنها 10$ دائمًا.
   * يمكن تمرير القيمة الحقيقية من إعدادات الأداة/الوسيط.
   */
  pipValuePerStandardLot?: number;
  minLot?: number;
  maxLot?: number;
  lotStep?: number;
  /**
   * Take Profit بالنقاط.
   *
   * اختياري للحفاظ على التوافق مع الكود القديم.
   */
  takeProfitPips?: number;
};
export type LotCalculationResult = {
  lot: number;
  riskMoney: number;
  stopLossPips: number;
  pipValuePerLot: number;
  theoreticalLot: number;
  /**
   * الربح المحتمل عند الوصول إلى TP.
   *
   * إذا لم يتم تمرير TP:
   * يستخدم SL كقيمة تقريبية فقط.
   */
  potentialProfit: number;
  isValid: boolean;
  error?: string;
};
/* =========================================================
   Defaults
========================================================= */
/**
 * قيمة تقريبية فقط.
 *
 * لا تستخدم هذه القيمة كقيمة عالمية لجميع الأزواج.
 */
const DEFAULT_PIP_VALUE = 10;
const DEFAULT_MIN_LOT = 0.01;
const DEFAULT_MAX_LOT = 100;
const DEFAULT_LOT_STEP = 0.01;
/**
 * حجم العقد القياسي في Forex.
 */
const DEFAULT_CONTRACT_SIZE = 100000;
/**
 * Payout افتراضي لـ QT.
 *
 * 92% = 0.92
 */
const DEFAULT_PAYOUT = 0.92;
/* =========================================================
   Utilities
========================================================= */
function roundMoney(
  value: number
): number {
  return Number(value.toFixed(2));
}
function roundLot(
  value: number,
  decimals = 4
): number {
  return Number(value.toFixed(decimals));
}
/**
 * التقريب إلى Lot Step.
 *
 * مثال:
 *
 * theoreticalLot = 0.137
 * lotStep = 0.01
 *
 * النتيجة:
 * 0.13
 */
function roundToLotStep(
  lot: number,
  step: number
): number {
  if (!Number.isFinite(lot)) {
    return 0;
  }
  if (!Number.isFinite(step) || step <= 0) {
    return lot;
  }
  return Math.floor(
    (lot + Number.EPSILON) / step
  ) * step;
}
/* =========================================================
   Validation
========================================================= */
function invalidLotResult(
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
/* =========================================================
   Forex Lot Calculation
========================================================= */
export function calculateLot(
  input: LotCalculationInput
): LotCalculationResult {
  const {
    balance,
    riskPercent,
    stopLossPips,
    pipValuePerStandardLot =
      DEFAULT_PIP_VALUE,
    minLot = DEFAULT_MIN_LOT,
    maxLot = DEFAULT_MAX_LOT,
    lotStep = DEFAULT_LOT_STEP,
    takeProfitPips,
  } = input;
  /* -------------------------------------------------------
     Validation
  ------------------------------------------------------- */
  if (
    !Number.isFinite(balance) ||
    balance <= 0
  ) {
    return invalidLotResult(
      "رصيد الحساب غير صالح."
    );
  }
  if (
    !Number.isFinite(riskPercent) ||
    riskPercent <= 0
  ) {
    return invalidLotResult(
      "نسبة المخاطرة غير صالحة."
    );
  }
  if (
    !Number.isFinite(stopLossPips) ||
    stopLossPips <= 0
  ) {
    return invalidLotResult(
      "Stop Loss يجب أن يكون أكبر من صفر."
    );
  }
  if (
    !Number.isFinite(
      pipValuePerStandardLot
    ) ||
    pipValuePerStandardLot <= 0
  ) {
    return invalidLotResult(
      "قيمة النقطة غير صالحة."
    );
  }
  if (
    !Number.isFinite(minLot) ||
    minLot <= 0
  ) {
    return invalidLotResult(
      "Minimum Lot غير صالح."
    );
  }
  if (
    !Number.isFinite(maxLot) ||
    maxLot < minLot
  ) {
    return invalidLotResult(
      "Maximum Lot غير صالح."
    );
  }
  if (
    !Number.isFinite(lotStep) ||
    lotStep <= 0
  ) {
    return invalidLotResult(
      "Lot Step غير صالح."
    );
  }
  /* -------------------------------------------------------
     Risk Money
  ------------------------------------------------------- */
  const riskMoney =
    balance *
    (riskPercent / 100);
  /* -------------------------------------------------------
     Theoretical Lot
  ------------------------------------------------------- */
  const theoreticalLot =
    riskMoney /
    (
      stopLossPips *
      pipValuePerStandardLot
    );
  /* -------------------------------------------------------
     Broker limits
  ------------------------------------------------------- */
  let lot =
    roundToLotStep(
      theoreticalLot,
      lotStep
    );
  /*
   * إذا كان الحجم النظري أقل من الحد الأدنى:
   * لا نجبر الصفقة على الحد الأدنى بدون تنبيه،
   * لأن ذلك قد يجعل المخاطرة أعلى من المطلوب.
   */
  if (theoreticalLot < minLot) {
    lot = 0;
  } else {
    lot = Math.min(
      maxLot,
      lot
    );
  }
  lot = roundLot(
    lot,
    4
  );
  if (lot <= 0) {
    return {
      lot: 0,
      riskMoney: roundMoney(
        riskMoney
      ),
      stopLossPips,
      pipValuePerLot:
        pipValuePerStandardLot,
      theoreticalLot:
        roundLot(
          theoreticalLot,
          4
        ),
      potentialProfit: 0,
      isValid: false,
      error:
        "حجم اللوت المحسوب أقل من Minimum Lot. خفّض Stop Loss أو ارفع نسبة المخاطرة/الرصيد.",
    };
  }
  /* -------------------------------------------------------
     Maximum Loss
  ------------------------------------------------------- */
  const potentialLoss =
    lot *
    stopLossPips *
    pipValuePerStandardLot;
  /* -------------------------------------------------------
     Potential Profit
  ------------------------------------------------------- */
  const profitDistance =
    Number.isFinite(
      takeProfitPips
    ) &&
    Number(takeProfitPips) > 0
      ? Number(takeProfitPips)
      : stopLossPips;
  const potentialProfit =
    lot *
    profitDistance *
    pipValuePerStandardLot;
  /* -------------------------------------------------------
     Result
  ------------------------------------------------------- */
  return {
    lot,
    riskMoney:
      roundMoney(
        riskMoney
      ),
    stopLossPips,
    pipValuePerLot:
      pipValuePerStandardLot,
    theoreticalLot:
      roundLot(
        theoreticalLot,
        4
      ),
    potentialProfit:
      roundMoney(
        potentialProfit
      ),
    isValid: true,
  };
}
/* =========================================================
   QT Calculation
========================================================= */
export type QuickTradingInput = {
  balance: number;
  riskPercent: number;
  /**
   * نسبة الـPayout.
   *
   * مثال:
   * 92 = 92%
   * 0.92 = 92%
   */
  payout?: number;
};
export type QuickTradingResult = {
  investment: number;
  riskMoney: number;
  potentialProfit: number;
  potentialReturn: number;
  potentialLoss: number;
  balanceAfterWin: number;
  balanceAfterLoss: number;
  payoutPercent: number;
  isValid: boolean;
  error?: string;
};
export function calculateQuickTrading(
  input: QuickTradingInput
): QuickTradingResult {
  const {
    balance,
    riskPercent,
  } = input;
  let payout =
    input.payout ??
    DEFAULT_PAYOUT;
  if (
    payout > 1
  ) {
    payout =
      payout / 100;
  }
  if (
    !Number.isFinite(balance) ||
    balance <= 0
  ) {
    return {
      investment: 0,
      riskMoney: 0,
      potentialProfit: 0,
      potentialReturn: 0,
      potentialLoss: 0,
      balanceAfterWin: 0,
      balanceAfterLoss: 0,
      payoutPercent: 0,
      isValid: false,
      error:
        "رصيد الحساب غير صالح.",
    };
  }
  if (
    !Number.isFinite(
      riskPercent
    ) ||
    riskPercent <= 0
  ) {
    return {
      investment: 0,
      riskMoney: 0,
      potentialProfit: 0,
      potentialReturn: 0,
      potentialLoss: 0,
      balanceAfterWin: 0,
      balanceAfterLoss: 0,
      payoutPercent: 0,
      isValid: false,
      error:
        "نسبة المخاطرة غير صالحة.",
    };
  }
  if (
    !Number.isFinite(payout) ||
    payout < 0 ||
    payout > 1
  ) {
    return {
      investment: 0,
      riskMoney: 0,
      potentialProfit: 0,
      potentialReturn: 0,
      potentialLoss: 0,
      balanceAfterWin: 0,
      balanceAfterLoss: 0,
      payoutPercent: 0,
      isValid: false,
      error:
        "نسبة Payout غير صالحة.",
    };
  }
  const riskMoney =
    balance *
    (riskPercent / 100);
  /**
   * في QT:
   *
   * Investment = المبلغ المعرض للخسارة.
   */
  const investment =
    roundMoney(
      riskMoney
    );
  const potentialProfit =
    roundMoney(
      investment *
      payout
    );
  const potentialReturn =
    roundMoney(
      investment +
      potentialProfit
    );
  const potentialLoss =
    investment;
  return {
    investment,
    riskMoney:
      roundMoney(
        riskMoney
      ),
    potentialProfit,
    potentialReturn,
    potentialLoss,
    balanceAfterWin:
      roundMoney(
        balance +
        potentialProfit
      ),
    balanceAfterLoss:
      roundMoney(
        Math.max(
          0,
          balance -
          investment
        )
      ),
    payoutPercent:
      roundMoney(
        payout * 100
      ),
    isValid:
      investment > 0,
  };
}
/* =========================================================
   Shares Calculation
========================================================= */
export type SharesCalculationInput = {
  balance: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
  /**
   * يسمح للصفقة القصيرة باستخدام
   * اتجاه مختلف لاحقًا.
   *
   * حاليًا الافتراضي LONG.
   */
  direction?: "LONG" | "SHORT";
};
export type SharesCalculationResult = {
  shares: number;
  riskMoney: number;
  riskPerShare: number;
  positionValue: number;
  potentialLoss: number;
  potentialProfit: number;
  isValid: boolean;
  error?: string;
};
export function calculateShares(
  input: SharesCalculationInput
): SharesCalculationResult {
  const {
    balance,
    riskPercent,
    entryPrice,
    stopLossPrice,
    takeProfitPrice = 0,
    direction = "LONG",
  } = input;
  if (
    !Number.isFinite(balance) ||
    balance <= 0
  ) {
    return invalidSharesResult(
      "رصيد الحساب غير صالح."
    );
  }
  if (
    !Number.isFinite(
      riskPercent
    ) ||
    riskPercent <= 0
  ) {
    return invalidSharesResult(
      "نسبة المخاطرة غير صالحة."
    );
  }
  if (
    !Number.isFinite(
      entryPrice
    ) ||
    entryPrice <= 0
  ) {
    return invalidSharesResult(
      "سعر الدخول غير صالح."
    );
  }
  if (
    !Number.isFinite(
      stopLossPrice
    ) ||
    stopLossPrice <= 0
  ) {
    return invalidSharesResult(
      "Stop Loss غير صالح."
    );
  }
  const riskMoney =
    balance *
    (riskPercent / 100);
  let riskPerShare: number;
  if (
    direction === "SHORT"
  ) {
    riskPerShare =
      stopLossPrice -
      entryPrice;
  } else {
    riskPerShare =
      entryPrice -
      stopLossPrice;
  }
  if (
    riskPerShare <= 0
  ) {
    return invalidSharesResult(
      direction === "SHORT"
        ? "في الصفقة القصيرة يجب أن يكون Stop Loss أعلى من سعر الدخول."
        : "في الصفقة الطويلة يجب أن يكون Stop Loss أقل من سعر الدخول."
    );
  }
  const theoreticalShares =
    riskMoney /
    riskPerShare;
  /**
   * لا يمكن شراء جزء من سهم في هذا النموذج.
   */
  const shares =
    Math.floor(
      theoreticalShares
    );
  if (shares < 1) {
    return invalidSharesResult(
      "المخاطرة صغيرة جدًا لشراء سهم واحد."
    );
  }
  const positionValue =
    shares *
    entryPrice;
  const potentialLoss =
    shares *
    riskPerShare;
  let potentialProfit =
    0;
  if (
    Number.isFinite(
      takeProfitPrice
    ) &&
    takeProfitPrice > 0
  ) {
    const profitPerShare =
      direction === "SHORT"
        ? entryPrice -
          takeProfitPrice
        : takeProfitPrice -
          entryPrice;
    if (
      profitPerShare > 0
    ) {
      potentialProfit =
        shares *
        profitPerShare;
    }
  }
  return {
    shares,
    riskMoney:
      roundMoney(
        riskMoney
      ),
    riskPerShare:
      roundMoney(
        riskPerShare
      ),
    positionValue:
      roundMoney(
        positionValue
      ),
    potentialLoss:
      roundMoney(
        potentialLoss
      ),
    potentialProfit:
      roundMoney(
        potentialProfit
      ),
    isValid:
      shares > 0,
  };
}
function invalidSharesResult(
  error: string
): SharesCalculationResult {
  return {
    shares: 0,
    riskMoney: 0,
    riskPerShare: 0,
    positionValue: 0,
    potentialLoss: 0,
    potentialProfit: 0,
    isValid: false,
    error,
  };
}
/* =========================================================
   Unified Calculator
========================================================= */
export type TradingCalculationInput = {
  accountType: AccountType;
  balance: number;
  riskPercent: number;
  /* QT */
  payout?: number;
  /* Forex */
  stopLossPips?: number;
  takeProfitPips?: number;
  pipValuePerStandardLot?: number;
  minLot?: number;
  maxLot?: number;
  lotStep?: number;
  /* Shares */
  entryPrice?: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  direction?: "LONG" | "SHORT";
};
export type TradingCalculationResult = {
  accountType: AccountType;
  instrument: InstrumentType;
  riskMoney: number;
  investment: number;
  lot: number;
  shares: number;
  theoreticalLot: number;
  pipValuePerLot: number;
  riskPerShare: number;
  positionValue: number;
  potentialLoss: number;
  potentialProfit: number;
  balanceAfterWin: number;
  balanceAfterLoss: number;
  payoutPercent: number;
  isValid: boolean;
  error?: string;
};
export function calculateTrading(
  input: TradingCalculationInput
): TradingCalculationResult {
  const {
    accountType,
    balance,
    riskPercent,
  } = input;
  const instrument =
    getInstrumentType(
      accountType
    );
  /* -------------------------------------------------------
     QT / Tournament
  ------------------------------------------------------- */
  if (
    instrument ===
    "QUICK_TRADING"
  ) {
    const result =
      calculateQuickTrading({
        balance,
        riskPercent,
        payout:
          input.payout,
      });
    return {
      accountType,
      instrument,
      riskMoney:
        result.riskMoney,
      investment:
        result.investment,
      lot: 0,
      shares: 0,
      theoreticalLot: 0,
      pipValuePerLot: 0,
      riskPerShare: 0,
      positionValue:
        result.investment,
      potentialLoss:
        result.potentialLoss,
      potentialProfit:
        result.potentialProfit,
      balanceAfterWin:
        result.balanceAfterWin,
      balanceAfterLoss:
        result.balanceAfterLoss,
      payoutPercent:
        result.payoutPercent,
      isValid:
        result.isValid,
      error:
        result.error,
    };
  }
  /* -------------------------------------------------------
     Shares
  ------------------------------------------------------- */
  if (
    instrument ===
    "SHARES"
  ) {
    const result =
      calculateShares({
        balance,
        riskPercent,
        entryPrice:
          input.entryPrice ?? 0,
        stopLossPrice:
          input.stopLossPrice ?? 0,
        takeProfitPrice:
          input.takeProfitPrice ?? 0,
        direction:
          input.direction ??
          "LONG",
      });
    return {
      accountType,
      instrument,
      riskMoney:
        result.riskMoney,
      investment:
        result.positionValue,
      lot: 0,
      shares:
        result.shares,
      theoreticalLot: 0,
      pipValuePerLot: 0,
      riskPerShare:
        result.riskPerShare,
      positionValue:
        result.positionValue,
      potentialLoss:
        result.potentialLoss,
      potentialProfit:
        result.potentialProfit,
      balanceAfterWin:
        roundMoney(
          balance +
          result.potentialProfit
        ),
      balanceAfterLoss:
        roundMoney(
          Math.max(
            0,
            balance -
            result.potentialLoss
          )
        ),
      payoutPercent: 0,
      isValid:
        result.isValid,
      error:
        result.error,
    };
  }
  /* -------------------------------------------------------
     MT4 / MT5 Forex
  ------------------------------------------------------- */
  const result =
    calculateLot({
      balance,
      riskPercent,
      stopLossPips:
        input.stopLossPips ?? 0,
      takeProfitPips:
        input.takeProfitPips,
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
    accountType,
    instrument,
    riskMoney:
      result.riskMoney,
    investment: 0,
    lot:
      result.lot,
    shares: 0,
    theoreticalLot:
      result.theoreticalLot,
    pipValuePerLot:
      result.pipValuePerLot,
    riskPerShare: 0,
    positionValue:
      result.lot *
      DEFAULT_CONTRACT_SIZE,
    potentialLoss:
      result.lot *
      result.stopLossPips *
      result.pipValuePerLot,
    potentialProfit:
      result.potentialProfit,
    balanceAfterWin:
      roundMoney(
        balance +
        result.potentialProfit
      ),
    balanceAfterLoss:
      roundMoney(
        Math.max(
          0,
          balance -
          (
            result.lot *
            result.stopLossPips *
            result.pipValuePerLot
          )
        )
      ),
    payoutPercent: 0,
    isValid:
      result.isValid,
    error:
      result.error,
  };
}
/* =========================================================
   Quick helpers
========================================================= */
/**
 * حساب حجم اللوت فقط.
 */
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
    !Number.isFinite(
      riskPercent
    ) ||
    riskPercent <= 0
  ) {
    return 0;
  }
  return roundMoney(
    balance *
    (riskPercent / 100)
  );
}
/**
 * حساب نسبة المخاطرة
 * المطلوبة لمبلغ معين.
 */
export function getRiskPercent(
  balance: number,
  riskMoney: number
): number {
  if (
    !Number.isFinite(balance) ||
    balance <= 0 ||
    !Number.isFinite(
      riskMoney
    ) ||
    riskMoney <= 0
  ) {
    return 0;
  }
  return Number(
    (
      (riskMoney /
        balance) *
      100
    ).toFixed(4)
  );
}
/**
 * حساب مبلغ استثمار QT.
 */
export function getQuickInvestment(
  balance: number,
  riskPercent: number
): number {
  return getRiskMoney(
    balance,
    riskPercent
  );
}
/**
 * حساب ربح QT.
 */
export function getQuickProfit(
  investment: number,
  payout: number
): number {
  if (
    !Number.isFinite(
      investment
    ) ||
    investment <= 0
  ) {
    return 0;
  }
  let normalizedPayout =
    payout;
  if (
    normalizedPayout > 1
  ) {
    normalizedPayout /=
      100;
  }
  if (
    !Number.isFinite(
      normalizedPayout
    ) ||
    normalizedPayout < 0
  ) {
    return 0;
  }
  return roundMoney(
    investment *
    normalizedPayout
  );
}
