import { useEffect, useState, useMemo } from "react";
import {
    getLiabilities,
    createLiability,
    updateLiability,
    recordLiabilityPayment,
    cancelLiability,
    deleteLiability,
    getContacts,
    getBanks,
} from "@/api/assetsApi";

import { useAsync } from "@/hooks/useAsync";
import Button from "@/components/ui/Button";
import FormField, { inputCls, selectCls } from "@/components/ui/FormField";
import Modal from "@/components/ui/Modal";
import { useToastContext } from "@/context/ToastContext";

import {
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    XCircle,
    CreditCard,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

import { formatINR } from "@/utils/formatters";

// ─────────────────────────────────────────────────────────────────────────────
// Constants — must match Java enums exactly
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LiabilityGroup → LiabilityType mapping.
 * The backend validates type.getGroup() === liabilityGroup, so we enforce
 * the same constraint in the UI.
 */
const LIABILITY_TYPES = [
    // LOAN group
    { value: "HOME_LOAN", label: "Home Loan", group: "LOAN" },
    { value: "CAR_LOAN", label: "Car Loan", group: "LOAN" },
    { value: "PERSONAL_LOAN", label: "Personal Loan", group: "LOAN" },
    { value: "EDUCATION_LOAN", label: "Education Loan", group: "LOAN" },
    { value: "GOLD_LOAN", label: "Gold Loan", group: "LOAN" },
    { value: "BUSINESS_LOAN", label: "Business Loan", group: "LOAN" },
    { value: "OTHER_LOAN", label: "Other Loan", group: "LOAN" },

    // BILL group
    { value: "ELECTRICITY", label: "Electricity", group: "BILL" },
    { value: "WATER", label: "Water", group: "BILL" },
    { value: "GAS", label: "Gas", group: "BILL" },
    { value: "INTERNET", label: "Internet", group: "BILL" },
    { value: "PHONE", label: "Phone", group: "BILL" },
    { value: "RENT", label: "Rent", group: "BILL" },
    { value: "OTHER_BILL", label: "Other Bill", group: "BILL" },

    // FEE group
    { value: "SCHOOL_FEE", label: "School Fee", group: "FEE" },
    { value: "COLLEGE_FEE", label: "College Fee", group: "FEE" },
    { value: "MEMBERSHIP_FEE", label: "Membership Fee", group: "FEE" },
    { value: "OTHER_FEE", label: "Other Fee", group: "FEE" },

    // CREDIT_CARD group
    { value: "CREDIT_CARD", label: "Credit Card", group: "CREDIT_CARD" },

    // OTHER group
    { value: "OTHER", label: "Other", group: "OTHER" },
];

const LIABILITY_TYPE_GROUPS = [
    { group: "LOAN", label: "Loans" },
    { group: "BILL", label: "Bills" },
    { group: "FEE", label: "Fees" },
    { group: "CREDIT_CARD", label: "Credit Card" },
    { group: "OTHER", label: "Other" },
];

const PAYMENT_METHODS = [
    { value: "CASH", label: "Cash" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "DEBIT_CARD", label: "Debit Card" },
    { value: "OTHER", label: "Other" },
];

const STATUS_COLORS = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    PAID_OFF: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    CANCELLED: "bg-slate-700 text-slate-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// Empty form & helpers
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
    name: "",
    liabilityGroup: "",
    type: "",
    lenderContactId: "",
    description: "",
    originalAmount: "",
    depositAmount: "",
    depositBankId: "",
    interestRate: "",
    startDate: "",
    dueDate: "",
};

function normalizeLiability(l) {
    return {
        ...EMPTY_FORM,
        name: l.name || "",
        liabilityGroup: l.liabilityGroup || "",
        type: l.type || "",
        lenderContactId: l.lenderContactId ?? "",
        description: l.description || "",
        originalAmount: l.originalAmount ?? "",
        depositAmount: l.depositAmount ?? "",
        depositBankId: l.bankId ?? "",
        interestRate: l.interestRate ?? "",
        startDate: l.startDate || "",
        dueDate: l.dueDate || "",
    };
}

