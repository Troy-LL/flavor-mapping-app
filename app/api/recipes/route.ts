import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dish = searchParams.get('dish');

    if (!dish) {
        return NextResponse.json(
            { error: "Missing 'dish' query parameter." },
            { status: 400 }
        );
    }

    try {
        // Construct the absolute path to the data file
        const jsonDirectory = path.join(process.cwd(), 'data');
        const filePath = path.join(jsonDirectory, 'recipesdb.json');

        // Read the file contents
        const fileContents = await fs.readFile(filePath, 'utf8');

        // Parse the JSON data
        const recipesDb = JSON.parse(fileContents);

        // Perform a case-insensitive lookup
        const dishKey = Object.keys(recipesDb).find(
            key => key.toLowerCase() === dish.toLowerCase()
        );

        if (dishKey) {
            return NextResponse.json(recipesDb[dishKey]);
        } else {
            return NextResponse.json(
                { error: `Recipe for dish "${dish}" not found.` },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error("Error reading recipesdb.json:", error);
        return NextResponse.json(
            { error: "Internal Server Error while accessing recipe database." },
            { status: 500 }
        );
    }
}
