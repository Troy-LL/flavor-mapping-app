import { NextResponse } from "next/server";

// Define the shape of our cached data
interface CachedCompoundData {
    smiles: string | null;
    formula: string | null;
    weight: string | null;
    common_names?: string[];
}

// In-Memory Cache for PubChem API requests.
// This data persists only for the lifetime of the Next.js lambda/server process.
// It acts as an ephemeral RAG cache to prevent duplicate external requests.
const pubChemCache = new Map<string, CachedCompoundData>();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        if (!query) {
            return NextResponse.json(
                { error: "Query parameter is required" },
                { status: 400 }
            );
        }

        const normalizedQuery = query.trim().toLowerCase();

        // 1. Check the ephemeral in-memory cache first
        if (pubChemCache.has(normalizedQuery)) {
            console.log(`[PubChem Cache Hit] Returning cached data for: ${query}`);
            return NextResponse.json(pubChemCache.get(normalizedQuery));
        }

        console.log(`[PubChem Cache Miss] Fetching from NIH PubChem for: ${query}`);

        // 2. Fetch both Structural Properties AND Synonyms in Parallel
        const propsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
            query
        )}/property/IsomericSMILES,MolecularFormula,MolecularWeight/JSON`;

        const synUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
            query
        )}/synonyms/JSON`;

        const [propsResponse, synResponse] = await Promise.all([
            fetch(propsUrl, { headers: { Accept: "application/json" } }),
            fetch(synUrl, { headers: { Accept: "application/json" } }),
        ]);

        if (!propsResponse.ok) {
            if (propsResponse.status === 404) {
                return NextResponse.json(
                    { error: `No compound found in PubChem for "${query}".` },
                    { status: 404 }
                );
            }
            throw new Error(`PubChem Profile API responded with status: ${propsResponse.status}`);
        }

        const propsData = await propsResponse.json();

        // Extract properties from the PubChem JSON response structure
        const properties = propsData?.PropertyTable?.Properties?.[0];

        if (!properties) {
            return NextResponse.json(
                { error: "Invalid response structure from PubChem." },
                { status: 500 }
            );
        }

        // Parse Synonyms gracefully
        let commonNames: string[] = [];
        if (synResponse.ok) {
            try {
                const synData = await synResponse.json();
                const allSynonyms = synData?.InformationList?.Information?.[0]?.Synonym || [];
                // Filter out the original query name, and pick the top two shortest/most readable synonyms
                commonNames = allSynonyms
                    .filter((s: string) => s.toLowerCase() !== query.toLowerCase() && s.length < 30) // Avoid massive IUPAC names
                    .slice(0, 2);
            } catch (e) {
                console.warn(`Failed to parse synonyms for ${query}`, e);
            }
        }

        // PubChem returns "SMILES" for this specific prop request instead of "IsomericSMILES", map accordingly
        const resultData: CachedCompoundData = {
            smiles: properties.SMILES || properties.IsomericSMILES,
            formula: properties.MolecularFormula,
            weight: properties.MolecularWeight,
            common_names: commonNames,
        };

        // 3. Store the result in the cache for future rapid access
        pubChemCache.set(normalizedQuery, resultData);

        return NextResponse.json(resultData);
    } catch (error) {
        console.error("PubChem API Error:", error);
        return NextResponse.json(
            { error: "Internal server error fetching from PubChem." },
            { status: 500 }
        );
    }
}
