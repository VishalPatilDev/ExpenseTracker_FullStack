import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function TransactionForm({
    form,
    contacts,
    categories,
    banks,
    hasGst,
    hasTds,
    submitting,
    onChange,
    onGstChange,
    onTdsChange,
    onPaymentTypeChange,
    onPaymentMethodChange,
    onSubmit,
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-2">

            {/* BASIC INFORMATION */}

            <div className="grid gap-4 md:grid-cols-4">

                <Field label="Type">
                    <Select
                        value={form.type}
                        onValueChange={(value) =>
                            onChange("type", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="EXPENSE">
                                Expense
                            </SelectItem>

                            <SelectItem value="INCOME">
                                Income
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="User / Contact">
                    <Select
                        value={form.contactId}
                        onValueChange={(value) =>
                            onChange("contactId", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select contact" />
                        </SelectTrigger>

                        <SelectContent>
                            {contacts.map((contact) => (
                                <SelectItem
                                    key={contact.id}
                                    value={String(contact.id)}
                                >
                                    {contact.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Date">
                    <Input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                            onChange("date", e.target.value)
                        }
                    />
                </Field>

                <Field label="Category">
                    <Select
                        value={form.categoryId}
                        onValueChange={(value) =>
                            onChange("categoryId", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>

                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Bank">
                    <Select
                        value={form.bankId}
                        onValueChange={(value) =>
                            onChange("bankId", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select bank" />
                        </SelectTrigger>

                        <SelectContent>
                            {banks.map((bank) => (
                                <SelectItem
                                    key={bank.id}
                                    value={String(bank.id)}
                                >
                                    {bank.name}
                                    {bank.branch
                                        ? ` - ${bank.branch}`
                                        : ""}
                                    {bank.accountNumber
                                        ? ` (${bank.accountNumber})`
                                        : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Particular">
                    <Input
                        placeholder="Enter particular"
                        value={form.particular}
                        onChange={(e) =>
                            onChange(
                                "particular",
                                e.target.value
                            )
                        }
                    />
                </Field>

                <Field label="Amount">
                    <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Enter amount"
                        value={form.amount}
                        onChange={(e) =>
                            onChange(
                                "amount",
                                e.target.value
                            )
                        }
                    />
                </Field>
            </div>

            {/* TAX */}

            <div className="grid gap-6 md:grid-cols-2">

                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={hasGst}
                            onCheckedChange={onGstChange}
                        />

                        <Label>Apply GST</Label>
                    </div>

                    {hasGst && (
                        <div className="grid gap-4 md:grid-cols-2">

                            <Field label="GST %">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={form.gstPercentage}
                                    onChange={(e) =>
                                        onChange(
                                            "gstPercentage",
                                            e.target.value
                                        )
                                    }
                                />
                            </Field>

                            <Field label="GST Number">
                                <Input
                                    value={form.gstNumber}
                                    placeholder="GST number"
                                    onChange={(e) =>
                                        onChange(
                                            "gstNumber",
                                            e.target.value
                                        )
                                    }
                                />
                            </Field>

                        </div>
                    )}
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={hasTds}
                            onCheckedChange={onTdsChange}
                        />

                        <Label>Apply TDS</Label>
                    </div>

                    {hasTds && (
                        <Field label="TDS %">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={form.tdsPercentage}
                                onChange={(e) =>
                                    onChange(
                                        "tdsPercentage",
                                        e.target.value
                                    )
                                }
                            />
                        </Field>
                    )}
                </div>

            </div>

            {/* TOTAL + PAYMENT */}

            <div className="grid gap-4 md:grid-cols-2">

                <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                        Total Amount
                    </p>

                    <p className="text-2xl font-bold">
                        ₹
                        {Number(
                            form.total
                        ).toLocaleString("en-IN")}
                    </p>
                </div>
                <Field label="Payment Method">
                    <Select
                        value={form.paymentMethod}
                        onValueChange={onPaymentMethodChange}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="CASH">
                                CASH
                            </SelectItem>

                            <SelectItem value="UPI">
                                UPI
                            </SelectItem>
                            <SelectItem value="BANK_TRANSFER">
                                BANK TRANSFER
                            </SelectItem>
                            <SelectItem value="CHEQUE">
                                CHEQUE
                            </SelectItem>
                            <SelectItem value="CREDIT_CARD">
                                CREDIT_CARD
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Payment Type">
                    <Select
                        value={form.paymentType}
                        onValueChange={onPaymentTypeChange}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="ONE_TIME">
                                One Time Payment
                            </SelectItem>

                            <SelectItem value="INSTALLMENT">
                                Pay in Installments
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

            </div>

            {/* REMARK */}

            <Field label="Remark">
                <Textarea
                    rows={3}
                    placeholder="Add an optional remark..."
                    value={form.remark}
                    onChange={(e) =>
                        onChange(
                            "remark",
                            e.target.value
                        )
                    }
                />
            </Field>

            {/* SUBMIT */}

            <Button
                type="submit"
                disabled={submitting}
                className="w-full"
            >
                {submitting
                    ? "Saving..."
                    : "Save Transaction"}
            </Button>

        </form>
    );
}

function Field({ label, children }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}