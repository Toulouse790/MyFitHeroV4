import { Plus } from 'lucide-react';
import { Link } from 'wouter'; // change en `react-router-dom` si tu utilises Router DOM

/**
 * Bouton flottant (mobile d’abord) qui amène vers une page d’actions rapides.
 * Adapte la route `to="/quick-actions"` selon ton besoin.
 */
export function FloatingActionButton() {
  return (
    <Link
      to="/quick-actions"
      className="
        fixed bottom-6 right-6 md:hidden
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-blue-600 text-white shadow-lg
        hover:bg-blue-700 active:scale-95
        transition-all duration-200
      "
      aria-label="Actions rapides"
    >
      <Plus size={28} />
    </Link>
  );
}

export default FloatingActionButton; // ← laisse aussi l’export default si jamais
