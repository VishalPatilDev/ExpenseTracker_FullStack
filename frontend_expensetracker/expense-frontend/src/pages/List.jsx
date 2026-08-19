import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Download, Plus, TrendingUp, TrendingDown, Clock } from "lucide-react";

import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionTable from "@/components/transactions/TransactionTable";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getTodayDate = () => {
    const d = new Date();
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
    ].join("-");
};

const fmt = (v) =>
    Number(v ?? 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const emptyPaymentForm = () => ({ amount: "", date: getTodayDate(), remark: "" });

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function List() {
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        type: "", category: "", paymentType: "", paymentStatus: "", contact: "",
    });

    // ── Payment modal state ───────────────────────────────────────────────────
    // We track BOTH the parent expense AND the specific installment being paid.
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState(emptyPaymentForm());
    const [submitting, setSubmitting] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // FETCH
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expResp, catResp, conResp] = await Promise.all([
                api.get("/pjsofttech/expense/expenses"),
                api.get("/pjsofttech/category"),
                api.get("/pjsofttech/user/users"),
            ]);
            setExpenses(expResp.data);
            setCategories(catResp.data);
            setContacts(conResp.data);
        } catch (err) {
            console.error("Fetch error:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert("Session expired. Please log in again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // FILTERS + SEARCH
    // ─────────────────────────────────────────────────────────────────────────

    const handleFilterChange = (name, value) =>
        setFilters((prev) => ({ ...prev, [name]: value }));

    const clearFilters = () =>
        setFilters({ type: "", category: "", paymentType: "", paymentStatus: "", contact: "" });

    const filteredExpenses = expenses.filter((exp) => {
        const txt = search.toLowerCase().trim();
        if (
            txt &&
            !exp.contact?.name?.toLowerCase().includes(txt) &&
            !exp.category?.name?.toLowerCase().includes(txt) &&
            !exp.particular?.toLowerCase().includes(txt)
        ) return false;

        return [
            !filters.type || exp.type === filters.type,
            !filters.category || String(exp.category?.id) === filters.category,
            !filters.paymentType || exp.paymentType === filters.paymentType,
            !filters.paymentStatus || exp.paymentStatus === filters.paymentStatus,
            !filters.contact || String(exp.contact?.id) === filters.contact,
        ].every(Boolean);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SUMMARY STATS
    // ─────────────────────────────────────────────────────────────────────────

    const stats = filteredExpenses.reduce(
        (acc, exp) => {
            const total = Number(exp.total ?? 0);
            const pending = Number(exp.pending ?? 0);
            if (exp.type === "INCOME") acc.income += total;
            else acc.expense += total;
            acc.pending += pending;
            return acc;
        },
        { income: 0, expense: 0, pending: 0 }
    );

    // ─────────────────────────────────────────────────────────────────────────
    // PAYMENT MODAL — open / close
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called from TransactionTable when user clicks Pay on a specific installment.
     * @param {object} expense     — the parent expense row
     * @param {object} installment — the specific installment being paid
     */
    const openPaymentModal = (expense, installment) => {
        setSelectedExpense(expense);
        setSelectedInstallment(installment);
        setPaymentForm(emptyPaymentForm());
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        if (submitting) return;
        setShowPaymentModal(false);
        setSelectedExpense(null);
        setSelectedInstallment(null);
        setPaymentForm(emptyPaymentForm());
    };

    const handlePaymentChange = (name, value) =>
        setPaymentForm((prev) => ({ ...prev, [name]: value }));

    // ─────────────────────────────────────────────────────────────────────────
    // SUBMIT PAYMENT
    // ─────────────────────────────────────────────────────────────────────────

    const handleAddPayment = async () => {
        if (!selectedInstallment) return;

        const amount = Number(paymentForm.amount);
        const pending = Number(selectedInstallment.pendingAmount ?? 0);

        if (!amount || amount <= 0) {
            alert("Payment amount must be greater than zero.");
            return;
        }
        if (pending <= 0) {
            alert("This installment has no pending amount.");
            return;
        }
        if (amount > pending) {
            alert(`Payment cannot exceed installment pending amount of ₹${fmt(pending)}.`);
            return;
        }
        if (!paymentForm.date) {
            alert("Please select a payment date.");
            return;
        }

        try {
            setSubmitting(true);

            // POST /expense/installment/{installmentId}/payment
            await api.post(
                `/pjsofttech/expense/installment/${selectedInstallment.id}/payment`,
                {
                    amount: amount,
                    date: paymentForm.date,
                    remark: paymentForm.remark || null,
                }
            );

            alert("Payment recorded successfully!");
            closePaymentModal();
            await fetchData();       // refresh table with updated paid/pending/status

        } catch (err) {
            console.error("Payment error:", err);
            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to record payment."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // CSV EXPORT
    // ─────────────────────────────────────────────────────────────────────────

    const downloadCSV = () => {
        if (!filteredExpenses.length) { alert("No records to export."); return; }

        const escape = (v) => {
            const s = String(v ?? "");
            return s.includes(",") || s.includes('"') || s.includes("\n")
                ? `"${s.replace(/"/g, '""')}"` : s;
        };

        const headers = ["ID", "Date", "Type", "Contact", "Category", "Particular",
            "Amount", "GST%", "GST Amt", "TDS%", "Total", "Paid", "Pending",
            "Payment Type", "Payment Method", "Status", "Remark"];

        const rows = filteredExpenses.map((e) => [
            e.id, e.date, e.type, e.contact?.name, e.category?.name, e.particular,
            e.amount, e.gstPercentage, e.gstAmount, e.tdsPercentage, e.total,
            e.paid, e.pending, e.paymentType, e.paymentMethod, e.paymentStatus, e.remark,
        ]);

        const csv = [
            headers.map(escape).join(","),
            ...rows.map((r) => r.map(escape).join(",")),
        ].join("\n");

        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 p-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Transactions</h1>
                    <p className="text-sm text-muted-foreground">
                        All income and expense records
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button className='hover:bg-gray-400' variant="outline" onClick={downloadCSV} disabled={!filteredExpenses.length}>
                        <Download className="mr-1.5 h-4 w-4" /> Export CSV
                    </Button>
                    <Button onClick={() => navigate("/expense")} className="bg-blue-300 hover:bg-blue-500">
                        <Plus className=" mr-1.5 h-4 w-4" /> Add Transaction
                    </Button>
                </div>
            </div>

            {/* ── Stats ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: "Total Income", value: stats.income, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Total Expense", value: stats.expense, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
                    { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                        <div>
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className={`text-lg font-bold ${color}`}>₹{fmt(value)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search + Filters ─────────────────────────────────────────── */}
            <div className="space-y-3">
                <input
                    className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="Search by contact, category or particular..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <TransactionFilters
                    filters={filters}
                    categories={categories}
                    contacts={contacts}
                    onChange={handleFilterChange}
                    onClear={clearFilters}
                />
            </div>

            {/* ── Count ───────────────────────────────────────────────────── */}
            <p className="text-xs text-muted-foreground">
                Showing <strong>{filteredExpenses.length}</strong> of <strong>{expenses.length}</strong> records
            </p>

            {/* ── Table ───────────────────────────────────────────────────── */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
                    Loading transactions…
                </div>
            ) : (
                <TransactionTable
                    expenses={filteredExpenses}
                    onPayInstallment={openPaymentModal}   // ← passes both expense + installment
                />
            )}

            {/* ── Payment Modal ────────────────────────────────────────────── */}
            <Dialog open={showPaymentModal} onOpenChange={(v) => { if (!v) closePaymentModal(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Installment Payment</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {selectedExpense && selectedInstallment && (
                                <>
                                    Installment #{selectedInstallment.installmentNumber} for{" "}
                                    <strong>{selectedExpense.contact?.name}</strong>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInstallment && (
                        <div className="space-y-4">

                            {/* Installment summary */}
                            <div className="rounded-xl bg-slate-50 border p-4 space-y-2 text-sm">
                                {[
                                    ["Scheduled Due", selectedInstallment.dueAmount, "text-slate-700"],
                                    ["Already Paid", selectedInstallment.paidAmount, "text-emerald-600"],
                                    ["Still Pending", selectedInstallment.pendingAmount, "text-red-500"],
                                ].map(([label, value, cls]) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className={`font-semibold ${cls}`}>₹{fmt(value)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Amount */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">
                                    Payment Amount
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        (max ₹{fmt(selectedInstallment.pendingAmount)})
                                    </span>
                                </label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    max={selectedInstallment.pendingAmount}
                                    value={paymentForm.amount}
                                    onChange={(e) => handlePaymentChange("amount", e.target.value)}
                                    placeholder="Enter payment amount"
                                />
                            </div>

                            {/* Date */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Payment Date</label>
                                <Input
                                    type="date"
                                    value={paymentForm.date}
                                    onChange={(e) => handlePaymentChange("date", e.target.value)}
                                />
                            </div>

                            {/* Remark */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Remark (optional)</label>
                                <Input
                                    value={paymentForm.remark}
                                    onChange={(e) => handlePaymentChange("remark", e.target.value)}
                                    placeholder="e.g. Part payment via UPI"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closePaymentModal}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleAddPayment}
                                    disabled={submitting}
                                    className="bg-slate-800 hover:bg-slate-700"
                                >
                                    {submitting ? "Saving…" : "Record Payment"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}