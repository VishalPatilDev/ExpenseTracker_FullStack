// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";

// import {
//     Command,
//     CommandEmpty,
//     CommandGroup,
//     CommandInput,
//     CommandItem,
//     CommandList,
// } from "@/components/ui/command";

// import { Button } from "@/components/ui/button";
// import { Check, ChevronsUpDown } from "lucide-react";

// export default function SearchableSelect({
//     value,
//     onChange,
//     options,
//     placeholder = "Select...",
//     searchPlaceholder = "Search...",
// }) {
//     const selected = options.find(
//         (option) => String(option.value) === String(value)
//     );

//     return (
//         <Popover>
//             <PopoverTrigger asChild>
//                 <Button
//                     variant="outline"
//                     role="combobox"
//                     className="h-10 w-full justify-between bg-white px-3 text-sm font-normal"
//                 >
//                     <span className="truncate">
//                         {selected?.label || placeholder}
//                     </span>

//                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                 </Button>
//             </PopoverTrigger>

//             <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white">
//                 <Command>
//                     <CommandInput placeholder={searchPlaceholder} />

//                     <CommandList>
//                         <CommandEmpty>
//                             No results found.
//                         </CommandEmpty>

//                         <CommandGroup>
//                             {options.map((option) => (
//                                 <CommandItem
//                                     key={String(option.value)}
//                                     value={option.label}
//                                     onSelect={() => {
//                                         onChange(
//                                             String(option.value)
//                                         );
//                                     }}
//                                 >
//                                     <Check
//                                         className={`mr-2 h-4 w-4 ${
//                                             String(option.value) ===
//                                             String(value)
//                                                 ? "opacity-100"
//                                                 : "opacity-0"
//                                         }`}
//                                     />

//                                     {option.label}
//                                 </CommandItem>
//                             ))}
//                         </CommandGroup>
//                     </CommandList>
//                 </Command>
//             </PopoverContent>
//         </Popover>
//     );
// }