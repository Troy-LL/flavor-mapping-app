"use client";

import { useEffect, useRef, useState } from "react";
import SmilesDrawer from "smiles-drawer";

interface MolecularViewerProps {
    compoundName: string;
}

interface PubChemData {
    smiles: string;
    formula: string;
    weight: string;
}

export function MolecularViewer({ compoundName }: MolecularViewerProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [pubchemData, setPubchemData] = useState<PubChemData | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchCompoundData() {
            if (!compoundName || compoundName === "Select a compound") return;

            setLoading(true);
            setError(null);
            setPubchemData(null);

            try {
                const response = await fetch(`/api/pubchem?query=${encodeURIComponent(compoundName)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch PubChem data");
                }

                if (isMounted) {
                    setPubchemData(data);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.error("PubChem fetch error:", err);
                    setError(err.message || "Failed to retrieve molecular structure.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchCompoundData();

        return () => {
            isMounted = false;
        };
    }, [compoundName]);

    useEffect(() => {
        if (!svgRef.current || !pubchemData?.smiles) return;

        // Reset rendering error
        setError(null);

        // Initialize SmilesDrawer with custom dark theme settings
        const options = {
            width: 400,
            height: 300,
            themes: {
                dark: {
                    C: "#d4d4d4", // Carbon (Light Gray)
                    O: "#f87171", // Oxygen (Soft Red)
                    N: "#60a5fa", // Nitrogen (Soft Blue)
                    F: "#34d399", // Fluorine (Soft Green)
                    CL: "#34d399", // Chlorine
                    BR: "#fbbf24", // Bromine
                    I: "#a78bfa", // Iodine
                    P: "#fb923c", // Phosphorus
                    S: "#fcd34d", // Sulfur
                    B: "#fca5a5", // Boron
                    SI: "#9ca3af", // Silicon
                    H: "#737373", // Hydrogen (Muted gray)
                    BACKGROUND: "#00000000", // Transparent background
                },
            },
        };

        const smilesDrawer = new SmilesDrawer.SvgDrawer(options);

        try {
            SmilesDrawer.parse(
                pubchemData.smiles,
                (tree: any) => {
                    if (!svgRef.current) return;

                    // Clear previous Drawing
                    while (svgRef.current.firstChild) {
                        svgRef.current.removeChild(svgRef.current.firstChild);
                    }

                    // Draw the molecule using the 'dark' theme. 
                    // SvgDrawer signature: (data, target, themeName, weights, infoOnly, highlight_atoms, weightsNormalized)
                    smilesDrawer.draw(tree, svgRef.current, "dark", null, false);
                },
                (err: any) => {
                    console.error("SmilesDrawer Parse Error:", err);
                    setError(String(err) || "Parse Error");
                }
            );
        } catch (e) {
            console.error("SmilesDrawer Execution Error:", e);
            setError("Rendering engine failed.");
        }
    }, [pubchemData?.smiles]);

    return (
        <div className="border border-neutral-800 p-6 bg-neutral-900/20 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-full flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                <h3 className="text-sm font-mono tracking-widest text-neutral-500 uppercase">
                    Structure
                </h3>
                <span className="font-mono text-amber-500 text-sm">
                    {compoundName !== "Select a compound" ? compoundName : "-"}
                </span>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-8 h-8 border-t-2 border-r-2 border-neutral-600 rounded-full animate-spin"></div>
                    <p className="font-mono text-xs text-neutral-500 tracking-widest uppercase">
                        Querying PubChem...
                    </p>
                </div>
            ) : error ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="font-mono text-sm text-neutral-500 text-center max-w-[250px]">{error}</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                    <svg
                        ref={svgRef}
                        data-smiles={pubchemData?.smiles}
                        width="400"
                        height="300"
                        className={`molecule-svg w-full max-w-[400px] h-auto transition-opacity duration-500 ${!pubchemData?.smiles ? 'opacity-0' : 'opacity-100'}`}
                    />
                </div>
            )}

            <div className="mt-4 w-full flex justify-between items-end border-t border-neutral-800/50 pt-2 h-10">
                {pubchemData && !loading && !error && (
                    <div className="flex gap-4">
                        <div className="flex gap-1 items-end">
                            <span className="text-[10px] uppercase font-mono text-neutral-600">Formula:</span>
                            <span className="text-xs font-mono text-neutral-300">{pubchemData.formula}</span>
                        </div>
                        <div className="flex gap-1 items-end">
                            <span className="text-[10px] uppercase font-mono text-neutral-600">Weight:</span>
                            <span className="text-xs font-mono text-neutral-300">{pubchemData.weight} g/mol</span>
                        </div>
                    </div>
                )}
                <p className="text-[10px] font-mono text-neutral-600 ml-auto">
                    Source: PubChem
                </p>
            </div>
        </div>
    );
}
