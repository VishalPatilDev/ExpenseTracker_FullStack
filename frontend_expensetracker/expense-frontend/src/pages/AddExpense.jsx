import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useToastContext } from "@/context/ToastContext";
import { createExpense } from "@/api/expenseApi";
import { useAsync } from "@/hooks/useAsync";
import { calcTotal, todayISO, dateToLocalDateTime, formatINR } from "@/utils/formatters";
import Button from "@/components/ui/Button";
import FormField, { inputCls, selectCls } from "@/components/ui/FormField";
import Modal from "@/components/ui/Modal";

const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CREDIT_CARD", "DEBIT_CARD"];

const EMPTY = {
  type: "EXPENSE",
  contactId: "",
  categoryId: "",
  date: todayISO(),
  particular: "",
  amount: "",
  gstPercentage: "",
  gstNumber: "",
  tdsPercentage: "",
  paymentType: "ONE_TIME",
  paymentMethod: "UPI",
  bankId: "",
  remark: "",
};

// ── Installment row ───────────────────────────────────────────────────────────
function InstallmentRow({ idx, data, onChange, onRemove, total }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-end">
      <span className="col-span-1 text-xs text-slate-400 pt-5">#{idx + 1}</span>
      <FormField label="Due Date" className="col-span-4">
        <input
          type="date"
          value={data.dueDate}
          onChange={(e) => onChange(idx, "dueDate", e.target.value)}
          className={inputCls}
        />
      </FormField>
      <FormField label="Amount (₹)" className="col-span-4">
        <input
          type="number"
          min="0"
          value={data.dueAmount}
          onChange={(e) => onChange(idx, "dueAmount", e.target.value)}
          className={inputCls}
        />
      </FormField>
      <button
        type="button"
        onClick={() => onRemove(idx)}
        className="col-span-3 mb-0.5 text-xs text-rose-400 hover:text-rose-300"
      >
        Remove
      </button>
    </div>
  );
}

