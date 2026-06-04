export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold text-white mb-2">Librería Online</p>
        <p>&copy; {new Date().getFullYear()} Todos los derechos reservados</p>
      </div>
    </footer>
  );
}
