import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { vehiclesApi } from '../../api/vehicles'
import type { VehicleCreate } from '../../types'

export function VehicleForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<VehicleCreate>({
    year: new Date().getFullYear(),
    make: '',
    model: '',
    current_mileage: 0,
  })
  const [nickname, setNickname] = useState('')
  const [trim, setTrim] = useState('')

  const mutation = useMutation({
    mutationFn: vehiclesApi.create,
    onSuccess,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      ...(nickname && { nickname }),
      ...(trim && { trim }),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add Vehicle</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            type="number"
            required
            min={1900}
            max={2100}
            value={form.year}
            onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
          <input
            type="text"
            required
            placeholder="Toyota"
            value={form.make}
            onChange={e => setForm({ ...form, make: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <input
            type="text"
            required
            placeholder="Camry"
            value={form.model}
            onChange={e => setForm({ ...form, model: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trim</label>
          <input
            type="text"
            placeholder="EX-L (optional)"
            value={trim}
            onChange={e => setTrim(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Mileage</label>
          <input
            type="number"
            required
            min={0}
            value={form.current_mileage}
            onChange={e => setForm({ ...form, current_mileage: parseInt(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
          <input
            type="text"
            placeholder="Dad's Truck (optional)"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {mutation.error && (
        <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
      >
        {mutation.isPending ? 'Adding...' : 'Add Vehicle'}
      </button>
    </form>
  )
}
