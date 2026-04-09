import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const location = useLocation()

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/vehicles', label: 'Vehicles' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-lg text-gray-900">
            AutoCare Tracker
          </Link>
          <div className="flex gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