function buildLiabilityPayload(form) {
    const typeEntry = LIABILITY_TYPES.find((t) => t.value === form.type);
    return {
        name: form.name.trim(),
        liabilityGroup: typeEntry?.group || form.liabilityGroup,
        type: form.type,
        lenderContactId: form.lenderContactId ? Number(form.lenderContactId) : null,
        description: form.description.trim() || null,
        originalAmount: Number(form.originalAmount),
        depositAmount: form.depositAmount !== "" ? Number(form.depositAmount) : null,
        depositBankId: form.depositBankId ? Number(form.depositBankId) : null,
        interestRate: form.interestRate !== "" ? Number(form.interestRate) : null,
        startDate: form.startDate,
        dueDate: form.dueDate || null,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Liability Form — Add & Edit
// ─────────────────────────────────────────────────────────────────────────────

function LiabilityForm({
    form,
    setForm,
    onSubmit,
    onCancel,
    loading,
    editing,
    contacts,
    banks,
}) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const selectedType = LIABILITY_TYPES.find((t) => t.value === form.type);
    const isLoan = selectedType?.group === "LOAN";

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField label="Name">
                    <input
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. HDFC Home Loan"
                        className={inputCls}
                    />
                </FormField>

                <FormField label="Type">
                    <select
                        name="type"
                        required
                        value={form.type}
                        onChange={handleChange}
                        className={selectCls}
                    >
                        <option value="">Select type</option>
                        {LIABILITY_TYPE_GROUPS.map(({ group, label }) => (
                            <optgroup key={group} label={label}>
                                {LIABILITY_TYPES.filter((t) => t.group === group).map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </FormField>

                <FormField label="Original amount (₹)">
                    <input
                        name="originalAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={form.originalAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={inputCls}
                        disabled={editing}
                        title={editing ? "Cannot change original amount after creation" : ""}
                    />
                </FormField>

                <FormField label="Start date">
                    <input
                        name="startDate"
                        type="date"
                        required
                        value={form.startDate}
                        onChange={handleChange}
                        className={inputCls}
                        disabled={editing}
                    />
                </FormField>

                <FormField label="Due date">
                    <input
                        name="dueDate"
                        type="date"
                        value={form.dueDate}
                        onChange={handleChange}
                        className={inputCls}
                    />
                </FormField>

                {/* <FormField label="Lender contact ID">
                    <input
                        name="lenderContactId"
                        type="number"
                        min="1"
                        value={form.lenderContactId}
                        onChange={handleChange}
                        placeholder="Optional"
                        className={inputCls}
                    />
                </FormField> */}
                <FormField label="Lender">
                    <select
                        name="lenderContactId"
                        value={form.lenderContactId}
                        onChange={handleChange}
                        className={selectCls}
                    >
                        <option value="">Select lender</option>

                        {contacts.map((contact) => (
                            <option key={contact.id} value={contact.id}>
                                {contact.name}
                            </option>
                        ))}
                    </select>
                </FormField>

                {isLoan && (
                    <FormField label="Interest rate (% p.a.)">
                        <input
                            name="interestRate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.interestRate}
                            onChange={handleChange}
                            placeholder="e.g. 8.5"
                            className={inputCls}
                        />
                    </FormField>
                )}

                {!editing && (
                    <>
                        {/* <FormField label="Deposit bank ID">
                            <input
                                name="depositBankId"
                                type="number"
                                min="1"
                                value={form.depositBankId}
                                onChange={handleChange}
                                placeholder="Bank to credit loan amount into"
                                className={inputCls}
                            />
                        </FormField> */}
                        <FormField label="Deposit bank">
                            <select
                                name="depositBankId"
                                value={form.depositBankId}
                                onChange={handleChange}
                                className={selectCls}
                            >
                                <option value="">Select bank</option>

                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Deposit amount (₹)">
                            <input
                                name="depositAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.depositAmount}
                                onChange={handleChange}
                                placeholder="Optional — defaults to original amount"
                                className={inputCls}
                            />
                        </FormField>
                    </>
                )}

                <FormField label="Description" className="md:col-span-2">
                    <input
                        name="description"
                        type="text"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Optional"
                        className={inputCls}
                    />
                </FormField>

            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" loading={loading}>
                    {editing ? "Update Liability" : "Add Liability"}
                </Button>
            </div>
        </form>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Form — LOAN uses principal + interest split; others use a single amount
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_PAYMENT = {
    paymentAmount: "",
    principalComponent: "",
    interestComponent: "",
    interestCategoryId: "",
    bankId: "",
    paymentMethod: "",
    date: "",
};

function PaymentForm({ liability, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState({
        ...EMPTY_PAYMENT,
        date: new Date().toISOString().split("T")[0],
    });

    const isLoan = liability?.liabilityGroup === "LOAN";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            paymentMethod: form.paymentMethod,
            bankId: form.bankId ? Number(form.bankId) : null,
            date: form.date,
        };

        if (isLoan) {
            payload.principalComponent = Number(form.principalComponent || 0);
            payload.interestComponent = Number(form.interestComponent || 0);
            if (payload.interestComponent > 0) {
                payload.interestCategoryId = Number(form.interestCategoryId);
            }
        } else {
            payload.paymentAmount = Number(form.paymentAmount);
        }

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Outstanding summary */}
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-800/60 p-4">
                <div>
                    <p className="text-xs text-slate-400">Outstanding</p>
                    <p className="text-lg font-semibold text-rose-400">
                        ₹{formatINR(liability?.outstandingAmount)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">Original</p>
                    <p className="text-lg font-semibold text-white">
                        ₹{formatINR(liability?.originalAmount)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {isLoan ? (
                    <>
                        <FormField label="Principal component (₹)">
                            <input
                                name="principalComponent"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.principalComponent}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Interest component (₹)">
                            <input
                                name="interestComponent"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.interestComponent}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={inputCls}
                            />
                        </FormField>

                        {Number(form.interestComponent) > 0 && (
                            <FormField label="Interest category ID">
                                <input
                                    name="interestCategoryId"
                                    type="number"
                                    min="1"
                                    required
                                    value={form.interestCategoryId}
                                    onChange={handleChange}
                                    placeholder="Required for interest expense"
                                    className={inputCls}
                                />
                            </FormField>
                        )}
                    </>
                ) : (
                    <FormField label="Payment amount (₹)">
                        <input
                            name="paymentAmount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            value={form.paymentAmount}
                            onChange={handleChange}
                            placeholder="0.00"
                            className={inputCls}
                        />
                    </FormField>
                )}

                <FormField label="Payment method">
                    <select
                        name="paymentMethod"
                        required
                        value={form.paymentMethod}
                        onChange={handleChange}
                        className={selectCls}
                    >
                        <option value="">Select method</option>
                        {PAYMENT_METHODS.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </FormField>

                {form.paymentMethod === "BANK_TRANSFER" && (
                    <FormField label="Bank ID">
                        <input
                            name="bankId"
                            type="number"
                            min="1"
                            required
                            value={form.bankId}
                            onChange={handleChange}
                            placeholder="Required for Bank Transfer"
                            className={inputCls}
                        />
                    </FormField>
                )}

                <FormField label="Payment date">
                    <input
                        name="date"
                        type="date"
                        required
                        value={form.date}
                        onChange={handleChange}
                        className={inputCls}
                    />
                </FormField>

            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" loading={loading}>Record Payment</Button>
            </div>
        </form>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment history row (expandable)
// ─────────────────────────────────────────────────────────────────────────────

function PaymentHistory({ payments, isLoan }) {
    if (!payments?.length) {
        return <p className="text-xs text-slate-500 py-2">No payments recorded yet.</p>;
    }

    return (
        <table className="w-full text-xs mt-2">
            <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                    <th className="text-left pb-1 pr-4">Date</th>
                    {isLoan ? (
                        <>
                            <th className="text-right pb-1 pr-4">Principal</th>
                            <th className="text-right pb-1 pr-4">Interest</th>
                        </>
                    ) : null}
                    <th className="text-right pb-1 pr-4">Total</th>
                    <th className="text-left pb-1">Method</th>
                </tr>
            </thead>
            <tbody>
                {payments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-800/60">
                        <td className="py-1.5 pr-4 text-slate-400">{p.paymentDate}</td>
                        {isLoan ? (
                            <>
                                <td className="py-1.5 pr-4 text-right text-slate-300">
                                    ₹{formatINR(p.principalComponent)}
                                </td>
                                <td className="py-1.5 pr-4 text-right text-amber-400">
                                    ₹{formatINR(p.interestComponent)}
                                </td>
                            </>
                        ) : null}
                        <td className="py-1.5 pr-4 text-right text-white font-medium">
                            ₹{formatINR(p.totalAmount ?? p.paymentAmount)}
                        </td>
                        <td className="py-1.5 text-slate-400">
                            {p.paymentMethod?.replaceAll("_", " ") || "-"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Liability Row (with expandable payment history)
// ─────────────────────────────────────────────────────────────────────────────

function LiabilityRow({ liability, onEdit, onPay, onCancel, onDelete, deleting }) {
    const [expanded, setExpanded] = useState(false);

    const isLoan = liability.liabilityGroup === "LOAN";
    const isActive = liability.status === "ACTIVE";
    const paidPct = liability.originalAmount > 0
        ? Math.min(100, ((liability.originalAmount - liability.outstandingAmount) / liability.originalAmount) * 100)
        : 0;

    return (
        <>
            <tr className="border-t border-slate-800 hover:bg-slate-800/30">

                {/* Name + type */}
                <td className="px-4 py-3">
                    <p className="font-medium text-slate-100">{liability.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {liability.type?.replaceAll("_", " ")}
                        {liability.lenderName ? ` · ${liability.lenderName}` : ""}
                    </p>
                </td>

                {/* Group */}
                <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                        {liability.liabilityGroup}
                    </span>
                </td>

                {/* Original */}
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    ₹{formatINR(liability.originalAmount)}
                </td>

                {/* Outstanding */}
                <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium text-rose-400">
                        ₹{formatINR(liability.outstandingAmount)}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-1.5 h-1 w-24 rounded-full bg-slate-700">
                        <div
                            className="h-1 rounded-full bg-emerald-500"
                            style={{ width: `${paidPct}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{paidPct.toFixed(0)}% paid</p>
                </td>

                {/* Paid / Interest */}
                <td className="px-4 py-3 whitespace-nowrap">
                    {isLoan ? (
                        <>
                            <p className="text-xs text-slate-400">
                                P: <span className="text-emerald-400">₹{formatINR(liability.totalPrincipalPaid)}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                I: <span className="text-amber-400">₹{formatINR(liability.totalInterestPaid)}</span>
                            </p>
                        </>
                    ) : (
                        <p className="text-xs text-emerald-400">
                            ₹{formatINR(liability.totalPrincipalPaid)}
                        </p>
                    )}
                </td>

                {/* Dates */}
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    <p>Start: {liability.startDate || "-"}</p>
                    {liability.dueDate && <p className="mt-0.5">Due: {liability.dueDate}</p>}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[liability.status] || ""}`}>
                        {liability.status}
                    </span>
                </td>

                {/* Bank */}
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {liability.bankName || "-"}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">

                        {/* Expand payments */}
                        <button
                            type="button"
                            title={expanded ? "Hide payments" : "Show payments"}
                            onClick={() => setExpanded((v) => !v)}
                            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {/* Record payment */}
                        {isActive && (
                            <button
                                type="button"
                                title="Record payment"
                                onClick={() => onPay(liability)}
                                className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                            >
                                <CreditCard size={14} />
                            </button>
                        )}

                        {/* Edit */}
                        {isActive && (
                            <button
                                type="button"
                                title="Edit"
                                onClick={() => onEdit(liability)}
                                className="p-1.5 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                            >
                                <Pencil size={14} />
                            </button>
                        )}

                        {/* Cancel */}
                        {isActive && (
                            <button
                                type="button"
                                title="Cancel liability"
                                onClick={() => onCancel(liability)}
                                className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                            >
                                <XCircle size={14} />
                            </button>
                        )}

                        {/* Delete */}
                        <button
                            type="button"
                            title="Delete"
                            disabled={deleting}
                            onClick={() => onDelete(liability.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        >
                            <Trash2 size={14} />
                        </button>

                    </div>
                </td>
            </tr>

            {/* Expanded payment history */}
            {expanded && (
                <tr className="bg-slate-800/20 border-t border-slate-800">
                    <td colSpan={9} className="px-8 py-3">
                        <PaymentHistory payments={liability.payments} isLoan={isLoan} />
                    </td>
                </tr>
            )}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Liability Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Liability() {
    const toast = useToastContext();

    const [liabilities, setLiabilities] = useState([]);
    const [modal, setModal] = useState(null); // { mode, liability? }
    const [form, setForm] = useState(EMPTY_FORM);
    const [contacts, setContacts] = useState([]);
    const [banks, setBanks] = useState([]);

    const { execute: fetchLiabilities, loading: fetching } = useAsync(getLiabilities);
    const { execute: saveLiability, loading: saving } = useAsync(async (data) => {
        if (modal?.mode === "edit") return updateLiability(modal.liability.id, data);
        return createLiability(data);
    });
    const { execute: payLiability, loading: paying } = useAsync((id, data) =>
        recordLiabilityPayment(id, data)
    );
    const { execute: removeLiability, loading: deleting } = useAsync(deleteLiability);
    const { execute: cancelLib, loading: cancelling } = useAsync(cancelLiability);

    // ── Load ──────────────────────────────────────────────────────────────────

    const loadLiabilities = async () => {
        try {
            const response = await fetchLiabilities();
            const result = response?.data;
            const list = result?.data || result?.result || response?.data || [];
            setLiabilities(Array.isArray(list) ? list : []);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to fetch liabilities");
        }
    };
    const loadDropdownData = async () => {
        try {
            const [contactsResponse, banksResponse] = await Promise.all([
                getContacts(),
                getBanks(),
            ]);

            const contactsResult = contactsResponse?.data;
            const banksResult = banksResponse?.data;

            const contactsList =
                contactsResult?.data ||
                contactsResult?.result ||
                [];

            const banksList =
                banksResult?.data ||
                banksResult?.result ||
                [];

            setContacts(Array.isArray(contactsList) ? contactsList : []);
            setBanks(Array.isArray(banksList) ? banksList : []);
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                "Failed to load contacts and banks"
            );
        }
    };

    useEffect(() => {
        loadLiabilities();
        loadDropdownData();
    }, []);

    // ── Modal helpers ─────────────────────────────────────────────────────────

    const openAdd = () => {
        setForm({
            ...EMPTY_FORM,
            startDate: new Date().toISOString().split("T")[0],
        });
        setModal({ mode: "add" });
    };

    const openEdit = (liability) => {
        setForm(normalizeLiability(liability));
        setModal({ mode: "edit", liability });
    };

    const openPay = (liability) => {
        setModal({ mode: "pay", liability });
    };

    const closeModal = () => {
        setModal(null);
        setForm(EMPTY_FORM);
    };

    // ── Submit handlers ───────────────────────────────────────────────────────

    const submitLiability = async (e) => {
        e.preventDefault();
        try {
            const payload = buildLiabilityPayload(form);
            await saveLiability(payload);
            toast.success(modal?.mode === "edit" ? "Liability updated" : "Liability added");
            closeModal();
            await loadLiabilities();
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to save liability"
            );
        }
    };

    const submitPayment = async (payload) => {
        try {
            await payLiability(modal.liability.id, payload);
            toast.success("Payment recorded");
            closeModal();
            await loadLiabilities();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to record payment");
        }
    };

    const handleCancel = async (liability) => {
        if (!window.confirm(`Cancel "${liability.name}"? This cannot be undone.`)) return;
        try {
            await cancelLib(liability.id);
            toast.success("Liability cancelled");
            await loadLiabilities();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to cancel liability");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this liability? Only liabilities with no payments can be deleted.")) return;
        try {
            await removeLiability(id);
            toast.success("Liability deleted");
            await loadLiabilities();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete liability");
        }
    };

    // ── Derived totals ────────────────────────────────────────────────────────

    const totals = useMemo(() => ({
        original: liabilities.reduce((s, l) => s + Number(l.originalAmount || 0), 0),
        outstanding: liabilities.reduce((s, l) => s + Number(l.outstandingAmount || 0), 0),
        interest: liabilities.reduce((s, l) => s + Number(l.totalInterestPaid || 0), 0),
        active: liabilities.filter((l) => l.status === "ACTIVE").length,
    }), [liabilities]);

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-7xl">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-white">Liabilities</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Track loans, bills, and other obligations.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={loadLiabilities} disabled={fetching}>
                        <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                    <Button onClick={openAdd}>
                        <Plus size={15} /> Add Liability
                    </Button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Active", value: totals.active, suffix: "", color: "text-white" },
                    { label: "Total borrowed", value: totals.original, suffix: "₹", color: "text-white" },
                    { label: "Outstanding", value: totals.outstanding, suffix: "₹", color: "text-rose-400" },
                    { label: "Interest paid", value: totals.interest, suffix: "₹", color: "text-amber-400" },
                ].map(({ label, value, suffix, color }) => (
                    <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className={`text-xl font-semibold mt-1 ${color}`}>
                            {suffix}{suffix ? formatINR(value) : value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">

                {fetching ? (
                    <div className="py-16 text-center text-slate-500">Loading liabilities…</div>
                ) : liabilities.length === 0 ? (
                    <div className="py-16 text-center">
                        <CreditCard size={32} className="mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400">No liabilities yet</p>
                        <p className="text-sm text-slate-600 mt-1">Add loans, bills, or fees to track them here.</p>
                        <Button size="sm" onClick={openAdd} className="mt-4">
                            <Plus size={14} /> Add Liability
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-800/60">
                                <tr>
                                    {["Liability", "Group", "Original", "Outstanding", "Paid / Interest", "Dates", "Status", "Bank", ""].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {liabilities.map((liability) => (
                                    <LiabilityRow
                                        key={liability.id}
                                        liability={liability}
                                        onEdit={openEdit}
                                        onPay={openPay}
                                        onCancel={handleCancel}
                                        onDelete={handleDelete}
                                        deleting={deleting}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <Modal
                open={modal?.mode === "add" || modal?.mode === "edit"}
                onClose={closeModal}
                title={modal?.mode === "edit" ? "Edit Liability" : "Add Liability"}
            >
                <LiabilityForm
                    form={form}
                    setForm={setForm}
                    onSubmit={submitLiability}
                    onCancel={closeModal}
                    loading={saving}
                    editing={modal?.mode === "edit"}
                    contacts={contacts}
                    banks={banks}
                />
            </Modal>

            {/* Payment Modal */}
            <Modal
                open={modal?.mode === "pay"}
                onClose={closeModal}
                title={`Record Payment — ${modal?.liability?.name || ""}`}
            >
                {modal?.mode === "pay" && (
                    <PaymentForm
                        liability={modal.liability}
                        onSubmit={submitPayment}
                        onCancel={closeModal}
                        loading={paying}
                    />
                )}
            </Modal>

        </div>
    );
}