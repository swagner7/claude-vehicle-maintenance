import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesApi } from '../../api/vehicles'
import { VehicleForm } from './VehicleForm'
import type { Vehicle } from '../../types'

export function VehicleListPage() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: vehiclesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-500">Failed to load vehicles</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <VehicleForm onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['vehicles'] }) }} />
        </div>
      )}

      {!vehicles?.length && !showForm ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No vehicles added yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {vehicles?.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onDelete={() => {
                if (confirm(`Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) {
                  deleteMutation.mutate(vehicle.id)
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function VehicleCard({ vehicle, onDelete }: { vehicle: Vehicle; onDelete: () => void }) {
  const name = vehicle.nickname
    ? `${vehicle.nickname}`
    : `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const subtitle = vehicle.nickname
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`
    : vehicle.trim || ''

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            to={`/vehicles/${vehicle.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {name}
          </Link>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors text-sm"
          title="Delete vehicle"
        >
          Delete
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        {vehicle.current_mileage.toLocaleString()} miles
      </p>
      <div className="flex gap-2">
        <Link
          to={`/vehicles/${vehicle.id}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Details
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          to={`/vehicles/${vehicle.id}/shop-check`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Shop Check
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          to={`/vehicles/${vehicle.id}/maintenance/new`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Log Service
        </Link>
      </div>
    </div>
  )
}
