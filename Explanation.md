# Flavor Mapping App Explanation

This document provides a detailed overview of how the **Flavor Mapping** application works, its architecture, and its primary features.

## What Does It Do?

**Flavor Mapping** is a gastronomic database and allergen tracker designed for chefs, food scientists, and culinary enthusiasts. The application allows users to search for specific ingredients to view their flavor profiles, understand the specific molecular compounds that give them their unique taste and aroma, and discover complimentary ingredients and recipes that pair well together.

### Key Features:
- **Ingredient Search:** Search for an ingredient to retrieve its comprehensive flavor profile.
- **Flavor Profile & Breakdown:** Displays detailed flavor notes alongside a percentage-based breakdown of the primary aroma and flavor compounds.
- **Molecular Fingerprint:** Fetches real molecular data (like chemical formulas, structures via SMILES, and atomic weights) from PubChem dynamically and renders 2D molecular structures using the `smiles-drawer` library.
- **Allergen & Sensitizer Highlighting:** Automatically flags specific chemical compounds that act as known dietary allergens or sensitizers in a high-contrast styling.
- **Dish & Recipe Pairing:** Recommends both standalone ingredient pairings and full dish ideas. Users can click on recommended dishes to view step-by-step recipes and instructions.

---

## How Does It Work?

The project is built around modern web standards using **Next.js**, **React**, and **Tailwind CSS**. 

### 1. Frontend Architecture (React / Next.js)

The user interface resides primarily in `app/page.tsx`, which serves as the controller for several specialized React components:
- **`SearchBar`:** Allows users to query the local ingredient database.
- **`FlavorNotesCard`:** Renders high-level descriptions and prominent flavor notes for the selected ingredient.
- **`CompoundBreakdownPanel`:** A sidebar that lists the molecular compounds making up the ingredient's flavor (e.g., "Vanillin", "Linalool"), including their percentage composition. 
- **`IngredientFingerprint` & `MolecularViewer`:** These components are responsible for the chemistry aspect of the app. They take the name of a compound, fetch its molecular structure data, and render a 2D skeletal diagram of the molecule using `smiles-drawer`.
- **`PairingPanel`:** Displays what ingredients and dish recipes pair best with the searched ingredient.
- **`RecipeDetailsModal`:** When a dish pairing is clicked, this modal opens, fetching and displaying the associated recipe instructions and ingredients.

### 2. Backend Data Flow (Next.js API Routes)

The application handles data locally using Next.js Serverless API routes that query static JSON files, alongside interacting with external APIs (PubChem):

- **`/api/flavordb` (`app/api/flavordb/route.ts`):** 
  This route reads from `data/flavordb.json`. When a user searches for an ingredient (like "Vanilla" or "Lemon"), this endpoint returns the full flavor profile, including notes, known chemical compounds, and pairing suggestions.

- **`/api/recipes` (`app/api/recipes/route.ts`):** 
  This route reads from `data/recipesdb.json`. When a user clicks on a suggested dish, this endpoint is called with the dish name to retrieve the corresponding recipe details.

- **`/api/pubchem`:**
  To avoid storing massive molecular databases locally, the app fetches compound data (such as SMILES strings, formulas, and molecular weights) on the fly. When the `IngredientFingerprint` or `MolecularViewer` loads, they call this local API route, which likely acts as a proxy to the external NCBI PubChem database to retrieve chemical information for rendering.

### 3. Rendering Molecules

A standout technical feature of the app is its ability to render molecular structures visually. 
This is achieved by obtaining the **SMILES** string (Simplified Molecular-Input Line-Entry System) of a compound. The SMILES string describes the structure of a chemical molecule in short ASCII format. The app passes this string into the **`smiles-drawer`** library, which parses the text and draws the physical 2D skeletal structure atom-by-atom onto an SVG element on the page, using a custom dark theme.
