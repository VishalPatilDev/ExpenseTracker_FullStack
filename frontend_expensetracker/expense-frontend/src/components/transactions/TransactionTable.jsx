// import { Button } from "@/components/ui/button";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";

// const formatAmount = (amount) =>
//     Number(amount ?? 0).toLocaleString("en-IN");

// const formatDate = (date) =>
//     date
//         ? new Date(date).toLocaleDateString("en-IN")
//         : "-";

// export default function TransactionTable({
//     expenses,
//     onAddPayment,
// }) {
//     return (
//         <div className="rounded-md border overflow-x-auto">

//             <Table className='border-gray-100'>

//                 <TableHeader className='bg-gray-200'>
//                     <TableRow >
//                         <TableHead className='border'>#</TableHead>
//                         <TableHead className='border'>ID</TableHead>
//                         <TableHead className='border'>Date</TableHead>
//                         <TableHead className='border'>Type</TableHead>
//                         <TableHead className='border'>Contact</TableHead>
//                         <TableHead className='border'>Category</TableHead>
//                         <TableHead className='border'>Bank</TableHead>
//                         <TableHead className='border'>Particular</TableHead>
//                         <TableHead className='border'>Amount</TableHead>
//                         <TableHead className='border'>GST %</TableHead>
//                         <TableHead className='border'>GST Amount</TableHead>
//                         <TableHead className='border'>GST Number</TableHead>
//                         <TableHead className='border'>TDS %</TableHead>
//                         <TableHead className='border'>Total</TableHead>
//                         <TableHead className='border'>Paid</TableHead>
//                         <TableHead className='border'>Pending</TableHead>
//                         <TableHead className='border'>Payment Type</TableHead>
//                         <TableHead className="border">
//                             Installments
//                         </TableHead>
//                         <TableHead className='border'>Status</TableHead>
//                         <TableHead className='border'>Remark</TableHead>
//                         <TableHead className='border'>Action</TableHead>
//                     </TableRow>
//                 </TableHeader>

//                 <TableBody >
//                     {expenses.map((expense, index) => (
//                         <TableRow key={expense.id}>

//                             <TableCell className='border'>
//                                 {expense.index ?? index + 1}
//                             </TableCell>

//                             <TableCell className='border'>{expense.id}</TableCell>

//                             <TableCell className='border'>
//                                 {formatDate(expense.date)}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 <span
//                                     className={
//                                         expense.type === "INCOME"
//                                             ? "text-green-600"
//                                             : "text-red-600"
//                                     }
//                                 >
//                                     {expense.type}
//                                 </span>

//                             </TableCell>


//                             <TableCell className='border'>
//                                 {expense.contact?.name || "-"}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.category?.name || "-"}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.bank?.name || "-"}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.particular || "-"}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 ₹{formatAmount(expense.amount)}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.gstPercentage ?? 0}%
//                             </TableCell>

//                             <TableCell className='border'>
//                                 ₹{formatAmount(expense.gstAmount)}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.gstNumber || "-"}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.tdsPercentage ?? 0}%
//                             </TableCell>

//                             <TableCell className='border'>
//                                 ₹{formatAmount(expense.total)}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 ₹{formatAmount(expense.paid)}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 ₹{formatAmount(expense.pending)}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.paymentType === "ONE_TIME"
//                                     ? "One Time"
//                                     : "Installment"}
//                             </TableCell>
//                             <TableCell className="border">
//                                 {expense.paymentType === "INSTALLMENT" ? (
//                                     <div className="space-y-2 min-w-[220px]">
//                                         {expense.installments?.length ? (
//                                             expense.installments.map((installment) => (
//                                                 <div
//                                                     key={installment.id}
//                                                     className="rounded-md border bg-gray-50 p-2 text-xs"
//                                                 >
//                                                     <div className="flex justify-between">
//                                                         <span className="font-medium">
//                                                             #{installment.installmentNumber}
//                                                         </span>

//                                                         <span
//                                                             className={
//                                                                 installment.status === "PAID"
//                                                                     ? "text-green-600 font-medium"
//                                                                     : installment.status === "PARTIAL"
//                                                                         ? "text-orange-600 font-medium"
//                                                                         : "text-red-600 font-medium"
//                                                             }
//                                                         >
//                                                             {installment.status}
//                                                         </span>
//                                                     </div>

//                                                     <div className="flex justify-between">
//                                                         <span>Due</span>

//                                                         <span>
//                                                             ₹
//                                                             {formatAmount(
//                                                                 installment.dueAmount
//                                                             )}
//                                                         </span>
//                                                     </div>

//                                                     <div className="flex justify-between">
//                                                         <span>Date</span>

//                                                         <span>
//                                                             {formatDate(
//                                                                 installment.dueDate
//                                                             )}
//                                                         </span>
//                                                     </div>

//                                                     <div className="flex justify-between">
//                                                         <span>Pending</span>

//                                                         <span className="text-red-600">
//                                                             ₹
//                                                             {formatAmount(
//                                                                 installment.pendingAmount
//                                                             )}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <span className="text-muted-foreground">
//                                                 Not scheduled
//                                             </span>
//                                         )}
//                                     </div>
//                                 ) : (
//                                     "-"
//                                 )}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.paymentStatus || "-"}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.remark || "-"}
//                             </TableCell>

//                             <TableCell className='border'>
//                                 {expense.paymentType === "INSTALLMENT" &&
//                                     expense.paymentStatus !== "COMPLETE" && (
//                                         <Button
//                                             size="sm"
//                                             onClick={() =>
//                                                 onAddPayment(expense)
//                                             }
//                                         >
//                                             Installment
//                                         </Button>
//                                     )}
//                             </TableCell>

//                         </TableRow>
//                     ))}
//                 </TableBody>

//             </Table>
//         </div>
//     );
// }
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
        PAID:     "bg-emerald-100 text-emerald-700 border-emerald-200",
        PARTIAL:  "bg-amber-100  text-amber-700  border-amber-200",
        PENDING:  "bg-red-100    text-red-700    border-red-200",
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
                    {expenses.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={18} className="text-center py-12 text-muted-foreground text-sm">
                                No transactions found.
                            </TableCell>
                        </TableRow>
                    )}

                    {expenses.map((exp, i) => (
                        <TableRow key={exp.id} className="hover:bg-slate-50/50 transition-colors">

                            <TableCell className="border-r text-xs text-muted-foreground font-medium">
                                {exp.index ?? i + 1}
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