import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export function SectionTitle({ eyebrow, title, copy, center = false }) {
  return (
    <div className={`mb-12 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="mb-4 text-xs font-bold uppercase tracking-[.25em] text-violet-300">{eyebrow}</p>}
      <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      {copy && <p className="mt-4 text-base leading-7 text-white/50">{copy}</p>}
    </div>
  );
}

export function FadeIn({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}

export function Rating({ value = 0 }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold backdrop-blur">
      <Star size={12} className="fill-amber-300 text-amber-300" /> {Number(value).toFixed(1)}
    </span>
  );
}

export function HotelCard({ hotel }) {
  const image = hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
  return (
    <Link to={`/hotels/${hotel._id}`} className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={hotel.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute right-3 top-3"><Rating value={hotel.avgRating} /></div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-violet-300">{hotel.city}</p>
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-lg font-semibold">{hotel.name}</h3>
          <p className="shrink-0 text-sm text-white/45"><b className="text-lg text-white">₹{hotel.startingPrice || "—"}</b>/night</p>
        </div>
      </div>
    </Link>
  );
}

export function Spinner() {
  return <div className="mx-auto my-20 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />;
}

export function Empty({ title = "Nothing here yet", copy }) {
  return <div className="surface p-10 text-center"><h3 className="font-semibold">{title}</h3>{copy && <p className="mt-2 text-sm text-white/45">{copy}</p>}</div>;
}

