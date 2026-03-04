import { NextResponse } from "next/server";
import flavordb from "@/data/flavordb.json";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ingredient = searchParams.get("ingredient");

        // Type assertion since we know the structure of our JSON
        const database = flavordb as Record<string, any>;

        // If no specific ingredient is requested, return the full list of options for Autocomplete
        if (!ingredient) {
            const allIngredients = Object.keys(database).map(key => ({
                id: key,
                name: database[key].name
            }));
            return NextResponse.json(allIngredients);
        }

        const normalizedQuery = ingredient.toLowerCase().trim();

        const result = database[normalizedQuery];

        if (!result) {
            return NextResponse.json(
                { error: `Ingredient "${ingredient}" not found in database.` },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error retrieving flavor data:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
