import { BarChart3, BedDouble, BookOpen, Hotel, LayoutDashboard } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const links = [[LayoutDashboard, "Overview", "/admin"], [Hotel, "Hotels", "/admin/hotels"], [BedDouble, "Rooms", "/admin/rooms"], [BookOpen, "Bookings", "/admin/bookings"], [BarChart3, "Analytics", "/admin/stats"]];
export default function AdminLayout() {
  return <section className="container-page py-10"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Administration</p><h1 className="mt-2 text-3xl font-bold">Stayora operations</h1></div><div className="grid gap-8 lg:grid-cols-[220px_1fr]"><aside className="surface h-fit p-2">{links.map(([Icon,name,path]) => <NavLink end={path === "/admin"} key={path} to={path} className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive ? "bg-white text-black" : "text-white/50 hover:bg-white/[.05] hover:text-white"}`}><Icon size={16}/>{name}</NavLink>)}</aside><Outlet/></div></section>;
}

