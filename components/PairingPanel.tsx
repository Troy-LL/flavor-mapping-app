import { UtensilsCrossed } from "lucide-react";

interface PairingData {
    solo: string[];
    dishes: string[];
}

interface PairingPanelProps {
    pairings: PairingData;
    onDishClick: (dishName: string) => void;
}

export function PairingPanel({ pairings, onDishClick }: PairingPanelProps) {
    if (!pairings.solo.length && !pairings.dishes.length) {
        return null; // Empty state handled by parent if needed
    }

    return (
        <div className="border border-neutral-800 p-6 bg-neutral-900/40 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-serif tracking-wide text-neutral-100">
                    Pairing Matrix & Applications
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {/* Solo Affinities Column */}
                <div>
                    <h4 className="text-xs font-mono tracking-widest text-neutral-400 uppercase mb-4">
                        Solo Affinities
                    </h4>
                    <ul className="divide-y divide-neutral-800/50 border-t border-b border-neutral-800/50">
                        {pairings.solo.map((pairing) => (
                            <li
                                key={pairing}
                                className="py-3 px-2 font-serif text-neutral-300 hover:text-amber-500 transition-colors hover:bg-neutral-800/20 cursor-default"
                            >
                                {pairing}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Culinary Concepts Column */}
                <div>
                    <h4 className="text-xs font-mono tracking-widest text-neutral-400 uppercase mb-4">
                        Culinary Concepts
                    </h4>
                    <ul className="space-y-3">
                        {pairings.dishes.map((dish) => (
                            <li key={dish}>
                                <button
                                    onClick={() => onDishClick(dish)}
                                    className="w-full text-left p-4 border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 transition-all group rounded-sm"
                                >
                                    <span className="font-serif text-neutral-300 group-hover:text-amber-500 transition-colors block mb-1">
                                        {dish}
                                    </span>
                                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest group-hover:text-neutral-400">
                                        View Recipe & Allergens &rarr;
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
