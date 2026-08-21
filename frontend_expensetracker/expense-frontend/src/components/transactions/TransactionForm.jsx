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
import SearchableDropdown from "../filters/SearchableDropdown";

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

            <div className="grid gap-4 md:grid-cols-5">

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

                        <SelectContent className='bg-white'>
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
                    {/* <Select
                        value={form.contactId}
                        onValueChange={(value) =>
                            onChange("contactId", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select contact" />
                        </SelectTrigger>

                        <SelectContent className='bg-white'>
                            {contacts.map((contact) => (
                                <SelectItem
                                    key={contact.id}
                                    value={String(contact.id)}
                                >
                                    {contact.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select> */}
                    <SearchableDropdown
                        value={form.contactId}
                        onChange={(value) => onChange("contactId", value)}
                        placeholder="Select contact"
                        options={contacts.map((contact) => ({
                            value: contact.id,
                            label: contact.name,
                        }))}
                    />
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
                    {/* <Select
                        value={form.categoryId}
                        onValueChange={(value) =>
                            onChange("categoryId", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>

                        <SelectContent className='bg-white'>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select> */}
                    <SearchableDropdown
                        value={form.categoryId}
                        onChange={(value) => onChange("categoryId", value)}
                        placeholder="Select Category"
                        options={categories.map((category) => ({
                            value: category.id,
                            label: category.name,
                        }))}
                    />
                </Field>

                <Field label="Bank">
                    {/* <Select
                        value={form.bankId}
                        onValueChange={(value) =>
                            onChange("bankId", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select bank" />
                        </SelectTrigger>

                        <SelectContent className='bg-white'>
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
                    </Select> */}
                    <SearchableDropdown
                        value={form.bankId}
                        onChange={(value) => onChange("bankId", value)}
                        placeholder="Select bank"
                        options={banks.map((bank) => ({
                            value: bank.id,
                            label: `${bank.name}${
            bank.branch ? ` - ${bank.branch}` : ""
        }${
            bank.accountNumber ? ` (${bank.accountNumber})` : ""
        }`,
                        }))}
                    />
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

            {/* TAX */}

            {/* <div className="grid gap-3 md:grid-cols-3">

                
            </div> */}

            {/* TOTAL + PAYMENT */}

            <div className="grid gap-4 md:grid-cols-3 items-center justify-center">

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

                        <SelectContent className='bg-white'>
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

                        <SelectContent className='bg-white'>
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
                className="w-full bg-blue-100 hover:bg-blue-300"
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