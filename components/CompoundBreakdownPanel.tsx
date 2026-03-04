import { useState, useEffect } from "react";

export interface Compound {
    name: string;
    percentage: number;
    smiles: string;
}

interface CompoundBreakdownProps {
    compounds: Compound[];
    activeCompoundSmiles: string | null;
    onSelectCompound: (smiles: string) => void;
}

export function CompoundBreakdownPanel({
    compounds,
    activeCompoundSmiles,
    onSelectCompound,
}: CompoundBreakdownProps) {
    const [synonyms, setSynonyms] = useState<Record<string, string[]>>({});

    useEffect(() => {
        compounds.forEach(async (c) => {
            if (!c.smiles) return;
            try {
                const res = await fetch(`/api/pubchem?query=${encodeURIComponent(c.name)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.common_names && data.common_names.length > 0) {
                        setSynonyms(prev => ({ ...prev, [c.smiles]: data.common_names }));
                    }
                }
            } catch (e) { }
        });
    }, [compounds]);

    return (
        <div className="border border-neutral-800 p-6 bg-neutral-900/40">
            <h3 className="text-sm font-mono tracking-widest text-neutral-500 uppercase mb-6 border-b border-neutral-800 pb-2">
                Chemical Composition
            </h3>
            <div className="space-y-4">
                {compounds.map((compound) => {
                    const isActive = compound.smiles === activeCompoundSmiles;

                    return (
                        <div
                            key={compound.name}
                            className={`group cursor-pointer transition-all ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                                }`}
                            onClick={() => onSelectCompound(compound.smiles)}
                        >
                            <div className="flex justify-between items-baseline mb-1">
                                <div className="flex items-center gap-2 truncate pr-2">
                                    <span
                                        className={`font-mono text-sm truncate ${isActive ? "text-amber-500" : "text-neutral-300"}`}
                                    >
                                        {compound.name}
                                    </span>
                                    {synonyms[compound.smiles]?.[0] && (
                                        <span className={`font-sans text-xs truncate italic ${isActive ? "text-amber-300/70" : "text-neutral-500"}`}>
                                            ({synonyms[compound.smiles][0].toLowerCase()})
                                        </span>
                                    )}
                                </div>
                                <span className="font-mono text-xs text-neutral-500 shrink-0">
                                    {compound.percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-neutral-800 h-1">
                                <div
                                    className={`h-1 transition-all duration-700 ease-out bg-neutral-300 ${isActive ? "bg-amber-500" : "bg-neutral-500 group-hover:bg-neutral-400"
                                        }`}
                                    style={{ width: `${compound.percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
