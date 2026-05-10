import React, { useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, BookOpen, Calendar, User, Layers, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function MangaDetail() {
  const { slug } = useParams();
  const { user } = useOutletContext();
  const queryClient = useQueryClient();

  const { data: mangas = [] } = useQuery({
    queryKey: ['manga-detail', slug],
    queryFn: () => base44.entities.Manga.filter({ slug }),
  });
  const manga = mangas[0];

  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters', manga?.id],
    queryFn: () => base44.entities.Chapter.filter({ manga_id: manga.id }, 'chapter_number', 200),
    enabled: !!manga?.id,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmark-check', manga?.id, user?.email],
    queryFn: () => base44.entities.Bookmark.filter({ manga_id: manga?.id, created_by: user?.email }),
    enabled: !!manga?.id && !!user?.email,
  });

  const isBookmarked = bookmarks.length > 0;

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await base44.entities.Bookmark.delete(bookmarks[0].id);
      } else {
        await base44.entities.Bookmark.create({
          manga_id: manga.id,
          manga_title: manga.title,
          manga_slug: manga.slug,
          manga_cover: manga.cover_9_16,
          manga_access: manga.access,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmark-check', manga?.id] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success(isBookmarked ? "Olib tashlandi" : "Saqlandi!");
    },
  });

  if (!manga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedChapters = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-80 overflow-hidden">
        {manga.cover_9_16 && (
          <img src={manga.cover_9_16} alt={manga.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-start gap-2 mb-1">
            {manga.access === 'premium' ? (
              <Badge className="bg-primary text-white">Pullik</Badge>
            ) : (
              <Badge className="bg-emerald-500 text-white">Bepul</Badge>
            )}
            <Badge variant="secondary" className="capitalize">{manga.type}</Badge>
            <Badge variant="outline" className="capitalize">{manga.status === 'ongoing' ? 'Davom etmoqda' : 'Tugallangan'}</Badge>
          </div>
          <h1 className="text-2xl font-black">{manga.title}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-2 space-y-4">
        {/* Actions */}
        <div className="flex gap-3">
          {sortedChapters.length > 0 && (
            <Link to={`/read/${manga.slug}/${sortedChapters[0].chapter_number}`} className="flex-1">
              <Button className="w-full gap-2 h-11 text-sm font-semibold">
                <BookOpen className="w-4 h-4" /> O'qishni boshlash
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="icon"
            className={`h-11 w-11 shrink-0 ${isBookmarked ? 'text-primary border-primary/50' : ''}`}
            onClick={() => toggleBookmark.mutate()}
          >
            <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-primary' : ''}`} />
          </Button>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-4 space-y-3"
        >
          {manga.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {manga.genres.map(g => (
                <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
              ))}
            </div>
          )}
          {manga.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{manga.description}</p>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {manga.author && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="w-3.5 h-3.5" /> {manga.author}
              </div>
            )}
            {manga.year && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" /> {manga.year}
              </div>
            )}
            {manga.total_volumes > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Layers className="w-3.5 h-3.5" /> {manga.total_volumes} jild
              </div>
            )}
            {manga.studio && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5" /> {manga.studio}
              </div>
            )}
          </div>
        </motion.div>

        {/* Chapters */}
        <div>
          <h2 className="text-base font-bold mb-3">Boblar ({sortedChapters.length})</h2>
          <div className="space-y-1.5">
            {sortedChapters.map((ch) => (
              <Link key={ch.id} to={`/read/${manga.slug}/${ch.chapter_number}`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-colors group"
                >
                  <div>
                    <span className="text-sm font-medium">{ch.chapter_number}-bob</span>
                    {ch.season > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">Fasl {ch.season}</span>
                    )}
                    {ch.volume > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">Jild {ch.volume}</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.div>
              </Link>
            ))}
          </div>
          {sortedChapters.length === 0 && (
            <p className="text-center py-8 text-muted-foreground text-sm">Boblar hali qo'shilmagan</p>
          )}
        </div>
      </div>
    </div>
  );
}
