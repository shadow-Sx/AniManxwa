import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MangaCard from '@/components/manga/MangaCard';
import { Sparkles, Loader2 } from 'lucide-react';

export default function ReaderSimilar({ manga }) {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      const allMangas = await base44.entities.Manga.list('-view_count', 50);
      const others = allMangas.filter(m => m.id !== manga.id);

      // Try AI recommendation
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Manga: "${manga.title}", Genres: ${manga.genres?.join(', ')}, Type: ${manga.type}
        
Available mangas: ${JSON.stringify(others.map(m => ({ id: m.id, title: m.title, genres: m.genres, type: m.type })))}

Return the IDs of the most similar mangas (up to 6).`,
        response_json_schema: {
          type: "object",
          properties: {
            ids: { type: "array", items: { type: "string" } }
          }
        }
      });

      const matched = result.ids?.map(id => others.find(m => m.id === id)).filter(Boolean) || [];
      setSimilar(matched.length > 0 ? matched : others.slice(0, 6));
      setLoading(false);
    }
    fetchSimilar();
  }, [manga.id]);

  if (loading) {
    return (
      <div className="py-4 text-center">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (similar.length === 0) return null;

  return (
    <div className="pt-4">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-primary" />
        O'xshash natijalar
      </h3>
      <div className="grid grid-cols-3 gap-2.5">
        {similar.map((m, i) => (
          <MangaCard key={m.id} manga={m} index={i} />
        ))}
      </div>
    </div>
  );
}
