import { api } from './client';
import type { Vehicle, VehicleCreate } from '../types';

export const vehiclesApi = {
  list: () => api.get<Vehicle[]>('/vehicles'),
  get: (id: number) => api.get<Vehicle>(`/vehicles/${id}`),
  create: (data: VehicleCreate) => api.post<Vehicle>('/vehicles', data),
  update: (id: number, data: Partial<VehicleCreate>) => api.put<Vehicle>(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  updateMileage: (id: number, mileage: number) =>
    api.patch<Vehicle>(`/vehicles/${id}/mileage`, { current_mileage: mileage }),
};
