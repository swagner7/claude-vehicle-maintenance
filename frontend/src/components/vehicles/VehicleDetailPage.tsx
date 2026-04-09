import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesApi } from '../../api/vehicles'
import { maintenanceApi } from '../../api/maintenance'
import { schedulesApi } from '../../api/schedules'
import type { MaintenanceRecord, ScheduleTemplate } from '../../types'

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const vehicleId = Number(id)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'history' | 'schedule'>('history')
  const [showMileageForm, setShowMileageForm] = useState(false)
  const [newMileage, setNewMileage] = useState('')

  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehiclesApi.get(vehicleId),
  })

  const { data: records } = useQuery({
    queryKey: ['maintenance', vehicleId],
    queryFn: () => maintenanceApi.list(vehicleId),
  })

  const { data: schedules } = useQuery({
    queryKey: ['schedules', vehicleId],
    queryFn: () => schedulesApi.getForVehicle(vehicleId),
  })

  const mileageMutation = useMutation({
    mutationFn: (mileage: number) => vehiclesApi.updateMileage(vehicleId, mileage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] })
      setShowMileageForm(false)
      setNewMileage('')
    },
  })

  const deleteRecordMutation = useMutation({
    mutationFn: (recordId: number) => maintenanceApi.delete(vehicleId, recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance', vehicleId] }),
  })

  if (vehicleLoading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (!vehicle) return <div className="text-center py-12 text-red-500">Vehicle not found</div>

  const name = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  return (
    <div>
      <div className="mb-6">
        <Link to="/vehicles" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">&larr; All Vehicles</Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            {vehicle.nickname && (
              <p className="text-gray-500">{vehicle.year} {vehicle.make} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              to={`/vehicles/${vehicleId}/shop-check`}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Shop Check
            </Link>
            <Link
              to={`/vehicles/${vehicleId}/maintenance/new`}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log Service
            </Link>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-700">
            {vehicle.current_mileage.toLocaleString()} miles
          </span>
          {showMileageForm ? (
            <form
              className="flex items-center gap-2"
              onSubmit={e => {
                e.preventDefault()
                mileageMutation.mutate(parseInt(newMileage))
              }}
            >
              <input
                type="number"
                min={0}
                value={newMileage}
                onChange={e => setNewMileage(e.target.value)}
                placeholder="New mileage"
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-32"
                autoFocus
              />
              <button type="submit" className="text-sm text-blue-600 hover:text-blue-800">Save</button>
              <button type="button" onClick={() => setShowMileageForm(false)} className="text-sm text-gray-500">Cancel</button>
            </form>
          ) : (
            <button
              onClick={() => { setShowMileageForm(true); setNewMileage(String(vehicle.current_mileage)) }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Update
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Maintenance History
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'schedule'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Schedule
        </button>
      </div>

      {activeTab === 'history' ? (
        <MaintenanceHistory records={records || []} onDelete={id => {
          if (confirm('Delete this maintenance record?')) deleteRecordMutation.mutate(id)
        }} />
      ) : (
        <ScheduleView schedules={schedules || []} />
      )}
    </div>
  )
}

function MaintenanceHistory({ records, onDelete }: { records: MaintenanceRecord[]; onDelete: (id: number) => void }) {
  if (!records.length) {
    return <p className="text-gray-500 text-center py-8">No maintenance records yet.</p>
  }

  return (
    <div className="space-y-3">
      {records.map(record => (
        <div key={record.id} className="bg-white rounded-lg border border-gray-200 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{record.service_label}</h3>
              <p className="text-sm text-gray-500">
                {new Date(record.performed_at).toLocaleDateString()} at {record.mileage_at.toLocaleString()} miles
              </p>
            </div>
            <button
              onClick={() => onDelete(record.id)}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Delete
            </button>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
            {record.shop_name && <span>Shop: {record.shop_name}</span>}
            {record.cost && <span>Cost: ${Number(record.cost).toFixed(2)}</span>}
          </div>
          {record.notes && <p className="mt-1 text-sm text-gray-500">{record.notes}</p>}
        </div>
      ))}
    </div>
  )
}

function ScheduleView({ schedules }: { schedules: ScheduleTemplate[] }) {
  if (!schedules.length) {
    return <p className="text-gray-500 text-center py-8">No schedule templates available.</p>
  }

  const grouped = {
    critical: schedules.filter(s => s.severity === 'critical'),
    recommended: schedules.filter(s => s.severity === 'recommended'),
    optional: schedules.filter(s => s.severity === 'optional'),
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([severity, items]) => items.length > 0 && (
        <div key={severity}>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            {severity}
          </h3>
          <div className="space-y-2">
            {items.map(schedule => (
              <div key={schedule.id} className="bg-white rounded-lg border border-gray-200 px-5 py-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{schedule.service_label}</h4>
                  <div className="text-sm text-gray-500">
                    {schedule.interval_miles && `Every ${schedule.interval_miles.toLocaleString()} mi`}
                    {schedule.interval_miles && schedule.interval_months && ' / '}
                    {schedule.interval_months && `${schedule.interval_months} mo`}
                  </div>
                </div>
                {schedule.description && (
                  <p className="text-sm text-gray-500 mt-1">{schedule.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
