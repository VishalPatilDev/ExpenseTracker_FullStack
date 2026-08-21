import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function SearchableDropdown({
    value,
    onChange,
    options,
    placeholder = "Select...",
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);

    const selected = options.find(
        (option) => String(option.value) === String(value)
    );

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const handleSelect = (option) => {
        onChange(String(option.value));
        setSearch("");
        setOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full"
        >
            {/* INPUT */}
            <div className="relative">
                <input
                    type="text"
                    value={open ? search : selected?.label || ""}
                    placeholder={placeholder}
                    onFocus={() => {
                        setOpen(true);
                        setSearch("");
                    }}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setOpen(true);
                    }}
                    className="h-10 w-full rounded-md border bg-white px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />

                <ChevronDown
                    className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </div>

            {/* DROPDOWN */}
            {open && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-md">

                    {filteredOptions.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            No results found.
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                type="button"
                                key={String(option.value)}
                                onClick={() => handleSelect(option)}
                                className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-slate-100"
                            >
                                <Check
                                    className={`mr-2 h-4 w-4 ${
                                        String(option.value) ===
                                        String(value)
                                            ? "opacity-100"
                                            : "opacity-0"
                                    }`}
                                />

                                {option.label}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}