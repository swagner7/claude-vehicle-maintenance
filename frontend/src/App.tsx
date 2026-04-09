import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { VehicleListPage } from './components/vehicles/VehicleListPage'
import { VehicleDetailPage } from './components/vehicles/VehicleDetailPage'
import { MaintenanceFormPage } from './components/maintenance/MaintenanceFormPage'
import { ShopCheckPage } from './components/shop-check/ShopCheckPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/vehicles" element={<VehicleListPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="/vehicles/:id/maintenance/new" element={<MaintenanceFormPage />} />
        <Route path="/vehicles/:id/shop-check" element={<ShopCheckPage />} />
      </Routes>
    </AppShell>
  )
}
