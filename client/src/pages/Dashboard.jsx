import { useEffect, useState } from "react";
import { CalendarDays, MapPin, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { api, messageFrom } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Empty, Spinner } from "../components/ui";

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const load = () => api.get("/bookings/me").then(({ data }) => setBookings(data.bookings)).catch((e) => setError(messageFrom(e)));
  useEffect(load, []);
  async function cancel(id) {
    if (!window.confirm("Cancel this upcoming booking?")) return;
    try { await api.patch(`/bookings/${id}/cancel`); load(); } catch (e) { setError(messageFrom(e)); }
  }
  return <section className="container-page py-14 sm:py-20"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Your dashboard</p><h1 className="mt-3 text-4xl font-bold">Hello, {user.name.split(" ")[0]}.</h1><p className="mt-3 text-white/45">All your stays, past and future, in one place.</p>{error && <p className="mt-6 text-red-300">{error}</p>}{!bookings ? <Spinner /> : !bookings.length ? <div className="mt-12"><Empty title="No trips booked yet" copy="When you find the one, it will appear here." /><Link className="btn-primary mx-auto mt-5 flex w-fit" to="/hotels">Explore stays</Link></div> : <div className="mt-12 space-y-4">{bookings.map((booking) => <article key={booking._id} className="surface grid overflow-hidden sm:grid-cols-[180px_1fr_auto]"><img src={booking.hotel?.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=70"} className="h-full min-h-40 w-full object-cover" /><div className="p-6"><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${booking.status === "cancelled" ? "bg-red-400/10 text-red-300" : "bg-emerald-400/10 text-emerald-300"}`}>{booking.status}</span><span className="text-xs text-white/30">{booking.room?.type}</span></div><h2 className="mt-3 text-xl font-bold">{booking.hotel?.name}</h2><p className="mt-2 flex items-center gap-2 text-sm text-white/40"><MapPin size={14}/>{booking.hotel?.city}</p><p className="mt-4 flex items-center gap-2 text-sm"><CalendarDays size={15} className="text-violet-300"/>{new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}</p></div><div className="flex flex-row items-center justify-between border-t border-white/10 p-6 sm:flex-col sm:items-end sm:border-l sm:border-t-0"><p className="text-xl font-bold">₹{booking.totalPrice}</p>{booking.status !== "cancelled" && new Date(booking.checkIn) > new Date() && <button onClick={() => cancel(booking._id)} className="flex items-center gap-2 text-xs text-red-300"><XCircle size={14}/>Cancel</button>}</div></article>)}</div>}</section>;
}

