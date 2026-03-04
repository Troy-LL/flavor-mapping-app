"use client";

import { Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
}

interface IngredientOption {
    id: string;
    name: string;
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<IngredientOption[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch all available ingredients on mount for the autocomplete
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await fetch("/api/flavordb");
                if (res.ok) {
                    const data = await res.json();
                    setOptions(data);
                }
            } catch (error) {
                console.error("Failed to load autocomplete options", error);
            }
        };
        fetchOptions();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = query.trim() === ""
        ? options
        : options.filter(opt => opt.name.toLowerCase().includes(query.toLowerCase()) || opt.id.toLowerCase().includes(query.toLowerCase()));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsDropdownOpen(false);
            onSearch(query.trim());
        }
    };

    const handleOptionSelect = (optionId: string) => {
        setQuery(optionId);
        setIsDropdownOpen(false);
        onSearch(optionId);
    };

    return (
        <div className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
            <form onSubmit={handleSubmit} className="relative group">
                <input
                    type="text"
                    placeholder="Search an ingredient (e.g., Strawberry, Beef)..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full bg-transparent border-b border-neutral-700 pb-2 pt-4 pr-10 outline-none text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-400 transition-colors font-sans text-lg"
                    disabled={isLoading}
                    autoComplete="off"
                />
                <div className="absolute right-0 bottom-2 text-neutral-500 group-focus-within:text-neutral-300 transition-colors">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <button type="submit" disabled={!query.trim()} className="hover:text-neutral-100 disabled:opacity-50">
                            <Search className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </form>

            {/* Autocomplete Dropdown */}
            {isDropdownOpen && filteredOptions.length > 0 && (
                <div className="absolute top-14 left-0 w-full bg-neutral-900/60 backdrop-blur-md border border-neutral-800/50 shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-dropdown">
                    <ul className="py-2">
                        {filteredOptions.map((opt) => (
                            <li key={opt.id}>
                                <button
                                    type="button"
                                    onClick={() => handleOptionSelect(opt.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-neutral-800/50 focus:bg-neutral-800/50 outline-none transition-colors transition group flex items-center justify-between"
                                >
                                    <span className="font-serif text-neutral-300 group-hover:text-amber-500 text-lg">
                                        {opt.name}
                                    </span>
                                    <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest hidden group-hover:block">
                                        Select &rarr;
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
