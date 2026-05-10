import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, isNewManga } from '@/lib/utils';

export default function MangaRow({ mangas, title, icon }) {
  return (
    <section>
      <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </h2>
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {mangas.map((manga, i) => (
          <MangaThumb key={manga.id} manga={manga} index={i} />
        ))}
      </div>
    </section>
  );
}

function MangaThumb({ manga, index }) {
  const isNew = isNewManga(manga.created_date);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="shrink-0 snap-start"
    >
      <Link to={`/manga/${manga.slug}`} className="block group">
        <div className="relative w-[100px] aspect-[9/16] rounded-xl overflow-hidden bg-secondary">
          {manga.cover_9_16 ? (
            <img
              src={manga.cover_9_16}
              alt={manga.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-center text-muted-foreground p-1">
              {manga.title}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {manga.access === 'pullik' ? (
              <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase bg-primary text-white rounded-md leading-none">P</span>
            ) : (
              <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase bg-emerald-500 text-white rounded-md leading-none">F</span>
            )}
            {isNew && (
              <span className="badge-new-animate px-1.5 py-0.5 text-[8px] font-bold uppercase bg-blue-500 text-white rounded-md leading-none">N</span>
            )}
          </div>
        </div>
        <p className="mt-1.5 text-[11px] font-medium text-foreground/90 w-[100px] truncate leading-tight">{manga.title}</p>
        <p className="text-[10px] text-muted-foreground capitalize">{manga.type}</p>
      </Link>
    </motion.div>
  );
}
