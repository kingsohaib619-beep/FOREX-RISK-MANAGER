"use client";
import {
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
export type Pair =
  | "EUR/USD"
  | "GBP/USD"
  | "USD/JPY"
  | "USD/CHF"
  | "AUD/USD"
  | "USD/CAD"
  | "NZD/USD"
  | "EUR/GBP";
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
type NewSessionProps = {
  accountType: AccountType;
  setAccountType: (
    value: AccountType
  ) => void;
  balance: string;
  setBalance: (value: string) => void;
  target: string;
  setTarget: (value: string) => void;
  maxLoss: string;
  setMaxLoss: (value: string) => void;
  risk: string;
  setRisk: (value: string) => void;
  pair: Pair;
  setPair: (value: Pair) => void;
  sl: string;
  setSl: (value: string) => void;
  tp: string;
  setTp: (value: string) => void;
  payout: string;
  setPayout: (value: string) => void;
  onBack: () => void;
  onStart: () => void;
};
const PAIRS: Pair[] = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "USD/CAD",
  "NZD/USD",
  "EUR/GBP",
];
const RISK_OPTIONS = [
  "0.5",
  "1",
  "1.5",
  "2",
  "3",
];
const ACCOUNT_OPTIONS: {
  value: AccountType;
  label: string;
  group: string;
}[] = [
  {
    value: "QT_REAL",
    label: "QT Real",
    group: "Pocket Option",
  },
  {
    value: "QT_DEMO",
    label: "QT Demo",
    group: "Pocket Option",
  },
  {
    value: "TOURNAMENT",
    label: "Tournament",
    group: "Pocket Option",
  },
  {
    value: "MT5_REAL",
    label: "Forex MT5 Real",
    group: "Forex",
  },
  {
    value: "MT5_DEMO",
    label: "Forex MT5 Demo",
    group: "Forex",
  },
  {
    value: "MT4_REAL",
    label: "Forex MT4 Real",
    group: "Forex",
  },
  {
    value: "MT4_DEMO",
    label: "Forex MT4 Demo",
    group: "Forex",
  },
  {
    value: "SHARES_REAL",
    label: "Shares Real",
    group: "Shares",
  },
  {
    value: "SHARES_DEMO",
    label: "Shares Demo",
    group: "Shares",
  },
];
function isPocketOption(
  accountType: AccountType
) {
  return (
    accountType === "QT_REAL" ||
    accountType === "QT_DEMO" ||
    accountType === "TOURNAMENT"
  );
}
function isForex(
  accountType: AccountType
) {
  return (
    accountType === "MT5_REAL" ||
    accountType === "MT5_DEMO" ||
    accountType === "MT4_REAL" ||
    accountType === "MT4_DEMO"
  );
}
function isShares(
  accountType: AccountType
) {
  return (
    accountType === "SHARES_REAL" ||
    accountType === "SHARES_DEMO"
  );
}
export default function NewSession({
  accountType,
  setAccountType,
  balance,
  setBalance,
  target,
  setTarget,
  maxLoss,
  setMaxLoss,
  risk,
  setRisk,
  pair,
  setPair,
  sl,
  setSl,
  tp,
  setTp,
  payout,
  setPayout,
  onBack,
  onStart,
}: NewSessionProps) {
  const balanceNumber =
    Number(balance);
  const targetNumber =
    Number(target);
  const maxLossNumber =
    Number(maxLoss);
  const riskNumber =
    Number(risk);
  const slNumber =
    Number(sl);
  const tpNumber =
    Number(tp);
  const payoutNumber =
    Number(payout);
  const isQT =
    isPocketOption(
      accountType
    );
  const isForexAccount =
    isForex(
      accountType
    );
  const isSharesAccount =
    isShares(
      accountType
    );
  const isValid =
    balanceNumber > 0 &&
    targetNumber > 0 &&
    maxLossNumber > 0 &&
    riskNumber > 0 &&
    slNumber > 0 &&
    tpNumber > 0 &&
    (
      !isQT ||
      (
        payoutNumber > 0 &&
        payoutNumber <= 100
      )
    );
  const riskAmount =
    balanceNumber > 0 &&
    riskNumber > 0
      ? balanceNumber *
        (riskNumber / 100)
      : 0;
  const riskToTarget =
    balanceNumber > 0 &&
    targetNumber > 0
      ? (
          targetNumber /
          balanceNumber
        ) * 100
      : 0;
  const rr =
    slNumber > 0 &&
    tpNumber > 0
      ? tpNumber / slNumber
      : 0;
  const selectedAccount =
    ACCOUNT_OPTIONS.find(
      (item) =>
        item.value ===
        accountType
    );
  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto min-h-screen max-w-md bg-[#0b0e13]">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pb-5 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]"
            aria-label="رجوع"
          >
            <ArrowLeft size={19} />
          </button>
          <div className="text-center">
            <div className="text-[10px] font-bold tracking-[0.24em] text-emerald-400">
              FOREX RISK
            </div>
            <h1 className="mt-1 text-base font-bold">
              جلسة جديدة
            </h1>
          </div>
          <div className="w-10" />
        </header>
        <main className="px-5 pb-10">
          {/* Intro */}
          <div className="mb-5">
            <h2 className="text-2xl font-black">
              إعداد جلسة التداول
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/40">
              اختر نوع الحساب أولًا، ثم أدخل
              رأس المال وحدود المخاطرة.
            </p>
          </div>
          {/* Account Type */}
          <section className="rounded-[24px] border border-emerald-400/10 bg-[#0f1319] p-5">
            <SectionTitle>
              نوع حساب التداول
            </SectionTitle>
            <div className="relative">
              <select
                value={
                  accountType
                }
                onChange={(event) =>
                  setAccountType(
                    event.target
                      .value as AccountType
                  )
                }
                className="h-14 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#0b0f14] px-4 pl-10 text-sm font-bold text-white outline-none"
              >
                <optgroup
                  label="Pocket Option"
                >
                  {ACCOUNT_OPTIONS
                    .filter(
                      (item) =>
                        item.group ===
                        "Pocket Option"
                    )
                    .map(
                      (item) => (
                        <option
                          key={
                            item.value
                          }
                          value={
                            item.value
                          }
                          className="bg-[#0b0f14]"
                        >
                          {
                            item.label
                          }
                        </option>
                      )
                    )}
                </optgroup>
                <optgroup
                  label="Forex"
                >
                  {ACCOUNT_OPTIONS
                    .filter(
                      (item) =>
                        item.group ===
                        "Forex"
                    )
                    .map(
                      (item) => (
                        <option
                          key={
                            item.value
                          }
                          value={
                            item.value
                          }
                          className="bg-[#0b0f14]"
                        >
                          {
                            item.label
                          }
                        </option>
                      )
                    )}
                </optgroup>
                <optgroup
                  label="Shares"
                >
                  {ACCOUNT_OPTIONS
                    .filter(
                      (item) =>
                        item.group ===
                        "Shares"
                    )
                    .map(
                      (item) => (
                        <option
                          key={
                            item.value
                          }
                          value={
                            item.value
                          }
                          className="bg-[#0b0f14]"
                        >
                          {
                            item.label
                          }
                        </option>
                      )
                    )}
                </optgroup>
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
            </div>
            <div className="mt-3 rounded-xl bg-emerald-400/[0.04] px-4 py-3">
              <div className="text-[10px] text-white/30">
                الحساب المحدد
              </div>
              <div className="mt-1 text-sm font-bold text-emerald-400">
                {
                  selectedAccount?.label
                }
              </div>
            </div>
          </section>
          {/* Capital */}
          <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">
            <SectionTitle>
              رأس المال والأهداف
            </SectionTitle>
            <MoneyInput
              label="رأس المال"
              value={balance}
              onChange={setBalance}
              placeholder="1000"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MoneyInput
                label="الهدف"
                value={target}
                onChange={setTarget}
                placeholder="50"
              />
              <MoneyInput
                label="أقصى خسارة"
                value={maxLoss}
                onChange={setMaxLoss}
                placeholder="30"
              />
            </div>
            {balanceNumber > 0 && (
              <div className="mt-4 rounded-2xl bg-white/[0.025] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/35">
                    المخاطرة عند النسبة الحالية
                  </span>
                  <strong className="text-emerald-400">
                    $
                    {riskAmount.toFixed(
                      2
                    )}
                  </strong>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-white/35">
                    الهدف كنسبة
                  </span>
                  <strong>
                    {riskToTarget.toFixed(
                      2
                    )}
                    %
                  </strong>
                </div>
              </div>
            )}
          </section>
          {/* Risk */}
          <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">
            <SectionTitle>
              مستوى المخاطرة
            </SectionTitle>
            <p className="mb-4 text-xs leading-5 text-white/35">
              اختر أقصى نسبة من الرصيد
              تخاطر بها في الصفقة.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {RISK_OPTIONS.map(
                (option) => {
                  const active =
                    risk ===
                    option;
                  return (
                    <button
                      key={
                        option
                      }
                      type="button"
                      onClick={() =>
                        setRisk(
                          option
                        )
                      }
                      className={`h-12 rounded-xl border text-xs font-bold transition active:scale-[0.97] ${
                        active
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                          : "border-white/[0.07] bg-[#0b0f14] text-white/45"
                      }`}
                    >
                      {option}%
                    </button>
                  );
                }
              )}
            </div>
            {riskNumber >= 3 && (
              <div className="mt-4 flex gap-3 rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.04] p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-yellow-400"
                />
                <p className="text-[11px] leading-5 text-white/45">
                  نسبة المخاطرة مرتفعة
                  نسبيًا. يفضل استخدام
                  نسبة أقل للحفاظ على
                  رأس المال.
                </p>
              </div>
            )}
          </section>
          {/* QT */}
          {isQT && (
            <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">
              <SectionTitle>
                إعداد Pocket Option
              </SectionTitle>
              <p className="mb-4 text-xs leading-5 text-white/35">
                استخدم نسبة العائد التي
                تعرضها المنصة للأصل
                قبل فتح الصفقة.
              </p>
              <NumberInput
                label="Payout"
                value={payout}
                onChange={setPayout}
                suffix="%"
                placeholder="92"
              />
              <div className="mt-3 rounded-xl bg-white/[0.025] p-3 text-[10px] leading-5 text-white/30">
                مثال: إذا كان Payout
                92%، فإن ربح صفقة رابحة
                يساوي 92% من مبلغ الصفقة.
              </div>
            </section>
          )}
          {/* Forex */}
          {isForexAccount && (
            <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">
              <SectionTitle>
                إعداد Forex
              </SectionTitle>
              <label className="block">
                <span className="mb-2 block text-xs text-white/45">
                  زوج العملات
                </span>
                <div className="relative">
                  <select
                    value={pair}
                    onChange={(event) =>
                      setPair(
                        event.target
                          .value as Pair
                      )
                    }
                    className="h-13 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#0b0f14] px-4 pl-10 text-sm font-bold text-white outline-none"
                  >
                    {PAIRS.map(
                      (item) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                          className="bg-[#0b0f14]"
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />
                </div>
              </label>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <NumberInput
                  label="Stop Loss"
                  value={sl}
                  onChange={setSl}
                  suffix="Pips"
                  placeholder="20"
                />
                <NumberInput
                  label="Take Profit"
                  value={tp}
                  onChange={setTp}
                  suffix="Pips"
                  placeholder="40"
                />
              </div>
              {rr > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.025] px-4 py-3">
                  <span className="text-xs text-white/35">
                    Risk / Reward
                  </span>
                  <span className="text-sm font-bold">
                    1 :{" "}
                    {rr.toFixed(
                      2
                    )}
                  </span>
                </div>
              )}
            </section>
          )}
          {/* Shares */}
          {isSharesAccount && (
            <section className="mt-4 rounded-[24px] border border-white/[0.07] bg-[#0f1319] p-5">
              <SectionTitle>
                إعداد Shares
              </SectionTitle>
              <p className="text-xs leading-5 text-white/35">
                يتم حساب حجم المركز
                بناءً على المبلغ الذي
                تريد المخاطرة به.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <NumberInput
                  label="Stop Loss"
                  value={sl}
                  onChange={setSl}
                  suffix="%"
                  placeholder="2"
                />
                <NumberInput
                  label="Take Profit"
                  value={tp}
                  onChange={setTp}
                  suffix="%"
                  placeholder="4"
                />
              </div>
            </section>
          )}
          {/* Summary */}
          <section className="mt-4 rounded-[24px] border border-emerald-400/10 bg-emerald-400/[0.035] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                <ShieldCheck
                  size={19}
                  className="text-emerald-400"
                />
              </div>
              <div>
                <div className="text-sm font-bold">
                  ملخص الجلسة
                </div>
                <div className="mt-1 text-[11px] text-white/35">
                  {
                    selectedAccount?.label
                  }
                  {" · "}
                  {pair}
                  {" · "}
                  مخاطرة {risk}%
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <SummaryItem
                label="الرصيد"
                value={
                  balanceNumber >
                  0
                    ? `$${balanceNumber.toFixed(
                        0
                      )}`
                    : "—"
                }
              />
              <SummaryItem
                label="المخاطرة"
                value={
                  riskAmount >
                  0
                    ? `$${riskAmount.toFixed(
                        2
                      )}`
                    : "—"
                }
              />
              <SummaryItem
                label={
                  isQT
                    ? "Payout"
                    : "SL"
                }
                value={
                  isQT
                    ? `${payoutNumber}%`
                    : slNumber >
                      0
                    ? `${slNumber} ${
                        isSharesAccount
                          ? "%"
                          : "pips"
                      }`
                    : "—"
                }
              />
            </div>
          </section>
          {/* Start */}
          <button
            type="button"
            disabled={!isValid}
            onClick={onStart}
            className={`mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-bold transition ${
              isValid
                ? "bg-emerald-400 text-[#04120c] active:scale-[0.98]"
                : "cursor-not-allowed bg-white/[0.06] text-white/20"
            }`}
          >
            إنشاء الجلسة
            <ArrowLeft
              size={18}
            />
          </button>
          <p className="mt-5 text-center text-[10px] leading-5 text-white/20">
            هذه الأداة لإدارة المخاطر
            والحسابات فقط، ولا تضمن
            تحقيق أرباح أو نتائج محددة.
          </p>
        </main>
      </div>
    </div>
  );
}
/* =========================================================
   Section Title
========================================================= */
function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-4 text-sm font-bold">
      {children}
    </h3>
  );
}
/* =========================================================
   Money Input
========================================================= */
function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-white/45">
        {label}
      </span>
      <div className="flex h-13 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b0f14] px-4">
        <span className="text-sm text-white/30">
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
                .replace(
                  ",",
                  "."
                )
            )
          }
          placeholder={
            placeholder
          }
          className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/15"
        />
      </div>
    </label>
  );
}
/* =========================================================
   Number Input
========================================================= */
function NumberInput({
  label,
  value,
  onChange,
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  suffix: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-white/45">
        {label}
      </span>
      <div className="flex h-13 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b0f14] px-4">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
                .replace(
                  ",",
                  "."
                )
            )
          }
          placeholder={
            placeholder
          }
          className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/15"
        />
        <span className="shrink-0 text-[10px] text-white/25">
          {suffix}
        </span>
      </div>
    </label>
  );
}
/* =========================================================
   Summary Item
========================================================= */
function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.025] p-3 text-center">
      <div className="text-[9px] text-white/25">
        {label}
      </div>
      <div className="mt-1 text-xs font-bold">
        {value}
      </div>
    </div>
  );
}
