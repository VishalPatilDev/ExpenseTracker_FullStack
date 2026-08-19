import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IndianRupee } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (v) =>
    Number(v ?? 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        COMPLETE: "bg-emerald-100 text-emerald-700 border-emerald-200",
        PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
        PARTIAL: "bg-amber-100  text-amber-700  border-amber-200",
        PENDING: "bg-red-100    text-red-700    border-red-200",
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? "bg-slate-100 text-slate-700"}`}>
            {status}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTALLMENT DETAIL CELL
// ─────────────────────────────────────────────────────────────────────────────

const InstallmentCell = ({ installments = [], onPay }) => {
    if (!installments.length) {
        return <span className="text-xs text-muted-foreground">Not scheduled</span>;
    }

    return (
        <div className="space-y-2 min-w-[260px]">
            {installments.map((inst) => (
                <div
                    key={inst.id}
                    className="rounded-lg border bg-slate-50 p-2.5 text-xs space-y-1.5"
                >
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-700">
                            #{inst.installmentNumber}
                        </span>
                        <StatusBadge status={inst.status} />
                        {inst.status !== "PAID" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2 border-slate-300 hover:bg-slate-100"
                                onClick={() => onPay(inst)}
                            >
                                Pay
                            </Button>
                        )}
                    </div>

                    {/* Amount rows */}
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                        <div className="text-center">
                            <p className="text-muted-foreground">Due</p>
                            <p className="font-medium">₹{fmt(inst.dueAmount)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-muted-foreground">Paid</p>
                            <p className="font-medium text-emerald-600">₹{fmt(inst.paidAmount)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-muted-foreground">Pending</p>
                            <p className={`font-medium ${Number(inst.pendingAmount) > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                ₹{fmt(inst.pendingAmount)}
                            </p>
                        </div>
                    </div>

                    <div className="text-muted-foreground text-[11px]">
                        Due: {fmtDate(inst.dueDate)}
                    </div>

                    {/* Payment history (collapsed if empty) */}
                    {inst.payments?.length > 0 && (
                        <details className="mt-1">
                            <summary className="cursor-pointer text-[11px] text-slate-500 hover:text-slate-700">
                                {inst.payments.length} payment{inst.payments.length > 1 ? "s" : ""}
                            </summary>
                            <div className="mt-1 space-y-1 pl-2 border-l-2 border-slate-200">
                                {inst.payments.map((p) => (
                                    <div key={p.id} className="flex justify-between text-[11px]">
                                        <span className="text-muted-foreground">{fmtDate(p.paymentDate)}</span>
                                        <span className="text-emerald-600 font-medium">+₹{fmt(p.amount)}</span>
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TABLE
// ─────────────────────────────────────────────────────────────────────────────

export default function TransactionTable({ expenses, onPayInstallment }) {
    const sortedExpenses = [...expenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    return (
        <div className="rounded-xl border overflow-x-auto shadow-sm">
            <Table>
                <TableHeader className="bg-slate-100">
                    <TableRow>
                        {[
                            "#", "Date", "Type", "Contact", "Category",
                            "Particular", "Amount", "GST%", "GST Amt", "TDS%",
                            "Total", "Paid", "Pending", "Payment Type",
                            "Payment Method",
                            "Status", "Installments", "Remark",
                        ].map((h) => (
                            <TableHead key={h} className="border-r last:border-r-0 text-xs font-semibold text-slate-600 whitespace-nowrap">
                                {h}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {sortedExpenses.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={18} className="text-center py-12 text-muted-foreground text-sm">
                                No transactions found.
                            </TableCell>
                        </TableRow>
                    )}

                    {sortedExpenses.map((exp, i) => (
                        <TableRow key={exp.id} className="hover:bg-slate-50/50 transition-colors">

                            <TableCell className="border-r text-xs text-muted-foreground font-medium">
                                {i + 1}
                            </TableCell>

                            <TableCell className="border-r text-xs whitespace-nowrap">
                                {fmtDate(exp.date)}
                            </TableCell>

                            <TableCell className="border-r">
                                <span className={`text-xs font-semibold ${exp.type === "INCOME" ? "text-emerald-600" : "text-red-500"}`}>
                                    {exp.type}
                                </span>
                            </TableCell>

                            <TableCell className="border-r text-xs whitespace-nowrap">
                                {exp.contact?.name || "—"}
                            </TableCell>

                            <TableCell className="border-r text-xs whitespace-nowrap">
                                {exp.category?.name || "—"}
                            </TableCell>

                            <TableCell className="border-r text-xs max-w-[120px] truncate">
                                {exp.particular || "—"}
                            </TableCell>

                            <TableCell className="border-r text-xs text-right">₹{fmt(exp.amount)}</TableCell>

                            <TableCell className="border-r text-xs text-right">
                                {Number(exp.gstPercentage ?? 0).toFixed(1)}%
                            </TableCell>

                            <TableCell className="border-r text-xs text-right">₹{fmt(exp.gstAmount)}</TableCell>

                            <TableCell className="border-r text-xs text-right">
                                {Number(exp.tdsPercentage ?? 0).toFixed(1)}%
                            </TableCell>

                            <TableCell className="border-r text-xs text-right font-semibold">
                                ₹{fmt(exp.total)}
                            </TableCell>

                            <TableCell className="border-r text-xs text-right text-emerald-600 font-medium">
                                ₹{fmt(exp.paid)}
                            </TableCell>

                            <TableCell className="border-r text-xs text-right font-medium">
                                <span className={Number(exp.pending) > 0 ? "text-red-500" : "text-emerald-600"}>
                                    ₹{fmt(exp.pending)}
                                </span>
                            </TableCell>

                            <TableCell className="border-r text-xs whitespace-nowrap">
                                {exp.paymentType === "ONE_TIME" ? "One Time" : "Installment"}
                            </TableCell>
                            <TableCell className="border-r text-xs whitespace-nowrap">
                                {exp.paymentMethod
                                    ? exp.paymentMethod.replaceAll("_", " ")
                                    : "—"}
                            </TableCell>


                            <TableCell className="border-r">
                                <StatusBadge status={exp.paymentStatus} />
                            </TableCell>

                            <TableCell className="border-r">
                                {exp.paymentType === "INSTALLMENT" ? (
                                    <InstallmentCell
                                        installments={exp.installments || []}
                                        onPay={(installment) => onPayInstallment(exp, installment)}
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                )}
                            </TableCell>

                            <TableCell className="text-xs max-w-[140px] truncate text-muted-foreground">
                                {exp.remark || "—"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}