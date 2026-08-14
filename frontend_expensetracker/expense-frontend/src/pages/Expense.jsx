import { useEffect, useState } from "react";
import api from "../api/api";
// import "./Expense.css";

const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};
const getEmptyForm = () => ({
    type: "EXPENSE",
    contactId: "",
    date: getTodayDate(),
    categoryId: "",
    particular: "",
    amount: "",
    gstPercentage: "",
    gstNumber: "",
    tdsPercentage: "",
    total: 0,
    paymentType: "ONE_TIME",
    remark: "",
});


export default function Expense() {
    const [contacts, setContacts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState(getEmptyForm());

    const [hasGst, setHasGst] = useState(false);
    const [hasTds, setHasTds] = useState(false);

    // ---------------------------------------
    // INSTALLMENT POPUP
    // ---------------------------------------
    const [showInstallmentPopup, setShowInstallmentPopup] =
        useState(false);

    const [installment, setInstallment] = useState({
        amount: "",
        date: getTodayDate(),
        remark: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // ---------------------------------------
    // FETCH INITIAL DATA
    // ---------------------------------------
    useEffect(() => {
        fetchContacts();
        fetchCategories();
    }, []);

    // -----------------------------
    // GET CONTACTS
    // -----------------------------
    const fetchContacts = async () => {
        try {
            const response = await api.get("/pjsofttech/user/users");

            setContacts(response.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    // -----------------------------
    // GET CATEGORIES
    // -----------------------------
    const fetchCategories = async () => {
        try {
            const response = await api.get("/pjsofttech/category");

            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // -----------------------------
    // HANDLE FORM INPUT
    // -----------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // -----------------------------
    // CALCULATE TOTAL
    // -----------------------------
    useEffect(() => {
        const amount = Number(form.amount) || 0;

        const gstPercentage = hasGst
            ? Number(form.gstPercentage) || 0
            : 0;

        const tdsPercentage = hasTds
            ? Number(form.tdsPercentage) || 0
            : 0;

        const gstAmount = (amount * gstPercentage) / 100;
        const tdsAmount = (amount * tdsPercentage) / 100;

        const total = amount + gstAmount - tdsAmount;

        setForm((previous) => {
            if (previous.total === total) {
                return previous;
            }

            return {
                ...previous,
                total,
            };
        });
    }, [
        form.amount,
        form.gstPercentage,
        form.tdsPercentage,
        hasGst,
        hasTds,
    ]);

    // -----------------------------
    // GST CHECKBOX
    // -----------------------------
    const handleGstChange = (e) => {
        const checked = e.target.checked;

        setHasGst(checked);

        if (!checked) {
            setForm((previous) => ({
                ...previous,
                gstPercentage: "",
                gstNumber: "",
            }));
        }
    };

    // -----------------------------
    // TDS CHECKBOX
    // -----------------------------
    const handleTdsChange = (e) => {
        const checked = e.target.checked;

        setHasTds(checked);

        if (!checked) {
            setForm((previous) => ({
                ...previous,
                tdsPercentage: "",
            }));
        }
    };

    // ---------------------------------------
    // PAYMENT Type CHANGE
    // ---------------------------------------
    const handlePaymentTypeChange = (e) => {
        const value = e.target.value;

        setForm((previous) => ({
            ...previous,
            paymentType: value,
        }));

        // Open installment popup
        if (value === "INSTALLMENT") {
            setInstallment({
                amount: "",
                date: getTodayDate(),
                remark: "",
            });

            setShowInstallmentPopup(true);
        }

        // If user switches back to complete
        if (value === "ONE_TIME") {
            setShowInstallmentPopup(false);

            setInstallment({
                amount: "",
                date: getTodayDate(),
                remark: "",
            });
        }
    };

    // ---------------------------------------
    // INSTALLMENT INPUT
    // ---------------------------------------
    const handleInstallmentChange = (e) => {
        const { name, value } = e.target;

        setInstallment((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ---------------------------------------
    // CONFIRM INITIAL PAYMENT
    // ---------------------------------------
    const handleConfirmInstallment = () => {
        const initialPayment =
            Number(installment.amount) || 0;

        const total =
            Number(form.total) || 0;

        if (initialPayment <= 0) {
            alert(
                "Initial payment must be greater than zero."
            );
            return;
        }

        if (initialPayment > total) {
            alert(
                "Initial payment cannot be greater than the total amount."
            );
            return;
        }

        if (!installment.date) {
            alert("Please select payment date.");
            return;
        }

        setShowInstallmentPopup(false);
    };

    // ---------------------------------------
    // CANCEL INSTALLMENT
    // ---------------------------------------
    const handleCancelInstallment = () => {
        setShowInstallmentPopup(false);

        setForm((previous) => ({
            ...previous,
            paymentType: "ONE_TIME",
        }));

        setInstallment({
            amount: "",
            date: getTodayDate(),
            remark: "",
        });
    };
    

    // ---------------------------------------
    // SUBMIT
    // ---------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // -----------------------------------
        // BASIC VALIDATION
        // -----------------------------------
        if (!form.contactId) {
            alert("Please select a contact.");
            return;
        }

        if (!form.categoryId) {
            alert("Please select a category.");
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            alert("Amount must be greater than zero.");
            return;
        }

        // -----------------------------------
        // INSTALLMENT VALIDATION
        // -----------------------------------
        if (form.paymentType === "INSTALLMENT") {
            const initialPayment =
                Number(installment.amount) || 0;

            const total =
                Number(form.total) || 0;

            if (initialPayment <= 0) {
                setShowInstallmentPopup(true);

                alert(
                    "Please enter the initial payment amount."
                );

                return;
            }

            if (initialPayment > total) {
                setShowInstallmentPopup(true);

                alert(
                    "Initial payment cannot be greater than the total amount."
                );

                return;
            }

            if (!installment.date) {
                setShowInstallmentPopup(true);

                alert(
                    "Please select initial payment date."
                );

                return;
            }
        }

        try {
            setSubmitting(true);

            // -----------------------------------
            // REQUEST DATA
            // -----------------------------------
            const requestData = {
                contactId: Number(form.contactId),

                type: form.type,

                date: form.date,

                categoryId: Number(form.categoryId),

                particular: form.particular,

                amount: Number(form.amount),

                gstPercentage: hasGst
                    ? Number(form.gstPercentage)
                    : null,

                gstNumber: hasGst
                    ? form.gstNumber
                    : null,

                tdsPercentage: hasTds
                    ? Number(form.tdsPercentage)
                    : null,

                total: Number(form.total),

                paymentType: form.paymentType,

                remark: form.remark,
            };

            // -----------------------------------
            // ADD INSTALLMENT DATA ONLY WHEN
            // PAYMENT STATUS = INSTALLMENT
            // -----------------------------------
            if (
                form.paymentType ===
                "INSTALLMENT"
            ) {
                requestData.installmentRequestDto = {
                    amount: Number(
                        installment.amount
                    ),

                    date: installment.date,

                    remark: installment.remark,
                };
            }

            console.log(
                "Expense Request:",
                requestData
            );

            // -----------------------------------
            // API CALL
            // -----------------------------------
            const response = await api.post(
                "/pjsofttech/expense",
                requestData
            );

            console.log(
                "Expense Response:",
                response.data
            );

            alert(
                "Transaction added successfully!"
            );

            // -----------------------------------
            // RESET
            // -----------------------------------
            setForm(getEmptyForm());

            setHasGst(false);
            setHasTds(false);

            setInstallment({
                amount: "",
                date: getTodayDate(),
                remark: "",
            });

            setShowInstallmentPopup(false);
        } catch (error) {
            console.error(
                "Error adding expense:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error;

            alert(
                backendMessage ||
                "Failed to add transaction"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="expense-page">

            <div className="expense-card">

                {/* -------------------------------- */}
                {/* HEADER */}
                {/* -------------------------------- */}

                <div className="expense-header">
                    {/* <h1>Add Transaction</h1> */}

                    <p>
                        Record a new income or expense
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* ROW 1 */}
                    <div className="form-row">

                        <div className="form-group">
                            <label>Type</label>

                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                required
                            >
                                <option value="EXPENSE">Expense</option>
                                <option value="INCOME">Income</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>User / Contact</label>

                            <select
                                name="contactId"
                                value={form.contactId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Contact
                                </option>

                                {contacts.map((contact) => (
                                    <option
                                        key={contact.id}
                                        value={contact.id}
                                    >
                                        {contact.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>


                    {/* ROW 2 */}
                    <div className="form-row">

                        <div className="form-group">
                            <label>Date</label>

                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>

                            <select
                                name="categoryId"
                                value={form.categoryId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Category
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>


                    {/* ROW 3 */}
                    <div className="form-row">

                        <div className="form-group">
                            <label>Particular</label>

                            <input
                                type="text"
                                name="particular"
                                placeholder="Enter particular"
                                value={form.particular}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Amount</label>

                            <input
                                type="number"
                                name="amount"
                                placeholder="Enter amount"
                                min="0"
                                step="1"
                                value={form.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>


                    {/* GST + TDS */}
                    <div className="tax-row">

                        {/* GST */}
                        <div className="checkbox-section">

                            <label className="checkbox-label">

                                <input
                                    type="checkbox"
                                    checked={hasGst}
                                    onChange={handleGstChange}
                                />

                                <span>Apply GST</span>

                            </label>

                            {hasGst && (
                                <div className="conditional-fields">

                                    <div className="form-group">
                                        <label>GST %</label>

                                        <input
                                            type="number"
                                            name="gstPercentage"
                                            placeholder="18"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={form.gstPercentage}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>GST Number</label>

                                        <input
                                            type="text"
                                            name="gstNumber"
                                            placeholder="GST number"
                                            value={form.gstNumber}
                                            onChange={handleChange}
                                        />
                                    </div>

                                </div>
                            )}

                        </div>


                        {/* TDS */}
                        <div className="checkbox-section">

                            <label className="checkbox-label">

                                <input
                                    type="checkbox"
                                    checked={hasTds}
                                    onChange={handleTdsChange}
                                />

                                <span>Apply TDS</span>

                            </label>

                            {hasTds && (
                                <div className="conditional-fields">

                                    <div className="form-group">
                                        <label>TDS %</label>

                                        <input
                                            type="number"
                                            name="tdsPercentage"
                                            placeholder="10"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={form.tdsPercentage}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                </div>
                            )}

                        </div>

                    </div>


                    {/* ROW 5 */}
                    <div className="form-row">

                        {/* TOTAL */}
                        <div className="total-section">

                            <div>
                                <span>Total Amount</span>

                                <strong>
                                    ₹{Number(form.total).toLocaleString("en-IN")}
                                </strong>
                            </div>

                        </div>


                        {/* PAYMENT TYPE */}
                        <div className="form-group">

                            <label>Payment Type</label>

                            <select
                                name="paymentType"
                                value={form.paymentType}
                                onChange={handlePaymentTypeChange}
                                required
                            >
                                <option value="ONE_TIME">
                                    One Time Payment
                                </option>

                                <option value="INSTALLMENT">
                                    Pay in Installments
                                </option>
                            </select>

                        </div>

                    </div>


                    {/* REMARK */}
                    <div className="form-group">

                        <label>Remark</label>

                        <textarea
                            name="remark"
                            placeholder="Add an optional remark..."
                            value={form.remark}
                            onChange={handleChange}
                            rows="2"
                        />

                    </div>


                    {/* SUBMIT */}
                    <button
                        type="submit"
                        className="submit-expense-button"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Saving..."
                            : "Save Transaction"}
                    </button>

                </form>


            </div>

            {/* ================================================= */}
            {/* INITIAL PAYMENT POPUP */}
            {/* ================================================= */}

            {showInstallmentPopup && (
                <div className="modal-overlay">

                    <div className="installment-modal">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    Initial Payment
                                </h2>

                                <p>
                                    Enter the first
                                    installment payment
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    handleCancelInstallment
                                }
                            >
                                ×
                            </button>

                        </div>

                        {/* TOTAL */}
                        <div className="payment-summary">

                            <div>
                                <span>
                                    Total Amount
                                </span>

                                <strong>
                                    ₹{" "}
                                    {Number(
                                        form.total
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Initial Payment
                                </span>

                                <strong>
                                    ₹{" "}
                                    {Number(
                                        installment.amount
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Remaining
                                </span>

                                <strong>
                                    ₹{" "}
                                    {Math.max(
                                        Number(
                                            form.total
                                        ) -
                                        (Number(
                                            installment.amount
                                        ) || 0),
                                        0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                        </div>

                        {/* PAYMENT AMOUNT */}
                        <div className="form-group">

                            <label>
                                Initial Payment Amount
                            </label>

                            <input
                                type="number"
                                name="amount"
                                placeholder="Enter initial payment"
                                min="1"
                                max={form.total}
                                step="1"
                                value={
                                    installment.amount
                                }
                                onChange={
                                    handleInstallmentChange
                                }
                                autoFocus
                            />

                            <small>
                                Maximum: ₹{" "}
                                {Number(
                                    form.total
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </small>

                        </div>

                        {/* PAYMENT DATE */}
                        <div className="form-group">

                            <label>
                                Payment Date
                            </label>

                            <input
                                type="date"
                                name="date"
                                value={
                                    installment.date
                                }
                                onChange={
                                    handleInstallmentChange
                                }
                            />

                        </div>

                        {/* PAYMENT REMARK */}
                        {/* <div className="form-group">

                            <label>
                                Payment Remark
                            </label>

                            <textarea
                                name="remark"
                                placeholder="Enter payment remark"
                                value={
                                    installment.remark
                                }
                                onChange={
                                    handleInstallmentChange
                                }
                                rows="3"
                            />

                        </div> */}

                        {/* BUTTONS */}
                        <div className="modal-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={
                                    handleCancelInstallment
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirm-button"
                                onClick={
                                    handleConfirmInstallment
                                }
                            >
                                Confirm Initial Payment
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

