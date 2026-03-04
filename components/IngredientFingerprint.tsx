"use client";

import { useEffect, useRef, useState } from "react";
import SmilesDrawer from "smiles-drawer";
import { AlertCircle } from "lucide-react";
import { CompoundData, PubChemData } from "@/app/page";

interface FingerprintProps {
    ingredientName: string;
    compounds: CompoundData[];
}

// Store fetched PubChem data for the grid
interface CompoundRenderData extends PubChemData {
    name: string;
    percentage: number;
    is_allergen?: boolean;
}

export function IngredientFingerprint({ ingredientName, compounds }: FingerprintProps) {
    const [renderData, setRenderData] = useState<CompoundRenderData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const svgRefs = useRef<(SVGSVGElement | null)[]>([]);

    // Fetch all structure data when compounds change
    useEffect(() => {
        let isMounted = true;

        async function fetchAllCompounds() {
            if (!compounds || compounds.length === 0) return;

            setLoading(true);
            setError(null);

            try {
                // Fetch all in parallel using the fast cached endpoint
                const fetchPromises = compounds.map(async (c) => {
                    const res = await fetch(`/api/pubchem?query=${encodeURIComponent(c.name)}`);
                    if (!res.ok) throw new Error(`Failed to fetch ${c.name}`);
                    const data = await res.json();

                    return {
                        ...data,
                        name: c.name,
                        percentage: c.percentage,
                        is_allergen: c.is_allergen
                    } as CompoundRenderData;
                });

                const results = await Promise.all(fetchPromises);

                if (isMounted) {
                    // Initialize the ref array to match the length of fetched data
                    svgRefs.current = svgRefs.current.slice(0, results.length);
                    setRenderData(results);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.error("Fingerprint Fetch Error:", err);
                    setError("Failed to construct the ingredient fingerprint.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchAllCompounds();

        return () => {
            isMounted = false;
        };
    }, [compounds]);

    // Draw SVGs once data is loaded
    useEffect(() => {
        if (renderData.length === 0) return;

        // Base dark theme configuration
        const themeConfig = {
            C: "#d4d4d4", // Carbon (Light Gray)
            O: "#f87171", // Oxygen (Soft Red)
            N: "#60a5fa", // Nitrogen (Soft Blue)
            BACKGROUND: "#00000000",
        };

        renderData.forEach((data, index) => {
            if (!data.smiles) return;
            const svgElement = svgRefs.current[index];
            if (!svgElement) return;

            // Clear previous rendering
            while (svgElement.firstChild) {
                svgElement.removeChild(svgElement.firstChild);
            }

            // Customize coloring specifically for allergen highlights
            const currentTheme = { ...themeConfig };
            let themeName = "dark";

            if (data.is_allergen) {
                // High contrast "danger" theme to visually flag sensitizers
                currentTheme.C = "#ef4444"; // Harsh red carbon skeleton
                currentTheme.O = "#b91c1c";
                themeName = "allergen";
            }

            const options = {
                width: 250,
                height: 200,
                themes: {
                    dark: themeConfig,
                    allergen: currentTheme
                }
            };

            const drawer = new SmilesDrawer.SvgDrawer(options);

            try {
                SmilesDrawer.parse(
                    data.smiles,
                    (tree: any) => {
                        drawer.draw(tree, svgElement, themeName, null, false);
                    },
                    (err: any) => console.error(`Failed parsing ${data.name}:`, err)
                );
            } catch (e) {
                console.error(`Execution error for ${data.name}:`, e);
            }
        });
    }, [renderData]);


    if (loading) {
        return (
            <div className="border border-neutral-800 p-6 bg-neutral-900/20 min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-r-2 border-neutral-600 rounded-full animate-spin mb-4"></div>
                <p className="font-mono text-xs text-neutral-500 tracking-widest uppercase">
                    Constructing Molecular Fingerprint...
                </p>
                <p className="font-sans text-xs text-neutral-600 mt-2">
                    (Checking Ephemeral Cache)
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="border border-neutral-800 p-6 bg-neutral-900/20 min-h-[400px] flex items-center justify-center">
                <p className="font-mono text-sm text-red-500">{error}</p>
            </div>
        );
    }

    if (renderData.length === 0) {
        return (
            <div className="border border-neutral-800 p-6 bg-neutral-900/20 min-h-[400px] flex items-center justify-center">
                <p className="font-mono text-sm text-neutral-500 uppercase tracking-widest">
                    Select an ingredient to view its molecular fingerprint
                </p>
            </div>
        )
    }

    return (
        <div className="border border-neutral-800 p-6 bg-neutral-900/20">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
                <div>
                    <h3 className="text-sm font-mono tracking-widest text-neutral-500 uppercase">
                        Molecular Fingerprint
                    </h3>
                    <p className="font-sans text-xs text-neutral-400 mt-1">
                        Complete structural overview of {ingredientName}
                    </p>
                </div>

                {renderData.some(c => c.is_allergen) && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/30 border border-red-900/50 rounded-sm">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="font-mono text-xs text-red-200">CONTAINS KNOWN SENSITIZER(S)</span>
                    </div>
                )}
            </div>

            {/* Collage Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {renderData.map((data, idx) => (
                    <div
                        key={data.name}
                        className={`flex flex-col items-center p-4 border rounded-sm transition-colors ${data.is_allergen
                            ? 'border-red-900/50 bg-red-950/10 hover:bg-red-950/20'
                            : 'border-neutral-800 hover:bg-neutral-800/20'
                            }`}
                    >
                        {/* The Molecule SVG */}
                        <svg
                            ref={(el) => {
                                svgRefs.current[idx] = el;
                            }}
                            width="250"
                            height="200"
                            className="molecule-svg w-full max-w-[200px] h-auto object-contain"
                        />

                        {/* Data Card Footer */}
                        <div className="w-full mt-4 pt-4 border-t border-neutral-800/50 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className={`font-mono text-sm truncate ${data.is_allergen ? "text-red-400 font-bold" : "text-amber-500"
                                    }`}>
                                    {data.name}
                                </span>
                                <span className="font-mono text-xs text-neutral-500">
                                    {data.percentage}%
                                </span>
                            </div>

                            {data.common_names && data.common_names.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {data.common_names.map((n, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-neutral-800/50 text-neutral-400 rounded-sm font-sans text-xs lowercase italic truncate max-w-full">
                                            known as: {n}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center opacity-50 mt-1">
                                <span className="font-sans text-[10px] text-neutral-400">
                                    {data.formula}
                                </span>
                                <span className="font-sans text-[10px] text-neutral-400">
                                    {data.weight}g
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
