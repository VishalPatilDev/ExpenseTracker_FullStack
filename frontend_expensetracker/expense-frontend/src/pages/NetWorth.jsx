import { useState, useEffect, useCallback } from "react";
import {
  getNetWorth, getNetWorthTarget, upsertNetWorthTarget,
  deleteNetWorthTarget, getNetWorthProjection, takeNetWorthSnapshot,
  getNetWorthSnapshots,
} from "@/api/assetsApi";
import { useAsync } from "@/hooks/useAsync";
import { useToastContext } from "@/context/ToastContext";
import { formatINR } from "@/utils/formatters";
import Button from "@/components/ui/Button";
import FormField, { inputCls } from "@/components/ui/FormField";
import Spinner from "@/components/ui/Spinner";

function StatCard({ label, value, variant = "default" }) {
  const color = variant === "positive" ? "text-emerald-400" : variant === "negative" ? "text-rose-400" : "text-white";
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>₹{formatINR(value)}</p>
    </div>
  );
}

export default function NetWorth() {
  const toast = useToastContext();
  const [summary, setSummary] = useState(null);
  const [target, setTarget] = useState(null);
  const [projection, setProjection] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetForm, setTargetForm] = useState({ targetAmount: "", targetYear: new Date().getFullYear() + 10, inflationRate: "6" });
  const [showTargetForm, setShowTargetForm] = useState(false);

  const { execute: saveTarget, loading: savingTarget } = useAsync(upsertNetWorthTarget);
  const { execute: snap, loading: snapping } = useAsync(takeNetWorthSnapshot);
  const { execute: delTarget, loading: deletingTarget } = useAsync(deleteNetWorthTarget);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nw, snaps] = await Promise.all([getNetWorth(), getNetWorthSnapshots()]);
      setSummary(nw.data?.data ?? nw.data);
      setSnapshots(snaps.data?.data ?? snaps.data ?? []);

      try {
        const t = await getNetWorthTarget();
        setTarget(t.data?.data ?? t.data);
      } catch { setTarget(null); }

      try {
        const p = await getNetWorthProjection();
        setProjection(p.data?.data ?? p.data);
      } catch { setProjection(null); }
    } catch (err) {
      toast.error("Failed to load net worth data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTargetSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveTarget({
        targetAmount: Number(targetForm.targetAmount),
        targetYear: Number(targetForm.targetYear),
        inflationRate: Number(targetForm.inflationRate),
      });
      toast.success("Target saved");
      setShowTargetForm(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save target");
    }
  };

  const handleSnapshot = async () => {
    try {
      await snap();
      toast.success("Snapshot taken");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to take snapshot");
    }
  };

  const handleDeleteTarget = async () => {
    if (!window.confirm("Delete the active target?")) return;
    try {
      await delTarget();
      toast.success("Target deleted");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  if (loading)
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  const chartMax = projection
    ? Math.max(
        ...projection.yearlyData.map((d) =>
          Math.max(d.actualNetWorth ?? 0, d.projectedNetWorth ?? 0, d.targetNetWorth ?? 0)
        ), 1
      )
    : 1;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Net Worth</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSnapshot} loading={snapping}>
            Take snapshot
          </Button>
          <Button size="sm" onClick={() => setShowTargetForm((p) => !p)}>
            {target ? "Edit target" : "Set target"}
          </Button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Assets" value={summary.totalAssets} variant="positive" />
          <StatCard label="Total Liabilities" value={summary.totalLiabilities} variant="negative" />
          <StatCard
            label="Net Worth"
            value={summary.netWorth}
            variant={Number(summary.netWorth) >= 0 ? "positive" : "negative"}
          />
        </div>
      )}

      {/* Target form */}
      {showTargetForm && (
        <form onSubmit={handleTargetSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-3 gap-4">
          <FormField label="Target amount (₹)">
            <input type="number" min="1" required value={targetForm.targetAmount}
              onChange={(e) => setTargetForm((p) => ({ ...p, targetAmount: e.target.value }))}
              className={inputCls} />
          </FormField>
          <FormField label="Target year">
            <input type="number" min={new Date().getFullYear()} required value={targetForm.targetYear}
              onChange={(e) => setTargetForm((p) => ({ ...p, targetYear: e.target.value }))}
              className={inputCls} />
          </FormField>
          <FormField label="Inflation rate (%)">
            <input type="number" min="0" step="0.1" required value={targetForm.inflationRate}
              onChange={(e) => setTargetForm((p) => ({ ...p, inflationRate: e.target.value }))}
              className={inputCls} />
          </FormField>
          <div className="col-span-3 flex gap-3 justify-end">
            {target && (
              <Button type="button" variant="danger" size="sm" onClick={handleDeleteTarget} loading={deletingTarget}>
                Delete target
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => setShowTargetForm(false)}>Cancel</Button>
            <Button type="submit" loading={savingTarget}>Save target</Button>
          </div>
        </form>
      )}

      {/* Target summary */}
      {target && (
        <div className="bg-slate-900 border border-indigo-500/20 rounded-xl p-5">
          <p className="text-xs text-indigo-400 mb-3 font-medium uppercase tracking-widest">Active Target</p>
          <div className="grid grid-cols-4 gap-4 text-sm">
            {[
              { label: "Target amount", val: `₹${formatINR(target.targetAmount)}` },
              { label: "Target year", val: target.targetYear },
              { label: "Inflation rate", val: `${target.inflationRate}%` },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-medium text-white">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projection chart */}
      {projection && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-white">Net Worth Projection</p>
            <span className="text-xs text-slate-500">
              Method: {projection.assumptions?.projectionMethod}
            </span>
          </div>

          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-4 mb-5 mt-3">
            {[
              { label: "Required annual saving", val: projection.summary?.requiredAnnualSaving },
              { label: "Progress", val: null, pct: projection.summary?.progressPercentage },
              { label: "Years remaining", val: null, count: projection.summary?.yearsRemaining },
            ].map(({ label, val, pct, count }) => (
              <div key={label} className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                {val != null && <p className="text-sm font-semibold text-white">₹{formatINR(val)}</p>}
                {pct != null && <p className="text-sm font-semibold text-indigo-400">{formatINR(pct)}%</p>}
                {count != null && <p className="text-sm font-semibold text-white">{count} yrs</p>}
              </div>
            ))}
          </div>

          {/* Simple bar chart */}
          <div className="flex items-end gap-1 h-40">
            {projection.yearlyData.map((d) => (
              <div key={d.year} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="flex items-end gap-0.5 w-full justify-center h-32">
                  {[
                    { v: d.actualNetWorth, cls: "bg-emerald-500" },
                    { v: d.projectedNetWorth, cls: "bg-indigo-500" },
                    { v: d.targetNetWorth, cls: "bg-amber-500" },
                  ].map(({ v, cls }, i) =>
                    v != null ? (
                      <div
                        key={i}
                        style={{ height: `${Math.max((v / chartMax) * 100, 3)}%` }}
                        className={`w-full rounded-t ${cls}`}
                        title={`₹${formatINR(v)}`}
                      />
                    ) : (
                      <div key={i} className="w-full" />
                    )
                  )}
                </div>
                <span className="text-[10px] text-slate-500">{d.year}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-3">
            {[
              { label: "Actual", cls: "bg-emerald-500" },
              { label: "Projected", cls: "bg-indigo-500" },
              { label: "Target", cls: "bg-amber-500" },
            ].map(({ label, cls }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`h-2 w-2 rounded-full ${cls}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Snapshots */}
      {snapshots.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-4">Historical snapshots</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {["Year", "Date", "Assets", "Liabilities", "Net Worth"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr key={s.id} className="border-t border-slate-800">
                    <td className="px-3 py-2 text-white font-medium">{s.year}</td>
                    <td className="px-3 py-2 text-slate-400">{s.snapshotDate}</td>
                    <td className="px-3 py-2 text-emerald-400">₹{formatINR(s.totalAssets)}</td>
                    <td className="px-3 py-2 text-rose-400">₹{formatINR(s.totalLiabilities)}</td>
                    <td className="px-3 py-2 font-semibold text-white">₹{formatINR(s.netWorth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}