import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { maintenanceApi } from '../../api/maintenance'
import type { DashboardVehicle } from '../../types'
import { StatusBadge } from '../shop-check/ShopCheckPage'

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: maintenanceApi.getDashboard,
  })

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-500">Failed to load dashboard</div>

  if (!data?.vehicles.length) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AutoCare Tracker</h1>
        <p className="text-gray-600 mb-6">Add your first vehicle to start tracking maintenance.</p>
        <Link
          to="/vehicles"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Vehicle
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="space-y-8">
        {data.vehicles.map(vehicle => (
          <VehicleDashboardCard key={vehicle.vehicle_id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  )
}

function VehicleDashboardCard({ vehicle }: { vehicle: DashboardVehicle }) {
  const name = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <Link
            to={`/vehicles/${vehicle.vehicle_id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {name}
          </Link>
          <p className="text-sm text-gray-500">{vehicle.current_mileage.toLocaleString()} miles</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/vehicles/${vehicle.vehicle_id}/shop-check`}
            className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Shop Check
          </Link>
          <Link
            to={`/vehicles/${vehicle.vehicle_id}/maintenance/new`}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log Service
          </Link>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {vehicle.overdue.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-red-700 mb-2">
              Overdue ({vehicle.overdue.length})
            </h3>
            <div className="space-y-2">
              {vehicle.overdue.map(item => (
                <div key={item.service_type} className="flex items-center justify-between bg-red-50 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-gray-900">{item.service_label}</span>
                  <div className="flex items-center gap-3">
                    <StatusDetail item={item} />
                    <StatusBadge status="overdue" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vehicle.due_soon.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-yellow-700 mb-2">
              Due Soon ({vehicle.due_soon.length})
            </h3>
            <div className="space-y-2">
              {vehicle.due_soon.map(item => (
                <div key={item.service_type} className="flex items-center justify-between bg-yellow-50 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-gray-900">{item.service_label}</span>
                  <div className="flex items-center gap-3">
                    <StatusDetail item={item} />
                    <StatusBadge status="due_soon" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vehicle.recent.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-green-700 mb-2">
              Recently Completed
            </h3>
            <div className="space-y-2">
              {vehicle.recent.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-gray-900">{item.service_label}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.performed_at).toLocaleDateString()} at {item.mileage_at.toLocaleString()} mi
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {vehicle.overdue.length === 0 && vehicle.due_soon.length === 0 && vehicle.recent.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            No maintenance records yet. <Link to={`/vehicles/${vehicle.vehicle_id}/maintenance/new`} className="text-blue-600 hover:underline">Log your first service</Link>
          </p>
        )}
      </div>
    </div>
  )
}

function StatusDetail({ item }: { item: { miles_remaining?: number | null; days_remaining?: number | null } }) {
  const parts: string[] = []
  if (item.miles_remaining != null) {
    parts.push(`${Math.abs(item.miles_remaining).toLocaleString()} mi ${item.miles_remaining < 0 ? 'overdue' : 'left'}`)
  }
  if (item.days_remaining != null) {
    parts.push(`${Math.abs(item.days_remaining)} days ${item.days_remaining < 0 ? 'overdue' : 'left'}`)
  }
  if (parts.length === 0) return null
  return <span className="text-xs text-gray-500">{parts.join(' / ')}</span>
}
