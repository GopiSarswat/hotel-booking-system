import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarDays, Headphones, MapPin, Search, ShieldCheck, Sparkles, Tags } from "lucide-react";
import { api } from "../api/client";
import { FadeIn, HotelCard, SectionTitle } from "../components/ui";

const features = [
  [Tags, "Best price, always", "Transparent rates and no surprise platform fees at checkout."],
  [CalendarDays, "Plans can change", "Flexible cancellation on eligible stays, clearly marked upfront."],
  [Headphones, "Here when you need us", "Real people and practical help, every hour of every day."],
  [BadgeCheck, "Stays we trust", "Every property is checked before it joins our collection."],
  [ShieldCheck, "Secure by design", "Protected booking and payment details from search to stay."],
  [Sparkles, "Reviews that matter", "Feedback only from travellers who completed their stay."],
];
const faqs = [
  ["Can I cancel my booking?", "Yes. Upcoming bookings can be cancelled from your dashboard. The property policy shown before checkout determines refund eligibility."],
  ["When are check-in and check-out?", "Most stays offer check-in from 2 PM and check-out by 11 AM. Exact times appear on each hotel page and confirmation."],
  ["How do I know a room is available?", "Availability is checked against live room-type inventory for your exact dates before the booking is confirmed."],
  ["Are payments real?", "This portfolio build uses a simulated payment confirmation. No card is charged."],
];

export default function Home() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [open, setOpen] = useState(0);
  const [where, setWhere] = useState("");
  useEffect(() => { api.get("/hotels?limit=6").then(({ data }) => setHotels(data.hotels)).catch(() => {}); }, []);
  return (
    <>
      <section className="relative min-h-[760px] overflow-hidden border-b border-white/[.07]">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className="absolute left-[15%] top-28 h-72 w-72 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="container-page relative flex min-h-[720px] flex-col items-center justify-center pb-24 pt-20 text-center">
          <div className="mb-7 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-200">✦ Remarkable stays, thoughtfully selected</div>
          <h1 className="max-w-5xl text-5xl font-extrabold leading-[.98] tracking-[-.055em] sm:text-7xl lg:text-[92px]">Find & book your <span className="gradient-text">perfect stay.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/50 sm:text-lg">Discover design-led hotels and memorable escapes, with honest prices and support that never clocks out.</p>
          <form onSubmit={(e) => { e.preventDefault(); const values = new FormData(e.currentTarget); const next = new URLSearchParams(); if (where) next.set("city", where); if (values.get("checkIn")) next.set("checkIn", values.get("checkIn")); if (values.get("checkOut")) next.set("checkOut", values.get("checkOut")); navigate(`/hotels?${next}`); }} className="surface mt-10 grid w-full max-w-4xl gap-2 p-2 text-left shadow-glow sm:grid-cols-[1.6fr_1fr_1fr_auto]">
            <label className="flex items-center gap-3 px-3"><MapPin size={18} className="text-violet-300" /><span className="flex-1"><small className="block text-[10px] font-bold uppercase tracking-widest text-white/35">Where</small><input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="City or destination" className="w-full bg-transparent py-1 text-sm outline-none" /></span></label>
            <label className="border-white/10 px-3 sm:border-l"><small className="block text-[10px] font-bold uppercase tracking-widest text-white/35">Check in</small><input name="checkIn" type="date" className="w-full bg-transparent py-1 text-sm [color-scheme:dark]" /></label>
            <label className="border-white/10 px-3 sm:border-l"><small className="block text-[10px] font-bold uppercase tracking-widest text-white/35">Check out</small><input name="checkOut" type="date" className="w-full bg-transparent py-1 text-sm [color-scheme:dark]" /></label>
            <button className="btn-primary"><Search size={17} /> Search</button>
          </form>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-white/35"><span>4.9/5 average rating</span><span>•</span><span>Verified properties</span><span>•</span><span>Free cancellation options</span></div>
        </div>
      </section>

      <section id="about" className="py-24 sm:py-32"><div className="container-page">
        <SectionTitle eyebrow="Why Stayora" title="Travel should feel exciting. Not exhausting." copy="We remove the guesswork with a smaller, smarter collection and clear information at every step." />
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">{features.map(([Icon, title, copy], i) => <FadeIn key={title} className="bg-ink p-8 sm:p-10"><span className="mb-8 inline-flex rounded-xl border border-violet-400/20 bg-violet-400/10 p-3 text-violet-300"><Icon size={22} /></span><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{copy}</p><span className="mt-8 block text-[11px] font-bold text-white/20">0{i + 1}</span></FadeIn>)}</div>
      </div></section>

      <section className="border-y border-white/[.07] bg-white/[.018] py-24 sm:py-32"><div className="container-page">
        <div className="flex items-end justify-between gap-5"><SectionTitle eyebrow="Handpicked" title="Stays worth travelling for." copy="Distinctive spaces, generous hosts, and places you'll still talk about years from now." /><Link className="btn-dark mb-12 hidden sm:flex" to="/hotels">Explore all <ArrowRight size={16} /></Link></div>
        {hotels.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{hotels.map((hotel) => <HotelCard key={hotel._id} hotel={hotel} />)}</div> : <div className="surface p-14 text-center text-white/40">Run the seed script to see our featured stays.</div>}
      </div></section>

      <section className="py-24 sm:py-32"><div className="container-page grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
        <SectionTitle eyebrow="Good to know" title="Questions, answered." copy="The useful details, without making you read the small print." />
        <div className="divide-y divide-white/10 border-y border-white/10">{faqs.map(([q, a], i) => <button key={q} onClick={() => setOpen(open === i ? -1 : i)} className="w-full py-6 text-left"><span className="flex items-center justify-between gap-4 font-semibold">{q}<span className="text-2xl font-light text-white/35">{open === i ? "−" : "+"}</span></span>{open === i && <p className="max-w-xl pt-4 text-sm leading-6 text-white/45">{a}</p>}</button>)}</div>
      </div></section>

      <section className="container-page pb-24"><div className="relative overflow-hidden rounded-[2rem] border border-violet-300/20 bg-gradient-to-br from-violet-600/25 via-fuchsia-600/10 to-cyan-500/15 px-6 py-20 text-center sm:px-12"><div className="dot-grid absolute inset-0 opacity-30" /><div className="relative"><p className="mb-4 text-xs font-bold uppercase tracking-[.25em] text-violet-200">Your next chapter</p><h2 className="text-4xl font-bold tracking-tight sm:text-6xl">Ready for your next trip?</h2><p className="mx-auto mt-5 max-w-lg text-white/55">A remarkable stay is closer than you think. Find yours in a few clicks.</p><Link to="/hotels" className="btn-primary mt-8">Find your stay <ArrowRight size={17} /></Link></div></div></section>
    </>
  );
}
