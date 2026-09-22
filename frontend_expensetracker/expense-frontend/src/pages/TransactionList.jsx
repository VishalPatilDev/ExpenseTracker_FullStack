import { useMemo, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettings } from "@/context/SettingsContext";
import { useToastContext } from "@/context/ToastContext";
import { addInstallmentPayment } from "@/api/expenseApi";
import { useAsync } from "@/hooks/useAsync";
import { formatINR, formatDateTime, todayISO } from "@/utils/formatters";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import FormField, { inputCls } from "@/components/ui/FormField";
import Spinner from "@/components/ui/Spinner";
import { Search, Download, X } from "lucide-react";

// ── Status badge mapping ──────────────────────────────────────────────────────
const STATUS_VARIANT = {
  COMPLETE: "success",
  PARTIAL: "warning",
  PENDING: "danger",
};

// ── Payment modal for installment expenses ────────────────────────────────────
function PaymentModal({ expense, onClose, onSuccess }) {
  const [form, setForm] = useState({ amount: "", date: todayISO(), remark: "" });
  const { execute, loading, error } = useAsync(
    (installmentId, data) => addInstallmentPayment(installmentId, data)
  );
  const toast = useToastContext();

  // Find first pending installment
  const pendingInstallment = expense.installments?.find(
    (i) => i.status !== "PAID"
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!pendingInstallment) return;
    try {
      await execute(pendingInstallment.id, {
        amount: Number(form.amount),
        date: `${form.date}T00:00:00`,
        remark: form.remark,
      });
      toast.success("Payment recorded");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to record payment");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3 bg-slate-800/50 rounded-lg p-3 text-center">
        {[
          { label: "Total", val: expense.total },
          { label: "Paid", val: expense.paid },
          { label: "Pending", val: expense.pending },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-medium text-white">₹{formatINR(val)}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <FormField label="Amount (₹)">
        <input
          type="number"
          min="1"
          max={expense.pending}
          required
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          className={inputCls}
        />
      </FormField>
      <FormField label="Date">
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          className={inputCls}
        />
      </FormField>
      <FormField label="Remark">
        <input
          type="text"
          value={form.remark}
          onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))}
          className={inputCls}
        />
      </FormField>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>Record payment</Button>
      </div>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TransactionList() {
  const { expenses, loading, refetch } = useExpenses();
  const { categories, contacts } = useSettings();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "", category: "", paymentType: "", paymentStatus: "", contact: "",
  });
  const [paymentTarget, setPaymentTarget] = useState(null);

  const handleFilter = (e) =>
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
  const clearFilters = () =>
    setFilters({ type: "", category: "", paymentType: "", paymentStatus: "", contact: "" });

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !(e.contact?.name?.toLowerCase().includes(q) ||
            e.category?.name?.toLowerCase().includes(q) ||
            e.particular?.toLowerCase().includes(q))
        ) return false;
      }
      if (filters.type && e.type !== filters.type) return false;
      if (filters.category && String(e.category?.id) !== String(filters.category)) return false;
      if (filters.paymentType && e.paymentType !== filters.paymentType) return false;
      if (filters.paymentStatus && e.paymentStatus !== filters.paymentStatus) return false;
      if (filters.contact && String(e.contact?.id) !== String(filters.contact)) return false;
      return true;
    });
  }, [expenses, search, filters]);

  const totals = useMemo(() => ({
    gst: filtered.reduce((s, e) => s + Number(e.gstAmount || 0), 0),
    tds: filtered.reduce((s, e) => s + Number(e.tdsAmount || 0), 0),
    paid: filtered.reduce((s, e) => s + Number(e.paid || 0), 0),
    pending: filtered.reduce((s, e) => s + Number(e.pending || 0), 0),
    income: filtered.filter((e) => e.type === "INCOME").reduce((s, e) => s + Number(e.paid || 0), 0),
    expense: filtered.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + Number(e.paid || 0), 0),
  }), [filtered]);

  const downloadCSV = () => {
    const headers = ["#","ID","Date","Type","Contact","Category","Particular","Amount","GST%","GST Amt","TDS%","Total","Paid","Pending","Payment Type","Method","Status","Remark"];
    const rows = filtered.map((e, i) => [
      i + 1, e.id, formatDateTime(e.date), e.type,
      e.contact?.name || "", e.category?.name || "",
      e.particular || "", e.amount || 0,
      e.gstPercentage || 0, e.gstAmount || 0,
      e.tdsPercentage || 0, e.total || 0,
      e.paid || 0, e.pending || 0,
      e.paymentType, e.paymentMethod, e.paymentStatus, e.remark || "",
    ]);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-white">Transactions</h1>

      {/* Search + download */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by contact, category…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-8 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={downloadCSV}>
          <Download size={14} /> CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { name: "type", label: "Type", opts: [["", "All types"], ["INCOME", "Income"], ["EXPENSE", "Expense"]] },
          { name: "paymentType", label: "Payment type", opts: [["", "All"], ["ONE_TIME", "One time"], ["INSTALLMENT", "Installment"]] },
          { name: "paymentStatus", label: "Status", opts: [["", "All status"], ["PENDING", "Pending"], ["PARTIAL", "Partial"], ["COMPLETE", "Complete"]] },
        ].map(({ name, label, opts }) => (
          <select
            key={name}
            name={name}
            value={filters[name]}
            onChange={handleFilter}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <select
          name="category"
          value={filters.category}
          onChange={handleFilter}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          name="contact"
          value={filters.contact}
          onChange={handleFilter}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All contacts</option>
          {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {Object.values(filters).some(Boolean) && (
          <button onClick={clearFilters} className="text-xs text-rose-400 hover:text-rose-300 px-2">
            Clear filters
          </button>
        )}
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total GST", val: totals.gst },
          { label: "Total TDS", val: totals.tds },
          { label: "Income", val: totals.income, cls: "text-emerald-400" },
          { label: "Expense", val: totals.expense, cls: "text-rose-400" },
          { label: "Pending", val: totals.pending, cls: "text-amber-400" },
        ].map(({ label, val, cls = "text-slate-100" }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-slate-500">{label}: </span>
            <span className={`font-medium ${cls}`}>₹{formatINR(val)}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-slate-500 self-center">
          {filtered.length} / {expenses.length} records
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-800/60">
            <tr>
              {["#","Date","Type","Contact","Category","Particular","Amount","GST","TDS","Total","Paid","Pending","Method","Status","Action"].map((h) => (
                <th key={h} className="px-3 py-2.5 font-medium text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={15} className="text-center py-12 text-slate-500">No transactions found</td>
              </tr>
            ) : (
              filtered.map((e, i) => (
                <tr key={e.id} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                  <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{formatDateTime(e.date)}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={e.type === "INCOME" ? "success" : "danger"}>{e.type}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-slate-200">{e.contact?.name || "-"}</td>
                  <td className="px-3 py-2.5 text-slate-400">{e.category?.name || "-"}</td>
                  <td className="px-3 py-2.5 text-slate-200 max-w-[140px] truncate">{e.particular || "-"}</td>
                  <td className="px-3 py-2.5 text-slate-200">₹{formatINR(e.amount)}</td>
                  <td className="px-3 py-2.5 text-slate-400">{e.gstPercentage ?? 0}%</td>
                  <td className="px-3 py-2.5 text-slate-400">{e.tdsPercentage ?? 0}%</td>
                  <td className="px-3 py-2.5 font-medium text-white">₹{formatINR(e.total)}</td>
                  <td className="px-3 py-2.5 text-emerald-400">₹{formatINR(e.paid)}</td>
                  <td className="px-3 py-2.5 text-amber-400">₹{formatINR(e.pending)}</td>
                  <td className="px-3 py-2.5 text-slate-400">{e.paymentMethod?.replace("_", " ") || "-"}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={STATUS_VARIANT[e.paymentStatus] || "neutral"}>
                      {e.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {e.paymentType === "INSTALLMENT" && e.paymentStatus !== "COMPLETE" && (
                      <button
                        onClick={() => setPaymentTarget(e)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 whitespace-nowrap"
                      >
                        Pay now
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment modal */}
      <Modal
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        title={`Record Payment — #${paymentTarget?.id}`}
      >
        {paymentTarget && (
          <PaymentModal
            expense={paymentTarget}
            onClose={() => setPaymentTarget(null)}
            onSuccess={refetch}
          />
        )}
      </Modal>
    </div>
  );
}