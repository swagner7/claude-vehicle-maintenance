import { api } from './client';
import type { ScheduleTemplate } from '../types';

export const schedulesApi = {
  getForVehicle: (vehicleId: number) =>
    api.get<ScheduleTemplate[]>(`/vehicles/${vehicleId}/schedule`),
  listTemplates: () => api.get<ScheduleTemplate[]>('/schedules/templates'),
};
