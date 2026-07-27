import { Link } from "react-router-dom";
export default function NotFound(){return <section className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center"><p className="gradient-text text-8xl font-black">404</p><h1 className="mt-4 text-3xl font-bold">This room doesn’t exist.</h1><p className="mt-3 text-white/40">Let’s get you somewhere more comfortable.</p><Link className="btn-primary mt-7" to="/">Back home</Link></section>}

