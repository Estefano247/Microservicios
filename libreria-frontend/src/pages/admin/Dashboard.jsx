import { Link } from 'react-router-dom';

const cards = [
  { title: 'Productos', desc: 'Gestionar catálogo de libros', link: '/admin/products', color: 'bg-indigo-500' },
  { title: 'Usuarios', desc: 'Administrar usuarios', link: '/admin/users', color: 'bg-green-500' },
  { title: 'Pedidos', desc: 'Ver y gestionar pedidos', link: '/admin/orders', color: 'bg-amber-500' },
  { title: 'Inventario', desc: 'Control de stock', link: '/admin/inventory', color: 'bg-purple-500' },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link key={card.title} to={card.link} className="group bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
            <div className={`${card.color} h-2`} />
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 mb-2">{card.title}</h2>
              <p className="text-gray-600">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
