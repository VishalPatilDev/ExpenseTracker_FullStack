
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function List() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [contacts, setContacts] = useState([]);


    const navigate = useNavigate();

    const [search, setSearch] = useState("");


    const [filters, setFilters] = useState({
        type: "",
        category: "",
        paymentType: "",
        paymentStatus: "",
        contact: ""
    });

    const [loading, setLoading] = useState(true);

    const transactionTypes = ["INCOME", "EXPENSE"];

    const paymentStatuses = [
        "PENDING",
        "PARTIAL",
        "COMPLETE"
    ];

    const paymentTypes = [
        "ONE_TIME",
        "INSTALLMENT"
    ];
    const [showInstallmentModal, setShowInstallmentModal] =
        useState(false);

    const [selectedExpense, setSelectedExpense] =
        useState(null);

    const [installmentForm, setInstallmentForm] =
        useState({
            amount: "",
            date: new Date().toISOString().split("T")[0],
            remark: "",
        });
    const openInstallmentModal = (expense) => {
        setSelectedExpense(expense);

        setInstallmentForm({
            amount: "",
            date: new Date().toISOString().split("T")[0],
            remark: "",
        });

        setShowInstallmentModal(true);
    };
    const handleAddInstallment = async () => {
        if (!selectedExpense) {
            return;
        }

        const amount = Number(
            installmentForm.amount
        );

        const pending = Number(
            selectedExpense.pending
        );

        if (!amount || amount <= 0) {
            alert(
                "Payment amount must be greater than zero"
            );
            return;
        }

        if (amount > pending) {
            alert(
                `Payment cannot be greater than pending amount ₹${pending}`
            );
            return;
        }

        try {
            const requestData = {
                amount: amount,
                date: installmentForm.date,
                remark: installmentForm.remark,
            };

            console.log(
                "Installment Request:",
                requestData
            );

            const response = await api.post(
                `/pjsofttech/expense/${selectedExpense.id}/installment`,
                requestData
            );

            console.log(
                "Installment Response:",
                response.data
            );

            alert(
                "Installment payment added successfully!"
            );

            setShowInstallmentModal(false);

            setSelectedExpense(null);

            // IMPORTANT:
            // Reload transaction list
            fetchData();

        } catch (error) {
            console.error(
                "Error adding installment:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Failed to add installment"
            );
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [expenseResponse, categoryResponse, contactResponse] =
                await Promise.all([
                    api.get("/pjsofttech/expense/expenses"),
                    api.get("/pjsofttech/category"),
                    api.get("/pjsofttech/user/users")
                ]);

            console.log("Expenses:", expenseResponse.data);
            console.log("Categories:", categoryResponse.data);
            console.log("Contacts:", contactResponse.data);

            setExpenses(expenseResponse.data);
            setCategories(categoryResponse.data);
            setContacts(contactResponse.data);

        } catch (error) {
            console.error("Error fetching list data:", error);

            if (error.response?.status === 401 ||
                error.response?.status === 403) {
                alert("Session expired. Please login again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            type: "",
            category: "",
            paymentType: "",
            paymentStatus: "",
            contact: ""
        });
    };

    const filteredExpenses = expenses.filter((expense) => {
        // Common search - Name OR Category
        if (search.trim()) {
            const searchText = search.toLowerCase().trim();

            const contactName =
                expense.contact?.name?.toLowerCase() || "";

            const categoryName =
                expense.category?.name?.toLowerCase() || "";

            if (
                !contactName.includes(searchText) &&
                !categoryName.includes(searchText)
            ) {
                return false;
            }
        }

        // Type filter
        if (
            filters.type &&
            expense.type !== filters.type
        ) {
            return false;
        }

        // Category filter
        if (
            filters.category &&
            String(expense.category?.id) !== String(filters.category)
        ) {
            return false;
        }

        // Payment type filter
        if (
            filters.paymentType &&
            expense.paymentType !== filters.paymentType
        ) {
            return false;
        }

        // Payment status filter
        if (
            filters.paymentStatus &&
            expense.paymentStatus !== filters.paymentStatus
        ) {
            return false;
        }

        // Contact filter
        if (
            filters.contact &&
            String(expense.contact?.id) !== String(filters.contact)
        ) {
            return false;
        }

        return true;
    });

    const formatDate = (date) => {
        if (!date) return "-";

        const d = new Date(date);

        return d.toLocaleDateString("en-IN");
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) {
            return "0";
        }

        return Number(amount).toLocaleString("en-IN");
    };

    return (
        <div className="list-page">

            {/* <h1>Expense List</h1> */}

            <div className="list-header">

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {search && (
                        <button
                            type="button"
                            className="clear-search"
                            onClick={() => setSearch("")}
                        >
                            ×
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    className="add-expense-btn"
                    onClick={() => navigate("/expense")}
                >
                    + Add Expense
                </button>

            </div>

            {/* FILTER SECTION */}
            <div className="filter-container">

                <div className="filter-group">
                    <label>Type</label>

                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Types</option>

                        {transactionTypes.map(type => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="filter-group">
                    <label>Category</label>

                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Categories</option>

                        {categories.map(category => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Payment Type</label>

                    <select
                        name="paymentType"
                        value={filters.paymentType}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Payment Types</option>

                        {paymentTypes.map(type => (
                            <option
                                key={type}
                                value={type}
                            >
                                {type === "ONE_TIME"
                                    ? "One Time"
                                    : "Installment"}
                            </option>
                        ))}
                    </select>
                </div>



                <div className="filter-group">
                    <label>Payment Status</label>

                    <select
                        name="paymentStatus"
                        value={filters.paymentStatus}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Status</option>

                        {paymentStatuses.map(status => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="filter-group">
                    <label>User / Contact</label>

                    <select
                        name="contact"
                        value={filters.contact}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Contacts</option>

                        {contacts.map(contact => (
                            <option
                                key={contact.id}
                                value={contact.id}
                            >
                                {contact.name}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="filter-buttons">
                    <button onClick={clearFilters}>
                        Clear Filters
                    </button>
                </div>

            </div>


            {/* RESULT COUNT */}
            <div className="list-summary">
                Showing {filteredExpenses.length} of {expenses.length} records
            </div>


            {/* TABLE */}
            <div className="table-container">

                {loading ? (
                    <p>Loading expenses...</p>
                ) : filteredExpenses.length === 0 ? (
                    <p>No expenses found.</p>
                ) : (

                    <table>

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ExpenseID</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Contact</th>
                                <th>Category</th>
                                <th>Particular</th>
                                <th>Amount</th>
                                <th>GST %</th>
                                <th>GST Amount</th>
                                <th>GST Number</th>
                                <th>TDS %</th>
                                <th>Total</th>
                                <th>Paid</th>
                                <th>Pending</th>
                                <th>Payment Type</th>

                                <th>Payment Status</th>
                                <th>Remark</th>
                            </tr>
                        </thead>
                        <tbody>

                            {filteredExpenses.map((expense, index) => (

                                <tr key={expense.id}>

                                    <td>
                                        {expense.index ?? index + 1}
                                    </td>
                                    <td>
                                        {expense.id}
                                    </td>

                                    <td>
                                        {formatDate(expense.date)}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                expense.type === "INCOME"
                                                    ? "income"
                                                    : "expense"
                                            }
                                        >
                                            {expense.type}
                                        </span>
                                    </td>

                                    <td>
                                        {expense.contact?.name || "-"}
                                    </td>

                                    <td>
                                        {expense.category?.name || "-"}
                                    </td>

                                    <td>
                                        {expense.particular || "-"}
                                    </td>

                                    <td>
                                        ₹{formatAmount(expense.amount)}
                                    </td>

                                    <td>
                                        {expense.gstPercentage ?? 0}%
                                    </td>

                                    <td>
                                        ₹{formatAmount(expense.gstAmount)}
                                    </td>

                                    <td>
                                        {expense.gstNumber || "-"}
                                    </td>

                                    <td>
                                        {expense.tdsPercentage ?? 0}%
                                    </td>

                                    <td>
                                        ₹{formatAmount(expense.total)}
                                    </td>

                                    <td>
                                        ₹{formatAmount(expense.paid)}
                                    </td>

                                    <td>
                                        ₹{formatAmount(expense.pending)}
                                    </td>
                                    <td>
                                        {expense.paymentType === "ONE_TIME"
                                            ? "One Time"
                                            : expense.paymentType === "INSTALLMENT"
                                                ? "Installment"
                                                : "-"}
                                    </td>

                                    <td>
                                        {expense.paymentStatus || "-"}
                                    </td>

                                    <td>
                                        {expense.remark || "-"}
                                    </td>
                                    <td>
                                        {expense.paymentType === "INSTALLMENT" && expense.paymentStatus !== "COMPLETE" && (
                                            <button
                                                onClick={() => openInstallmentModal(expense)}
                                            >
                                                Add Payment
                                            </button>
                                        )}
                                    </td>


                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>
            {showInstallmentModal && selectedExpense && (
                <div className="modal-overlay">

                    <div className="installment-modal">

                        <h2>
                            Add Payment
                        </h2>

                        <p>
                            Transaction ID:{" "}
                            <strong>
                                #{selectedExpense.id}
                            </strong>
                        </p>

                        <div className="payment-summary">

                            <div>
                                <span>Total</span>

                                <strong>
                                    ₹
                                    {Number(
                                        selectedExpense.total
                                    ).toLocaleString("en-IN")}
                                </strong>
                            </div>

                            <div>
                                <span>Already Paid</span>

                                <strong>
                                    ₹
                                    {Number(
                                        selectedExpense.paid
                                    ).toLocaleString("en-IN")}
                                </strong>
                            </div>

                            <div>
                                <span>Pending</span>

                                <strong>
                                    ₹
                                    {Number(
                                        selectedExpense.pending
                                    ).toLocaleString("en-IN")}
                                </strong>
                            </div>

                        </div>

                        <div className="form-group">

                            <label>
                                Payment Amount
                            </label>

                            <input
                                type="number"
                                min="1"
                                max={selectedExpense.pending}
                                value={installmentForm.amount}
                                onChange={(e) =>
                                    setInstallmentForm(
                                        (previous) => ({
                                            ...previous,
                                            amount: e.target.value,
                                        })
                                    )
                                }
                            />

                            <small>
                                Maximum payment: ₹
                                {Number(
                                    selectedExpense.pending
                                ).toLocaleString("en-IN")}
                            </small>

                        </div>

                        <div className="form-group">

                            <label>
                                Payment Date
                            </label>

                            <input
                                type="date"
                                value={installmentForm.date}
                                onChange={(e) =>
                                    setInstallmentForm(
                                        (previous) => ({
                                            ...previous,
                                            date: e.target.value,
                                        })
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Remark
                            </label>

                            <textarea
                                rows="3"
                                placeholder="Payment remark"
                                value={installmentForm.remark}
                                onChange={(e) =>
                                    setInstallmentForm(
                                        (previous) => ({
                                            ...previous,
                                            remark: e.target.value,
                                        })
                                    )
                                }
                            />

                        </div>

                        <div className="modal-actions">

                            <button
                                type="button"
                                onClick={() => {
                                    setShowInstallmentModal(false);
                                    setSelectedExpense(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleAddInstallment}
                            >
                                Add Payment
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}