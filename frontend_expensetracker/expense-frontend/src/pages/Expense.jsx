import { useEffect, useState } from "react";
import api from "../api/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import TransactionForm  from "@/components/transactions/TransactionForm";
// import InstallmentModal from "@/components/transactions/InstallmentModal";
import TransactionForm from "@/components/transactions/TransactionForm";
import InstallmentModal from "@/components/transactions/InstallmentModel";

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

/** Convert to integer paise (avoids float issues). */
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

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Expense() {
    const [contacts, setContacts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banks, setBanks] = useState([]);

    const [form, setForm] = useState(emptyForm());
    const [hasGst, setHasGst] = useState(false);
    const [hasTds, setHasTds] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Installment schedule state
    const [showInstallmentModal, setShowInstallmentModal] = useState(false);
    const [numberOfInstallments, setNumberOfInstallments] = useState(2);
    const [installments, setInstallments] = useState([
        emptyInstallment(1), emptyInstallment(2),
    ]);

    // ── Fetch master data ─────────────────────────────────────────────────────
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

    // ── Auto-calculate total ──────────────────────────────────────────────────
    useEffect(() => {
        const amt = Number(form.amount) || 0;
        const gst = hasGst ? (Number(form.gstPercentage) || 0) : 0;
        const tds = hasTds ? (Number(form.tdsPercentage) || 0) : 0;
        const total = amt + (amt * gst) / 100 - (amt * tds) / 100;

        setForm((prev) => prev.total === total ? prev : { ...prev, total });
    }, [form.amount, form.gstPercentage, form.tdsPercentage, hasGst, hasTds]);

    // ── Form field change ─────────────────────────────────────────────────────
    const handleChange = (name, value) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    // ── GST toggle ───────────────────────────────────────────────────────────
    const handleGstChange = (checked) => {
        setHasGst(checked);
        if (!checked) setForm((p) => ({ ...p, gstPercentage: "", gstNumber: "" }));
    };

    // ── TDS toggle ───────────────────────────────────────────────────────────
    const handleTdsChange = (checked) => {
        setHasTds(checked);
        if (!checked) setForm((p) => ({ ...p, tdsPercentage: "" }));
    };

    // ── Payment method change ────────────────────────────────────────────────
    const handlePaymentMethodChange = (value) => {
        handleChange("paymentMethod", value);
    };


    // ── Payment type change ───────────────────────────────────────────────────
    const handlePaymentTypeChange = (value) => {
        handleChange("paymentType", value);
        if (value === "INSTALLMENT") {
            // Reset to 2 equal installments and open modal
            const count = 2;
            setNumberOfInstallments(count);
            setInstallments([emptyInstallment(1), emptyInstallment(2)]);
            setShowInstallmentModal(true);
        } else {
            setShowInstallmentModal(false);
            setNumberOfInstallments(2);
            setInstallments([emptyInstallment(1), emptyInstallment(2)]);
        }
    };


    // ── Installment array change (from modal) ─────────────────────────────────
    const handleInstallmentChange = (indexOrAction, fieldOrArray, value) => {
        if (indexOrAction === "replace") {
            setInstallments(Array.isArray(fieldOrArray) ? fieldOrArray : []);
            return;
        }
        setInstallments((prev) =>
            prev.map((item, i) =>
                i === indexOrAction ? { ...item, [fieldOrArray]: value } : item
            )
        );
    };

    // ── Validate schedule (shared between confirm button and submit) ───────────
    const validateSchedule = () => {
        const totalPaise = toPaise(form.total);
        const count = Number(numberOfInstallments);
        const schedulePaise = installments.reduce((s, i) => s + toPaise(i.dueAmount), 0);

        if (!count || count <= 0) return "Number of installments must be greater than zero.";
        if (installments.length !== count) return "Installment count doesn't match. Please open the modal.";
        if (Math.abs(schedulePaise - totalPaise) > 1) // 1 paise tolerance for rounding
            return `Installment total (₹${(schedulePaise / 100).toFixed(2)}) must equal expense total (₹${(totalPaise / 100).toFixed(2)}).`;

        for (const inst of installments) {
            if (!inst.dueAmount || toPaise(inst.dueAmount) <= 0)
                return `Installment #${inst.installmentNumber}: amount must be greater than zero.`;
            if (!inst.dueDate)
                return `Installment #${inst.installmentNumber}: due date is required.`;
        }
        return null; // valid
    };

    // ── Confirm installment schedule from modal ───────────────────────────────
    const handleConfirmInstallment = () => {
        const err = validateSchedule();
        if (err) { alert(err); return; }
        setShowInstallmentModal(false);
    };

    // ── Cancel installment modal — revert to ONE_TIME ─────────────────────────
    const handleCancelInstallment = () => {
        setShowInstallmentModal(false);
        handleChange("paymentType", "ONE_TIME");
        setNumberOfInstallments(2);
        setInstallments([emptyInstallment(1), emptyInstallment(2)]);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // SUBMIT
    // ─────────────────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic field validation
        if (!form.contactId) { alert("Please select a contact."); return; }
        if (!form.categoryId) { alert("Please select a category."); return; }
        if (!form.bankId) { alert("Please select a bank."); return; }
        if (!form.amount || Number(form.amount) <= 0) { alert("Amount must be greater than zero."); return; }

        // Installment schedule validation
        if (form.paymentType === "INSTALLMENT") {
            const err = validateSchedule();
            if (err) {
                alert(err);
                setShowInstallmentModal(true);
                return;
            }
        }

        // Build request body
        const payload = {
            contactId: Number(form.contactId),
            categoryId: Number(form.categoryId),
            bankId: Number(form.bankId),
            type: form.type,
            date: form.date,
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

            // Reset
            setForm(emptyForm());
            setHasGst(false);
            setHasTds(false);
            setNumberOfInstallments(2);
            setInstallments([emptyInstallment(1), emptyInstallment(2)]);
            setShowInstallmentModal(false);

        } catch (err) {
            console.error("Submit error:", err);
            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to save transaction."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="p-6">
            <Card className="mx-auto max-w-5xl shadow-lg border-slate-200">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-800">
                        Add Transaction
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Record income or expense. Installment schedules are set before saving.
                    </p>
                </CardHeader>

                <CardContent className="pt-5">
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
                        /* Pass schedule info so form can show a summary badge */
                        installmentScheduleConfirmed={
                            form.paymentType === "INSTALLMENT" && !showInstallmentModal
                        }
                        onEditSchedule={() => setShowInstallmentModal(true)}
                    />
                </CardContent>
            </Card>

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