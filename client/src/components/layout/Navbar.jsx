import { BedDouble, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const links = [["Hotels", "/hotels"], ["Deals", "/hotels?maxPrice=8000"], ["About", "/#about"]];
  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-ink/80 backdrop-blur-xl">
      <nav className="container-page flex h-18 items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 p-1.5"><BedDouble size={18} /></span>Stayora</Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map(([name, path]) => <NavLink key={name} to={path} className="text-sm text-white/55 transition hover:text-white">{name}</NavLink>)}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"} className="text-sm font-medium">{user.name.split(" ")[0]}</Link>
              <button aria-label="Sign out" onClick={logout} className="btn-dark !p-2.5"><LogOut size={16} /></button>
            </>
          ) : <Link to="/login" className="px-3 text-sm font-semibold">Sign in</Link>}
          <Link to="/hotels" className="btn-primary !py-2.5">Book now</Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && <div className="container-page space-y-4 border-t border-white/10 py-5 md:hidden">{links.map(([name, path]) => <Link onClick={() => setOpen(false)} className="block text-white/70" key={name} to={path}>{name}</Link>)}<Link to={user ? "/dashboard" : "/login"} className="btn-primary w-full">{user ? "Dashboard" : "Sign in"}</Link></div>}
    </header>
  );
}

