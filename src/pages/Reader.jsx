import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft, ChevronRight, Settings, List, Play, Pause, ArrowUp, ArrowDown, BookOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReaderSimilar from '@/components/reader/ReaderSimilar';

const DIRECTIONS = [
  { id: 'ttb', label: "Yuqoridan pastga" },
  { id: 'rtl', label: "O'ngdan chapga" },
  { id: 'ltr', label: "Chapdan o'ngga" },
  { id: 'btt', label: "Pastdan yuqoriga" },
];

export default function Reader() {
  const { slug, chapterNum } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const chapterListRef = useRef(null);
  const [direction, setDirection] = useState('ttb');
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const autoScrollRef = useRef(null);

  const { data: mangas = [] } = useQuery({
    queryKey: ['reader-manga', slug],
    queryFn: () => base44.entities.Manga.filter({ slug }),
  });
  const manga = mangas[0];

  const { data: chapters = [] } = useQuery({
    queryKey: ['reader-chapters', manga?.id],
    queryFn: () => base44.entities.Chapter.filter({ manga_id: manga.id }, 'chapter_number', 200),
    enabled: !!manga?.id,
  });

  const currentChapter = chapters.find(c => c.chapter_number === parseInt(chapterNum));
  const sortedChapters = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);
  const currentIdx = sortedChapters.findIndex(c => c.id === currentChapter?.id);
  const prevChapter = currentIdx > 0 ? sortedChapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < sortedChapters.length - 1 ? sortedChapters[currentIdx + 1] : null;

  // Track reading progress
  useEffect(() => {
    if (currentChapter && manga) {
      base44.entities.ReadingProgress.create({
        manga_id: manga.id,
        manga_title: manga.title,
        chapter_id: currentChapter.id,
        chapter_number: currentChapter.chapter_number,
      }).catch(() => {});
      base44.entities.Manga.update(manga.id, {
        view_count: (manga.view_count || 0) + 1,
      }).catch(() => {});
    }
  }, [currentChapter?.id]);

  // Auto scroll
  useEffect(() => {
    if (autoScroll) {
      autoScrollRef.current = setInterval(() => {
        const scrollAmount = direction === 'btt' ? -scrollSpeed : scrollSpeed;
        window.scrollBy({ top: scrollAmount });
      }, 50);
    }
    return () => clearInterval(autoScrollRef.current);
  }, [autoScroll, scrollSpeed, direction]);

  // Scroll to active chapter when list opens
  useEffect(() => {
    if (chaptersOpen && chapterListRef.current) {
      setTimeout(() => {
        const activeEl = chapterListRef.current?.querySelector('[data-active="true"]');
        activeEl?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 150);
    }
  }, [chaptersOpen]);

  // Block right-click and touch save on images
  const blockSave = (e) => e.preventDefault();

  if (!currentChapter && chapters.length === 0 && !manga) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pages = currentChapter.pages || [];
  const displayPages = direction === 'btt' ? [...pages].reverse() : pages;

  return (
    <div
      className="min-h-screen bg-black select-none"
      ref={containerRef}
      onContextMenu={blockSave}
    >
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-3 py-2">
          <Link to={`/manga/${slug}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="text-center flex-1 px-2">
            <p className="text-xs font-medium truncate">{manga?.title}</p>
            <p className="text-[10px] text-muted-foreground">{chapterNum}-bob</p>
          </div>

          {/* Chapters button */}
          <Sheet open={chaptersOpen} onOpenChange={setChaptersOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <BookOpen className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-card border-border rounded-t-2xl max-h-[70vh] flex flex-col p-0">
              <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/50 shrink-0">
                <SheetTitle className="flex items-center justify-between">
                  <span>Boblar ro'yxati</span>
                  <span className="text-xs font-normal text-muted-foreground">{sortedChapters.length} bob</span>
                </SheetTitle>
              </SheetHeader>
              <div
                ref={chapterListRef}
                className="overflow-y-auto flex-1 py-2 px-4 space-y-1"
              >
                {sortedChapters.map((ch) => {
                  const isCurrent = ch.chapter_number === parseInt(chapterNum);
                  return (
                    <button
                      key={ch.id}
                      data-active={isCurrent}
                      onClick={() => {
                        setChaptersOpen(false);
                        navigate(`/read/${slug}/${ch.chapter_number}`);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all",
                        isCurrent
                          ? "bg-primary/15 border border-primary/30 text-primary"
                          : "hover:bg-secondary text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                          isCurrent ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                        )}>
                          {isCurrent ? <Check className="w-3 h-3" /> : ch.chapter_number}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{ch.chapter_number}-bob</p>
                          {(ch.season > 0 || ch.volume > 0) && (
                            <p className="text-[10px] text-muted-foreground">
                              {ch.season > 0 && `Fasl ${ch.season}`}
                              {ch.season > 0 && ch.volume > 0 && ' · '}
                              {ch.volume > 0 && `Jild ${ch.volume}`}
                            </p>
                          )}
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Hozir
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

          {/* Settings button */}
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-card border-border rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Sozlamalar</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 py-4">
                {/* Direction */}
                <div>
                  <p className="text-sm font-medium mb-2">O'qish yo'nalishi</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DIRECTIONS.map(d => (
                      <Button
                        key={d.id}
                        variant={direction === d.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDirection(d.id)}
                        className="text-xs"
                      >
                        {d.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {/* Auto scroll */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Avto aylantirish</p>
                    <Button
                      variant={autoScroll ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAutoScroll(!autoScroll)}
                      className="gap-1"
                    >
                      {autoScroll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {autoScroll ? "To'xtatish" : 'Boshlash'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Sekin</span>
                    <Slider
                      value={[scrollSpeed]}
                      onValueChange={([v]) => setScrollSpeed(v)}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground">Tez</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Pages — protected */}
      <div
        className={cn(
          "pt-12",
          (direction === 'ltr' || direction === 'rtl') && "flex overflow-x-auto snap-x snap-mandatory",
          direction === 'rtl' && "flex-row-reverse"
        )}
        onContextMenu={blockSave}
        onDragStart={blockSave}
      >
        {displayPages.map((page, i) => (
          <div
            key={i}
            className={cn(
              "relative",
              (direction === 'ltr' || direction === 'rtl') && "min-w-full snap-center flex items-center justify-center bg-black max-h-screen"
            )}
          >
            <img
              src={page}
              alt=""
              aria-hidden="true"
              className={cn(
                "w-full pointer-events-none select-none",
                (direction === 'ltr' || direction === 'rtl') && "object-contain max-h-screen"
              )}
              draggable={false}
              onContextMenu={blockSave}
              onDragStart={blockSave}
              style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
            />
            {/* Invisible overlay to block long-press on mobile */}
            <div
              className="absolute inset-0 z-10"
              onContextMenu={blockSave}
              onTouchStart={(e) => { if (e.touches.length > 1) e.preventDefault(); }}
              style={{ WebkitTouchCallout: 'none' }}
            />
          </div>
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          {prevChapter ? (
            <Link to={`/read/${slug}/${prevChapter.chapter_number}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ChevronLeft className="w-4 h-4" /> Oldingi bob
              </Button>
            </Link>
          ) : <div className="flex-1" />}

          <Link to={`/manga/${slug}`}>
            <Button variant="outline" size="icon">
              <List className="w-4 h-4" />
            </Button>
          </Link>

          {nextChapter ? (
            <Link to={`/read/${slug}/${nextChapter.chapter_number}`} className="flex-1">
              <Button className="w-full gap-2">
                Keyingi bob <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : <div className="flex-1" />}
        </div>

        {manga && <ReaderSimilar manga={manga} />}
      </div>
    </div>
  );
}
