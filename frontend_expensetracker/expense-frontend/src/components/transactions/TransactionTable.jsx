import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const fmt = (v) =>
    Number(v ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        COMPLETE: "bg-green-100 text-green-700 border-green-200",
        PAID: "bg-green-100 text-green-700 border-green-200",
        PARTIAL: "bg-amber-100 text-amber-700 border-amber-200",
        PENDING: "bg-red-100 text-red-600 border-red-200",
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────
// INSTALLMENT BADGE  (shown in Type column like the screenshot)
// ─────────────────────────────────────────────────────────────

const InstallmentBadge = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex px-2 py-0.5 rounded border text-xs font-semibold
                   bg-orange-100 text-orange-700 border-orange-200
                   hover:bg-orange-200 transition-colors cursor-pointer"
    >
        Installment
    </button>
);

// ─────────────────────────────────────────────────────────────
// INSTALLMENT DETAIL CELL
// ─────────────────────────────────────────────────────────────

const InstallmentCell = ({ installments = [], onPay }) => {
    if (!installments.length) return <span className="text-xs text-gray-400">—</span>;

    return (
        <div className="space-y-2 min-w-[240px]">
            {installments.map((inst) => (
                <div key={inst.id} className="rounded border bg-gray-50 p-2 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-700">#{inst.installmentNumber}</span>
                        <StatusBadge status={inst.status} />
                        {inst.status !== "PAID" && (
                            <button
                                className="h-6 text-xs px-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                onClick={() => onPay(inst)}
                            >
                                Pay
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                        <div className="text-center">
                            <p className="text-gray-400">Due</p>
                            <p className="font-medium">₹{fmt(inst.dueAmount)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400">Paid</p>
                            <p className="font-medium text-green-600">₹{fmt(inst.paidAmount)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400">Pending</p>
                            <p className={`font-medium ${Number(inst.pendingAmount) > 0 ? "text-red-600" : "text-green-600"}`}>
                                ₹{fmt(inst.pendingAmount)}
                            </p>
                        </div>
                    </div>
                    <div className="text-gray-400 text-[11px]">Due: {fmtDate(inst.dueDate)}</div>
                    {inst.payments?.length > 0 && (
                        <details className="mt-1">
                            <summary className="cursor-pointer text-[11px] text-gray-400 hover:text-gray-600">
                                {inst.payments.length} payment{inst.payments.length > 1 ? "s" : ""}
                            </summary>
                            <div className="mt-1 space-y-1 pl-2 border-l-2 border-gray-200">
                                {inst.payments.map((p) => (
                                    <div key={p.id} className="flex justify-between text-[11px]">
                                        <span className="text-gray-400">{fmtDate(p.paymentDate)}</span>
                                        <span className="text-green-600 font-medium">+₹{fmt(p.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// TABLE HEADERS
// ─────────────────────────────────────────────────────────────

const HEADERS = [
    "✓", "Index", "Date", "User", "Category", "Particular",
    "Amount", "GST Amt", "TDS Amount", "Total (+GST)",
    "Paid", "Pending", "Bill Type", "Status", "Branch",
];

// ─────────────────────────────────────────────────────────────
// MAIN TABLE
// ─────────────────────────────────────────────────────────────

export default function TransactionTable({ expenses, onPayInstallment, onViewInstallments, }) {
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-[#4A90D9] text-white">
                        {HEADERS.map((h) => (
                            <th
                                key={h}
                                className="px-3 py-3 text-center font-semibold border-r border-[#3a7fc1] last:border-r-0 whitespace-nowrap"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.length === 0 && (
                        <tr>
                            <td colSpan={HEADERS.length} className="text-center py-12 text-gray-400">
                                No transactions found.
                            </td>
                        </tr>
                    )}
                    {sorted.map((exp, i) => (
                        <tr
                            key={exp.id}
                            className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors"
                        >
                            {/* Checkmark */}
                            <td className="px-3 py-3 text-center border-r border-gray-100">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                            </td>

                            {/* Index */}
                            <td className="px-3 py-3 text-center text-gray-500 border-r border-gray-100">
                                {i + 1}
                            </td>

                            {/* Date */}
                            <td className="px-3 py-3 text-center whitespace-nowrap border-r border-gray-100">
                                {fmtDate(exp.date)}
                            </td>

                            {/* User (clickable link style) */}
                            <td className="px-3 py-3 border-r border-gray-100 whitespace-nowrap">
                                <span className="text-[#4A90D9] font-medium">
                                    {exp.contact?.name || "—"}
                                </span>
                            </td>

                            {/* Category */}
                            <td className="px-3 py-3 border-r border-gray-100 whitespace-nowrap">
                                {exp.category?.name || "—"}
                            </td>

                            {/* Particular */}
                            <td className="px-3 py-3 border-r border-gray-100 max-w-[100px] truncate">
                                {exp.particular || "—"}
                            </td>

                            {/* Amount */}
                            <td className="px-3 py-3 text-center border-r border-gray-100">
                                ₹{fmt(exp.amount)}
                            </td>

                            {/* GST Amt */}
                            <td className="px-3 py-3 text-center border-r border-gray-100">
                                ₹{fmt(exp.gstAmount)}
                            </td>

                            {/* TDS */}
                            <td className="px-3 py-3 text-center border-r border-gray-100">
                                ₹{fmt(exp.tdsAmount)}
                            </td>

                            {/* Total */}
                            <td className="px-3 py-3 text-center font-semibold border-r border-gray-100">
                                ₹{fmt(exp.total)}
                            </td>

                            {/* Paid */}
                            <td className="px-3 py-3 text-center text-green-600 font-medium border-r border-gray-100">
                                ₹{fmt(exp.paid)}
                            </td>

                            {/* Pending */}
                            <td className="px-3 py-3 text-center border-r border-gray-100">
                                <span className={Number(exp.pending) > 0 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                                    ₹{fmt(exp.pending)}
                                </span>
                            </td>

                            {/* Bill Type / Payment Type */}
                            <td className="px-3 py-3 text-center border-r border-gray-100 whitespace-nowrap">
                                {exp.paymentType === "INSTALLMENT" ? (
                                    <InstallmentBadge
                                        onClick={() => onViewInstallments(exp)}
                                    />
                                ) : (
                                    exp.paymentMethod || "-"
                                )}
                            </td>
                            {/* Status */}
                            <td className="px-3 py-3 text-center border-r border-gray-100 whitespace-nowrap">
                                <StatusBadge status={exp.paymentStatus} />
                            </td>
                            {/* Branch */}
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                <span className="bg-blue-100 text-[#4A90D9] text-[10px] font-semibold px-2 py-0.5 rounded">
                                    {exp.branchName || "Pune Bro..."}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}