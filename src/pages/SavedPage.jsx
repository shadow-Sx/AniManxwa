import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useOutletContext } from 'react-router-dom';
import MangaCard from '@/components/manga/MangaCard';
import { Heart } from 'lucide-react';

export default function SavedPage() {
  const { user } = useOutletContext();

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', user?.email],
    queryFn: () => base44.entities.Bookmark.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  // Convert bookmarks to manga-like objects for MangaCard
  const savedItems = bookmarks.map(b => ({
    id: b.manga_id,
    title: b.manga_title,
    slug: b.manga_slug,
    cover_9_16: b.manga_cover,
    access: b.manga_access,
    created_date: b.created_date,
  }));

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">❤️ Saqlangan</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {savedItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5">
            {savedItems.map((manga, i) => (
              <MangaCard key={manga.id} manga={manga} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Saqlangan mangalar yo'q</p>
            <p className="text-xs mt-1">Manga sahifasida ❤️ tugmasini bosing</p>
          </div>
        )}
      </div>
    </div>
  );
}
