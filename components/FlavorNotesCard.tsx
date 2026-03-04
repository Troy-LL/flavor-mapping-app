interface FlavorNotesProps {
    ingredientName: string;
    notes: string[];
    description: string;
}

export function FlavorNotesCard({ ingredientName, notes, description }: FlavorNotesProps) {
    return (
        <div className="border border-neutral-800 p-8 flex flex-col gap-6 bg-neutral-900/20">
            <div>
                <h2 className="text-3xl font-serif text-neutral-100 mb-2 capitalize tracking-wide">
                    {ingredientName}
                </h2>
                <p className="font-serif text-neutral-400 leading-relaxed text-lg italic">
                    "{description}"
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-mono tracking-widest text-neutral-500 uppercase">
                    Aroma Profile
                </h3>
                <div className="flex flex-wrap gap-2">
                    {notes.map((note) => (
                        <span
                            key={note}
                            className="px-3 py-1 font-sans text-sm border border-neutral-700 text-neutral-300 bg-neutral-900"
                        >
                            {note}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
