
'use client';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function MultiSelectPopover({ title, options, selectedValues, onChange }: {
    title: string;
    options: { value: string; label: string }[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-auto justify-between h-auto"
                >
                    <div className="flex gap-1 flex-wrap">
                        {selectedValues.length > 0 ? (
                            <>
                                {Array.from(new Set(selectedValues.filter(v => v !== null && v !== undefined))).slice(0, 3).map(value => {
                                    const stringValue = String(value);
                                    const option = options.find(o => String(o.class_id) === stringValue);
                                    return <Badge variant="secondary" key={stringValue}>{option?.label || stringValue}</Badge>;
                                })}
                                {selectedValues.length > 3 && (
                                    <Badge variant="outline" key="more-badge">
                                        +{selectedValues.length - 3} more
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <span key="select-placeholder">Select {title}...</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0">
                <Command>
                    <CommandInput placeholder={`Search ${title}...`} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {[...new Map(options.filter(o => o?.value).map(o => [o.value, o])).values()].map(option => {
                                const optionValue = String(option.class_id);
                                const isSelected = selectedValues.some(v => String(v) === optionValue);
                                return (
                                    <CommandItem
                                        key={optionValue}
                                        onSelect={() => {
                                            const newSelection = isSelected
                                                ? selectedValues.filter(v => String(v) !== optionValue)
                                                : [...selectedValues, optionValue];
                                            onChange(newSelection);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                        {option.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
