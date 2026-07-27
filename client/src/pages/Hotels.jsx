import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { api, messageFrom } from "../api/client";
import { Empty, HotelCard, Spinner } from "../components/ui";

export default function Hotels() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const query = params.toString();
  useEffect(() => {
    setData(null);
    api.get(`/hotels?${query}`).then(({ data: result }) => setData(result)).catch((e) => setError(messageFrom(e)));
  }, [query]);
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };
  return (
    <section className="container-page py-14 sm:py-20">
      <div className="mb-12 max-w-2xl"><p className="mb-4 text-xs font-bold uppercase tracking-[.25em] text-violet-300">Stay collection</p><h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Find a place that <span className="gradient-text">feels right.</span></h1><p className="mt-4 text-white/45">Search live room inventory, compare honest prices, and book in minutes.</p></div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="surface h-fit p-5 lg:sticky lg:top-24">
          <div className="mb-6 flex items-center gap-2 font-semibold"><SlidersHorizontal size={17} /> Filters</div>
          <div className="space-y-5">
            <label><span className="label">City</span><div className="relative"><Search className="absolute left-3 top-3.5 text-white/30" size={16} /><input className="input !pl-10" placeholder="e.g. Udaipur" defaultValue={params.get("city") || ""} onBlur={(e) => update("city", e.target.value)} /></div></label>
            <div className="grid grid-cols-2 gap-2"><label><span className="label">Min ₹</span><input type="number" className="input" defaultValue={params.get("minPrice") || ""} onBlur={(e) => update("minPrice", e.target.value)} /></label><label><span className="label">Max ₹</span><input type="number" className="input" defaultValue={params.get("maxPrice") || ""} onBlur={(e) => update("maxPrice", e.target.value)} /></label></div>
            <label><span className="label">Guests</span><select className="input" value={params.get("guests") || ""} onChange={(e) => update("guests", e.target.value)}><option value="">Any</option>{[1,2,3,4].map((n) => <option key={n}>{n}</option>)}</select></label>
            <label><span className="label">Minimum rating</span><select className="input" value={params.get("rating") || ""} onChange={(e) => update("rating", e.target.value)}><option value="">Any rating</option><option value="4">4+ Excellent</option><option value="4.5">4.5+ Exceptional</option></select></label>
            <label><span className="label">Check in</span><input type="date" className="input [color-scheme:dark]" value={params.get("checkIn") || ""} onChange={(e) => update("checkIn", e.target.value)} /></label>
            <label><span className="label">Check out</span><input type="date" className="input [color-scheme:dark]" value={params.get("checkOut") || ""} onChange={(e) => update("checkOut", e.target.value)} /></label>
          </div>
        </aside>
        <div>{!data ? <Spinner /> : error ? <Empty title="We couldn't load hotels" copy={error} /> : !data.hotels.length ? <Empty title="No stays match those filters" copy="Try widening your dates, price, or destination." /> : <><div className="mb-6 flex justify-between text-sm text-white/40"><span>{data.pagination.total} stays found</span><span>Page {data.pagination.page} of {data.pagination.pages}</span></div><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data.hotels.map((hotel) => <HotelCard hotel={hotel} key={hotel._id} />)}</div><div className="mt-10 flex justify-center gap-3"><button disabled={data.pagination.page <= 1} onClick={() => update("page", data.pagination.page - 1)} className="btn-dark disabled:opacity-30">Previous</button><button disabled={data.pagination.page >= data.pagination.pages} onClick={() => update("page", data.pagination.page + 1)} className="btn-dark disabled:opacity-30">Next</button></div></>}</div>
      </div>
    </section>
  );
}
