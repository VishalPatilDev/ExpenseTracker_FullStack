// import { useEffect, useState } from "react";
// import api from "../api/api";

// import {
//     Card,
//     CardContent,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";

// import TransactionForm from "@/components/transactions/TransactionForm";
// import InstallmentModal from "@/components/transactions/InstallmentModel";

// const getTodayDate = () => {
//     const today = new Date();

//     return `${today.getFullYear()}-${String(
//         today.getMonth() + 1
//     ).padStart(2, "0")}-${String(today.getDate()).padStart(
//         2,
//         "0"
//     )}`;
// };
// const getTodayDateTime = () => {
//     const now = new Date();

//     return `${now.getFullYear()}-${String(
//         now.getMonth() + 1
//     ).padStart(2, "0")}-${String(
//         now.getDate()
//     ).padStart(2, "0")}T${String(
//         now.getHours()
//     ).padStart(2, "0")}:${String(
//         now.getMinutes()
//     ).padStart(2, "0")}:${String(
//         now.getSeconds()
//     ).padStart(2, "0")}`;
// };

// // --------------------------------
// // EMPTY EXPENSE FORM
// // --------------------------------

// const getEmptyForm = () => ({
//     type: "EXPENSE",
//     contactId: "",
//     date: getTodayDate(),
//     categoryId: "",
//     bankId: "",
//     particular: "",
//     amount: "",
//     gstPercentage: "",
//     gstNumber: "",
//     tdsPercentage: "",
//     total: 0,
//     paymentType: "ONE_TIME",
//     remark: "",
// });

// // --------------------------------
// // EMPTY INSTALLMENT
// // --------------------------------

// const getEmptyInstallment = (number = 1) => ({
//     installmentNumber: number,
//     dueAmount: "",
//     dueDate: getTodayDate(),
// });

// export default function Expense() {
//     const [contacts, setContacts] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [banks, setBanks] = useState([]);

//     const [form, setForm] = useState(getEmptyForm());

//     const [hasGst, setHasGst] = useState(false);
//     const [hasTds, setHasTds] = useState(false);

//     // --------------------------------
//     // INSTALLMENT STATE
//     // --------------------------------

//     const [numberOfInstallments, setNumberOfInstallments] =
//         useState(2);

//     const [installments, setInstallments] = useState([
//         getEmptyInstallment(1),
//         getEmptyInstallment(2),
//     ]);

//     const [showInstallmentPopup, setShowInstallmentPopup] =
//         useState(false);

//     const [submitting, setSubmitting] = useState(false);

