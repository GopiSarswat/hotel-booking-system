import { BedDouble } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/[.07] py-10">
      <div className="container-page flex flex-col items-center justify-between gap-5 text-sm text-white/40 sm:flex-row">
        <Link to="/" className="flex items-center gap-2 font-bold text-white"><BedDouble size={18} /> Stayora</Link>
        <p>Thoughtful stays. Honest prices. Human support.</p>
        <p>© {new Date().getFullYear()} Stayora</p>
      </div>
    </footer>
  );
}

