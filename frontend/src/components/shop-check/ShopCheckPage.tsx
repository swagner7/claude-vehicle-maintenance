import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '../../api/vehicles'
import { maintenanceApi } from '../../api/maintenance'
import type { ServiceStatus } from '../../types'

export function ShopCheckPage() {
  const { id } = useParams<{ id: string }>()
  const vehicleId = Number(id)

  const { data: vehicle } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehiclesApi.get(vehicleId),
  })

  const { data: status, isLoading, error } = useQuery({
    queryKey: ['vehicle-status', vehicleId],
    queryFn: () => maintenanceApi.getStatus(vehicleId),
  })

  if (isLoading) return <div className="text-center py-12 text-gray-500 text-lg">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-500">Failed to load status</div>

  const name = vehicle?.nickname || (vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '')

  return (
    <div className="max-w-lg mx-auto">
      <Link to={`/vehicles/${vehicleId}`} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">&larr; Back</Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop Check</h1>
        <p className="text-gray-500">{name} — {status?.current_mileage.toLocaleString()} miles</p>
        <p className="text-sm text-gray-400 mt-1">Use this at the service counter to check if you actually need a service.</p>
      </div>

      <div className="space-y-3">
        {status?.items.map(item => (
          <ShopCheckItem key={item.service_type} item={item} />
        ))}
      </div>

      {status?.items.length === 0 && (
        <p className="text-center text-gray-500 py-8">No schedule data available.</p>
      )}
    </div>
  )
}

function ShopCheckItem({ item }: { item: ServiceStatus }) {
  const bgColor = {
    overdue: 'bg-red-50 border-red-200',
    due_soon: 'bg-yellow-50 border-yellow-200',
    ok: 'bg-green-50 border-green-200',
    unknown: 'bg-gray-50 border-gray-200',
  }[item.status]

  return (
    <div className={`rounded-xl border-2 p-4 ${bgColor}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-lg">{item.service_label}</h3>
        <StatusBadge status={item.status} />
      </div>

      {item.status === 'unknown' ? (
        <p className="text-sm text-gray-500">No records — add your first entry to start tracking.</p>
      ) : (
        <div className="space-y-1">
          {item.last_performed_date && (
            <p className="text-sm text-gray-600">
              Last done: <span className="font-medium">{new Date(item.last_performed_date).toLocaleDateString()}</span>
              {item.last_performed_mileage != null && (
                <> at <span className="font-medium">{item.last_performed_mileage.toLocaleString()} mi</span></>
              )}
            </p>
          )}

          {item.miles_remaining != null && (
            <p className={`text-sm font-medium ${item.miles_remaining <= 0 ? 'text-red-700' : item.miles_remaining <= 500 ? 'text-yellow-700' : 'text-green-700'}`}>
              {item.miles_remaining <= 0
                ? `${Math.abs(item.miles_remaining).toLocaleString()} miles overdue`
                : `${item.miles_remaining.toLocaleString()} miles remaining`
              }
            </p>
          )}

          {item.days_remaining != null && (
            <p className={`text-sm font-medium ${item.days_remaining <= 0 ? 'text-red-700' : item.days_remaining <= 30 ? 'text-yellow-700' : 'text-green-700'}`}>
              {item.days_remaining <= 0
                ? `${Math.abs(item.days_remaining)} days overdue`
                : `${item.days_remaining} days remaining`
              }
            </p>
          )}

          {item.interval_miles && (
            <p className="text-xs text-gray-400">
              Recommended: every {item.interval_miles.toLocaleString()} mi
              {item.interval_months ? ` / ${item.interval_months} mo` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles = {
    overdue: 'bg-red-100 text-red-800',
    due_soon: 'bg-yellow-100 text-yellow-800',
    ok: 'bg-green-100 text-green-800',
    unknown: 'bg-gray-100 text-gray-600',
  }[status] || 'bg-gray-100 text-gray-600'

  const labels = {
    overdue: 'OVERDUE',
    due_soon: 'DUE SOON',
    ok: 'OK',
    unknown: 'NO DATA',
  }[status] || status.toUpperCase()

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles}`}>
      {labels}
    </span>
  )
}
