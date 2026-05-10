import React from 'react';
import { Link } from 'react-router-dom';
import { isNewManga, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function MangaCard({ manga, index = 0 }) {
  const isNew = isNewManga(manga.created_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/manga/${manga.slug}`} className="block group">
        <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-secondary">
          {manga.cover_9_16 ? (
            <img
              src={manga.cover_9_16}
              alt={manga.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              {manga.title}
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {manga.access === 'Pullik' ? (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-md">
                Premium
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-md">
                Bepul
              </span>
            )}
            {isNew && (
              <span className="badge-new-animate px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500 text-white rounded-md">
                Yangi
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
