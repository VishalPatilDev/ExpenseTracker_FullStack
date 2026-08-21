import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
// import SearchableSelect from "../filters/SearchableSelect";
import SearchableDropdown from "../filters/SearchableDropdown";


export default function TransactionFilters({
    filters,
    categories,
    contacts,
    onChange,
    onClear,
}) {

    const categoryOptions = [
        ...categories.map((category) => ({
            value: category.id,
            label: category.name,
        })),
    ];

    const contactOptions = [
        ...contacts.map((contact) => ({
            value: contact.id,
            label: contact.name,
        })),
    ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">

            {/* TYPE */}
            <Select
                value={filters.type || ""}
                onValueChange={(value) => onChange("type", value)}
            >
                <SelectTrigger className="h-10 w-full bg-white px-3 text-sm">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>

                <SelectContent className="z-50 bg-white ">
                    <SelectItem value="All" className="cursor-pointer">
                        All
                    </SelectItem>
                    <SelectItem value="INCOME" className="cursor-pointer">
                        Income
                    </SelectItem>
                    <SelectItem value="EXPENSE" className="cursor-pointer">
                        Expense
                    </SelectItem>
                </SelectContent>
            </Select>


            {/* CATEGORY
            <Select
                value={filters.category || ""}
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
            </Select> */}


            {/* CATEGORY - SEARCHABLE */}
            {/* <SearchableSelect 
                value={filters.category}
                onChange={(value) =>
                    onChange("category", value)
                }
                options={categoryOptions}
                placeholder="All Categories"
                searchPlaceholder="Search category..."
            /> */}

            <SearchableDropdown
                value={filters.category}
                onChange={(value) => onChange("category", value)}
                options={categoryOptions}
                placeholder="All Categories"
            />



            {/* PAYMENT TYPE */}
            <Select
                value={filters.paymentType || ""}
                onValueChange={(value) =>
                    onChange("paymentType", value)
                }
            >
                <SelectTrigger className="h-10 w-full bg-white px-3 text-sm">
                    <SelectValue placeholder="Payment Type" />
                </SelectTrigger>

                <SelectContent className="z-50 bg-white ">
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
                value={filters.paymentStatus || ""}
                onValueChange={(value) =>
                    onChange("paymentStatus", value)
                }
            >
                <SelectTrigger className="h-10 w-full bg-white px-3 text-sm">
                    <SelectValue placeholder="Payment Status" />
                </SelectTrigger>

                <SelectContent className="z-50 bg-white ">
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
            {/* <Select
                value={filters.contact || ""}
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
            </Select> */}


            {/* CONTACT - SEARCHABLE */}
            {/* <SearchableSelect
                value={filters.contact}
                onChange={(value) =>
                    onChange("contact", value)
                }
                options={contactOptions}
                placeholder="All Contacts"
                searchPlaceholder="Search contact..."
            /> */}


            {/*Searchable Dropdown*/}
            <SearchableDropdown
                value={filters.contact}
                onChange={(value) => onChange("contact", value)}
                options={contactOptions}
                placeholder="All Contacts"
            />


            {/* CLEAR */}
            <Button
                type="button"
                variant="outline"
                className="h-10 w-full whitespace-nowrap hover:bg-gray-200"
                onClick={onClear}
            >
                Clear Filters
            </Button>

        </div>
    );
}