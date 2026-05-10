import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function HeroCarousel({ mangas }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const go = (idx) => {
    setDirection(idx > active ? 1 : -1);
    setActive(idx);
  };

  const next = () => go((active + 1) % mangas.length);
  const prev = () => go((active - 1 + mangas.length) % mangas.length);

  // Auto-advance every 4 seconds
  useEffect(() => {
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [active, mangas.length]);

  const manga = mangas[active];

  const variants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-secondary" style={{ aspectRatio: '16/9' }}>
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={manga.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.45, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <img
            src={manga.banner_16_9 || manga.cover_9_16}
            alt={manga.title}
            className="w-full h-full object-cover"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              {manga.access === 'premium' ? (
                <Badge className="bg-primary text-[10px] px-2 py-0.5">Pullik</Badge>
              ) : (
                <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0.5">Bepul</Badge>
              )}
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 capitalize bg-white/10 text-white border-0">
                {manga.type}
              </Badge>
              {manga.status === 'ongoing' && (
                <Badge className="bg-blue-500/80 text-white text-[10px] px-2 py-0.5">Ongoing</Badge>
              )}
            </div>

            <h2 className="text-white font-black text-xl leading-tight mb-1 drop-shadow-lg">
              {manga.title}
            </h2>

            {manga.description && (
              <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-3">
                {manga.description}
              </p>
            )}

            <Link to={`/manga/${manga.slug}`}>
              <Button size="sm" className="gap-1.5 h-8 text-xs font-semibold shadow-lg">
                <BookOpen className="w-3.5 h-3.5" /> O'qish
              </Button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-4 flex gap-1 z-10">
        {mangas.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === active ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </div>
  );
}
