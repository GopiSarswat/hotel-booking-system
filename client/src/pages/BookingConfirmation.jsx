import { CheckCircle2 } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const booking = useLocation().state?.booking;
  return <section className="container-page flex min-h-[70vh] items-center justify-center py-20"><div className="surface max-w-xl p-10 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><CheckCircle2 size={34}/></span><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Booking confirmed</p><h1 className="mt-3 text-4xl font-bold">Your stay is all set.</h1><p className="mt-4 text-white/45">We’ve reserved {booking?.room?.type ? `the ${booking.room.type} room at ${booking.hotel?.name}` : "your room"}. Your reference is <span className="text-white">{bookingId.slice(-8).toUpperCase()}</span>.</p>{booking && <div className="my-8 grid grid-cols-2 gap-3 text-left"><div className="rounded-xl bg-white/[.04] p-4"><span className="label">Check in</span>{new Date(booking.checkIn).toLocaleDateString()}</div><div className="rounded-xl bg-white/[.04] p-4"><span className="label">Total paid</span>₹{booking.totalPrice}</div></div>}<Link className="btn-primary" to="/dashboard">View my bookings</Link></div></section>;
}

