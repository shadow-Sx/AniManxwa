import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MangaBanner({ manga, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={`/manga/${manga.slug}`} className="block group">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
          {manga.banner_16_9 ? (
            <img
              src={manga.banner_16_9}
              alt={manga.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : manga.cover_9_16 ? (
            <img
              src={manga.cover_9_16}
              alt={manga.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary">
              <span className="text-lg font-bold">{manga.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-sm truncate">{manga.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {manga.access === 'premium' ? (
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-primary text-white rounded">Pullik</span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-500 text-white rounded">Bepul</span>
              )}
              <span className="text-[10px] text-white/70 capitalize">{manga.type}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
