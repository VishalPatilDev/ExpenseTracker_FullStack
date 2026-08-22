import { useEffect, useState } from "react";
import api from "../api/api";
import TransactionForm from "@/components/transactions/TransactionForm";
import InstallmentModal from "@/components/transactions/InstallmentModel";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const getTodayDate = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};

const toPaise = (v) => Math.round(Number(v || 0) * 100);

const emptyForm = () => ({
    type: "EXPENSE",
    contactId: "",
    date: getTodayDate(),
    categoryId: "",
    bankId: "",
    particular: "",
    amount: "",
    gstPercentage: "",
    gstNumber: "",
    tdsPercentage: "",
    total: 0,
    paymentType: "ONE_TIME",
    paymentMethod: "UPI",
    remark: "",
});

const emptyInstallment = (n) => ({
    installmentNumber: n,
    dueAmount: "",
    dueDate: getTodayDate(),
});

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function Expense() {
    const [contacts, setContacts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banks, setBanks] = useState([]);

    const [form, setForm] = useState(emptyForm());
    const [hasGst, setHasGst] = useState(false);
    const [hasTds, setHasTds] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [showInstallmentModal, setShowInstallmentModal] = useState(false);
    const [numberOfInstallments, setNumberOfInstallments] = useState(2);
    const [installments, setInstallments] = useState([emptyInstallment(1), emptyInstallment(2)]);

    useEffect(() => {
        (async () => {
            try {
                const [c, cat, b] = await Promise.all([
                    api.get("/pjsofttech/user/users"),
                    api.get("/pjsofttech/category"),
                    api.get("/pjsofttech/bank"),
                ]);
                setContacts(c.data);
                setCategories(cat.data);
                setBanks(b.data);
            } catch (e) { console.error("Fetch error:", e); }
        })();
    }, []);

    useEffect(() => {
        const amt = Number(form.amount) || 0;
        const gst = hasGst ? (Number(form.gstPercentage) || 0) : 0;
        const tds = hasTds ? (Number(form.tdsPercentage) || 0) : 0;
        const total = amt + (amt * gst) / 100 - (amt * tds) / 100;
        setForm((prev) => prev.total === total ? prev : { ...prev, total });
    }, [form.amount, form.gstPercentage, form.tdsPercentage, hasGst, hasTds]);

    const handleChange = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

    const handleGstChange = (checked) => {
        setHasGst(checked);
        if (!checked) setForm((p) => ({ ...p, gstPercentage: "", gstNumber: "" }));
    };

    const handleTdsChange = (checked) => {
        setHasTds(checked);
        if (!checked) setForm((p) => ({ ...p, tdsPercentage: "" }));
    };

const handlePaymentMethodChange = (value) => {
    handleChange("paymentMethod", value);

    if (value !== "BANK_TRANSFER") {
        handleChange("bankId", "");
    }
};
    const handlePaymentTypeChange = (value) => {
        handleChange("paymentType", value);
        if (value === "INSTALLMENT") {
            setNumberOfInstallments(2);
            setInstallments([emptyInstallment(1), emptyInstallment(2)]);
            setShowInstallmentModal(true);
        } else {
            setShowInstallmentModal(false);
            setNumberOfInstallments(2);
            setInstallments([emptyInstallment(1), emptyInstallment(2)]);
        }
    };

    const handleInstallmentChange = (indexOrAction, fieldOrArray, value) => {
        if (indexOrAction === "replace") { setInstallments(Array.isArray(fieldOrArray) ? fieldOrArray : []); return; }
        setInstallments((prev) => prev.map((item, i) => i === indexOrAction ? { ...item, [fieldOrArray]: value } : item));
    };

    const validateSchedule = () => {
        const totalPaise = toPaise(form.total);
        const count = Number(numberOfInstallments);
        const schedulePaise = installments.reduce((s, i) => s + toPaise(i.dueAmount), 0);
        if (!count || count <= 0) return "Number of installments must be greater than zero.";
        if (installments.length !== count) return "Installment count doesn't match.";
        if (Math.abs(schedulePaise - totalPaise) > 1) return `Installment total must equal expense total.`;
        for (const inst of installments) {
            if (!inst.dueAmount || toPaise(inst.dueAmount) <= 0) return `Installment #${inst.installmentNumber}: amount must be greater than zero.`;
            if (!inst.dueDate) return `Installment #${inst.installmentNumber}: due date is required.`;
        }
        return null;
    };

    const handleConfirmInstallment = () => {
        const err = validateSchedule();
        if (err) { alert(err); return; }
        setShowInstallmentModal(false);
    };

    const handleCancelInstallment = () => {
        setShowInstallmentModal(false);
        handleChange("paymentType", "ONE_TIME");
        setNumberOfInstallments(2);
        setInstallments([emptyInstallment(1), emptyInstallment(2)]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.contactId) { alert("Please select a contact."); return; }
        if (!form.categoryId) { alert("Please select a category."); return; }
if (form.paymentMethod === "BANK_TRANSFER" && !form.bankId) {
    alert("Please select a bank.");
    return;
}        if (!form.amount || Number(form.amount) <= 0) { alert("Amount must be greater than zero."); return; }
        if (form.paymentType === "INSTALLMENT") {
            const err = validateSchedule();
            if (err) { alert(err); setShowInstallmentModal(true); return; }
        }

        const payload = {
            contactId: Number(form.contactId),
            categoryId: Number(form.categoryId),
            bankId: form.paymentMethod === "BANK_TRANSFER"
        ? Number(form.bankId)
        : null,
            type: form.type,
            date: `${form.date}T00:00:00`,
            particular: form.particular || null,
            amount: Number(form.amount),
            gstPercentage: hasGst ? Number(form.gstPercentage) : null,
            gstNumber: hasGst ? form.gstNumber : null,
            tdsPercentage: hasTds ? Number(form.tdsPercentage) : null,
            paymentType: form.paymentType,
            paymentMethod: form.paymentMethod,
            remark: form.remark || null,
        };

        if (form.paymentType === "INSTALLMENT") {
            payload.numberOfInstallments = Number(numberOfInstallments);
            payload.installments = installments.map((inst) => ({
                installmentNumber: inst.installmentNumber,
                dueAmount: Number(inst.dueAmount),
                dueDate: inst.dueDate,
            }));
        }

        try {
            setSubmitting(true);
            await api.post("/pjsofttech/expense", payload);
            alert("Transaction saved successfully!");
            setForm(emptyForm());
            setHasGst(false);
            setHasTds(false);
            setNumberOfInstallments(2);
            setInstallments([emptyInstallment(1), emptyInstallment(2)]);
            setShowInstallmentModal(false);
        } catch (err) {
            alert(err.response?.data?.error || err.response?.data?.message || "Failed to save transaction.");
        } finally { setSubmitting(false); }
    };

    // ─────────────────────────────────────────────────────────────
    // UI — styled like the PJSOFTTECH "Add IncomeExpens" screen
    // ─────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">

                {/* Page title bar */}
                <div className="border-b border-gray-100 px-6 py-4">
                    <h1 className="text-base font-semibold text-gray-700">Add Income / Expense</h1>
                </div>

                <div className="p-6">
                    <TransactionForm
                        form={form}
                        contacts={contacts}
                        categories={categories}
                        banks={banks}
                        hasGst={hasGst}
                        hasTds={hasTds}
                        submitting={submitting}
                        onChange={handleChange}
                        onGstChange={handleGstChange}
                        onTdsChange={handleTdsChange}
                        onPaymentTypeChange={handlePaymentTypeChange}
                        onPaymentMethodChange={handlePaymentMethodChange}
                        onSubmit={handleSubmit}
                        installmentScheduleConfirmed={form.paymentType === "INSTALLMENT" && !showInstallmentModal}
                        onEditSchedule={() => setShowInstallmentModal(true)}
                    />
                </div>
            </div>

            <InstallmentModal
                open={showInstallmentModal}
                total={form.total}
                numberOfInstallments={numberOfInstallments}
                setNumberOfInstallments={(v) => setNumberOfInstallments(Number(v))}
                installments={installments}
                onInstallmentChange={handleInstallmentChange}
                onConfirm={handleConfirmInstallment}
                onCancel={handleCancelInstallment}
            />
        </div>
    );
}