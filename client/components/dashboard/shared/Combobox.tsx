"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ComboboxProps<T> = {
  name?: string;
  options: T[];
  value: string | string[] | T | null;
  multiple?: boolean;
  placeholder?: string;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  onChange: (value: string | string[] | T | null) => void;
  onCreateOption?: (input: string) => void;
  emptyStateAction?: React.ReactNode | ((query: string) => React.ReactNode);
  disabled?: boolean;
};

export default function Combobox<T>({
  name,
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Select...",
  getLabel,
  getValue,
  onCreateOption,
  emptyStateAction,
  disabled = false,
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedValues = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []) as string[],
    [value]
  );

  const filtered = options.filter((item) =>
    getLabel(item).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceAbove > spaceBelow);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is inside the wrapper OR inside a dialog (portal)
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        !target.closest('[role="dialog"]') &&
        !target.closest('[data-state="open"]') // Extra safety for radix triggers/content
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: T) => {
    const val = getValue(item);

    if (multiple) {
      if (selectedValues.includes(val)) {
        onChange(selectedValues.filter((v) => v !== val));
      } else {
        onChange([...selectedValues, val]);
      }
    } else {
      onChange(val);
      setOpen(false);
    }

    setQuery("");
    setHighlightedIndex(null);
  };

  const handleCreate = () => {
    if (onCreateOption && query.trim()) {
      onCreateOption(query.trim());
      setQuery("");
      setOpen(false);
    }
  };

  const selectedLabel = useMemo(() => {
    if (multiple || selectedValues.length === 0) return null;
    const selectedId = selectedValues[0];
    const selectedOption = options.find((o) => getValue(o) === selectedId);
    return selectedOption ? getLabel(selectedOption) : null;
  }, [multiple, selectedValues, options, getValue, getLabel]);

  const removeValue = (e: React.MouseEvent, valToRemove: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== valToRemove));
  };

  const displayText = multiple
    ? selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : placeholder
    : selectedLabel || placeholder;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full capitalize"
      data-name={name}
    >
      <button
        type="button"
        ref={buttonRef}
        onClick={() => !disabled && setOpen((prev) => !prev)} // prevent opening
        className={cn(
          "w-full text-left px-3 py-1.5 border rounded-md flex items-center justify-between transition-all duration-150",
          "bg-white text-muted-foreground dark:bg-accent dark:text-muted-foreground cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed" // visually indicate disabled
        )}
      >
        <span>{displayText}</span>
        <ChevronDown size={15} className="text-gray-400 dark:text-gray-300" />
      </button>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((val) => {
            const option = options.find((o) => getValue(o) === val);
            const label = option ? getLabel(option) : val;

            return (
              <Badge
                key={val}
                variant="default"
                className="flex items-center gap-1 rounded-sm px-2 py-0.5 font-normal"
              >
                {label}
                <button
                  type="button"
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={(e) => removeValue(e, val)}
                >
                  <X
                    size={14}
                    className="text-muted-foreground hover:text-foreground"
                  />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {open && (
        <div
          className={cn(
            "absolute z-40 w-full max-h-60 mt-2 border rounded-md shadow-lg overflow-hidden transition-all duration-150 capitalize",
            dropUp ? "bottom-full mb-2" : "top-full",
            "bg-white dark:bg-accent border"
          )}
        >
          <div className="flex items-center justify-between border-b px-3">
            <input
              type="text"
              placeholder="Search..."
              value={query}
              autoFocus
              disabled={disabled}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightedIndex((prev) =>
                    prev === null || prev === filtered.length - 1 ? 0 : prev + 1
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightedIndex((prev) =>
                    prev === null || prev === 0 ? filtered.length - 1 : prev - 1
                  );
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (highlightedIndex !== null && filtered[highlightedIndex]) {
                    handleSelect(filtered[highlightedIndex]);
                  }
                  // Removed enter-to-create logic since we have a dedicated button now
                  // or we can keep it if handleCreate is defined
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              className="flex-1 py-2 text-sm outline-none bg-transparent text-black dark:text-white"
            />
            {emptyStateAction && (
              <div className="shrink-0 ml-2">
                {typeof emptyStateAction === "function"
                  ? emptyStateAction(query)
                  : emptyStateAction}
              </div>
            )}
            {/* Keeping legacy onCreateOption support just in case, though emptyStateAction is preferred */}
            {!emptyStateAction && onCreateOption && (
              <button
                type="button"
                onClick={handleCreate}
                className="shrink-0 ml-2 text-blue-500 hover:underline text-sm"
              >
                + Add &quot;{query}&quot;
              </button>
            )}
          </div>

          <ul className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-700 text-sm">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-gray-500 dark:text-gray-400 flex flex-col justify-center items-center gap-2">
                <span>No options found</span>
              </li>
            ) : (
              filtered.map((item, index) => {
                const val = getValue(item);
                const isSelected = selectedValues.includes(val);
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={val}
                    tabIndex={0}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "px-3 py-2 cursor-pointer flex items-center justify-between transition ",
                      isHighlighted && "bg-neutral-100 dark:bg-neutral-700",
                      isSelected &&
                        "bg-neutral-200 dark:bg-neutral-800 font-medium"
                    )}
                  >
                    {getLabel(item)}
                    {isSelected && <CheckIcon className="size-4 ml-2" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
