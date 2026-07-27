import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BedDouble } from "lucide-react";
import { messageFrom } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Auth({ register = false }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await (register ? auth.register(form) : auth.login(form));
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) { setError(messageFrom(err)); } finally { setBusy(false); }
  }
  return (
    <section className="container-page flex min-h-[75vh] items-center justify-center py-16"><div className="w-full max-w-md">
      <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-bold"><BedDouble /> Stayora</Link>
      <div className="surface p-7 sm:p-9"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">{register ? "Join Stayora" : "Welcome back"}</p><h1 className="mt-3 text-3xl font-bold">{register ? "Create your account" : "Sign in to continue"}</h1><p className="mt-2 text-sm text-white/40">{register ? "Your next great stay starts here." : "Manage your bookings and future escapes."}</p>
      <form onSubmit={submit} className="mt-8 space-y-5">{register && <label><span className="label">Full name</span><input required minLength="2" className="input" value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} /></label>}<label><span className="label">Email</span><input required type="email" className="input" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} /></label><label><span className="label">Password</span><input required minLength="8" type="password" className="input" value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} /></label>{error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}<button disabled={busy} className="btn-primary w-full">{busy ? "Please wait…" : register ? "Create account" : "Sign in"}</button></form>
      <p className="mt-6 text-center text-sm text-white/40">{register ? "Already a member?" : "New to Stayora?"} <Link className="font-semibold text-violet-300" to={register ? "/login" : "/register"}>{register ? "Sign in" : "Create account"}</Link></p>
      </div>
    </div></section>
  );
}

