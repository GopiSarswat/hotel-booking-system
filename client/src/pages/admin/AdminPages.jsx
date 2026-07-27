import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { api, messageFrom } from "../../api/client";
import { Empty, Spinner } from "../../components/ui";

function StatCards({ stats }) {
  const cards = [["Total revenue", `₹${stats.revenue.toLocaleString()}`],["Bookings",stats.totalBookings],["Live occupancy",`${stats.occupancy}%`],["Properties",stats.totalHotels]];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([name,value]) => <div className="surface p-5" key={name}><p className="text-xs text-white/40">{name}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>;
}
export function AdminOverview() {
  const [stats,setStats]=useState(null);
  useEffect(()=>{api.get("/admin/stats").then(({data})=>setStats(data));},[]);
  if(!stats)return <Spinner/>;
  return <div><h2 className="mb-6 text-xl font-bold">At a glance</h2><StatCards stats={stats}/><div className="surface mt-6 p-6"><h3 className="mb-5 font-semibold">Top properties</h3>{stats.topHotels.length ? stats.topHotels.map((h,i)=><div className="flex justify-between border-b border-white/10 py-3 text-sm" key={h._id}><span>{i+1}. {h.name}</span><span className="text-white/40">{h.bookings} bookings</span></div>) : <p className="text-sm text-white/40">No booking data yet.</p>}</div></div>;
}
export function AdminStats() {
  const [stats,setStats]=useState(null);
  useEffect(()=>{api.get("/admin/stats").then(({data})=>setStats(data));},[]);
  if(!stats)return <Spinner/>;
  return <div><h2 className="mb-6 text-xl font-bold">Performance</h2><StatCards stats={stats}/><div className="surface mt-6 p-6"><h3 className="mb-6 font-semibold">Revenue by top hotel</h3><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.topHotels}><CartesianGrid stroke="#ffffff12" vertical={false}/><XAxis dataKey="name" stroke="#ffffff55" tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:"#111317",border:"1px solid #ffffff1a",borderRadius:12}}/><Bar dataKey="revenue" fill="#8b7cff" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div></div></div>;
}
export function AdminBookings() {
  const [items,setItems]=useState(null);
  useEffect(()=>{api.get("/bookings").then(({data})=>setItems(data.bookings));},[]);
  if(!items)return <Spinner/>;
  return <div><h2 className="mb-6 text-xl font-bold">All bookings</h2><div className="surface overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-white/10 text-xs text-white/35"><tr>{["Guest","Hotel","Dates","Total","Status"].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{items.map(b=><tr className="border-b border-white/[.06]" key={b._id}><td className="p-4">{b.user?.name}<small className="block text-white/30">{b.user?.email}</small></td><td className="p-4">{b.hotel?.name}</td><td className="p-4 text-white/50">{new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}</td><td className="p-4">₹{b.totalPrice}</td><td className="p-4 capitalize">{b.status}</td></tr>)}</tbody></table></div></div>;
}
export function AdminHotels() {
  const empty={name:"",city:"",address:"",description:"",amenities:"WiFi, Pool",images:""};
  const [items,setItems]=useState(null),[form,setForm]=useState(empty),[error,setError]=useState("");
  const load=()=>api.get("/hotels?limit=24").then(({data})=>setItems(data.hotels));
  useEffect(load,[]);
  async function add(e){e.preventDefault();try{await api.post("/hotels",{...form,amenities:form.amenities.split(",").map(x=>x.trim()),images:form.images?[form.images]:[]});setForm(empty);load();}catch(err){setError(messageFrom(err));}}
  async function remove(id){if(window.confirm("Delete this hotel?"))try{await api.delete(`/hotels/${id}`);load();}catch(err){setError(messageFrom(err));}}
  if(!items)return <Spinner/>;
  return <div><h2 className="mb-6 text-xl font-bold">Manage hotels</h2><form onSubmit={add} className="surface mb-6 grid gap-3 p-5 sm:grid-cols-2"><input required className="input" placeholder="Hotel name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required className="input" placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/><input required className="input" placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><input className="input" placeholder="Image URL" value={form.images} onChange={e=>setForm({...form,images:e.target.value})}/><textarea required className="input sm:col-span-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><input className="input" placeholder="Amenities, comma separated" value={form.amenities} onChange={e=>setForm({...form,amenities:e.target.value})}/><button className="btn-primary">Add hotel</button>{error&&<p className="text-red-300 sm:col-span-2">{error}</p>}</form><div className="space-y-3">{items.map(h=><div className="surface flex items-center justify-between p-4" key={h._id}><div><b>{h.name}</b><small className="ml-3 text-white/35">{h.city}</small></div><button className="text-xs text-red-300" onClick={()=>remove(h._id)}>Delete</button></div>)}</div></div>;
}
export function AdminRooms() {
  const [hotels,setHotels]=useState([]),[rooms,setRooms]=useState([]),[hotel,setHotel]=useState(""),[error,setError]=useState("");
  const [form,setForm]=useState({type:"standard",pricePerNight:5000,capacity:2,totalUnits:3});
  useEffect(()=>{api.get("/hotels?limit=24").then(({data})=>{setHotels(data.hotels);if(data.hotels[0])setHotel(data.hotels[0]._id);});},[]);
  useEffect(()=>{if(hotel)api.get(`/hotels/${hotel}/rooms`).then(({data})=>setRooms(data.rooms));},[hotel]);
  async function add(e){e.preventDefault();try{await api.post("/rooms",{...form,hotel});const {data}=await api.get(`/hotels/${hotel}/rooms`);setRooms(data.rooms);}catch(err){setError(messageFrom(err));}}
  async function remove(id){if(window.confirm("Delete this room type?"))try{await api.delete(`/rooms/${id}`);setRooms(rooms.filter(r=>r._id!==id));}catch(err){setError(messageFrom(err));}}
  if(!hotels.length)return <Empty title="Add a hotel first"/>;
  return <div><h2 className="mb-6 text-xl font-bold">Manage rooms</h2><label className="label">Property</label><select className="input mb-5" value={hotel} onChange={e=>setHotel(e.target.value)}>{hotels.map(h=><option value={h._id} key={h._id}>{h.name}</option>)}</select><form onSubmit={add} className="surface mb-6 grid gap-3 p-5 sm:grid-cols-4"><select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{["standard","deluxe","suite"].map(x=><option key={x}>{x}</option>)}</select><input className="input" type="number" min="1" value={form.pricePerNight} onChange={e=>setForm({...form,pricePerNight:Number(e.target.value)})}/><input className="input" type="number" min="1" value={form.capacity} onChange={e=>setForm({...form,capacity:Number(e.target.value)})}/><input className="input" type="number" min="1" value={form.totalUnits} onChange={e=>setForm({...form,totalUnits:Number(e.target.value)})}/><button className="btn-primary sm:col-span-4">Add room type</button>{error&&<p className="text-red-300 sm:col-span-4">{error}</p>}</form><div className="space-y-3">{rooms.map(r=><div className="surface flex justify-between p-4" key={r._id}><span className="capitalize">{r.type} · ₹{r.pricePerNight} · {r.totalUnits} units</span><button onClick={()=>remove(r._id)} className="text-xs text-red-300">Delete</button></div>)}</div></div>;
}

export default function AdminPages({ page }) {
  if (page === "hotels") return <AdminHotels />;
  if (page === "rooms") return <AdminRooms />;
  if (page === "bookings") return <AdminBookings />;
  if (page === "stats") return <AdminStats />;
  return <AdminOverview />;
}
