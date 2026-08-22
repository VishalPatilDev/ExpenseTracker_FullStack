import { Checkbox } from "@/components/ui/checkbox";
import SearchableDropdown from "../filters/SearchableDropdown";

// ─────────────────────────────────────────────────────────────
// Shared styled primitives to match PJSOFTTECH outlined inputs
// ─────────────────────────────────────────────────────────────

const OutlinedField = ({ label, children }) => (
    <div className="relative border border-gray-300 rounded px-3 pt-5 pb-2 focus-within:border-[#4A90D9] transition-colors">
        <span className="absolute top-1 left-3 text-[10px] font-medium text-gray-400 uppercase tracking-wide">
            {label}
        </span>
        {children}
    </div>
);

const OutlinedSelect = ({ label, value, onChange, children }) => (
    <OutlinedField label={label}>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
        >
            {children}
        </select>
    </OutlinedField>
);

const OutlinedInput = ({ label, type = "text", value, onChange, placeholder, min, max, step, required }) => (
    <OutlinedField label={label}>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder ?? ""}
            min={min}
            max={max}
            step={step}
            required={required}
            className="w-full bg-transparent text-sm text-gray-700 focus:outline-none placeholder:text-gray-300"
        />
    </OutlinedField>
);

// ─────────────────────────────────────────────────────────────
// TransactionForm
// ─────────────────────────────────────────────────────────────

export default function TransactionForm({
    form,
    contacts,
    categories,
    banks,
    hasGst,
    hasTds,
    submitting,
    onChange,
    onGstChange,
    onTdsChange,
    onPaymentTypeChange,
    onPaymentMethodChange,
    onSubmit,
    installmentScheduleConfirmed,
    onEditSchedule,
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">

            {/* ── Row 1: Type | User | Date | Category ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <OutlinedSelect label="Type" value={form.type} onChange={(v) => onChange("type", v)}>
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                </OutlinedSelect>

                {/* User searchable */}
                <OutlinedField label="User">
                    <SearchableDropdown
                        value={form.contactId}
                        onChange={(v) => onChange("contactId", v)}
                        placeholder="Select contact"
                        options={contacts.map((c) => ({ value: c.id, label: c.name }))}
                        minimal
                    />
                </OutlinedField>

                <OutlinedInput
                    label="Date"
                    type="date"
                    value={form.date}
                    onChange={(e) => onChange("date", e.target.value)}
                />

                {/* Category searchable */}
                <OutlinedField label="Category">
                    <SearchableDropdown
                        value={form.categoryId}
                        onChange={(v) => onChange("categoryId", v)}
                        placeholder="Select category"
                        options={categories.map((c) => ({ value: c.id, label: c.name }))}
                        minimal
                    />
                </OutlinedField>
            </div>

            {/* ── Row 2: Particular | Amount | GST checkbox | TDS checkbox ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                <OutlinedInput
                    label="Particular"
                    value={form.particular}
                    onChange={(e) => onChange("particular", e.target.value)}
                    placeholder=""
                />

                <OutlinedInput
                    label="Amount"
                    type="number"
                    min="0"
                    step="1"
                    value={form.amount}
                    onChange={(e) => onChange("amount", e.target.value)}
                />

                {/* GST */}
                <div className="border border-gray-300 rounded px-3 pt-4 pb-3 space-y-2 focus-within:border-[#4A90D9]">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={hasGst} onCheckedChange={onGstChange} />
                        <span className="text-sm text-gray-600 font-medium">GST %</span>
                    </label>
                    {hasGst && (
                        <div className="space-y-2">
                            <input
                                type="number" min="0" max="100" step="0.01"
                                value={form.gstPercentage}
                                onChange={(e) => onChange("gstPercentage", e.target.value)}
                                placeholder="GST %"
                                className="w-full border-b border-gray-200 text-sm py-1 focus:outline-none focus:border-[#4A90D9]"
                            />
                            <input
                                type="text"
                                value={form.gstNumber}
                                onChange={(e) => onChange("gstNumber", e.target.value)}
                                placeholder="GST Number"
                                className="w-full border-b border-gray-200 text-sm py-1 focus:outline-none focus:border-[#4A90D9]"
                            />
                        </div>
                    )}
                </div>

                {/* TDS */}
                <div className="border border-gray-300 rounded px-3 pt-4 pb-3 space-y-2 focus-within:border-[#4A90D9]">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={hasTds} onCheckedChange={onTdsChange} />
                        <span className="text-sm text-gray-600 font-medium">TDS %</span>
                    </label>
                    {hasTds && (
                        <input
                            type="number" min="0" max="100" step="0.01"
                            value={form.tdsPercentage}
                            onChange={(e) => onChange("tdsPercentage", e.target.value)}
                            placeholder="TDS %"
                            className="w-full border-b border-gray-200 text-sm py-1 focus:outline-none focus:border-[#4A90D9]"
                        />
                    )}
                </div>
            </div>

            {/* ── Row 3: Total | Payment Status | Bank ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">

                {/* Total (read-only) */}
                <OutlinedField label="Total">
                    <p className="text-sm text-gray-700 font-semibold">
                        {Number(form.total).toLocaleString("en-IN")}
                    </p>
                </OutlinedField>

                {/* Payment Type = Payment Status in the screenshot */}
                <OutlinedSelect label="Payment Status" value={form.paymentType} onChange={onPaymentTypeChange}>
                    <option value="ONE_TIME">One Time</option>
                    <option value="INSTALLMENT">Installment</option>
                </OutlinedSelect>

                
            </div>

            {/* ── Payment method ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <OutlinedSelect label="Payment Method" value={form.paymentMethod} onChange={onPaymentMethodChange}>
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    <option value="CHEQUE">CHEQUE</option>
                    <option value="CREDIT_CARD">CREDIT CARD</option>
                </OutlinedSelect>

                {/* Installment confirmed badge */}
                {form.paymentType === "INSTALLMENT" && installmentScheduleConfirmed && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                            ✓ Schedule set
                        </span>
                        <button type="button" onClick={onEditSchedule} className="text-xs text-[#4A90D9] underline">
                            Edit
                        </button>
                    </div>
                )}
                {form.paymentMethod === "BANK_TRANSFER" && (
                 
                <OutlinedField label="Bank">
                    <SearchableDropdown
                        value={form.bankId}
                        onChange={(v) => onChange("bankId", v)}
                        placeholder="Select bank"
                        options={banks.map((b) => ({
                            value: b.id,
                            label: `${b.name}${b.branch ? ` - ${b.branch}` : ""}${b.accountNumber ? ` (${b.accountNumber})` : ""}`,
                        }))}
                        minimal
                    />
                </OutlinedField>
                )}
            </div>

            {/* ── Remark ── */}
            <OutlinedField label="Remark">
                <textarea
                    rows={3}
                    value={form.remark}
                    onChange={(e) => onChange("remark", e.target.value)}
                    placeholder=""
                    className="w-full bg-transparent text-sm text-gray-700 focus:outline-none resize-none"
                />
            </OutlinedField>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="text-sm font-medium text-[#4A90D9] hover:underline px-4 py-2"
                >
                    CANCEL
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#4A90D9] hover:bg-[#3a7fc1] disabled:opacity-60 text-white text-sm font-semibold px-8 py-2 rounded transition-colors"
                >
                    {submitting ? "Saving..." : "SAVE"}
                </button>
            </div>
        </form>
    );
}