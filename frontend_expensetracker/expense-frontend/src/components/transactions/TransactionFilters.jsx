import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TransactionFilters({
    filters,
    categories,
    contacts,
    onChange,
    onClear,
}) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">

            {/* TYPE */}
            <Select
                value={filters.type || undefined}
                onValueChange={(value) => onChange("type", value)}
            >
                <SelectTrigger className="h-10 w-full bg-white px-3 text-sm">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>

                <SelectContent className="z-50">
                    <SelectItem value="INCOME" className="cursor-pointer">
                        Income
                    </SelectItem>

                    <SelectItem value="EXPENSE" className="cursor-pointer">
                        Expense
                    </SelectItem>
                </SelectContent>
            </Select>


            {/* CATEGORY */}
            <Select
                value={filters.category || undefined}
                onValueChange={(value) =>
                    onChange("category", value)
                }
            >
                <SelectTrigger className="h-10 w-full bg-white px-3 text-sm">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>

                <SelectContent className="z-50 max-h-60">
                    {categories.map((category) => (
                        <SelectItem
                            key={category.id}
                            value={String(category.id)}
                            className="cursor-pointer"
                        >
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>


            {/* PAYMENT TYPE */}
            <Select
                value={filters.paymentType || undefined}
                onValueChange={(value) =>
                    onChange("paymentType", value)
                }
            >
                <SelectTrigger className="h-10 w-full bg-white px-3 text-sm">
                    <SelectValue placeholder="Payment Type" />
                </SelectTrigger>

                <SelectContent className="z-50">
                    <SelectItem
                        value="ONE_TIME"
                        className="cursor-pointer"
                    >
                        One Time
                    </SelectItem>

                    <SelectItem
                        value="INSTALLMENT"
                        className="cursor-pointer"
                    >
                        Installment
                    </SelectItem>
                </SelectContent>
            </Select>


            {/* PAYMENT STATUS */}
            <Select
                value={filters.paymentStatus || undefined}
                onValueChange={(value) =>
                    onChange("paymentStatus", value)
                }
            >
                <SelectTrigger className="h-10 w-full bg-white px-3 text-sm">
                    <SelectValue placeholder="Payment Status" />
                </SelectTrigger>

                <SelectContent className="z-50">
                    {["PENDING", "PARTIAL", "COMPLETE"].map(
                        (status) => (
                            <SelectItem
                                key={status}
                                value={status}
                                className="cursor-pointer"
                            >
                                {status}
                            </SelectItem>
                        )
                    )}
                </SelectContent>
            </Select>


            {/* CONTACT */}
            <Select
                value={filters.contact || undefined}
                onValueChange={(value) =>
                    onChange("contact", value)
                }
            >
                <SelectTrigger className="h-10 w-full bg-white px-3 text-sm">
                    <SelectValue placeholder="Contact" />
                </SelectTrigger>

                <SelectContent className="z-50 max-h-60">
                    {contacts.map((contact) => (
                        <SelectItem
                            key={contact.id}
                            value={String(contact.id)}
                            className="cursor-pointer"
                        >
                            {contact.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>


            {/* CLEAR */}
            <Button
                type="button"
                variant="outline"
                className="h-10 w-full whitespace-nowrap"
                onClick={onClear}
            >
                Clear Filters
            </Button>

        </div>
    );
}