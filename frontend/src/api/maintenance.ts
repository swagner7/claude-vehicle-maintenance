import { api } from './client';
import type { MaintenanceRecord, MaintenanceRecordCreate, VehicleStatus, Dashboard } from '../types';

export const maintenanceApi = {
  list: (vehicleId: number) =>
    api.get<MaintenanceRecord[]>(`/vehicles/${vehicleId}/maintenance`),
  create: (vehicleId: number, data: MaintenanceRecordCreate) =>
    api.post<MaintenanceRecord>(`/vehicles/${vehicleId}/maintenance`, data),
  update: (vehicleId: number, recordId: number, data: Partial<MaintenanceRecordCreate>) =>
    api.put<MaintenanceRecord>(`/vehicles/${vehicleId}/maintenance/${recordId}`, data),
  delete: (vehicleId: number, recordId: number) =>
    api.delete(`/vehicles/${vehicleId}/maintenance/${recordId}`),
  getStatus: (vehicleId: number) =>
    api.get<VehicleStatus>(`/vehicles/${vehicleId}/status`),
  getDashboard: () => api.get<Dashboard>('/dashboard'),
};
