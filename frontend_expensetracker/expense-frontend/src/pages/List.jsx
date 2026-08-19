// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/api";

// import { Button } from "@/components/ui/button";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Download } from "lucide-react";

// import TransactionFilters from "../components/transactions/TransactionFilters";
// import TransactionTable from "@/components/transactions/TransactionTable";

// const getTodayDate = () => {
//     const today = new Date();

//     return `${today.getFullYear()}-${String(
//         today.getMonth() + 1
//     ).padStart(2, "0")}-${String(today.getDate()).padStart(
//         2,
//         "0"
//     )}`;
// };

// const emptyPayment = () => ({
//     amount: "",
//     date: getTodayDate(),
//     remark: "",
// });

// export default function List() {
//     const navigate = useNavigate();

//     const [expenses, setExpenses] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [contacts, setContacts] = useState([]);

//     const [search, setSearch] = useState("");

//     const [filters, setFilters] = useState({
//         type: "",
//         category: "",
//         paymentType: "",
//         paymentStatus: "",
//         contact: "",
//     });

//     const [loading, setLoading] = useState(true);

//     // --------------------------------
//     // PAYMENT MODAL
//     // --------------------------------

//     const [selectedExpense, setSelectedExpense] =
//         useState(null);

//     const [showPaymentModal, setShowPaymentModal] =
//         useState(false);

//     const [paymentForm, setPaymentForm] =
//         useState(emptyPayment());

//     const [submittingPayment, setSubmittingPayment] =
//         useState(false);

