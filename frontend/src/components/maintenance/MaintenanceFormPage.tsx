import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesApi } from '../../api/vehicles'
import { maintenanceApi } from '../../api/maintenance'
import { schedulesApi } from '../../api/schedules'
import type { MaintenanceRecordCreate } from '../../types'

const SERVICE_TYPES = [
  { type: 'oil_change', label: 'Oil & Filter Change' },
  { type: 'tire_rotation', label: 'Tire Rotation' },
  { type: 'engine_air_filter', label: 'Engine Air Filter' },
  { type: 'cabin_air_filter', label: 'Cabin Air Filter' },
  { type: 'brake_fluid', label: 'Brake Fluid Flush' },
  { type: 'transmission_fluid', label: 'Transmission Fluid' },
  { type: 'coolant_flush', label: 'Coolant Flush' },
  { type: 'spark_plugs', label: 'Spark Plugs' },
  { type: 'serpentine_belt', label: 'Serpentine Belt' },
  { type: 'brake_pads', label: 'Brake Pads' },
  { type: 'battery', label: 'Battery Replacement' },
  { type: 'wiper_blades', label: 'Wiper Blades' },
  { type: 'power_steering_fluid', label: 'Power Steering Fluid' },
  { type: 'differential_fluid', label: 'Differential Fluid' },
  { type: 'tire_alignment', label: 'Wheel Alignment' },
  { type: 'other', label: 'Other' },
]

export function MaintenanceFormPage() {
  const { id } = useParams<{ id: string }>()
  const vehicleId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: vehicle } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehiclesApi.get(vehicleId),
  })

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: schedulesApi.listTemplates,
  })

  const [serviceType, setServiceType] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [performedAt, setPerformedAt] = useState(new Date().toISOString().split('T')[0])
  const [mileageAt, setMileageAt] = useState('')
  const [shopName, setShopName] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')

  const mutation = useMutation({
    mutationFn: (data: MaintenanceRecordCreate) => maintenanceApi.create(vehicleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate(`/vehicles/${vehicleId}`)
    },
  })

  const selectedService = SERVICE_TYPES.find(s => s.type === serviceType)
  const serviceLabel = serviceType === 'other' ? customLabel : (selectedService?.label || '')

  // Also check templates for additional label info
  const templateMatch = templates?.find(t => t.service_type === serviceType)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      service_type: serviceType === 'other' ? customLabel.toLowerCase().replace(/\s+/g, '_') : serviceType,
      service_label: serviceLabel,
      performed_at: performedAt,
      mileage_at: parseInt(mileageAt),
      ...(shopName && { shop_name: shopName }),
      ...(cost && { cost: parseFloat(cost) }),
      ...(notes && { notes }),
    })
  }

  return (
    <div>
      <Link to={`/vehicles/${vehicleId}`} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">&larr; Back</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Log Maintenance</h1>
      {vehicle && (
        <p className="text-gray-500 mb-6">
          {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`} — {vehicle.current_mileage.toLocaleString()} miles
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <select
            required
            value={serviceType}
            onChange={e => setServiceType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a service...</option>
            {SERVICE_TYPES.map(s => (
              <option key={s.type} value={s.type}>{s.label}</option>
            ))}
          </select>
        </div>

        {serviceType === 'other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Timing Belt Replacement"
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {templateMatch?.description && (
          <p className="text-sm text-gray-500 bg-blue-50 rounded-lg px-4 py-2">
            {templateMatch.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Performed</label>
            <input
              type="date"
              required
              value={performedAt}
              onChange={e => setPerformedAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mileage at Service</label>
            <input
              type="number"
              required
              min={0}
              placeholder={vehicle ? String(vehicle.current_mileage) : ''}
              value={mileageAt}
              onChange={e => setMileageAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input
              type="text"
              placeholder="Jiffy Lube (optional)"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder="49.99 (optional)"
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            placeholder="Any additional notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {mutation.error && (
          <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {mutation.isPending ? 'Saving...' : 'Save Record'}
          </button>
          <Link
            to={`/vehicles/${vehicleId}`}
            className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
