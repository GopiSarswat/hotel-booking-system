import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, MapPin, ShieldCheck, Star } from "lucide-react";
import { api, messageFrom } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Empty, Rating, Spinner } from "../components/ui";

const fallback = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85";
export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: 1 });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([api.get(`/hotels/${id}`), api.get(`/hotels/${id}/reviews`)])
      .then(([detail, reviewData]) => { setHotel(detail.data.hotel); setRooms(detail.data.rooms); setSelected(detail.data.rooms[0]?._id); setReviews(reviewData.data.reviews); })
      .catch((e) => setMessage(messageFrom(e)));
  }, [id]);
  const room = rooms.find((item) => item._id === selected);
  const nights = useMemo(() => form.checkIn && form.checkOut ? Math.max(0, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)) : 0, [form]);
  async function checkAvailability() {
    if (!form.checkIn || !form.checkOut) return setMessage("Choose check-in and check-out dates first.");
    try {
      const { data } = await api.get(`/hotels/${id}/rooms`, { params: form });
      const found = data.rooms.find((item) => item._id === selected);
      setMessage(found?.available > 0 ? `${found.available} room${found.available === 1 ? "" : "s"} available for these dates.` : "No availability for these dates.");
    } catch (e) { setMessage(messageFrom(e)); }
  }
  async function book() {
    if (!user) return navigate("/login", { state: { from: { pathname: `/hotels/${id}` } } });
    setBusy(true); setMessage("");
    try {
      const { data } = await api.post("/bookings", { room: selected, ...form });
      navigate(`/booking/${data.booking._id}`, { state: { booking: data.booking } });
    } catch (e) { setMessage(messageFrom(e)); } finally { setBusy(false); }
  }
  if (!hotel && !message) return <Spinner />;
  if (!hotel) return <div className="container-page py-20"><Empty title="Hotel unavailable" copy={message} /></div>;
  const images = hotel.images?.length ? hotel.images : [fallback, fallback, fallback];
  return (
    <section className="container-page py-10 sm:py-16">
      <div className="mb-8"><div className="mb-3 flex items-center gap-3"><Rating value={hotel.avgRating} /><span className="text-sm text-white/35">{hotel.numReviews} verified reviews</span></div><h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{hotel.name}</h1><p className="mt-3 flex items-center gap-2 text-white/45"><MapPin size={16} /> {hotel.address}, {hotel.city}</p></div>
      <div className="grid h-[480px] grid-cols-1 gap-3 overflow-hidden rounded-2xl sm:grid-cols-2"><img src={images[0]} className="h-full w-full object-cover" alt={hotel.name} /><div className="hidden grid-cols-2 gap-3 sm:grid">{[1,2,3,4].map((i) => <img key={i} src={images[i % images.length]} className="h-full min-h-0 w-full object-cover" alt="" />)}</div></div>
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_390px]">
        <div>
          <p className="max-w-3xl text-lg leading-8 text-white/60">{hotel.description}</p>
          <div className="my-12 border-y border-white/10 py-8"><h2 className="mb-5 text-xl font-semibold">What this place offers</h2><div className="grid gap-4 text-sm text-white/60 sm:grid-cols-2">{hotel.amenities.map((a) => <span key={a} className="flex items-center gap-3"><Check className="text-violet-300" size={17} />{a}</span>)}</div></div>
          <h2 className="mb-6 text-2xl font-bold">Choose your room</h2>
          <div className="grid gap-4 md:grid-cols-3">{rooms.map((item, i) => <button key={item._id} onClick={() => setSelected(item._id)} className={`relative rounded-2xl border p-5 text-left transition hover:-translate-y-1 ${selected === item._id ? "border-violet-400 bg-violet-400/10" : "border-white/10 bg-white/[.03]"}`}>{i === 1 && <span className="absolute -top-3 right-3 rounded-full bg-violet-500 px-3 py-1 text-[10px] font-bold uppercase">Best value</span>}<p className="text-xs font-bold uppercase tracking-widest text-violet-300">{item.type}</p><p className="mt-4 text-2xl font-bold">₹{item.pricePerNight}<small className="text-xs font-normal text-white/40"> / night</small></p><p className="mt-3 text-xs text-white/40">Up to {item.capacity} guests · {item.totalUnits} rooms</p></button>)}</div>
          <div className="mt-14"><h2 className="text-2xl font-bold">Guest notes</h2>{reviews.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2">{reviews.map((review) => <article key={review._id} className="surface p-5"><p className="flex gap-1">{Array.from({ length: review.rating }, (_, i) => <Star key={i} size={13} className="fill-amber-300 text-amber-300" />)}</p><p className="mt-3 text-sm leading-6 text-white/55">{review.comment}</p><p className="mt-4 text-xs font-semibold">{review.user?.name}</p></article>)}</div> : <p className="mt-4 text-sm text-white/40">No reviews yet. Be the first guest to share a note.</p>}</div>
        </div>
        <aside className="surface h-fit p-6 lg:sticky lg:top-28">
          <div className="flex items-end justify-between"><p><b className="text-3xl">₹{room?.pricePerNight || "—"}</b><span className="text-sm text-white/40"> / night</span></p><Rating value={hotel.avgRating} /></div>
          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10"><label className="p-3"><span className="label !mb-1">Check in</span><input type="date" min={new Date().toISOString().slice(0,10)} value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="w-full bg-transparent text-sm outline-none [color-scheme:dark]" /></label><label className="border-l p-3"><span className="label !mb-1">Check out</span><input type="date" min={form.checkIn} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="w-full bg-transparent text-sm outline-none [color-scheme:dark]" /></label><label className="col-span-2 border-t p-3"><span className="label !mb-1">Guests</span><select value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} className="w-full bg-panel text-sm outline-none">{Array.from({ length: room?.capacity || 1 }, (_, i) => <option key={i}>{i + 1}</option>)}</select></label></div>
          <button onClick={checkAvailability} className="btn-dark mt-4 w-full">Check availability</button>
          {message && <p className="mt-3 text-center text-xs text-violet-200">{message}</p>}
          <button disabled={busy || !selected || !nights} onClick={book} className="btn-primary mt-4 w-full">{busy ? "Confirming…" : user ? "Reserve stay" : "Sign in to reserve"}</button>
          {nights > 0 && room && <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm"><div className="flex justify-between text-white/50"><span>₹{room.pricePerNight} × {nights} nights</span><span>₹{room.pricePerNight * nights}</span></div><div className="flex justify-between font-bold"><span>Total</span><span>₹{room.pricePerNight * nights}</span></div></div>}
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-white/30"><ShieldCheck size={14} /> Secure simulated payment</p>
        </aside>
      </div>
    </section>
  );
}

