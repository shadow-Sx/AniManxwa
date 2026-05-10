import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search } from 'lucide-react';
import MangaCard from '@/components/manga/MangaCard';
import MangaRow from '@/components/manga/MangaRow';
import HeroCarousel from '@/components/manga/HeroCarousel';

export default function Home() {
  const { user } = useOutletContext();

  const { data: latestMangas = [] } = useQuery({
    queryKey: ['mangas-latest'],
    queryFn: () => base44.entities.Manga.list('-created_date', 40),
  });

  const { data: topMangas = [] } = useQuery({
    queryKey: ['mangas-top'],
    queryFn: () => base44.entities.Manga.list('-view_count', 20),
  });

  const heroMangas = latestMangas.filter(m => m.banner_16_9 || m.cover_9_16).slice(0, 6);
  const premiumMangas = latestMangas.filter(m => m.access === 'premium');
  const freeMangas = latestMangas.filter(m => m.access === 'free');
  const manhwaMangas = latestMangas.filter(m => m.type === 'manhwa');
  const mangaMangas = latestMangas.filter(m => m.type === 'manga');
  const manhuaMangas = latestMangas.filter(m => m.type === 'manhua');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight">
              <span className="text-primary">Ani</span>Manxwa
            </h1>
          </div>
          <Link to="/search">
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <div className="w-full h-10 rounded-xl bg-secondary/80 border border-border/50 pl-10 flex items-center text-sm text-muted-foreground cursor-pointer hover:bg-secondary transition-colors">
                Manga qidirish...
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Hero Carousel */}
        {heroMangas.length > 0 && (
          <HeroCarousel mangas={heroMangas} />
        )}

        {/* Top Rated Row */}
        {topMangas.length > 0 && (
          <MangaRow mangas={topMangas} title="Top reytingli" icon="🏆" />
        )}

        {/* Latest Row */}
        {latestMangas.length > 0 && (
          <MangaRow mangas={latestMangas} title="Eng so'ngi" icon="🔥" />
        )}

        {/* Manhwa Row */}
        {manhwaMangas.length > 0 && (
          <MangaRow mangas={manhwaMangas} title="Manhwa" icon="🇰🇷" />
        )}

        {/* Manga Row */}
        {mangaMangas.length > 0 && (
          <MangaRow mangas={mangaMangas} title="Manga" icon="🇯🇵" />
        )}

        {/* Manhua Row */}
        {manhuaMangas.length > 0 && (
          <MangaRow mangas={manhuaMangas} title="Manhua" icon="🇨🇳" />
        )}

        {/* Premium Row */}
        {premiumMangas.length > 0 && (
          <MangaRow mangas={premiumMangas} title="Premium" icon="⭐" />
        )}

        {/* Free Row */}
        {freeMangas.length > 0 && (
          <MangaRow mangas={freeMangas} title="Bepul" icon="🎁" />
        )}

        {latestMangas.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">Hozircha Manga/Manhwalar yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
}
