"use client";

import { X, AlertTriangle, ChefHat } from "lucide-react";

export interface RecipeData {
    name: string;
    description: string;
    ingredients_list: string[];
    instructions: string[];
    allergen_warnings: string[];
    key_flavor_molecules: string[];
}

interface RecipeDetailsModalProps {
    recipe: RecipeData | null;
    isOpen: boolean;
    onClose: () => void;
}

export function RecipeDetailsModal({ recipe, isOpen, onClose }: RecipeDetailsModalProps) {
    if (!isOpen || !recipe) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Modal Container */}
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-700 shadow-2xl rounded-sm custom-scrollbar"
                role="dialog"
                aria-modal="true"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Content */}
                <div className="p-8 pb-6 border-b border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                        <ChefHat className="w-5 h-5 text-amber-500" />
                        <h2 className="text-2xl font-serif text-neutral-100 tracking-wide">
                            {recipe.name}
                        </h2>
                    </div>
                    <p className="font-serif text-neutral-400 text-lg italic">
                        "{recipe.description}"
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-8 pt-6 space-y-8">

                    {/* ALWAYS VISIBLE ALLERGEN WARNING SECTION */}
                    {recipe.allergen_warnings && recipe.allergen_warnings.length > 0 && (
                        <div className="bg-red-950/30 border border-red-900/50 rounded-sm p-4">
                            <div className="flex items-center gap-2 mb-2 text-red-500">
                                <AlertTriangle className="w-4 h-4" />
                                <h3 className="font-mono text-sm tracking-widest uppercase font-bold">
                                    Allergen Warnings
                                </h3>
                            </div>
                            <ul className="list-disc list-inside space-y-1">
                                {recipe.allergen_warnings.map((warning, idx) => (
                                    <li key={idx} className="font-sans text-sm text-red-200/90">
                                        {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Ingredients List */}
                    <div>
                        <h3 className="text-sm font-mono tracking-widest text-neutral-500 uppercase mb-4">
                            Ingredients
                        </h3>
                        <ul className="space-y-2">
                            {recipe.ingredients_list.map((ingredient, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-neutral-300 font-sans text-sm">
                                    <span className="text-amber-500/50 mt-1">•</span>
                                    <span>{ingredient}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                        <h3 className="text-sm font-mono tracking-widest text-neutral-500 uppercase mb-4">
                            Instructions
                        </h3>
                        <ol className="space-y-4">
                            {recipe.instructions.map((step, idx) => (
                                <li key={idx} className="flex gap-4 group">
                                    <span className="font-mono text-xs text-neutral-600 group-hover:text-amber-500 transition-colors pt-1">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className="font-sans text-sm text-neutral-300 leading-relaxed">
                                        {step}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Key Molecules Footer */}
                    <div className="pt-6 border-t border-neutral-800">
                        <h3 className="text-xs font-mono tracking-widest text-neutral-500 uppercase mb-3">
                            Key Flavor Molecules
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {recipe.key_flavor_molecules.map((molecule, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono text-xs"
                                >
                                    {molecule}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
