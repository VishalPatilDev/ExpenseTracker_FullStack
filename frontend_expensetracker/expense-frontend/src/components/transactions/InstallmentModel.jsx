import { useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, IndianRupee } from "lucide-react";

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

const addDays = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
    ].join("-");
};

/** Convert a rupee value to integer paise to avoid floating-point errors. */
const toPaise = (v) => Math.round(Number(v || 0) * 100);

/** Format a paise value back to rupee string with IN locale. */
const fromPaise = (p) => (p / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 });

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function InstallmentModal({
    open,
    total,              // Number (rupees)
    numberOfInstallments,
    setNumberOfInstallments,
    installments = [],
    onInstallmentChange,
    onConfirm,
    onCancel,
}) {
    // Use integer paise for all comparisons
    const totalPaise = toPaise(total);

    const scheduledPaise = useMemo(
        () => installments.reduce((s, i) => s + toPaise(i.dueAmount), 0),
        [installments]
    );

    const remainingPaise = totalPaise - scheduledPaise;
    const isBalanced     = remainingPaise === 0;
    const isOverAllocated = remainingPaise < 0;

    // ── Generate equal-split installments ─────────────────────────────────────
    const generateInstallments = (count) => {
        const n = Number(count);
        if (!n || n <= 0) { onInstallmentChange("replace", []); return; }

        const basePaise   = Math.floor(totalPaise / n);
        const remainder   = totalPaise - basePaise * n;
        const today       = getTodayDate();

        const newList = Array.from({ length: n }, (_, i) => {
            const paise = i === n - 1 ? basePaise + remainder : basePaise;
            return {
                installmentNumber: i + 1,
                dueAmount: paise > 0 ? (paise / 100).toFixed(2) : "",
                dueDate: i === 0 ? today : addDays(today, i * 30),
            };
        });

        onInstallmentChange("replace", newList);
    };

    // ── Handle count change ───────────────────────────────────────────────────
    const handleCountChange = (e) => {
        const v = Number(e.target.value);
        setNumberOfInstallments(v);
        generateInstallments(v);
    };

    // ── Handle amount change with smart redistribution ────────────────────────
    const handleAmountChange = (index, rawValue) => {
        const newPaise    = toPaise(rawValue);
        const usedBefore  = installments.slice(0, index).reduce((s, i) => s + toPaise(i.dueAmount), 0);
        const maxPaise    = totalPaise - usedBefore;

        if (newPaise > maxPaise) {
            alert(`Maximum allowed: ₹${fromPaise(maxPaise)}`);
            return;
        }

        const updated = installments.map((item, i) => ({ ...item }));
        updated[index].dueAmount = rawValue;

        // Redistribute remaining among subsequent installments
        const leftPaise   = totalPaise - usedBefore - newPaise;
        const afterCount  = updated.length - index - 1;

        if (afterCount > 0) {
            const splitPaise = Math.floor(leftPaise / afterCount);
            let distributed  = 0;

            for (let i = index + 1; i < updated.length; i++) {
                const isLast  = i === updated.length - 1;
                const amt     = isLast ? leftPaise - distributed : splitPaise;
                updated[i].dueAmount = amt > 0 ? (amt / 100).toFixed(2) : "";
                distributed += amt;
            }
        }

        onInstallmentChange("replace", updated);
    };

    // ── Handle date change ────────────────────────────────────────────────────
    const handleDateChange = (index, value) => {
        if (index > 0) {
            const prevDate = installments[index - 1]?.dueDate;
            if (prevDate && value <= prevDate) {
                alert(`Installment ${index + 1} date must be after installment ${index}.`);
                return;
            }
        }

        const updated = installments.map((item) => ({ ...item }));
        updated[index].dueDate = value;

        // Push subsequent dates forward if they're no longer after their predecessor
        for (let i = index + 1; i < updated.length; i++) {
            if (!updated[i].dueDate || updated[i].dueDate <= updated[i - 1].dueDate) {
                updated[i].dueDate = addDays(updated[i - 1].dueDate, 1);
            }
        }

        onInstallmentChange("replace", updated);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Set Installment Schedule
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Plan when each installment is due. Payments are recorded separately.
                    </DialogDescription>
                </DialogHeader>

                {/* ── Summary card ─────────────────────────────────────────── */}
                <div className="rounded-xl border bg-slate-50 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Expense Total</span>
                        <span className="font-bold text-slate-800 flex items-center gap-0.5">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {Number(total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Scheduled</span>
                        <span className="font-semibold text-slate-700">
                            ₹{fromPaise(scheduledPaise)}
                        </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                        <span className="text-muted-foreground">Remaining to allocate</span>
                        <span className={`font-bold flex items-center gap-1.5 ${
                            isBalanced
                                ? "text-emerald-600"
                                : isOverAllocated
                                    ? "text-red-600"
                                    : "text-amber-600"
                        }`}>
                            {isBalanced
                                ? <><CheckCircle2 className="w-4 h-4" /> ₹0.00</>
                                : <><AlertCircle className="w-4 h-4" /> ₹{fromPaise(Math.abs(remainingPaise))}{isOverAllocated ? " over" : ""}</>
                            }
                        </span>
                    </div>
                    {isBalanced && (
                        <p className="text-xs text-emerald-600 font-medium">
                            ✓ Schedule is balanced — ready to confirm
                        </p>
                    )}
                </div>

                {/* ── Count input ──────────────────────────────────────────── */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Number of Installments</label>
                    <Input
                        type="number"
                        min="1"
                        max="60"
                        value={numberOfInstallments}
                        onChange={handleCountChange}
                        className="max-w-[140px]"
                    />
                </div>

                {/* ── Installment rows ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                    {installments.map((inst, i) => {
                        const instPaise   = toPaise(inst.dueAmount);
                        const pct         = totalPaise > 0 ? Math.round((instPaise / totalPaise) * 100) : 0;

                        return (
                            <div
                                key={inst.installmentNumber}
                                className="rounded-xl border bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-semibold">
                                            {inst.installmentNumber}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-700">
                                            Installment #{inst.installmentNumber}
                                        </span>
                                    </div>
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                        {pct}% of total
                                    </Badge>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-600">Due Amount (₹)</label>
                                        <Input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={inst.dueAmount}
                                            onChange={(e) => handleAmountChange(i, e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-600">Due Date</label>
                                        <Input
                                            type="date"
                                            value={inst.dueDate}
                                            min={
                                                i > 0
                                                    ? addDays(installments[i - 1]?.dueDate || getTodayDate(), 1)
                                                    : getTodayDate()
                                            }
                                            onChange={(e) => handleDateChange(i, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Actions ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                        Payments against each installment are recorded separately after saving.
                    </p>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={!isBalanced || installments.length === 0}
                            className={isBalanced ? "bg-slate-800 hover:bg-slate-700" : ""}
                        >
                            Confirm Schedule
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}