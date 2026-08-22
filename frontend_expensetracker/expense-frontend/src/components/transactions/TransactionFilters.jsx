import SearchableDropdown from "../filters/SearchableDropdown";

// Outlined select matching PJSOFTTECH floating-label style
const FilterSelect = ({ label, value, onChange, children }) => (
    <div className="relative border border-gray-300 rounded focus-within:border-[#4A90D9] transition-colors">
        <span className="absolute top-1 left-3 text-[9px] font-medium text-gray-400 uppercase tracking-wide">
            {label}
        </span>
        <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white text-sm text-gray-700 pt-5 pb-2 px-3 focus:outline-none appearance-none rounded"
        >
            <option value=""></option>
            {children}
        </select>
        {/* chevron */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
    </div>
);

const FilterSearchable = ({ label, value, onChange, options, placeholder }) => (
    <div className="relative border border-gray-300 rounded focus-within:border-[#4A90D9] transition-colors">
        <span className="absolute top-1 left-3 text-[9px] font-medium text-gray-400 uppercase tracking-wide z-10">
            {label}
        </span>
        <div className="pt-5 pb-1 px-2">
            <SearchableDropdown
                value={value}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
                minimal
            />
        </div>
    </div>
);

export default function TransactionFilters({ filters, categories, contacts, onChange, onClear }) {
    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
    const contactOptions = contacts.map((c) => ({ value: c.id, label: c.name }));

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 items-end">

            {/* Type */}
            <FilterSelect label="Type" value={filters.type} onChange={(v) => onChange("type", v)}>
                <option value="All">All</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
            </FilterSelect>

            {/* Timeframe (placeholder) */}
            <FilterSelect label="Timeframe" value="" onChange={() => {}}>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
            </FilterSelect>

            {/* Bill Type / Payment Type */}
            <FilterSelect label="Bill Type" value={filters.paymentType} onChange={(v) => onChange("paymentType", v)}>
                <option value="ONE_TIME">One Time</option>
                <option value="INSTALLMENT">Installment</option>
            </FilterSelect>

            {/* Category */}
            <FilterSearchable
                label="Category"
                value={filters.category}
                onChange={(v) => onChange("category", v)}
                options={categoryOptions}
                placeholder="All"
            />

            {/* Payment Method */}
            <FilterSelect label="Payment Method" value={filters.paymentMethod} onChange={(v) => onChange("paymentMethod", v)}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CREDIT_CARD">Credit Card</option>
            </FilterSelect>

            {/* Payment Status */}
            <FilterSelect label="Payment Status" value={filters.paymentStatus} onChange={(v) => onChange("paymentStatus", v)}>
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="COMPLETE">Complete</option>
            </FilterSelect>

            {/* User / Contact */}
            <FilterSearchable
                label="User"
                value={filters.contact}
                onChange={(v) => onChange("contact", v)}
                options={contactOptions}
                placeholder="All"
            />

            {/* Department (placeholder) */}
            {/* <FilterSelect label="Department" value="" onChange={() => {}}>
                <option value="all">All</option>
            </FilterSelect> */}

            {/* Clear */}
            <button
                type="button"
                onClick={onClear}
                className="h-full min-h-[56px] border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50 transition-colors px-3"
            >
                Clear
            </button>
        </div>
    );
}