//     // --------------------------------
//     // FETCH DATA
//     // --------------------------------

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const fetchData = async () => {
//         try {
//             setLoading(true);

//             const [
//                 expenseResponse,
//                 categoryResponse,
//                 contactResponse,
//             ] = await Promise.all([
//                 api.get("/pjsofttech/expense/expenses"),
//                 api.get("/pjsofttech/category"),
//                 api.get("/pjsofttech/user/users"),
//             ]);

//             setExpenses(expenseResponse.data);
//             setCategories(categoryResponse.data);
//             setContacts(contactResponse.data);
//         } catch (error) {
//             console.error(
//                 "Error fetching data:",
//                 error
//             );

//             if (
//                 error.response?.status === 401 ||
//                 error.response?.status === 403
//             ) {
//                 alert(
//                     "Session expired. Please login again."
//                 );
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --------------------------------
//     // FILTERS
//     // --------------------------------

//     const handleFilterChange = (name, value) => {
//         setFilters((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const clearFilters = () => {
//         setFilters({
//             type: "",
//             category: "",
//             paymentType: "",
//             paymentStatus: "",
//             contact: "",
//         });
//     };

//     // --------------------------------
//     // SEARCH + FILTER
//     // --------------------------------

//     const filteredExpenses = expenses.filter(
//         (expense) => {
//             const text = search
//                 .toLowerCase()
//                 .trim();

//             if (
//                 text &&
//                 !expense.contact?.name
//                     ?.toLowerCase()
//                     .includes(text) &&
//                 !expense.category?.name
//                     ?.toLowerCase()
//                     .includes(text) &&
//                 !expense.particular
//                     ?.toLowerCase()
//                     .includes(text)
//             ) {
//                 return false;
//             }

//             const matches = [
//                 !filters.type ||
//                     expense.type === filters.type,

//                 !filters.category ||
//                     String(
//                         expense.category?.id
//                     ) ===
//                         String(
//                             filters.category
//                         ),

//                 !filters.paymentType ||
//                     expense.paymentType ===
//                         filters.paymentType,

//                 !filters.paymentStatus ||
//                     expense.paymentStatus ===
//                         filters.paymentStatus,

//                 !filters.contact ||
//                     String(
//                         expense.contact?.id
//                     ) ===
//                         String(
//                             filters.contact
//                         ),
//             ];

//             return matches.every(Boolean);
//         }
//     );

//     // --------------------------------
//     // OPEN PAYMENT MODAL
//     // --------------------------------

//     const openPaymentModal = (expense) => {
//         setSelectedExpense(expense);

//         setPaymentForm({
//             amount: "",
//             date: getTodayDate(),
//             remark: "",
//         });

//         setShowPaymentModal(true);
//     };

//     // --------------------------------
//     // CLOSE PAYMENT MODAL
//     // --------------------------------

//     const closePaymentModal = () => {
//         if (submittingPayment) return;

//         setShowPaymentModal(false);
//         setSelectedExpense(null);
//         setPaymentForm(emptyPayment());
//     };

//     // --------------------------------
//     // PAYMENT FORM CHANGE
//     // --------------------------------

//     const handlePaymentChange = (name, value) => {
//         setPaymentForm((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     // --------------------------------
//     // ADD PAYMENT
//     // --------------------------------

//     const handleAddPayment = async () => {
//         if (!selectedExpense) return;

//         const amount = Number(
//             paymentForm.amount
//         );

//         const pending = Number(
//             selectedExpense.pending || 0
//         );

//         if (!amount || amount <= 0) {
//             alert(
//                 "Payment amount must be greater than zero."
//             );
//             return;
//         }

//         if (pending <= 0) {
//             alert(
//                 "This transaction has no pending amount."
//             );
//             return;
//         }

//         if (amount > pending) {
//             alert(
//                 `Payment cannot be greater than pending amount ₹${pending.toLocaleString(
//                     "en-IN"
//                 )}`
//             );
//             return;
//         }

//         if (!paymentForm.date) {
//             alert(
//                 "Please select payment date."
//             );
//             return;
//         }

//         try {
//             setSubmittingPayment(true);

//             const requestData = {
//                 installmentId: selectedInstallment.id,
//                 date: paymentForm.date,
//                 remark: paymentForm.remark,
//             };

//             console.log(
//                 "Installment Payment Request:",
//                 requestData
//             );

//             await api.post(
//                 `/pjsofttech/expense/${selectedExpense.id}/installment`,
//                 requestData
//             );

//             alert(
//                 "Installment payment added successfully!"
//             );

//             closePaymentModal();

//             await fetchData();
//         } catch (error) {
//             console.error(
//                 "Error adding installment:",
//                 error
//             );

//             alert(
//                 error.response?.data?.message ||
//                     error.response?.data?.error ||
//                     "Failed to add installment"
//             );
//         } finally {
//             setSubmittingPayment(false);
//         }
//     };

//     // --------------------------------
//     // DOWNLOAD CSV
//     // --------------------------------

//     const downloadCSV = () => {
//         if (!filteredExpenses.length) {
//             alert(
//                 "No records available to download."
//             );
//             return;
//         }

//         const headers = [
//             "ID",
//             "Date",
//             "Type",
//             "Amount",
//             "Category",
//             "Contact",
//             "Payment Type",
//             "Payment Status",
//             "Pending",
//             "Remark",
//         ];

//         const rows = filteredExpenses.map(
//             (expense) => [
//                 expense.id ?? "",
//                 expense.date ?? "",
//                 expense.type ?? "",
//                 expense.total ??
//                     expense.amount ??
//                     0,
//                 expense.category?.name ?? "",
//                 expense.contact?.name ?? "",
//                 expense.paymentType ?? "",
//                 expense.paymentStatus ?? "",
//                 expense.pending ?? 0,
//                 expense.remark ?? "",
//             ]
//         );

//         const escapeCSV = (value) => {
//             const stringValue = String(
//                 value ?? ""
//             );

//             if (
//                 stringValue.includes(",") ||
//                 stringValue.includes('"') ||
//                 stringValue.includes("\n")
//             ) {
//                 return `"${stringValue.replace(
//                     /"/g,
//                     '""'
//                 )}"`;
//             }

//             return stringValue;
//         };

//         const csvContent = [
//             headers
//                 .map(escapeCSV)
//                 .join(","),
//             ...rows.map((row) =>
//                 row
//                     .map(escapeCSV)
//                     .join(",")
//             ),
//         ].join("\n");

//         const blob = new Blob(
//             [csvContent],
//             {
//                 type: "text/csv;charset=utf-8;",
//             }
//         );

//         const url =
//             URL.createObjectURL(blob);

//         const link =
//             document.createElement("a");

//         link.href = url;

//         link.download = `expense-report-${new Date()
//             .toISOString()
//             .split("T")[0]}.csv`;

//         document.body.appendChild(link);

//         link.click();

//         document.body.removeChild(link);

//         URL.revokeObjectURL(url);
//     };

//     // --------------------------------
//     // UI
//     // --------------------------------

//     return (
//         <div className="space-y-6 p-6">

//             {/* HEADER */}

//             <div className="flex items-center justify-between gap-4">

//                 <input
//                     className="w-full max-w-sm rounded-md border px-3 py-2"
//                     placeholder="Search by name or category..."
//                     value={search}
//                     onChange={(e) =>
//                         setSearch(
//                             e.target.value
//                         )
//                     }
//                 />

//                 <div className="flex gap-2">

//                     <Button
//                         className="hover:bg-gray-200"
//                         variant="outline"
//                         onClick={downloadCSV}
//                         disabled={
//                             filteredExpenses.length ===
//                             0
//                         }
//                     >
//                         <Download className="mr-2 h-4 w-4" />
//                         Download CSV
//                     </Button>

//                     <Button
//                         className="bg-blue-200 hover:bg-blue-400"
//                         onClick={() =>
//                             navigate(
//                                 "/expense"
//                             )
//                         }
//                     >
//                         + Add Expense
//                     </Button>

//                 </div>
//             </div>

//             {/* FILTERS */}

//             <TransactionFilters
//                 filters={filters}
//                 categories={categories}
//                 contacts={contacts}
//                 onChange={
//                     handleFilterChange
//                 }
//                 onClear={clearFilters}
//             />

//             {/* COUNT */}

//             <p className="text-sm text-muted-foreground">
//                 Showing{" "}
//                 {filteredExpenses.length}{" "}
//                 of {expenses.length} records
//             </p>

//             {/* TABLE */}

//             {loading ? (
//                 <p className="text-sm text-muted-foreground">
//                     Loading expenses...
//                 </p>
//             ) : (
//                 <TransactionTable
//                     expenses={filteredExpenses}
//                     onAddPayment={
//                         openPaymentModal
//                     }
//                 />
//             )}

//             {/* ADD PAYMENT MODAL */}

//             <Dialog
//                 open={showPaymentModal}
//                 onOpenChange={(open) => {
//                     if (!open) {
//                         closePaymentModal();
//                     }
//                 }}
//             >
//                 <DialogContent className="max-w-md">

//                     <DialogHeader>
//                         <DialogTitle>
//                             Add Installment Payment
//                         </DialogTitle>
//                     </DialogHeader>

//                     {selectedExpense && (
//                         <div className="space-y-5">

//                             {/* EXPENSE SUMMARY */}

//                             <div className="rounded-lg bg-muted p-4 space-y-2">

//                                 <div className="flex justify-between">
//                                     <span className="text-sm text-muted-foreground">
//                                         Total
//                                     </span>

//                                     <span className="font-semibold">
//                                         ₹
//                                         {Number(
//                                             selectedExpense.total ??
//                                                 selectedExpense.amount ??
//                                                 0
//                                         ).toLocaleString(
//                                             "en-IN"
//                                         )}
//                                     </span>
//                                 </div>

//                                 <div className="flex justify-between">
//                                     <span className="text-sm text-muted-foreground">
//                                         Paid
//                                     </span>

//                                     <span className="font-semibold">
//                                         ₹
//                                         {(
//                                             Number(
//                                                 selectedExpense.total ??
//                                                     selectedExpense.amount ??
//                                                     0
//                                             ) -
//                                             Number(
//                                                 selectedExpense.pending ??
//                                                     0
//                                             )
//                                         ).toLocaleString(
//                                             "en-IN"
//                                         )}
//                                     </span>
//                                 </div>

//                                 <div className="flex justify-between">
//                                     <span className="text-sm text-muted-foreground">
//                                         Pending
//                                     </span>

//                                     <span className="font-bold text-red-600">
//                                         ₹
//                                         {Number(
//                                             selectedExpense.pending ??
//                                                 0
//                                         ).toLocaleString(
//                                             "en-IN"
//                                         )}
//                                     </span>
//                                 </div>

//                             </div>

//                             {/* PAYMENT AMOUNT */}

//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">
//                                     Payment Amount
//                                 </label>

//                                 <Input
//                                     type="number"
//                                     min="1"
//                                     step="1"
//                                     value={
//                                         paymentForm.amount
//                                     }
//                                     onChange={(e) =>
//                                         handlePaymentChange(
//                                             "amount",
//                                             e.target
//                                                 .value
//                                         )
//                                     }
//                                     placeholder="Enter payment amount"
//                                 />
//                             </div>

//                             {/* PAYMENT DATE */}

//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">
//                                     Payment Date
//                                 </label>

//                                 <Input
//                                     type="date"
//                                     value={
//                                         paymentForm.date
//                                     }
//                                     onChange={(e) =>
//                                         handlePaymentChange(
//                                             "date",
//                                             e.target
//                                                 .value
//                                         )
//                                     }
//                                 />
//                             </div>

//                             {/* REMARK */}

//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">
//                                     Remark
//                                 </label>

//                                 <Input
//                                     value={
//                                         paymentForm.remark
//                                     }
//                                     onChange={(e) =>
//                                         handlePaymentChange(
//                                             "remark",
//                                             e.target
//                                                 .value
//                                         )
//                                     }
//                                     placeholder="Optional remark"
//                                 />
//                             </div>

//                             {/* BUTTONS */}

//                             <div className="flex justify-end gap-2">

//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     onClick={
//                                         closePaymentModal
//                                     }
//                                     disabled={
//                                         submittingPayment
//                                     }
//                                 >
//                                     Cancel
//                                 </Button>

//                                 <Button
//                                     type="button"
//                                     onClick={
//                                         handleAddPayment
//                                     }
//                                     disabled={
//                                         submittingPayment
//                                     }
//                                 >
//                                     {submittingPayment
//                                         ? "Saving..."
//                                         : "Add Payment"}
//                                 </Button>

//                             </div>

//                         </div>
//                     )}

//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// }
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
                    <Button variant="outline" onClick={downloadCSV} disabled={!filteredExpenses.length}>
                        <Download className="mr-1.5 h-4 w-4" /> Export CSV
                    </Button>
                    <Button onClick={() => navigate("/expense")} className="bg-slate-800 hover:bg-slate-700">
                        <Plus className="mr-1.5 h-4 w-4" /> Add Transaction
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