export default function AddExpense() {
  const { categories, contacts, banks, loaded, refresh } = useSettings();
  const toast = useToastContext();
  const { execute, loading } = useAsync(createExpense);

  const [form, setForm] = useState(EMPTY);
  const [hasGst, setHasGst] = useState(false);
  const [hasTds, setHasTds] = useState(false);
  const [installments, setInstallments] = useState([{ dueDate: todayISO(), dueAmount: "" }]);

  useEffect(() => {
    if (!loaded) refresh();
  }, [loaded, refresh]);

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const handle = (e) => set(e.target.name, e.target.value);

  const total = calcTotal(
    form.amount,
    hasGst ? form.gstPercentage : 0,
    hasTds ? form.tdsPercentage : 0
  );

  const addInstallmentRow = () =>
    setInstallments((p) => [...p, { dueDate: todayISO(), dueAmount: "" }]);

  const updateInstallment = (idx, key, val) =>
    setInstallments((p) => p.map((item, i) => (i === idx ? { ...item, [key]: val } : item)));

  const removeInstallment = (idx) =>
    setInstallments((p) => p.filter((_, i) => i !== idx));

  const resetForm = () => {
    setForm(EMPTY);
    setHasGst(false);
    setHasTds(false);
    setInstallments([{ dueDate: todayISO(), dueAmount: "" }]);
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      type: form.type,
      contactId: Number(form.contactId),
      categoryId: Number(form.categoryId),
      date: dateToLocalDateTime(form.date),
      particular: form.particular,
      amount: Number(form.amount),
      gstPercentage: hasGst ? Number(form.gstPercentage) : null,
      gstNumber: hasGst ? form.gstNumber : null,
      tdsPercentage: hasTds ? Number(form.tdsPercentage) : null,
      total,
      paymentType: form.paymentType,
      paymentMethod: form.paymentMethod,
      bankId: form.paymentMethod === "BANK_TRANSFER" ? Number(form.bankId) : null,
      remark: form.remark,
    };

    if (form.paymentType === "INSTALLMENT") {
      const schedTotal = installments.reduce((s, i) => s + Number(i.dueAmount || 0), 0);
      if (Math.abs(schedTotal - total) > 0.01) {
        toast.error(`Installment amounts (₹${formatINR(schedTotal)}) must equal total (₹${formatINR(total)})`);
        return;
      }
      payload.numberOfInstallments = installments.length;
      payload.installments = installments.map((item, i) => ({
        installmentNumber: i + 1,
        dueAmount: Number(item.dueAmount),
        dueDate: item.dueDate,
      }));
    }

    try {
      await execute(payload);
      toast.success("Transaction saved successfully");
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save transaction");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-white mb-6">Add Transaction</h1>

      <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
        {/* Row 1: type + contact */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Type">
            <select name="type" value={form.type} onChange={handle} className={selectCls}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </FormField>
          <FormField label="Contact">
            <select name="contactId" value={form.contactId} onChange={handle} required className={selectCls}>
              <option value="">Select contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Row 2: date + category */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date">
            <input type="date" name="date" value={form.date} onChange={handle} required className={inputCls} />
          </FormField>
          <FormField label="Category">
            <select name="categoryId" value={form.categoryId} onChange={handle} required className={selectCls}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Particular + amount */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Particular">
            <input
              type="text"
              name="particular"
              value={form.particular}
              onChange={handle}
              required
              placeholder="e.g. Office rent"
              className={inputCls}
            />
          </FormField>
          <FormField label="Amount (₹)">
            <input
              type="number"
              name="amount"
              min="0"
              value={form.amount}
              onChange={handle}
              required
              placeholder="0"
              className={inputCls}
            />
          </FormField>
        </div>

        {/* GST / TDS toggles */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasGst}
              onChange={(e) => {
                setHasGst(e.target.checked);
                if (!e.target.checked) set("gstPercentage", "");
              }}
              className="accent-indigo-500"
            />
            Apply GST
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasTds}
              onChange={(e) => {
                setHasTds(e.target.checked);
                if (!e.target.checked) set("tdsPercentage", "");
              }}
              className="accent-indigo-500"
            />
            Apply TDS
          </label>
        </div>

        {hasGst && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="GST %">
              <input
                type="number"
                name="gstPercentage"
                min="0"
                max="100"
                value={form.gstPercentage}
                onChange={handle}
                required
                placeholder="18"
                className={inputCls}
              />
            </FormField>
            <FormField label="GST Number">
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handle}
                placeholder="GSTIN"
                className={inputCls}
              />
            </FormField>
          </div>
        )}

        {hasTds && (
          <FormField label="TDS %" className="w-1/2">
            <input
              type="number"
              name="tdsPercentage"
              min="0"
              max="100"
              value={form.tdsPercentage}
              onChange={handle}
              required
              placeholder="10"
              className={inputCls}
            />
          </FormField>
        )}

        {/* Total display */}
        <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3">
          <span className="text-sm text-slate-400">Total payable</span>
          <span className="text-lg font-semibold text-white">₹{formatINR(total)}</span>
        </div>

        {/* Payment type + method */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Payment type">
            <select
              name="paymentType"
              value={form.paymentType}
              onChange={(e) => {
                set("paymentType", e.target.value);
                if (e.target.value === "INSTALLMENT" && installments.length === 0) {
                  setInstallments([{ dueDate: todayISO(), dueAmount: "" }]);
                }
              }}
              className={selectCls}
            >
              <option value="ONE_TIME">One time</option>
              <option value="INSTALLMENT">Installments</option>
            </select>
          </FormField>
          <FormField label="Payment method">
            <select name="paymentMethod" value={form.paymentMethod} onChange={handle} className={selectCls}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m.replace("_", " ")}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Bank selector (only for BANK_TRANSFER) */}
        {form.paymentMethod === "BANK_TRANSFER" && (
          <FormField label="Bank">
            <select name="bankId" value={form.bankId} onChange={handle} required className={selectCls}>
              <option value="">Select bank</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>{b.name} — {b.accountNumber}</option>
              ))}
            </select>
          </FormField>
        )}

        {/* Installment schedule */}
        {form.paymentType === "INSTALLMENT" && (
          <div className="flex flex-col gap-3 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Installment schedule</p>
              <button
                type="button"
                onClick={addInstallmentRow}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                + Add row
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {installments.map((item, idx) => (
                <InstallmentRow
                  key={idx}
                  idx={idx}
                  data={item}
                  onChange={updateInstallment}
                  onRemove={removeInstallment}
                  total={total}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Scheduled: ₹{formatINR(installments.reduce((s, i) => s + Number(i.dueAmount || 0), 0))} / Total: ₹{formatINR(total)}
            </p>
          </div>
        )}

        {/* Remark */}
        <FormField label="Remark">
          <textarea
            name="remark"
            value={form.remark}
            onChange={handle}
            rows={2}
            placeholder="Optional note"
            className={inputCls}
          />
        </FormField>

        <Button type="submit" loading={loading} className="w-full">
          Save transaction
        </Button>
      </form>
    </div>
  );
}