//     // --------------------------------
//     // FETCH DATA
//     // --------------------------------

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const fetchData = async () => {
//         try {
//             const [
//                 contactsResponse,
//                 categoriesResponse,
//                 banksResponse,
//             ] = await Promise.all([
//                 api.get("/pjsofttech/user/users"),
//                 api.get("/pjsofttech/category"),
//                 api.get("/pjsofttech/bank"),
//             ]);

//             setContacts(contactsResponse.data);
//             setCategories(categoriesResponse.data);
//             setBanks(banksResponse.data);
//         } catch (error) {
//             console.error("Error fetching data:", error);
//         }
//     };

//     // --------------------------------
//     // FORM CHANGE
//     // --------------------------------

//     const handleChange = (name, value) => {
//         setForm((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     // --------------------------------
//     // CALCULATE TOTAL
//     // --------------------------------

//     useEffect(() => {
//         const amount = Number(form.amount) || 0;

//         const gst = hasGst
//             ? Number(form.gstPercentage) || 0
//             : 0;

//         const tds = hasTds
//             ? Number(form.tdsPercentage) || 0
//             : 0;

//         const total =
//             amount +
//             (amount * gst) / 100 -
//             (amount * tds) / 100;

//         setForm((prev) => {
//             if (prev.total === total) {
//                 return prev;
//             }

//             return {
//                 ...prev,
//                 total,
//             };
//         });
//     }, [
//         form.amount,
//         form.gstPercentage,
//         form.tdsPercentage,
//         hasGst,
//         hasTds,
//     ]);

//     // --------------------------------
//     // GST
//     // --------------------------------

//     const handleGstChange = (checked) => {
//         setHasGst(checked);

//         if (!checked) {
//             setForm((prev) => ({
//                 ...prev,
//                 gstPercentage: "",
//                 gstNumber: "",
//             }));
//         }
//     };

//     // --------------------------------
//     // TDS
//     // --------------------------------

//     const handleTdsChange = (checked) => {
//         setHasTds(checked);

//         if (!checked) {
//             setForm((prev) => ({
//                 ...prev,
//                 tdsPercentage: "",
//             }));
//         }
//     };

//     // --------------------------------
//     // GENERATE INSTALLMENTS
//     // --------------------------------

//     const generateInstallments = (count) => {
//         const number = Number(count);

//         if (!number || number <= 0) {
//             setInstallments([]);
//             return;
//         }

//         const newInstallments = Array.from(
//             { length: number },
//             (_, index) => getEmptyInstallment(index + 1)
//         );

//         setInstallments(newInstallments);
//     };

//     // --------------------------------
//     // PAYMENT TYPE
//     // --------------------------------

//     const handlePaymentTypeChange = (value) => {
//         setForm((prev) => ({
//             ...prev,
//             paymentType: value,
//         }));

//         if (value === "INSTALLMENT") {
//             const defaultCount = 1;

//             setNumberOfInstallments(defaultCount);

//             generateInstallments(defaultCount);

//             setShowInstallmentPopup(true);
//         } else {
//             setShowInstallmentPopup(false);

//             setNumberOfInstallments(2);

//             setInstallments([
//                 getEmptyInstallment(1),
//                 getEmptyInstallment(2),
//             ]);
//         }
//     };

//     // --------------------------------
//     // INSTALLMENT CHANGE
//     // --------------------------------

//     const handleInstallmentChange = (
//         index,
//         field,
//         value
//     ) => {
//         // --------------------------------
//         // REPLACE ENTIRE INSTALLMENT ARRAY
//         // --------------------------------

//         if (index === "replace") {
//             setInstallments(
//                 Array.isArray(field)
//                     ? field
//                     : []
//             );

//             return;
//         }

//         // --------------------------------
//         // UPDATE SINGLE INSTALLMENT FIELD
//         // --------------------------------

//         setInstallments((prev) =>
//             prev.map((installment, i) =>
//                 i === index
//                     ? {
//                         ...installment,
//                         [field]: value,
//                     }
//                     : installment
//             )
//         );
//     };


//     // --------------------------------
//     // CONFIRM INSTALLMENT PLAN
//     // --------------------------------

//     const handleConfirmInstallment = () => {
//         const total = Number(form.total) || 0;

//         const count = Number(numberOfInstallments);

//         if (!count || count <= 0) {
//             alert(
//                 "Number of installments must be greater than zero."
//             );
//             return;
//         }

//         if (installments.length !== count) {
//             alert(
//                 "Please create a valid installment schedule."
//             );
//             return;
//         }

//         // Validate every installment
//         for (const installment of installments) {
//             if (
//                 !installment.dueAmount ||
//                 Number(installment.dueAmount) <= 0
//             ) {
//                 alert(
//                     `Please enter amount for installment ${installment.installmentNumber}.`
//                 );
//                 return;
//             }

//             if (!installment.dueDate) {
//                 alert(
//                     `Please select due date for installment ${installment.installmentNumber}.`
//                 );
//                 return;
//             }
//         }

//         // Calculate schedule total
//         const scheduleTotal = installments.reduce(
//             (sum, installment) =>
//                 sum + Number(installment.dueAmount || 0),
//             0
//         );

//         // Important:
//         // schedule must exactly equal expense total
//         if (Math.abs(scheduleTotal - total) > 0.01) {


//             alert(
//                 `Installment amounts must equal total amount.\n\n` +
//                 `Total: ₹${total.toLocaleString("en-IN")}\n` +
//                 `Scheduled: ₹${scheduleTotal.toLocaleString(
//                     "en-IN"
//                 )}`
//             );

//             return;
//         }

//         // Close popup only after everything is valid
//         setShowInstallmentPopup(false);
//     };

//     // --------------------------------
//     // CANCEL INSTALLMENT
//     // --------------------------------

//     const handleCancelInstallment = () => {
//         setShowInstallmentPopup(false);

//         setForm((prev) => ({
//             ...prev,
//             paymentType: "ONE_TIME",
//         }));

//         setNumberOfInstallments(2);

//         setInstallments([
//             getEmptyInstallment(1),
//             getEmptyInstallment(2),
//         ]);
//     };

//     // --------------------------------
//     // SUBMIT
//     // --------------------------------

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // -----------------------------
//         // BASIC VALIDATION
//         // -----------------------------

//         if (!form.contactId) {
//             alert("Please select a contact.");
//             return;
//         }

//         if (!form.categoryId) {
//             alert("Please select a category.");
//             return;
//         }

//         if (!form.bankId) {
//             alert("Please select a bank.");
//             return;
//         }

//         if (!form.amount || Number(form.amount) <= 0) {
//             alert("Amount must be greater than zero.");
//             return;
//         }

//         // -----------------------------
//         // INSTALLMENT VALIDATION
//         // -----------------------------

//         if (form.paymentType === "INSTALLMENT") {
//             const count = Number(numberOfInstallments);
//             const total = Number(form.total);

//             if (!count || count <= 0) {
//                 alert(
//                     "Number of installments must be greater than zero."
//                 );

//                 setShowInstallmentPopup(true);
//                 return;
//             }

//             if (installments.length !== count) {
//                 alert(
//                     "Please create a valid installment schedule."
//                 );

//                 setShowInstallmentPopup(true);
//                 return;
//             }

//             for (const installment of installments) {
//                 if (
//                     !installment.dueAmount ||
//                     Number(installment.dueAmount) <= 0
//                 ) {
//                     alert(
//                         `Invalid amount for installment ${installment.installmentNumber}.`
//                     );

//                     setShowInstallmentPopup(true);
//                     return;
//                 }

//                 if (!installment.dueDate) {
//                     alert(
//                         `Please select due date for installment ${installment.installmentNumber}.`
//                     );

//                     setShowInstallmentPopup(true);
//                     return;
//                 }
//             }

//             const scheduleTotal = installments.reduce(
//                 (sum, installment) =>
//                     sum +
//                     Number(installment.dueAmount || 0),
//                 0
//             );

//             if (Math.abs(scheduleTotal - total) > 0.01) {

//                 alert(
//                     "Installment amounts must equal total amount."
//                 );

//                 setShowInstallmentPopup(true);
//                 return;
//             }
//         }

//         // -----------------------------
//         // REQUEST
//         // -----------------------------

//         try {
//             setSubmitting(true);

//             const requestData = {
//                 contactId: Number(form.contactId),

//                 type: form.type,

//                 date: form.date,

//                 categoryId: Number(form.categoryId),

//                 bankId: Number(form.bankId),

//                 particular: form.particular,

//                 amount: Number(form.amount),

//                 gstPercentage: hasGst
//                     ? Number(form.gstPercentage)
//                     : null,

//                 gstNumber: hasGst
//                     ? form.gstNumber
//                     : null,

//                 tdsPercentage: hasTds
//                     ? Number(form.tdsPercentage)
//                     : null,

//                 total: Number(form.total),

//                 paymentType: form.paymentType,

//                 remark: form.remark,
//             };

//             // -----------------------------
//             // INSTALLMENT PLAN
//             // -----------------------------

//             if (
//                 form.paymentType === "INSTALLMENT"
//             ) {
//                 requestData.numberOfInstallments =
//                     Number(numberOfInstallments);

//                 requestData.installments =
//                     installments.map(
//                         (installment) => ({
//                             installmentNumber:
//                                 Number(
//                                     installment.installmentNumber
//                                 ),

//                             dueAmount:
//                                 Number(
//                                     installment.dueAmount
//                                 ),

//                             dueDate:
//                                 installment.dueDate,
//                         })
//                     );
//             }

//             console.log(
//                 "Expense Request:",
//                 requestData
//             );

//             // -----------------------------
//             // API
//             // -----------------------------

//             await api.post(
//                 "/pjsofttech/expense",
//                 requestData
//             );

//             alert(
//                 "Transaction added successfully!"
//             );

//             // -----------------------------
//             // RESET
//             // -----------------------------

//             setForm(getEmptyForm());

//             setHasGst(false);

//             setHasTds(false);

//             setNumberOfInstallments(2);

//             setInstallments([
//                 getEmptyInstallment(1),
//                 getEmptyInstallment(2),
//             ]);

//             setShowInstallmentPopup(false);
//         } catch (error) {
//             console.error(
//                 "Expense submit error:",
//                 error
//             );

//             alert(
//                 error.response?.data?.message ||
//                 error.response?.data?.error ||
//                 "Failed to add transaction"
//             );
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // --------------------------------
//     // UI
//     // --------------------------------

//     return (
//         <div className="p-6">
//             <Card className="mx-auto max-w-5xl shadow-2xl">
//                 <CardHeader>
//                     <CardTitle>
//                         Add Transaction
//                     </CardTitle>

//                     <p className="text-sm text-muted-foreground">
//                         Record a new income or expense
//                     </p>
//                 </CardHeader>

//                 <CardContent>
//                     <TransactionForm
//                         form={form}
//                         contacts={contacts}
//                         categories={categories}
//                         banks={banks}
//                         hasGst={hasGst}
//                         hasTds={hasTds}
//                         submitting={submitting}
//                         onChange={handleChange}
//                         onGstChange={handleGstChange}
//                         onTdsChange={handleTdsChange}
//                         onPaymentTypeChange={
//                             handlePaymentTypeChange
//                         }
//                         onSubmit={handleSubmit}
//                     />
//                 </CardContent>
//             </Card>

//             <InstallmentModal
//                 open={showInstallmentPopup}
//                 total={form.total}
//                 numberOfInstallments={
//                     numberOfInstallments
//                 }
//                 setNumberOfInstallments={
//                     (value) => {
//                         setNumberOfInstallments(
//                             Number(value)
//                         );
//                     }
//                 }
//                 installments={installments}
//                 onInstallmentChange={
//                     handleInstallmentChange
//                 }
//                 onConfirm={
//                     handleConfirmInstallment
//                 }
//                 onCancel={
//                     handleCancelInstallment
//                 }
//             />
//         </div>
//     );
// }
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
            paymentMethod:form.paymentMethod,
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