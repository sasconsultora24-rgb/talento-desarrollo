import { Link } from "react-router-dom";
import { Button } from "../components/ui.jsx";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-extrabold text-navy-900">404</h1>
      <p className="text-navy-500 mt-3">No encontramos la página que buscás.</p>
      <Link to="/" className="inline-block mt-6">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
