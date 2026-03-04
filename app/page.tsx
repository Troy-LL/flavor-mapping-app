"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FlavorNotesCard } from "@/components/FlavorNotesCard";
import { CompoundBreakdownPanel, Compound } from "@/components/CompoundBreakdownPanel";
import { RecipeDetailsModal, RecipeData } from "@/components/RecipeDetailsModal";
import { IngredientFingerprint } from "@/components/IngredientFingerprint";
import { PairingPanel } from "@/components/PairingPanel";

export interface CompoundData {
  name: string;
  percentage: number;
  smiles?: string;
  is_allergen?: boolean;
}

export interface PubChemData {
  smiles: string | null;
  formula: string | null;
  weight: string | null;
  common_names?: string[];
}

type IngredientData = {
  name: string;
  description: string;
  notes: string[];
  compounds: CompoundData[];
  pairings: {
    solo: string[];
    dishes: string[];
  };
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IngredientData | null>(null);
  const [activeCompound, setActiveCompound] = useState<Compound | null>(null);

  // Recipe Modal State
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<RecipeData | null>(null);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    setActiveCompound(null);

    try {
      // Fetch exact ingredient data from our local API route
      const response = await fetch(`/api/flavordb?ingredient=${encodeURIComponent(query)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Ingredient "${query}" not found.`);
      }

      // Map API schema to frontend schema
      const mappedData: IngredientData = {
        name: result.name,
        description: result.description,
        notes: result.flavor_notes,
        compounds: result.aroma_compounds,
        pairings: {
          solo: result.pairings.solo_pairings,
          dishes: result.pairings.dish_ideas,
        }
      };

      setData(mappedData);
      if (mappedData.compounds.length > 0) {
        // Enforce the default smiles value to satisfy the strict Compound type
        setActiveCompound({
          ...mappedData.compounds[0],
          smiles: mappedData.compounds[0].smiles || ""
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred fetching the flavor profile.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCompoundSmiles = activeCompound?.smiles || "";

  const handleDishClick = async (dishName: string) => {
    try {
      const response = await fetch(`/api/recipes?dish=${encodeURIComponent(dishName)}`);
      if (!response.ok) throw new Error("Failed to load recipe details.");

      const recipeData = await response.json();
      setActiveRecipe(recipeData);
      setIsRecipeModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-8 max-w-[1600px] mx-auto space-y-12">
      {/* Header section with Search */}
      <section className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-neutral-100 tracking-tight">
            Flavor Mapping
          </h1>
          <p className="font-mono text-sm text-neutral-500 uppercase tracking-widest">
            A Gastronomic Database & Allergen Tracker
          </p>
        </div>
        <SearchBar onSearch={handleSearch} isLoading={loading} />
        {error && (
          <p className="text-center font-mono text-red-500 text-sm mt-4 animate-in fade-in">
            {error}
          </p>
        )}
      </section>

      {/* Main Content Area */}
      {data && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Left Column: Flavor Notes & Composition */}
          <div className="lg:col-span-3 space-y-8 flex flex-col">
            <FlavorNotesCard
              ingredientName={data.name}
              description={data.description}
              notes={data.notes}
            />
            <CompoundBreakdownPanel
              compounds={data.compounds as Compound[]}
              activeCompoundSmiles={selectedCompoundSmiles}
              onSelectCompound={(smiles) => setActiveCompound(data.compounds.find(c => c.smiles === smiles) as Compound || null)}
            />
          </div>

          {/* Middle Column: Molecular Fingerprint (Collage) */}
          <div className="lg:col-span-6 h-auto min-h-[500px]">
            <IngredientFingerprint
              ingredientName={data.name}
              compounds={data.compounds}
            />
          </div>

          {/* Right Column: Pairing Matrix & Dishes */}
          <div className="lg:col-span-3 h-full overflow-y-auto custom-scrollbar">
            <PairingPanel
              pairings={data.pairings}
              onDishClick={handleDishClick}
            />
          </div>

        </div>
      )}

      {/* Recipe Modal Overlay */}
      <RecipeDetailsModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        recipe={activeRecipe}
      />
    </main>
  );
}
