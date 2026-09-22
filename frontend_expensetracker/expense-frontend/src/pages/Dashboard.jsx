import { useMemo, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { formatINR } from "@/utils/formatters";
import Spinner from "@/components/ui/Spinner";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDate(expense) {
  if (!expense.date) return null;
  const d = new Date(expense.date);
  return isNaN(d.getTime()) ? null : d;
}
function getAmount(expense) {
  return Number(expense.total ?? expense.amount ?? 0);
}

function sumFiltered(expenses, type, from, to) {
  const now = new Date();
  return expenses
    .filter((e) => {
      if (e.type !== type) return false;
      const d = getDate(e);
      if (!d) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    })
    .reduce((s, e) => s + getAmount(e), 0);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#a78bfa"];

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({ title, rows, accent }) {
  const accents = {
    indigo: "border-indigo-500/30 text-indigo-400",
    emerald: "border-emerald-500/30 text-emerald-400",
    amber: "border-amber-500/30 text-amber-400",
    rose: "border-rose-500/30 text-rose-400",
    violet: "border-violet-500/30 text-violet-400",
  };
  return (
    <div className={`bg-slate-900 border ${accents[accent] || "border-slate-800"} rounded-xl p-5`}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-60">{title}</p>
      <div className="flex flex-col gap-2">
        {rows.map(({ label, value, highlight }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{label}</span>
            <span className={`text-sm font-medium ${highlight ? (Number(value) >= 0 ? "text-emerald-400" : "text-rose-400") : "text-slate-100"}`}>
              ₹{formatINR(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { expenses, loading } = useExpenses();
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const now = new Date();

  const stats = useMemo(() => {
    const periods = [
      { label: "Today", from: daysAgo(1) },
      { label: "7 days", from: daysAgo(7) },
      { label: "30 days", from: daysAgo(30) },
      { label: "365 days", from: daysAgo(365) },
      { label: "All time", from: null },
    ];
    return periods.map(({ label, from }) => ({
      label,
      income: sumFiltered(expenses, "INCOME", from, null),
      expense: sumFiltered(expenses, "EXPENSE", from, null),
    }));
  }, [expenses]);

  const availableYears = useMemo(() => {
    const years = expenses
      .map((e) => getDate(e)?.getFullYear())
      .filter(Boolean);
    return [...new Set([...years, now.getFullYear()])].sort();
  }, [expenses]);

  const monthlyData = useMemo(() => {
    return MONTHS.map((month, i) => {
      let income = 0, expense = 0;
      expenses.forEach((e) => {
        const d = getDate(e);
        if (!d) return;
        if (d.getFullYear() !== Number(selectedYear)) return;
        if (d.getMonth() !== i) return;
        if (Number(selectedYear) === now.getFullYear() && i > now.getMonth()) return;
        const a = getAmount(e);
        if (e.type === "INCOME") income += a;
        if (e.type === "EXPENSE") expense += a;
      });
      return { month, income, expense, saving: income - expense };
    });
  }, [expenses, selectedYear]);

  const chartMax = useMemo(() => {
    const vals = monthlyData.flatMap((d) => [d.income, d.expense, Math.abs(d.saving)]);
    return Math.max(...vals, 1);
  }, [monthlyData]);

  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (e.type !== "EXPENSE") return;
      const d = getDate(e);
      if (!d) return;
      if (selectedYear !== "All" && d.getFullYear() !== Number(selectedYear)) return;
      const name = e.category?.name || "Uncategorized/Assets";
      map[name] = (map[name] || 0) + getAmount(e);
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([name, amount], i) => ({ name, amount, pct: total > 0 ? (amount / total) * 100 : 0, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, selectedYear]);

  const pendingIncome = useMemo(() =>
    expenses.filter((e) => e.type === "INCOME").reduce((s, e) => s + Number(e.pending || 0), 0),
    [expenses]);
  const pendingExpense = useMemo(() =>
    expenses.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + Number(e.pending || 0), 0),
    [expenses]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-white">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <SummaryCard
          title="Income"
          accent="emerald"
          rows={stats.map((s) => ({ label: s.label, value: s.income }))}
        />
        <SummaryCard
          title="Expense"
          accent="rose"
          rows={stats.map((s) => ({ label: s.label, value: s.expense }))}
        />
        <SummaryCard
          title="Savings / Loss"
          accent="indigo"
          rows={stats.map((s) => ({ label: s.label, value: s.income - s.expense, highlight: true }))}
        />
        <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/60 mb-2">
            Pending Income
          </p>
          <p className="text-2xl font-bold text-emerald-400">₹{formatINR(pendingIncome)}</p>
          <p className="text-xs text-slate-500 mt-1">Amount to be received</p>
        </div>
        <div className="bg-slate-900 border border-rose-500/20 rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-400/60 mb-2">
            Pending Expense
          </p>
          <p className="text-2xl font-bold text-rose-400">₹{formatINR(pendingExpense)}</p>
          <p className="text-xs text-slate-500 mt-1">Amount to be paid</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Monthly bar chart */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-white">Monthly Overview</p>
            <div className="flex items-center gap-1">
              {availableYears.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(String(y))}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${selectedYear === String(y)
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                    }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-1 h-36">
            {monthlyData.map(({ month, income, expense, saving }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="flex items-end gap-0.5 w-full justify-center h-28">
                  {[
                    { v: income, cls: "bg-emerald-500" },
                    { v: expense, cls: "bg-rose-500" },
                    { v: Math.abs(saving), cls: saving >= 0 ? "bg-indigo-500" : "bg-amber-500" },
                  ].map(({ v, cls }, i) => (
                    <div
                      key={i}
                      style={{ height: `${Math.max((v / chartMax) * 100, v > 0 ? 3 : 0)}%` }}
                      className={`w-full rounded-t ${cls} transition-all`}
                      title={`₹${formatINR(v)}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500">{month}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-3">
            {[
              { label: "Income", cls: "bg-emerald-500" },
              { label: "Expense", cls: "bg-rose-500" },
              { label: "Saving", cls: "bg-indigo-500" },
              { label: "Loss", cls: "bg-amber-500" },
            ].map(({ label, cls }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`h-2 w-2 rounded-full ${cls}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Category donut */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-4">Expense by Category</p>
          {categoryData.length === 0 ? (
            <p className="text-sm text-slate-500">No data</p>
          ) : (
            <>
              <div
                className="rounded-full mx-auto mb-4"
                style={{
                  width: 120,
                  height: 120,
                  background: (() => {
                    let cur = 0;
                    const parts = categoryData.map(({ pct, color }) => {
                      const start = cur;
                      cur += pct;
                      return `${color} ${start}% ${cur}%`;
                    });
                    return `conic-gradient(${parts.join(", ")})`;
                  })(),
                }}
              />
              <div className="flex flex-col gap-2 overflow-y-auto max-h-48">
                {categoryData.map(({ name, amount, pct, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                      {name}
                    </span>
                    <span className="text-slate-400 shrink-0 ml-2">
                      ₹{formatINR(amount)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}