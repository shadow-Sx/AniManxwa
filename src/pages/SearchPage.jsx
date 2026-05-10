import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import MangaCard from '@/components/manga/MangaCard';
import { Badge } from '@/components/ui/badge';

const GENRES = ['Harakat', 'Ramantika', 'Fantaziya', 'Komediya', 'Horror', 'Drama', 'Sci-Fi', 'Sarguzasht', 'Sirli', 'Hayotdan parcha'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const { data: allMangas = [] } = useQuery({
    queryKey: ['all-mangas-search'],
    queryFn: () => base44.entities.Manga.list('-created_date', 100),
  });

  // Simple text filter
  const filtered = allMangas.filter(m => {
    const matchesText = !query || m.title?.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = !selectedGenre || m.genres?.includes(selectedGenre);
    return matchesText && matchesGenre;
  });

  // AI search
  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    const mangaTitles = allMangas.map(m => ({
      id: m.id,
      title: m.title,
      genres: m.genres,
      description: m.description,
      type: m.type,
      year: m.year,
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Foydalanuvchi quyidagicha qidirmoqda: "${aiQuery}"
      
Mavjud mangalar ro'yxati:
${JSON.stringify(mangaTitles)}

Foydalanuvchi so'rovi bo'yicha eng mos mangalarni toping. Janr, tavsif, yil, o'xshash nom va kategoriya bo'yicha qidirishni qo'llab-quvvatlang. Natijalarni eng mos bo'lganlari birinchi kelsin.`,
      response_json_schema: {
        type: "object",
        properties: {
          matching_ids: {
            type: "array",
            items: { type: "string" },
            description: "IDs of matching mangas ordered by relevance"
          },
          suggestion: {
            type: "string",
            description: "Brief suggestion in Uzbek about the search results"
          }
        }
      }
    });

    const matchedMangas = result.matching_ids
      ?.map(id => allMangas.find(m => m.id === id))
      .filter(Boolean) || [];
    
    setAiResults({ mangas: matchedMangas, suggestion: result.suggestion });
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
          {/* Text search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Manga nomi bo'yicha qidirish..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setAiResults(null); }}
              className="pl-10 bg-secondary border-border/50"
              autoFocus
            />
          </div>

          {/* AI search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                placeholder="AI bilan qidirish (janr, tavsif...)"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                className="pl-10 bg-secondary border-primary/20"
              />
            </div>
            <Button
              onClick={handleAiSearch}
              disabled={aiLoading}
              size="icon"
              className="shrink-0"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </Button>
          </div>

          {/* Genre chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {GENRES.map(genre => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "secondary"}
                className="cursor-pointer shrink-0 transition-colors"
                onClick={() => {
                  setSelectedGenre(selectedGenre === genre ? null : genre);
                  setAiResults(null);
                }}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* AI suggestion */}
        {aiResults?.suggestion && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
            <p className="text-sm text-primary flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              {aiResults.suggestion}
            </p>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-3 gap-2.5">
          {(aiResults ? aiResults.mangas : filtered).map((manga, i) => (
            <MangaCard key={manga.id} manga={manga} index={i} />
          ))}
        </div>

        {(aiResults ? aiResults.mangas : filtered).length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Natija topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}
